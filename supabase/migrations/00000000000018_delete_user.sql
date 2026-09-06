-- ============================================================================
-- Migration: hapus akun pengguna dari menu Admin -> Pengguna
--
-- Sampai sekarang satu-satunya tombol di halaman Pengguna adalah "Jadikan
-- Admin"/"Cabut Admin". Tidak ada cara menghapus akun sama sekali — termasuk
-- akun uji yang dibuat saat menelusuri bug, yang berarti akun sampah itu
-- menetap selamanya di daftar pengguna.
--
-- Kenapa fungsi SQL, bukan supabase.auth.admin.deleteUser()?
--
--   Menghapus akun berarti menghapus baris di auth.users, dan REST API untuk
--   itu hanya menerima service role key. Kunci itu belum ada di Vercel (lihat
--   README) dan menaruhnya di sana semata-mata demi tombol ini akan menaikkan
--   taruhan kalau bocor: satu kunci yang menembus SELURUH RLS, dipakai untuk
--   satu operasi. Fungsi SECURITY DEFINER di sini berjalan sebagai pemiliknya
--   (postgres) sehingga boleh menyentuh auth.users, tapi cakupannya persis
--   satu hal — dan baris pertamanya menuntut pemanggilnya admin.
--
-- Yang IKUT terhapus dan yang TIDAK:
--
--   Ikut  : profil, wishlist, sesi login, dan postingan komunitas miliknya
--           (isi postingan itu miliknya; balasan di bawahnya ikut cascade).
--   Tidak : pesanan dan produk. Itu catatan usaha, bukan milik pengguna —
--           menghapusnya akan mengubah angka omzet yang sudah dilaporkan.
--           Yang dilakukan adalah memutus tautan ke akun (buyer_id jadi NULL,
--           persis seperti pesanan tamu) SETELAH nama dan nomor WhatsApp-nya
--           disalin ke kolom buyer_name/buyer_whatsapp, supaya baris pesanan
--           di halaman Admin -> Pesanan tetap terbaca lengkap. Halaman itu
--           memang membaca kolom tersebut langsung, tidak pernah join ke
--           profiles, jadi tampilannya tidak berubah sedikit pun.
--
-- Dua pagar yang sengaja dipasang:
--
--   1. Admin tidak bisa menghapus dirinya sendiri — kalau ia satu-satunya
--      admin, situs kehilangan seluruh akses pengelolaan dan tidak ada jalan
--      kembali lewat UI.
--   2. Admin lain harus dicabut status adminnya dulu. Dua langkah untuk
--      tindakan yang tidak bisa dibatalkan, dan pencabutan itu tercatat
--      sebagai keputusan tersendiri.
-- ============================================================================

create or replace function public.admin_delete_user(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role     text;
  v_name     text;
  v_username text;
  v_whatsapp text;
  v_label    text;
begin
  if not public.is_admin() then
    raise exception 'Akses ditolak — hanya admin yang boleh menghapus pengguna.'
      using errcode = '42501';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Kamu tidak bisa menghapus akunmu sendiri.';
  end if;

  select p.role, p.full_name, p.username, p.whatsapp
    into v_role, v_name, v_username, v_whatsapp
    from public.profiles p
   where p.id = p_user_id;

  if not found then
    raise exception 'Pengguna tidak ditemukan (mungkin sudah dihapus).';
  end if;

  if v_role = 'admin' then
    raise exception 'Cabut status admin akun ini dulu sebelum menghapusnya.';
  end if;

  v_label := coalesce(nullif(btrim(v_name), ''), nullif(btrim(v_username), ''), 'Pengguna terhapus');

  -- Catatan usaha dipertahankan; identitas pembeli dibekukan jadi teks biasa.
  update public.orders
     set buyer_name     = coalesce(nullif(btrim(buyer_name), ''), v_label),
         buyer_whatsapp = coalesce(nullif(btrim(buyer_whatsapp), ''), v_whatsapp),
         buyer_id       = null
   where buyer_id = p_user_id;

  -- topup_orders tidak punya kolom buyer_name (lihat migrasi 2) — nomor
  -- WhatsApp-nya saja yang bisa diselamatkan.
  update public.topup_orders
     set buyer_whatsapp = coalesce(nullif(btrim(buyer_whatsapp), ''), v_whatsapp),
         user_id        = null
   where user_id = p_user_id;

  update public.rekber_orders
     set buyer_name     = coalesce(nullif(btrim(buyer_name), ''), v_label),
         buyer_whatsapp = coalesce(nullif(btrim(buyer_whatsapp), ''), v_whatsapp),
         requester_id   = null
   where requester_id = p_user_id;

  -- Produk toko: penjualnya toko itu sendiri, bukan pengguna. Kalau ada yang
  -- tercatat atas nama akun ini, tautannya dilepas supaya katalog tidak ikut
  -- hilang bersama akunnya.
  update public.products set seller_id = null where seller_id = p_user_id;

  delete from public.community_posts where author_id = p_user_id;

  -- profiles, wishlists, dan seluruh sesi login ikut lewat ON DELETE CASCADE.
  delete from auth.users where id = p_user_id;

  return v_label;
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
