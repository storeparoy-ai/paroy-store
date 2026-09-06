-- ============================================================================
-- Migration: isi pesan notifikasi bisa diatur dari dashboard
--
-- Sampai sekarang yang bisa diatur pemilik cuma token, chat ID, dan tiga
-- sakelar on/off. Susunan pesannya sendiri ditulis keras di lib/notify.ts,
-- jadi mengubah satu kata pun berarti mengubah kode dan deploy ulang.
--
-- Dua kolom di bawah memindahkan susunan itu ke database. Isinya template
-- dengan penanda seperti {invoice} dan {nominal} yang diganti nilai sungguhan
-- saat dikirim — lihat lib/notify-template.ts, yang sengaja dibuat modul murni
-- supaya berkas yang sama dipakai server saat mengirim DAN browser saat
-- menampilkan pratinjau. Kalau keduanya memakai kode berbeda, pratinjaunya
-- cepat atau lambat akan berbohong.
--
-- Nilai awalnya persis susunan yang selama ini terkirim, jadi tidak ada yang
-- berubah di Telegram sampai pemilik benar-benar menyuntingnya.
--
-- Kolomnya boleh NULL dengan arti "pakai bawaan aplikasi". Itu bukan
-- kemalasan: kalau pemilik mengosongkan kotaknya sampai benar-benar kosong,
-- yang benar adalah kembali ke pesan bawaan, bukan mengirim notifikasi kosong
-- yang ditolak Telegram dan hilang tanpa jejak.
--
-- Catatan keamanan: tabel ini hanya bisa dibaca dan ditulis PEMILIK sejak
-- migrasi 19. Template boleh memuat tag HTML (<b>, <code>, <a>) karena itu
-- justru gunanya, dan yang menulisnya adalah pemilik toko sendiri ke chat
-- miliknya sendiri. Yang TIDAK boleh dipercaya adalah nilai yang disisipkan
-- ke dalamnya — nama pembeli dan catatan itu input bebas dari pengunjung, dan
-- semuanya di-escape di lib/notify-template.ts sebelum masuk template.
-- ============================================================================

alter table public.notification_settings
  add column if not exists template_new_order    text,
  add column if not exists template_proof_upload text;

comment on column public.notification_settings.template_new_order is
  'Template pesan "pesanan baru". NULL = pakai bawaan aplikasi. Penanda: {jenis} {invoice} {item} {nominal} {pembeli} {whatsapp} {metode} {catatan} {link} {waktu}';

comment on column public.notification_settings.template_proof_upload is
  'Template pesan "bukti transfer masuk". NULL = pakai bawaan aplikasi. Penanda: {invoice} {link} {waktu}';

-- Kalau barisnya belum ada sama sekali (migrasi 15 baru jalan di project
-- kosong), buat satu supaya halaman Notifikasi punya sesuatu untuk disunting.
insert into public.notification_settings (id) values (1)
on conflict (id) do nothing;

-- Isi baris yang sudah ada dengan susunan yang selama ini dipakai, supaya
-- pemilik melihat teks sungguhan saat pertama membuka halaman Notifikasi —
-- bukan kotak kosong yang menyesatkan ("berarti tidak ada pesan?").
update public.notification_settings
   set template_new_order = concat_ws(E'\n',
         '<b>{jenis}</b>',
         '',
         'Invoice  : <code>{invoice}</code>',
         'Item     : {item}',
         'Nominal  : <b>{nominal}</b>',
         'Pembeli  : {pembeli}',
         'WhatsApp : {whatsapp}',
         'Bayar    : {metode}',
         'Catatan  : {catatan}',
         '',
         '⏳ Menunggu bukti transfer dari pembeli.',
         '{link}'
       )
 where id = 1 and template_new_order is null;

update public.notification_settings
   set template_proof_upload = concat_ws(E'\n',
         '<b>💸 Bukti transfer masuk</b>',
         '',
         'Invoice : <code>{invoice}</code>',
         'Jam     : {waktu}',
         '',
         'Cek buktinya lalu ubah status pesanan.',
         '{link}'
       )
 where id = 1 and template_proof_upload is null;
