-- ============================================================================
-- Migration: pembatasan laju pesanan tamu (OPS-05)
--
-- Ruang lingkupnya sengaja dipersempit setelah memeriksa kode yang ada.
-- create_guest_order dan create_guest_rekber sudah mengunci barisan produk
-- (`for update`) lalu menandainya `reserved` (migrasi 11), jadi pesanan kedua
-- untuk akun yang sama otomatis ditolak — klik ganda dan pesanan beruntun
-- di jalur beli/sewa/rekber sudah tidak mungkin.
--
-- Yang benar-benar terbuka cuma TOP UP: tidak ada produk untuk dikunci, jadi
-- satu orang bisa menembakkan pesanan sebanyak yang ia mau.
--
-- Dua lapis, dengan kekuatan yang berbeda dan jujur tentang batasnya:
--
--   Lapis 1 (bagian 3) — di dalam RPC, tidak bisa ditawar. Menolak pesanan
--   top up kembar dalam dua menit. Kuncinya diturunkan dari data yang sudah
--   tersimpan, bukan dari sesuatu yang dikirim browser, jadi tidak ada yang
--   bisa dipalsukan.
--
--   Lapis 2 (bagian 1-2) — jendela geser per alamat IP, dipanggil server
--   Next.js. Ini menghentikan orang yang menyetel formulir situs berulang
--   kali. Ia TIDAK menghentikan penyerang yang memanggil Supabase langsung
--   dengan kunci anon (kunci itu memang ada di browser setiap pengunjung) —
--   pembatas semacam itu hanya sekuat kunci yang dipakainya, dan alamat IP
--   cuma bisa dilihat server, bukan Postgres. Untuk ancaman di level itu,
--   perlindungannya ada di Supabase dan Vercel, bukan di sini.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Catatan percobaan
--
-- Menyimpan sidik jari IP (SHA-256 bergaram), bukan IP-nya. Alamat IP itu
-- data pribadi, dan untuk keperluan menghitung "berapa kali dalam 10 menit"
-- nilai aslinya sama sekali tidak dibutuhkan.
-- ----------------------------------------------------------------------------
create table if not exists public.guest_rate_limit (
  id         bigserial primary key,
  key_hash   text not null,
  action     text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists guest_rate_limit_lookup_idx
  on public.guest_rate_limit (key_hash, action, created_at desc);

alter table public.guest_rate_limit enable row level security;

-- Sengaja TANPA policy untuk anon: tabel ini hanya boleh disentuh lewat
-- fungsi SECURITY DEFINER di bawah. Tanpa policy, RLS menolak semuanya —
-- itu memang yang diinginkan.
drop policy if exists "Admins can read rate limit log" on public.guest_rate_limit;
create policy "Admins can read rate limit log" on public.guest_rate_limit
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. Pemeriksa jendela geser
--
-- Mengembalikan true kalau percobaan ini masih dalam kuota (sekaligus
-- mencatatnya), false kalau sudah lewat.
-- ----------------------------------------------------------------------------
create or replace function public.rate_limit_ok(
  p_key            text,
  p_action         text,
  p_limit          integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  -- Batas atas parameter: fungsinya bisa dipanggil siapa saja dengan kunci
  -- anon, jadi jangan biarkan pemanggil menentukan sendiri kuota tak terhingga
  -- atau jendela sepanjang setahun.
  if p_key is null or length(p_key) not between 8 and 128 then
    return false;
  end if;
  p_limit          := least(greatest(coalesce(p_limit, 5), 1), 100);
  p_window_seconds := least(greatest(coalesce(p_window_seconds, 600), 1), 86400);

  -- Bersih-bersih sesekali saja (~1 dari 100 panggilan). Menghapus di setiap
  -- panggilan berarti memindai tabel untuk pekerjaan yang tidak mendesak.
  if random() < 0.01 then
    delete from public.guest_rate_limit where created_at < now() - interval '1 day';
  end if;

  select count(*) into v_count
    from public.guest_rate_limit
   where key_hash = p_key
     and action = p_action
     and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_limit then
    return false;
  end if;

  insert into public.guest_rate_limit (key_hash, action) values (p_key, p_action);
  return true;
end;
$$;

grant execute on function public.rate_limit_ok(text, text, integer, integer) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Penjaga pesanan top up kembar — di dalam RPC, tidak bisa dilewati
--
-- Tanda tangan fungsinya TIDAK berubah, jadi cukup CREATE OR REPLACE dan
-- tidak ada urutan deploy yang perlu dijaga: kode lama tetap cocok dengan
-- database baru, begitu pula sebaliknya.
-- ----------------------------------------------------------------------------
create or replace function public.create_guest_topup(
  p_topup_item_id  uuid,
  p_game_user_id   text,
  p_payment_code   text,
  p_buyer_whatsapp text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item         public.topup_items%rowtype;
  v_game_name    text;
  v_method       public.payment_methods%rowtype;
  v_amount       numeric;
  v_order_number text;
begin
  select * into v_item from public.topup_items where id = p_topup_item_id;
  if not found or not v_item.is_active then
    raise exception 'Item top up tidak tersedia.' using errcode = '22023';
  end if;

  select * into v_method from public.payment_methods where code = p_payment_code;
  if not found or not v_method.is_active then
    raise exception 'Metode pembayaran tidak tersedia.' using errcode = '22023';
  end if;

  -- Pesanan yang sama persis, dua menit terakhir, masih menunggu pembayaran.
  -- Nyaris selalu ini tombol yang tertekan dua kali — bukan orang yang benar
  -- benar ingin membeli nominal yang sama dua kali dalam dua menit sebelum
  -- yang pertama dibayar. Pesan kesalahannya menyebutkan itu, supaya pembeli
  -- tidak mengira pesanan pertamanya hilang.
  if exists (
    select 1 from public.topup_orders o
     where o.game_user_id = p_game_user_id
       and o.item_label = v_item.label
       and o.status = 'pending'
       and o.created_at > now() - interval '2 minutes'
  ) then
    raise exception 'Pesanan top up yang sama baru saja dibuat dan masih menunggu pembayaran. Cek nomor invoice sebelumnya di halaman Cek Transaksi.'
      using errcode = '22023';
  end if;

  select name into v_game_name from public.games where id = v_item.game_id;

  -- Harga item + biaya layanan, dua-duanya dari database. Dibulatkan supaya
  -- nominal transfer tidak pernah punya pecahan rupiah.
  v_amount := round(
    v_item.price
    + (v_item.price * coalesce(v_method.fee_percent, 0) / 100)
    + coalesce(v_method.fee_flat, 0)
  );

  insert into public.topup_orders
    (user_id, buyer_whatsapp, game, game_user_id, item_label, amount, payment_method, status)
  values
    (auth.uid(), p_buyer_whatsapp, coalesce(v_game_name, ''), p_game_user_id, v_item.label,
     v_amount, v_method.label, 'pending')
  returning order_number into v_order_number;

  return v_order_number;
end;
$$;
