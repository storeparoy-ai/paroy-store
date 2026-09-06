-- ============================================================================
-- Migration: Cek Transaksi ikut menyebut rekening tujuan
--
-- MASALAHNYA
--
-- Halaman Cek Transaksi menampilkan nomor invoice, nama barang, nominal,
-- garis status, dan kotak "Kirim Bukti Transfer" — tapi tidak pernah menyebut
-- KE MANA uangnya harus dikirim.
--
-- Untuk Top Up dan Rekber itu tidak fatal: rekeningnya muncul di layar sukses
-- (sejak commit 0aa2008). Untuk beli akun, rekeningnya cuma tampil di
-- FORMULIR checkout, sebelum tombol "Saya Sudah Transfer" ditekan. Sesudah
-- ditekan, formulirnya hilang.
--
-- Jadi ada jalan buntu yang nyata. Pembeli yang menekan tombol itu sebelum
-- benar-benar transfer — labelnya sebuah klaim, dan ada hitungan mundur 15
-- menit yang menekan — atau yang sekadar menutup tab lalu kembali besok,
-- berakhir memegang tagihan berisi nominal dan permintaan mengunggah bukti,
-- tanpa satu pun petunjuk rekening tujuan. Akunnya pun sudah terkunci
-- ('reserved'), sehingga halaman checkout tidak bisa dibuka ulang. Satu-
-- satunya jalan keluarnya menghubungi admin.
--
-- Ditemukan saat menuntaskan uji alur beli akun dari sisi pembeli sungguhan.
--
-- PERBAIKANNYA
--
-- Cek Transaksi adalah satu-satunya halaman yang bisa dibuka kapan saja tanpa
-- login, jadi di situlah rekening tujuan harus ada — bukan cuma di layar
-- sukses yang hanya terlihat sekali. Fungsi ini menambah satu kolom
-- `payment_method` supaya halaman itu bisa menunjukkan rekening YANG PERSIS
-- DIPILIH pembeli, bukan daftar semua rekening yang membuatnya menebak.
--
-- Rekber tidak menyimpan metode pembayaran (nominalnya baru pasti setelah
-- admin menilai), jadi barisnya mengembalikan NULL — dan halaman itu
-- menampilkan seluruh pilihan sebagai gantinya.
--
-- URUTAN DEPLOY: jalankan migrasi ini DULU, baru push kodenya. Menambah kolom
-- pada RETURNS TABLE tidak merusak kode lama (ia hanya membaca kolom yang
-- dikenalnya), tapi kode baru membaca `payment_method` yang belum ada.
-- ============================================================================

drop function if exists public.get_order_status(text);

create or replace function public.get_order_status(p_order_number text)
returns table (
  order_number   text,
  kind           text,
  status         text,
  amount         numeric,
  item_label     text,
  has_proof      boolean,
  payment_method text,
  created_at     timestamptz
)
language sql
security definer
stable
set search_path = public
as $fn$
  select o.order_number,
         case when o.mode = 'rental' then 'rental' else 'buy' end::text as kind,
         o.status, o.amount,
         coalesce(p.title, o.note, 'Pembelian Akun') as item_label,
         o.proof_url is not null as has_proof,
         o.payment_method,
         o.created_at
  from public.orders o
  left join public.products p on p.id = o.product_id
  where o.order_number = p_order_number

  union all

  select t.order_number, 'topup'::text, t.status, t.amount,
         t.item_label, t.payment_proof_url is not null,
         t.payment_method,
         t.created_at
  from public.topup_orders t
  where t.order_number = p_order_number

  union all

  -- Rekber memang tidak punya kolom metode pembayaran.
  select r.order_number, 'rekber'::text, r.status, r.amount,
         r.item_description, r.proof_url is not null,
         null::text,
         r.created_at
  from public.rekber_orders r
  where r.order_number = p_order_number

  limit 1;
$fn$;

grant execute on function public.get_order_status(text) to anon, authenticated;
