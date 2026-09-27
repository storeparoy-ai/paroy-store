-- Maskot baru "Paroy Hoodie" (dipilih pemilik 2026-09-27, dari kanvas
-- desain tiga konsep) menggantikan poster JPG berlatar putih.
--
-- !! JALANKAN SETELAH KODENYA TAYANG DI VERCEL !!
-- Berkas /mascot/paroy-hoodie.svg baru ada setelah deploy. Kalau SQL ini
-- dijalankan lebih dulu, hero beranda menunjuk ke berkas yang belum ada dan
-- gambarnya rusak sampai deploy selesai (kejadian yang sama dengan ikon game
-- di migrasi 23).
--
-- Maskot lama tetap tersimpan di Storage; admin bisa mengunggah gambar lain
-- kapan saja lewat Admin → Pengaturan Situs, yang juga langsung memperbarui
-- beranda. Tanpa itu beranda menyesuaikan dalam ±1 jam (cache).

update public.site_settings
set mascot_image_url = '/mascot/paroy-hoodie.svg',
    updated_at = now()
where id = 1;

-- Periksa: select mascot_image_url from public.site_settings;
