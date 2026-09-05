-- ============================================================================
-- Migration: tutup 3 celah kritis yang ditemukan pada audit 2026-09-04.
--
--   SEC-01  Pengguna biasa bisa mengangkat dirinya sendiri jadi admin.
--   SEC-02  Nominal pesanan dikirim dari browser, bukan diambil dari database.
--   SEC-03  Nama + nomor WhatsApp seluruh pengguna bisa dibaca publik.
--
-- Urutan di bawah penting: helper is_admin() dipakai oleh bagian SEC-01 dan
-- SEC-03, jadi ia harus dibuat lebih dulu.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0. Helper: cek apakah pemanggil saat ini admin.
--
-- SECURITY DEFINER supaya pembacaan public.profiles di dalamnya MELEWATI RLS.
-- Ini bukan kemudahan, tapi keharusan: kebijakan SELECT baru pada tabel
-- profiles (bagian SEC-03) sendiri perlu tahu "apakah pemanggil admin?", dan
-- kalau pengecekan itu ditulis sebagai subquery biasa ke profiles, subquery
-- tersebut akan memicu kebijakan yang sama secara berulang — Postgres
-- menolaknya dengan "infinite recursion detected in policy for relation
-- profiles". Membungkusnya di fungsi DEFINER memutus lingkaran itu.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select p.role from public.profiles p where p.id = auth.uid()),
    ''
  ) = 'admin';
$$;

grant execute on function public.is_admin() to anon, authenticated;


-- ---------------------------------------------------------------------------
-- SEC-01. Kolom `role` tidak boleh diubah oleh pemiliknya sendiri.
--
-- Akar masalah: kebijakan "Users can update own profile" (migrasi 00) memberi
-- izin per-BARIS, sementara RLS Postgres memang tidak bisa membatasi per-KOLOM.
-- Jadi siapa pun yang punya akun bisa mengirim satu permintaan PATCH ke
-- barisnya sendiri berisi {"role":"admin"} memakai kunci anon yang memang
-- tertanam di browser — dan seketika memegang seluruh dashboard admin,
-- data pesanan, data pribadi pembeli, sampai kunci rahasia Tripay.
--
-- Trigger di bawah menutupnya di lapisan yang benar (kolom), tanpa mengganggu
-- pengguna yang sekadar mengubah nama atau nomor WhatsApp-nya: kalau `role`
-- tidak berubah, tidak ada pemeriksaan tambahan sama sekali.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- auth.uid() bernilai NULL pada konteks tanpa sesi: service_role, SQL
    -- Editor, dan superuser. Itulah jalur yang dipakai untuk mengangkat admin
    -- PERTAMA (lihat catatan "Becoming the first admin"), jadi jalur itu harus
    -- tetap terbuka. Ini tidak melemahkan penjagaan: peramban tidak pernah
    -- sampai ke sini dengan uid kosong, karena kebijakan RLS yang mengizinkan
    -- baris ini disentuh mensyaratkan auth.uid() = id.
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'Hanya admin yang boleh mengubah role pengguna.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role_change on public.profiles;
create trigger profiles_guard_role_change
  before update on public.profiles
  for each row
  execute function public.guard_profile_role_change();


-- ---------------------------------------------------------------------------
-- SEC-03. Tutup kebocoran nama + nomor WhatsApp seluruh pengguna.
--
-- Sebelumnya: "Public profiles are viewable by everyone" (USING true) membuka
-- SELURUH kolom profiles — termasuk `whatsapp` — untuk pengunjung anonim. Satu
-- permintaan REST sudah cukup untuk menarik daftar lengkap nama dan nomor HP
-- semua pelanggan; bahan sempurna bagi penipu untuk menyaru sebagai admin
-- Paroy Store, yaitu persis ancaman yang jadi nilai jual situs ini.
--
-- Sesudahnya: baris profil hanya bisa dibaca pemiliknya sendiri dan admin.
-- Halaman Leaderboard dan Komunitas yang memang butuh nama + avatar publik
-- dilayani lewat view sempit di bawah, yang tidak memuat kolom sensitif.
-- ---------------------------------------------------------------------------
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can view their own profile." on public.profiles;
create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- View publik: hanya kolom yang memang aman dipajang. Sengaja TIDAK memakai
-- security_invoker, supaya view berjalan dengan hak pemiliknya dan melewati
-- RLS tabel di baliknya — itulah yang membuat Leaderboard & Komunitas tetap
-- bisa menampilkan nama pemenang tanpa ikut membuka nomor teleponnya.
drop view if exists public.public_profiles;
create view public.public_profiles
with (security_invoker = false)
as select id, full_name, username, avatar_url from public.profiles;

grant select on public.public_profiles to anon, authenticated;


-- ---------------------------------------------------------------------------
-- SEC-02. Nominal pesanan dihitung di database, bukan dikirim browser.
--
-- Sebelumnya create_guest_order/rekber menyimpan `p_amount` apa adanya, dan
-- hak panggilnya terbuka untuk `anon`. Artinya siapa pun bisa menerbitkan
-- invoice resmi untuk akun Rp5.000.000 bertuliskan Rp1.000 — tanpa perlu
-- membuka situsnya sama sekali — dan untuk Rekber bahkan mengisi biaya jasa
-- dengan nol.
--
-- PENTING: fungsi lama WAJIB di-DROP, bukan sekadar ditimpa. Postgres
-- membedakan fungsi berdasarkan tanda tangannya, jadi versi lama yang masih
-- menerima p_amount akan tetap bisa dipanggil dan celahnya tetap terbuka.
-- ---------------------------------------------------------------------------
drop function if exists public.create_guest_order(text, text, uuid, numeric, text, text, text);
drop function if exists public.create_guest_rekber(text, text, text, numeric, numeric, uuid);

-- --- Pembelian & sewa akun ---------------------------------------------------
create or replace function public.create_guest_order(
  p_buyer_name     text,
  p_buyer_whatsapp text,
  p_product_id     uuid,
  p_payment_method text,
  p_mode           text default 'buy',
  p_note           text default null,
  -- Hanya dipakai saat p_mode = 'rental'.
  p_rental_unit    text default null,   -- 'hourly' | 'daily'
  p_rental_qty     integer default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product      public.products%rowtype;
  v_mode         text := coalesce(p_mode, 'buy');
  v_amount       numeric;
  v_rate         numeric;
  v_max_qty      integer;
  v_order_number text;
begin
  select * into v_product from public.products where id = p_product_id;

  if not found then
    raise exception 'Produk tidak ditemukan.' using errcode = '22023';
  end if;

  -- Hanya produk yang benar-benar dipajang yang boleh dipesan. Ini sekaligus
  -- menutup jalur memesan produk yang sudah dinonaktifkan, terjual, atau
  -- sedang dikunci pembeli lain.
  if coalesce(v_product.status, '') <> 'active' then
    raise exception 'Produk ini sedang tidak tersedia.' using errcode = '22023';
  end if;

  if v_mode = 'rental' then
    if not coalesce(v_product.can_rental, false) then
      raise exception 'Produk ini tidak disewakan.' using errcode = '22023';
    end if;

    if p_rental_unit not in ('hourly', 'daily') then
      raise exception 'Satuan sewa tidak valid.' using errcode = '22023';
    end if;

    -- Batas atas disamakan dengan yang ditawarkan formulir sewa (24 jam /
    -- 30 hari), supaya nominal tidak bisa dibengkakkan lewat kuantitas.
    v_rate    := case when p_rental_unit = 'hourly'
                      then v_product.rental_price_hourly
                      else v_product.rental_price_daily end;
    v_max_qty := case when p_rental_unit = 'hourly' then 24 else 30 end;

    if v_rate is null or v_rate <= 0 then
      raise exception 'Tarif sewa untuk satuan ini belum diatur.' using errcode = '22023';
    end if;

    if p_rental_qty is null or p_rental_qty < 1 or p_rental_qty > v_max_qty then
      raise exception 'Durasi sewa di luar batas yang diizinkan.' using errcode = '22023';
    end if;

    v_amount := v_rate * p_rental_qty;
  else
    v_amount := v_product.price;
  end if;

  insert into public.orders
    (buyer_id, buyer_name, buyer_whatsapp, product_id, amount, mode, note, payment_method, status)
  values
    (auth.uid(), p_buyer_name, p_buyer_whatsapp, p_product_id, v_amount, v_mode, p_note, p_payment_method, 'pending')
  returning order_number into v_order_number;

  return v_order_number;
end;
$$;

-- --- Pengajuan rekber --------------------------------------------------------
create or replace function public.create_guest_rekber(
  p_buyer_name       text,
  p_buyer_whatsapp   text,
  p_product_id       uuid,
  p_item_description text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product      public.products%rowtype;
  v_amount       numeric;
  v_fee          numeric;
  v_order_number text;
begin
  -- Produk WAJIB, tidak boleh null. Kalau nominal masih boleh dikirim bebas
  -- untuk kasus "tanpa produk", celah SEC-02 tinggal dilewati dengan cara
  -- mengosongkan product_id — jadi jalur itu ditutup sekalian. Seluruh
  -- formulir rekber yang ada memang selalu mengirim produk.
  if p_product_id is null then
    raise exception 'Pengajuan rekber harus menyertakan produk.' using errcode = '22023';
  end if;

  select * into v_product from public.products where id = p_product_id;

  if not found then
    raise exception 'Produk tidak ditemukan.' using errcode = '22023';
  end if;

  if coalesce(v_product.status, '') <> 'active' then
    raise exception 'Produk ini sedang tidak tersedia.' using errcode = '22023';
  end if;

  v_amount := v_product.price;

  -- Biaya jasa dihitung ulang dari tabel tarif yang dikelola admin, memakai
  -- aturan yang sama persis dengan calculateRekberFeeFromTiers() di sisi
  -- aplikasi: tingkat pertama (menurut sort_order) yang batas atasnya masih
  -- menampung nominal ini, atau tingkat terbuka (max_amount NULL).
  select t.fee into v_fee
    from public.rekber_fee_tiers t
   where t.max_amount is null or v_amount <= t.max_amount
   order by t.sort_order asc
   limit 1;

  if v_fee is null then
    raise exception 'Tarif rekber belum diatur.' using errcode = '22023';
  end if;

  insert into public.rekber_orders
    (requester_id, buyer_name, buyer_whatsapp, product_id, item_description, amount, fee, seller_contact, status)
  values
    (auth.uid(), p_buyer_name, p_buyer_whatsapp, p_product_id, p_item_description, v_amount, v_fee,
     'Paroy Store (Official)', 'pending')
  returning order_number into v_order_number;

  return v_order_number;
end;
$$;

grant execute on function public.create_guest_order(text, text, uuid, text, text, text, text, integer) to anon, authenticated;
grant execute on function public.create_guest_rekber(text, text, uuid, text) to anon, authenticated;


-- ---------------------------------------------------------------------------
-- CATATAN — top up belum ikut diamankan di migrasi ini, dan itu disengaja.
--
-- create_guest_topup masih menerima p_amount dari klien karena memang BELUM
-- ADA sumber kebenarannya di database: daftar item & harga top up masih
-- ditulis keras di lib/mock-data.ts (TOPUP_ITEMS), tidak seperti produk, game,
-- metode pembayaran, dan tarif rekber yang sudah dikelola lewat dashboard.
--
-- Perbaikan sebenarnya adalah membuat tabel `topup_items` (game, label,
-- harga, aktif) beserta tab pengelolanya di admin — yang sekaligus menjawab
-- kebutuhan bisnis yang lebih besar: sekarang mengubah harga top up harus
-- lewat rilis kode. Setelah tabel itu ada, fungsi ini tinggal mengambil harga
-- dari sana dengan pola yang sama seperti create_guest_order di atas.
--
-- Sementara itu dampaknya jauh lebih terbatas dibanding jalur akun: nominal
-- top up berkisar puluhan ribu, bukan jutaan, dan admin tetap mengonfirmasi
-- setiap pembayaran secara manual sebelum diproses.
-- ---------------------------------------------------------------------------
create or replace function public.create_guest_topup(
  p_game           text,
  p_game_user_id   text,
  p_item_label     text,
  p_amount         numeric,
  p_payment_method text,
  p_buyer_whatsapp text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_number text;
begin
  -- Penjagaan seadanya sampai tabel topup_items ada: tolak nominal yang tidak
  -- masuk akal, supaya tabel pesanan tidak bisa diisi entri bernilai nol atau
  -- negatif.
  if p_amount is null or p_amount <= 0 then
    raise exception 'Nominal top up tidak valid.' using errcode = '22023';
  end if;

  insert into public.topup_orders
    (user_id, buyer_whatsapp, game, game_user_id, item_label, amount, payment_method, status)
  values
    (auth.uid(), p_buyer_whatsapp, p_game, p_game_user_id, p_item_label, p_amount, p_payment_method, 'pending')
  returning order_number into v_order_number;

  return v_order_number;
end;
$$;
