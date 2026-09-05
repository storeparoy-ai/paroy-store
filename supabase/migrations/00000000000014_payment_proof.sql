-- ============================================================================
-- Migration: bukti transfer (OPS-03) + nomor invoice yang tidak bisa ditebak
--
-- Konteks: kolom `proof_url` sudah ada sejak migrasi awal tapi tidak pernah
-- dipakai — pembeli transfer lalu menghilang, dan admin harus mencocokkan
-- mutasi rekening dengan nama pembeli secara manual. Migrasi ini membuka
-- jalur unggah bukti untuk pembeli tamu, dengan syarat keamanan yang harus
-- dipenuhi lebih dulu (bagian 1).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Nomor invoice: 4 digit desimal -> 6 karakter heksadesimal
--
-- Format lama `PS-20260905-4821` hanya punya 10.000 kemungkinan per prefix per
-- hari. Dua masalah nyata, dan yang kedua baru jadi berbahaya karena migrasi
-- ini:
--
--   a) Tabrakan. order_number UNIQUE, jadi dua pesanan yang kebetulan dapat
--      angka sama membuat pesanan kedua GAGAL total. Dengan paradoks ulang
--      tahun, peluangnya sudah ~1% di sekitar 15 pesanan/hari dan ~40% di 100
--      pesanan/hari — bukan angka teoretis, itu pelanggan yang kehilangan
--      pesanan di hari ramai.
--
--   b) Bisa dienumerasi. Menebak seluruh 10.000 nomor sehari itu sepele, dan
--      get_order_status() terbuka untuk anon. Selama nomor invoice cuma untuk
--      melacak status, itu kebocoran kecil; begitu nomor invoice jadi kunci
--      "boleh melampirkan bukti transfer ke pesanan ini", ia berubah jadi
--      kunci yang bisa di-brute force.
--
-- 16^6 = 16,7 juta kemungkinan per hari menutup keduanya. Ini cuma DEFAULT
-- kolom, jadi pesanan lama tetap memakai nomornya masing-masing.
-- ----------------------------------------------------------------------------
create or replace function public.generate_order_number(prefix text default 'PS')
returns text
language sql
volatile
as $$
  select prefix || '-' || to_char(now(), 'YYYYMMDD') || '-' ||
         upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
$$;

-- rekber_orders belum punya kolom bukti sama sekali (orders punya proof_url,
-- topup_orders punya payment_proof_url — nama beda karena ditulis di migrasi
-- yang berbeda; dibiarkan apa adanya supaya tidak memecah kode yang ada).
alter table public.rekber_orders
  add column if not exists proof_url text;

-- ----------------------------------------------------------------------------
-- 2. Bucket `payment-proofs` — PRIVAT
--
-- Bukti transfer memuat nama pemilik rekening, nomor rekening, dan saldo yang
-- kebetulan ikut terpotret. Itu data pribadi orang lain, jadi bucket ini
-- sengaja tidak public seperti `public-assets`: hanya admin yang boleh
-- membacanya, dan halaman admin membacanya lewat signed URL berumur pendek.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs', 'payment-proofs', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
on conflict (id) do update set
  public             = false,
  file_size_limit    = 5242880,
  allowed_mime_types = excluded.allowed_mime_types;

-- Helper: apakah nomor invoice ini benar-benar ada DAN masih menunggu
-- verifikasi? SECURITY DEFINER karena kebijakan storage di bawah dijalankan
-- sebagai anon, yang tidak boleh membaca tabel pesanan secara langsung.
create or replace function public.order_awaiting_proof(p_order_number text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.orders
      where order_number = p_order_number and status = 'pending'
    union all
    select 1 from public.topup_orders
      where order_number = p_order_number and status = 'pending'
    union all
    select 1 from public.rekber_orders
      where order_number = p_order_number and status = 'pending'
  );
$$;

grant execute on function public.order_awaiting_proof(text) to anon, authenticated;

-- Unggah: siapa pun boleh, TAPI hanya ke dalam folder yang namanya persis
-- sebuah nomor invoice yang ada dan masih pending. Ini batas keamanan yang
-- sesungguhnya — bukan server action di aplikasi, karena kunci anon ada di
-- browser dan siapa pun bisa memanggil Storage langsung tanpa lewat situs.
drop policy if exists "Anyone can upload a proof to a pending order" on storage.objects;
create policy "Anyone can upload a proof to a pending order" on storage.objects
  for insert with check (
    bucket_id = 'payment-proofs'
    and public.order_awaiting_proof((storage.foldername(name))[1])
  );

-- Sengaja TIDAK ada kebijakan UPDATE: file yang sudah masuk tidak bisa ditimpa
-- (upload juga memakai upsert:false dengan nama acak). Kalau pembeli salah
-- unggah, ia mengunggah file baru dan lampiran pesanan menunjuk ke yang
-- terakhir — jejak yang lama tetap utuh untuk admin.
drop policy if exists "Admins can read payment proofs" on storage.objects;
create policy "Admins can read payment proofs" on storage.objects
  for select using (bucket_id = 'payment-proofs' and public.is_admin());

drop policy if exists "Admins can delete payment proofs" on storage.objects;
create policy "Admins can delete payment proofs" on storage.objects
  for delete using (bucket_id = 'payment-proofs' and public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. Melampirkan bukti ke pesanan
--
-- Kebijakan UPDATE di ketiga tabel pesanan hanya mengizinkan admin, dan itu
-- benar — pembeli tamu tidak boleh menyentuh baris pesanan. Jadi pelampiran
-- lewat RPC SECURITY DEFINER yang cakupannya sesempit mungkin: satu kolom,
-- satu baris, dan hanya selama pesanan masih pending.
-- ----------------------------------------------------------------------------
create or replace function public.attach_payment_proof(
  p_order_number text,
  p_path         text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hit integer;
begin
  -- Path harus berada di dalam folder milik nomor invoice ini. Tanpa cek ini
  -- seseorang bisa menunjuk lampiran pesanan orang lain ke file miliknya.
  if p_path is null or p_path <> p_order_number || '/' || split_part(p_path, '/', 2)
     or split_part(p_path, '/', 2) = '' then
    return false;
  end if;

  update public.orders set proof_url = p_path
    where order_number = p_order_number and status = 'pending';
  get diagnostics v_hit = row_count;
  if v_hit > 0 then return true; end if;

  update public.topup_orders set payment_proof_url = p_path
    where order_number = p_order_number and status = 'pending';
  get diagnostics v_hit = row_count;
  if v_hit > 0 then return true; end if;

  update public.rekber_orders set proof_url = p_path
    where order_number = p_order_number and status = 'pending';
  get diagnostics v_hit = row_count;
  return v_hit > 0;
end;
$$;

grant execute on function public.attach_payment_proof(text, text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. get_order_status(): tambah `has_proof`
--
-- Supaya halaman Cek Transaksi bisa bilang "bukti sudah kami terima" dan
-- pembeli berhenti mengunggah ulang. Tipe kembaliannya berubah, dan Postgres
-- tidak mengizinkan CREATE OR REPLACE mengubah RETURNS TABLE — jadi harus
-- DROP dulu. Konsekuensinya: kode baru di atas database lama akan mematahkan
-- Cek Transaksi, jadi migrasi ini wajib jalan SEBELUM deploy.
--
-- Yang sengaja TIDAK dikembalikan: nama pembeli dan nomor WhatsApp. Nomor
-- invoice sekarang sulit ditebak, tapi tetap saja ia berpindah tangan lewat
-- tangkapan layar — jadi ia tidak layak jadi kunci data pribadi.
-- ----------------------------------------------------------------------------
drop function if exists public.get_order_status(text);

create function public.get_order_status(p_order_number text)
returns table (
  order_number text,
  kind         text,
  status       text,
  amount       numeric,
  item_label   text,
  has_proof    boolean,
  created_at   timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select o.order_number,
         case when o.mode = 'rental' then 'rental' else 'buy' end::text as kind,
         o.status, o.amount,
         coalesce(p.title, o.note, 'Pembelian Akun') as item_label,
         o.proof_url is not null as has_proof,
         o.created_at
  from public.orders o
  left join public.products p on p.id = o.product_id
  where o.order_number = p_order_number

  union all

  select t.order_number, 'topup'::text, t.status, t.amount,
         t.item_label, t.payment_proof_url is not null, t.created_at
  from public.topup_orders t
  where t.order_number = p_order_number

  union all

  select r.order_number, 'rekber'::text, r.status, r.amount,
         r.item_description, r.proof_url is not null, r.created_at
  from public.rekber_orders r
  where r.order_number = p_order_number

  limit 1;
$$;

grant execute on function public.get_order_status(text) to anon, authenticated;
