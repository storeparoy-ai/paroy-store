-- ============================================================================
-- Migration: tutup lubang — admin terbatas masih bisa membaca & menulis
--            pengaturan notifikasi (termasuk token bot)
--
-- APA YANG TERJADI
--
-- Migrasi 19 memindahkan tabel notification_settings jadi milik pemilik saja.
-- Caranya seperti tabel lain: `drop policy if exists` lalu `create policy`.
-- Tapi nama yang dipakai untuk men-DROP salah ketik:
--
--     ditulis di migrasi 19 : "Admins can read notification settings"
--     nama sesungguhnya     : "Only admins can view notification settings."
--
-- `drop policy if exists` dengan nama yang tidak ada TIDAK MENGELUARKAN ERROR.
-- Jadi migrasi 19 berjalan mulus, melaporkan sukses, dan meninggalkan tiga
-- kebijakan lama berbasis is_admin() TETAP HIDUP berdampingan dengan tiga
-- kebijakan baru berbasis is_owner().
--
-- Postgres meng-OR-kan kebijakan yang sejenis: satu saja yang mengizinkan,
-- aksesnya lolos. Hasilnya persis kebalikan dari yang dimaksud — SETIAP admin,
-- termasuk yang cuma diberi izin "Pesanan", tetap bisa:
--
--   * membaca bot_token dan chat_id (token bot itu setara kata sandi), dan
--   * MENGUBAH chat_id, yaitu membelokkan seluruh notifikasi pesanan ke chat
--     miliknya sendiri tanpa pemilik pernah tahu.
--
-- Ditemukan saat menguji batas admin terbatas dari sesi login sungguhan —
-- memanggil Supabase langsung, bukan lewat situs. Menu "Notifikasi" memang
-- tidak muncul di dashboardnya, dan itulah yang membuatnya berbahaya:
-- tampilannya sudah benar, jadi tidak ada yang terlihat salah.
--
-- CATATAN untuk perubahan kebijakan berikutnya: mengganti nama kebijakan itu
-- operasi yang gagal secara DIAM-DIAM ke arah yang lebih longgar. Karena itu
-- dua tabel pemegang rahasia di bawah tidak lagi ditulis dengan pasangan
-- drop-nama/create-nama, melainkan: BUANG SEMUA kebijakan yang ada di tabel
-- itu apa pun namanya, baru pasang yang benar. Dengan begitu daftar di berkas
-- ini adalah satu-satunya kebenaran, dan salah ketik tidak bisa lagi
-- meninggalkan pintu lama terbuka.
-- ============================================================================

do $bersihkan$
declare
  v_policy record;
begin
  for v_policy in
    select policyname, tablename
      from pg_policies
     where schemaname = 'public'
       and tablename in ('notification_settings', 'payment_gateway_settings')
  loop
    execute format('drop policy %I on public.%I', v_policy.policyname, v_policy.tablename);
    raise notice 'Kebijakan lama dibuang: %.%', v_policy.tablename, v_policy.policyname;
  end loop;
end;
$bersihkan$;


-- Pengaturan notifikasi: token bot + chat tujuan. Pemilik saja.
create policy "notification_settings_owner_select" on public.notification_settings
  for select using (public.is_owner());

create policy "notification_settings_owner_insert" on public.notification_settings
  for insert with check (public.is_owner());

create policy "notification_settings_owner_update" on public.notification_settings
  for update using (public.is_owner()) with check (public.is_owner());

create policy "notification_settings_owner_delete" on public.notification_settings
  for delete using (public.is_owner());


-- Gateway pembayaran: private key Tripay. Pemilik saja.
create policy "payment_gateway_owner_select" on public.payment_gateway_settings
  for select using (public.is_owner());

create policy "payment_gateway_owner_insert" on public.payment_gateway_settings
  for insert with check (public.is_owner());

create policy "payment_gateway_owner_update" on public.payment_gateway_settings
  for update using (public.is_owner()) with check (public.is_owner());

create policy "payment_gateway_owner_delete" on public.payment_gateway_settings
  for delete using (public.is_owner());


-- Perhatikan `with check` pada UPDATE di atas — migrasi 19 hanya memasang
-- `using`. Keduanya perlu: `using` menentukan baris mana yang boleh disentuh,
-- `with check` menentukan boleh jadi apa baris itu sesudahnya. Tanpa `with
-- check`, sebuah UPDATE yang lolos `using` boleh menulis nilai apa pun.


-- ---------------------------------------------------------------------------
-- Pemeriksa mandiri: pastikan tidak ada kebijakan tersisa yang memakai
-- is_admin() pada dua tabel ini. Kalau ada, migrasi ini GAGAL dengan pesan
-- yang jelas alih-alih diam seperti migrasi 19.
-- ---------------------------------------------------------------------------
do $periksa$
declare
  v_sisa text;
begin
  select string_agg(tablename || '.' || policyname, ', ')
    into v_sisa
    from pg_policies
   where schemaname = 'public'
     and tablename in ('notification_settings', 'payment_gateway_settings')
     and coalesce(qual, '') || coalesce(with_check, '') not like '%is_owner%';

  if v_sisa is not null then
    raise exception 'Masih ada kebijakan yang bukan is_owner() pada tabel rahasia: %', v_sisa;
  end if;

  raise notice 'Bersih: seluruh kebijakan pada notification_settings & payment_gateway_settings kini pemilik saja.';
end;
$periksa$;
