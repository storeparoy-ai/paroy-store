-- ============================================================================
-- Migration: pemilik (owner) + admin dengan izin terbatas
--
-- MASALAHNYA
--
-- Sampai migrasi 18, kekuasaan di situs ini cuma punya satu tingkat: 'admin'.
-- Siapa pun yang diangkat langsung memegang SEMUA — termasuk mengganti nomor
-- rekening tujuan di Metode Pembayaran (uang pembeli masuk ke rekening lain,
-- dan halaman checkout tetap terlihat normal), kunci rahasia Tripay, token bot
-- Telegram, nomor WhatsApp seluruh pelanggan, dan kebijakan "Admins can update
-- any profile" yang membuatnya bisa mencabut status admin ORANG YANG
-- MENGANGKATNYA lalu menghapus akunnya.
--
-- Artinya tidak ada cara meminta seseorang bantu memeriksa bukti transfer
-- tanpa menyerahkan kunci brankas. Bukan karena pintu depannya lemah — dari
-- luar situs ini tidak bisa ditembus, dan itu diuji ulang tiap `npm test` —
-- tapi karena tidak ada kunci yang lebih kecil untuk diberikan.
--
-- YANG DIBANGUN DI SINI
--
--   role = 'owner'  Pemilik toko. Kekuasaan penuh, dan statusnya TIDAK BISA
--                   diubah lewat situs oleh siapa pun, termasuk dirinya
--                   sendiri — lihat trigger di bagian 4. Satu-satunya jalan
--                   mengubahnya adalah SQL Editor, yang butuh akses ke akun
--                   Supabase. Itulah arti "tidak bisa diganggu gugat".
--
--   role = 'admin'  Pembantu. Tidak punya apa-apa secara bawaan; yang boleh
--                   ia sentuh ditentukan satu per satu oleh owner lewat kolom
--                   `permissions`, dari halaman Pengguna.
--
-- Empat izin yang bisa diberikan, dan lima hal yang tidak pernah bisa:
--
--   Bisa diberikan             | Selamanya owner saja
--   ---------------------------|------------------------------------------
--   pesanan   Dashboard,       | Pengguna (angkat/cabut/hapus admin)
--             Pesanan,         | Metode Pembayaran (nomor rekening tujuan)
--             bukti transfer   | Gateway Pembayaran (kunci Tripay)
--   produk    Jual beli akun   | Notifikasi (token bot Telegram)
--   katalog   Top Up, Game,    | Pengaturan Situs
--             Rentang Harga,   |
--             Flash Sale,      |
--             Tarif Rekber     |
--   komunitas Moderasi         |
--
-- KENAPA SEMUA KEBIJAKAN DITULIS ULANG
--
-- 32 kebijakan RLS yang ada menuliskan pemeriksaannya sebagai literal
-- `(select role from profiles where id = auth.uid()) = 'admin'`. Kalau owner
-- diberi role baru sementara kebijakan itu dibiarkan, owner justru TERKUNCI
-- dari tabelnya sendiri. Dan kalau owner tetap ber-role 'admin', setiap
-- kebijakan yang terlewat diam-diam memberi pembantu akses penuh — kegagalan
-- yang tidak terlihat sampai terlambat.
--
-- Jadi seluruhnya diganti ke fungsi helper. Setelah ini tidak ada lagi kata
-- 'admin' yang ditulis harfiah di dalam kebijakan mana pun: satu tempat untuk
-- diubah, dan pemeriksaan yang sama persis di semua tabel.
--
-- MENYEMBUNYIKAN TAB TIDAK MENGAMANKAN APA PUN. Pagarnya ada di sini, di
-- database. Menu yang disaring di app/admin/layout.tsx hanya kerapian
-- tampilan — yang benar-benar menolak adalah RLS di bawah ini, yang berlaku
-- juga saat seseorang memanggil Supabase langsung dari luar situs.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Kolom izin
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists permissions text[] not null default '{}';

-- Batasi isinya ke daftar yang dikenal. Tanpa ini satu salah ketik ('pesana')
-- menghasilkan admin yang izinnya tidak pernah berlaku tanpa pesan error apa
-- pun, dan 'owner' bisa diselundupkan ke dalam array seolah-olah izin biasa.
alter table public.profiles drop constraint if exists profiles_permissions_known;
alter table public.profiles add constraint profiles_permissions_known
  check (permissions <@ array['pesanan', 'produk', 'katalog', 'komunitas']::text[]);

update public.profiles set role = 'user' where role is null;

alter table public.profiles drop constraint if exists profiles_role_known;
alter table public.profiles add constraint profiles_role_known
  check (role in ('user', 'admin', 'owner'));


-- ---------------------------------------------------------------------------
-- 2. Helper
--
-- Ketiganya SECURITY DEFINER supaya pembacaan profiles di dalamnya melewati
-- RLS — alasan yang sama seperti is_admin() di migrasi 10: kebijakan SELECT
-- pada profiles sendiri memanggil helper ini, dan subquery biasa akan memicu
-- "infinite recursion detected in policy for relation profiles".
-- ---------------------------------------------------------------------------
create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $fn$
  select coalesce((select p.role from public.profiles p where p.id = auth.uid()), '') = 'owner';
$fn$;

-- is_admin() sekarang berarti "punya akses ke dashboard sama sekali" —
-- owner termasuk di dalamnya. Dipakai untuk hal yang memang berlaku bagi
-- keduanya (misalnya boleh membuka /admin), BUKAN untuk izin per-menu.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $fn$
  select coalesce((select p.role from public.profiles p where p.id = auth.uid()), '')
         in ('admin', 'owner');
$fn$;

-- Pemeriksaan yang sebenarnya dipakai kebijakan di bawah. Owner selalu lolos;
-- admin lolos hanya kalau izin itu ada di dalam array miliknya.
create or replace function public.admin_can(p_perm text)
returns boolean
language sql
security definer
stable
set search_path = public
as $fn$
  select exists (
    select 1 from public.profiles p
     where p.id = auth.uid()
       and (p.role = 'owner' or (p.role = 'admin' and p_perm = any(p.permissions)))
  );
$fn$;

grant execute on function public.is_owner() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.admin_can(text) to anon, authenticated;


-- ---------------------------------------------------------------------------
-- 3. Angkat pemilik
--
-- Admin yang paling lama terdaftar menjadi owner — itu akun yang mendirikan
-- toko ini. Admin lain (kalau ada) tetap admin, tapi diberi keempat izin
-- sekaligus supaya tidak ada yang tiba-tiba kehilangan akses yang sudah
-- dipakainya; owner tinggal mengurangi lewat halaman Pengguna.
--
-- Idempoten: kalau owner sudah ada, blok ini tidak melakukan apa-apa, jadi
-- migrasi ini aman dijalankan dua kali.
-- ---------------------------------------------------------------------------
do $seed$
declare
  v_first uuid;
begin
  if exists (select 1 from public.profiles where role = 'owner') then
    raise notice 'Owner sudah ada - pengangkatan dilewati.';
    return;
  end if;

  select p.id into v_first
    from public.profiles p
   where p.role = 'admin'
   order by p.created_at asc nulls last, p.id asc
   limit 1;

  if v_first is null then
    raise notice 'Belum ada admin sama sekali - tidak ada yang bisa diangkat jadi owner.';
    return;
  end if;

  update public.profiles set role = 'owner', permissions = '{}' where id = v_first;
  update public.profiles
     set permissions = array['pesanan', 'produk', 'katalog', 'komunitas']
   where role = 'admin';

  raise notice 'Owner diangkat: %', v_first;
end;
$seed$;


-- ---------------------------------------------------------------------------
-- 4. Penjaga kolom role & permissions
--
-- Menggantikan guard_profile_role_change dari migrasi 10, yang hanya menjaga
-- `role` dan hanya menuntut "admin". Tiga aturan sekarang:
--
--   a. Hanya owner yang boleh menyentuh role atau permissions siapa pun.
--      Admin biasa tidak bisa mengangkat dirinya sendiri, tidak bisa memberi
--      izin tambahan pada dirinya sendiri, dan tidak bisa mencabut hak
--      siapa pun.
--   b. Status owner tidak bisa diberikan maupun dicabut lewat situs sama
--      sekali — bahkan oleh owner itu sendiri. Ini yang membuatnya "tidak
--      bisa diganggu gugat": tidak ada rangkaian klik di dashboard yang bisa
--      menghilangkannya, jadi juga tidak ada yang bisa dilakukan orang yang
--      berhasil membajak sesi seorang admin.
--   c. auth.uid() NULL (SQL Editor, service role) tetap boleh — itu jalur
--      pemulihan satu-satunya, dan butuh akses ke akun Supabase itu sendiri.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if new.role is distinct from old.role
     or new.permissions is distinct from old.permissions then

    if auth.uid() is null then
      return new; -- SQL Editor / service role: jalur pemulihan.
    end if;

    if not public.is_owner() then
      raise exception 'Hanya pemilik yang boleh mengubah hak akses pengguna.'
        using errcode = '42501';
    end if;

    if old.role = 'owner' or new.role = 'owner' then
      raise exception 'Status pemilik tidak bisa diubah lewat situs. Gunakan SQL Editor Supabase.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$fn$;

drop trigger if exists profiles_guard_role_change on public.profiles;
create trigger profiles_guard_role_change
  before update on public.profiles
  for each row
  execute function public.guard_profile_role_change();


-- ---------------------------------------------------------------------------
-- 5. PESANAN — izin 'pesanan'
--
-- SELECT ikut dibatasi, bukan hanya UPDATE. Membaca tabel pesanan berarti
-- membaca nama dan nomor WhatsApp setiap pembeli; admin katalog tidak perlu
-- itu, dan RLS adalah satu-satunya yang benar-benar menahannya.
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view their own orders." on public.orders;
create policy "Users can view their own orders." on public.orders
  for select using (auth.uid() = buyer_id or public.admin_can('pesanan'));

drop policy if exists "Only admins can update orders." on public.orders;
create policy "Only admins can update orders." on public.orders
  for update using (public.admin_can('pesanan'));

drop policy if exists "Users can view their own topups." on public.topup_orders;
create policy "Users can view their own topups." on public.topup_orders
  for select using (auth.uid() = user_id or public.admin_can('pesanan'));

drop policy if exists "Only admins can update topups." on public.topup_orders;
create policy "Only admins can update topups." on public.topup_orders
  for update using (public.admin_can('pesanan'));

drop policy if exists "Users can view their own rekber." on public.rekber_orders;
create policy "Users can view their own rekber." on public.rekber_orders
  for select using (auth.uid() = requester_id or public.admin_can('pesanan'));

drop policy if exists "Only admins can update rekber." on public.rekber_orders;
create policy "Only admins can update rekber." on public.rekber_orders
  for update using (public.admin_can('pesanan'));

-- Bukti transfer: bucket privat, isinya foto struk berisi nama dan nominal.
drop policy if exists "Admins can read payment proofs" on storage.objects;
create policy "Admins can read payment proofs" on storage.objects
  for select using (bucket_id = 'payment-proofs' and public.admin_can('pesanan'));

drop policy if exists "Admins can delete payment proofs" on storage.objects;
create policy "Admins can delete payment proofs" on storage.objects
  for delete using (bucket_id = 'payment-proofs' and public.admin_can('pesanan'));


-- ---------------------------------------------------------------------------
-- 6. PRODUK — izin 'produk'
-- ---------------------------------------------------------------------------
drop policy if exists "Only admins can insert products." on public.products;
create policy "Only admins can insert products." on public.products
  for insert with check (public.admin_can('produk'));

drop policy if exists "Admins and sellers can update their products." on public.products;
create policy "Admins and sellers can update their products." on public.products
  for update using (auth.uid() = seller_id or public.admin_can('produk'));

drop policy if exists "Only admins can delete products." on public.products;
create policy "Only admins can delete products." on public.products
  for delete using (public.admin_can('produk'));


-- ---------------------------------------------------------------------------
-- 7. KATALOG — izin 'katalog'
-- ---------------------------------------------------------------------------
drop policy if exists "Only admins can insert games." on public.games;
create policy "Only admins can insert games." on public.games
  for insert with check (public.admin_can('katalog'));

drop policy if exists "Only admins can update games." on public.games;
create policy "Only admins can update games." on public.games
  for update using (public.admin_can('katalog'));

drop policy if exists "Only admins can delete games." on public.games;
create policy "Only admins can delete games." on public.games
  for delete using (public.admin_can('katalog'));

drop policy if exists "Only admins can insert topup items." on public.topup_items;
create policy "Only admins can insert topup items." on public.topup_items
  for insert with check (public.admin_can('katalog'));

drop policy if exists "Only admins can update topup items." on public.topup_items;
create policy "Only admins can update topup items." on public.topup_items
  for update using (public.admin_can('katalog'));

drop policy if exists "Only admins can delete topup items." on public.topup_items;
create policy "Only admins can delete topup items." on public.topup_items
  for delete using (public.admin_can('katalog'));

drop policy if exists "Only admins can insert price ranges." on public.product_price_ranges;
create policy "Only admins can insert price ranges." on public.product_price_ranges
  for insert with check (public.admin_can('katalog'));

drop policy if exists "Only admins can update price ranges." on public.product_price_ranges;
create policy "Only admins can update price ranges." on public.product_price_ranges
  for update using (public.admin_can('katalog'));

drop policy if exists "Only admins can delete price ranges." on public.product_price_ranges;
create policy "Only admins can delete price ranges." on public.product_price_ranges
  for delete using (public.admin_can('katalog'));

drop policy if exists "Only admins can insert flash sales." on public.flash_sales;
create policy "Only admins can insert flash sales." on public.flash_sales
  for insert with check (public.admin_can('katalog'));

drop policy if exists "Only admins can update flash sales." on public.flash_sales;
create policy "Only admins can update flash sales." on public.flash_sales
  for update using (public.admin_can('katalog'));

-- Flash sale tidak pernah punya kebijakan DELETE sejak migrasi 1, jadi tombol
-- hapusnya di dashboard selalu gagal diam-diam. Sekalian dibuatkan.
drop policy if exists "Only admins can delete flash sales." on public.flash_sales;
create policy "Only admins can delete flash sales." on public.flash_sales
  for delete using (public.admin_can('katalog'));

drop policy if exists "Only admins can insert rekber fee tiers." on public.rekber_fee_tiers;
create policy "Only admins can insert rekber fee tiers." on public.rekber_fee_tiers
  for insert with check (public.admin_can('katalog'));

drop policy if exists "Only admins can update rekber fee tiers." on public.rekber_fee_tiers;
create policy "Only admins can update rekber fee tiers." on public.rekber_fee_tiers
  for update using (public.admin_can('katalog'));

drop policy if exists "Only admins can delete rekber fee tiers." on public.rekber_fee_tiers;
create policy "Only admins can delete rekber fee tiers." on public.rekber_fee_tiers
  for delete using (public.admin_can('katalog'));


-- ---------------------------------------------------------------------------
-- 8. KOMUNITAS — izin 'komunitas'
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can delete community posts." on public.community_posts;
create policy "Admins can delete community posts." on public.community_posts
  for delete using (public.admin_can('komunitas'));

drop policy if exists "Authors and admins can delete comments." on public.community_comments;
create policy "Authors and admins can delete comments." on public.community_comments
  for delete using (auth.uid() = author_id or public.admin_can('komunitas'));


-- ---------------------------------------------------------------------------
-- 9. HANYA PEMILIK
--
-- Empat hal yang kalau salah tangan berarti uang pembeli berpindah rekening
-- atau kunci rahasia toko berpindah tangan.
-- ---------------------------------------------------------------------------
drop policy if exists "Only admins can insert payment methods." on public.payment_methods;
create policy "Only admins can insert payment methods." on public.payment_methods
  for insert with check (public.is_owner());

drop policy if exists "Only admins can update payment methods." on public.payment_methods;
create policy "Only admins can update payment methods." on public.payment_methods
  for update using (public.is_owner());

drop policy if exists "Only admins can delete payment methods." on public.payment_methods;
create policy "Only admins can delete payment methods." on public.payment_methods
  for delete using (public.is_owner());

drop policy if exists "Only admins can view payment gateway settings." on public.payment_gateway_settings;
create policy "Only admins can view payment gateway settings." on public.payment_gateway_settings
  for select using (public.is_owner());

drop policy if exists "Only admins can insert payment gateway settings." on public.payment_gateway_settings;
create policy "Only admins can insert payment gateway settings." on public.payment_gateway_settings
  for insert with check (public.is_owner());

drop policy if exists "Only admins can update payment gateway settings." on public.payment_gateway_settings;
create policy "Only admins can update payment gateway settings." on public.payment_gateway_settings
  for update using (public.is_owner());

drop policy if exists "Admins can read notification settings" on public.notification_settings;
create policy "Admins can read notification settings" on public.notification_settings
  for select using (public.is_owner());

drop policy if exists "Admins can insert notification settings" on public.notification_settings;
create policy "Admins can insert notification settings" on public.notification_settings
  for insert with check (public.is_owner());

drop policy if exists "Admins can update notification settings" on public.notification_settings;
create policy "Admins can update notification settings" on public.notification_settings
  for update using (public.is_owner());

drop policy if exists "Only admins can insert site settings." on public.site_settings;
create policy "Only admins can insert site settings." on public.site_settings
  for insert with check (public.is_owner());

drop policy if exists "Only admins can update site settings." on public.site_settings;
create policy "Only admins can update site settings." on public.site_settings
  for update using (public.is_owner());

-- Halaman Pengguna: daftar seluruh pelanggan lengkap dengan nomor WhatsApp.
-- Dulu terbuka untuk semua admin; sekarang hanya pemilik.
drop policy if exists "Users can view their own profile." on public.profiles;
create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id or public.is_owner());

drop policy if exists "Admins can update any profile." on public.profiles;
create policy "Admins can update any profile." on public.profiles
  for update using (public.is_owner());


-- ---------------------------------------------------------------------------
-- 10. Gambar di bucket publik
--
-- Dipakai foto produk (izin produk), ikon game (izin katalog), dan logo situs
-- (owner). Satu bucket, jadi siapa pun yang boleh mengurus salah satunya boleh
-- mengunggah — isinya memang untuk dipajang, bukan rahasia.
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can upload to public-assets" on storage.objects;
create policy "Admins can upload to public-assets" on storage.objects
  for insert with check (
    bucket_id = 'public-assets'
    and (public.is_owner() or public.admin_can('produk') or public.admin_can('katalog'))
  );

drop policy if exists "Admins can update public-assets" on storage.objects;
create policy "Admins can update public-assets" on storage.objects
  for update using (
    bucket_id = 'public-assets'
    and (public.is_owner() or public.admin_can('produk') or public.admin_can('katalog'))
  );

drop policy if exists "Admins can delete from public-assets" on storage.objects;
create policy "Admins can delete from public-assets" on storage.objects
  for delete using (
    bucket_id = 'public-assets'
    and (public.is_owner() or public.admin_can('produk') or public.admin_can('katalog'))
  );


-- ---------------------------------------------------------------------------
-- 11. Penghapusan akun (migrasi 18) naik jadi hak pemilik
--
-- Tanda tangannya tidak berubah, jadi tidak ada urutan deploy yang berbahaya.
-- Dua pagar tambahan: yang boleh menghapus hanya owner, dan akun owner sendiri
-- tidak bisa dihapus lewat situs sama sekali.
-- ---------------------------------------------------------------------------
create or replace function public.admin_delete_user(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_role     text;
  v_name     text;
  v_username text;
  v_whatsapp text;
  v_label    text;
begin
  if not public.is_owner() then
    raise exception 'Akses ditolak — hanya pemilik yang boleh menghapus pengguna.'
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

  if v_role = 'owner' then
    raise exception 'Akun pemilik tidak bisa dihapus lewat situs.';
  end if;

  v_label := coalesce(nullif(btrim(v_name), ''), nullif(btrim(v_username), ''), 'Pengguna terhapus');

  update public.orders
     set buyer_name     = coalesce(nullif(btrim(buyer_name), ''), v_label),
         buyer_whatsapp = coalesce(nullif(btrim(buyer_whatsapp), ''), v_whatsapp),
         buyer_id       = null
   where buyer_id = p_user_id;

  update public.topup_orders
     set buyer_whatsapp = coalesce(nullif(btrim(buyer_whatsapp), ''), v_whatsapp),
         user_id        = null
   where user_id = p_user_id;

  update public.rekber_orders
     set buyer_name     = coalesce(nullif(btrim(buyer_name), ''), v_label),
         buyer_whatsapp = coalesce(nullif(btrim(buyer_whatsapp), ''), v_whatsapp),
         requester_id   = null
   where requester_id = p_user_id;

  update public.products set seller_id = null where seller_id = p_user_id;

  delete from public.community_posts where author_id = p_user_id;
  delete from auth.users where id = p_user_id;

  return v_label;
end;
$fn$;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
