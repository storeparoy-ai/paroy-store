-- ============================================================================
-- Migration: katalog top up jadi bisa dikelola dari dashboard, dan nominalnya
-- dihitung server.
--
-- Dua masalah sekaligus:
--
--  1. BISNIS. Daftar item dan harga top up masih ditulis keras di
--     lib/mock-data.ts (TOPUP_ITEMS) — satu-satunya bagian toko yang belum
--     ikut CMS. Padahal "Top Up Kilat" adalah jualan utama, dan harga diamond
--     berubah jauh lebih sering daripada apa pun di sini. Mengubah satu harga
--     berarti mengubah kode dan menunggu rilis.
--
--  2. KEAMANAN. Ini sisa terakhir celah SEC-02 (audit 2026-09-04):
--     create_guest_topup masih menerima p_amount dari browser karena memang
--     belum ada sumber kebenaran di database untuk dibandingkan. Sekarang ada.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Biaya per metode pembayaran.
--
-- Halaman top up dulu punya daftar metode + biayanya sendiri yang ditulis
-- keras (QRIS 0,7%, VA flat Rp4.250, e-wallet 1,5%), terpisah dari tabel
-- payment_methods yang dipakai halaman checkout. Dua sumber untuk hal yang
-- sama, dan yang satu tidak bisa disentuh admin.
--
-- Defaultnya 0 dan tidak diisi angka lama itu — bukan kelalaian: pembayaran
-- di sini nyatanya transfer manual ke rekening sendiri, jadi "biaya QRIS"
-- yang tidak pernah benar-benar dipungut pihak mana pun sebaiknya jadi
-- keputusan sadar admin, bukan warisan angka contoh.
-- ---------------------------------------------------------------------------
alter table public.payment_methods
  add column if not exists fee_percent numeric not null default 0,
  add column if not exists fee_flat    numeric not null default 0;

comment on column public.payment_methods.fee_percent is
  'Biaya layanan dalam persen dari nominal, mis. 1.5 untuk 1,5%.';
comment on column public.payment_methods.fee_flat is
  'Biaya layanan tetap dalam rupiah, ditambahkan setelah fee_percent.';


-- ---------------------------------------------------------------------------
-- 2. Katalog item top up.
-- ---------------------------------------------------------------------------
create table if not exists public.topup_items (
  id         uuid primary key default gen_random_uuid(),
  game_id    uuid not null references public.games(id) on delete cascade,
  label      text not null,              -- mis. "86 💎 Diamond"
  amount     integer,                    -- jumlah diamond/UC, hanya untuk ditampilkan
  price      numeric not null check (price > 0),
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz default timezone('utc'::text, now())
);

create index if not exists topup_items_game_idx
  on public.topup_items (game_id, sort_order);

alter table public.topup_items enable row level security;

drop policy if exists "Topup items are viewable by everyone." on public.topup_items;
create policy "Topup items are viewable by everyone." on public.topup_items
  for select using (true);

drop policy if exists "Only admins can insert topup items." on public.topup_items;
create policy "Only admins can insert topup items." on public.topup_items
  for insert with check (public.is_admin());

drop policy if exists "Only admins can update topup items." on public.topup_items;
create policy "Only admins can update topup items." on public.topup_items
  for update using (public.is_admin());

drop policy if exists "Only admins can delete topup items." on public.topup_items;
create policy "Only admins can delete topup items." on public.topup_items
  for delete using (public.is_admin());


-- ---------------------------------------------------------------------------
-- 3. Isi dengan daftar yang selama ini ditulis di kode, supaya tidak ada yang
--    berubah di mata pengunjung saat migrasi ini dijalankan.
-- ---------------------------------------------------------------------------
insert into public.topup_items (game_id, label, amount, price, sort_order)
select g.id, v.label, v.amount, v.price, v.sort_order
  from (values
    ('mlbb', '86 💎 Diamond',    86,   20000, 1),
    ('mlbb', '172 💎 Diamond',   172,  39000, 2),
    ('mlbb', '257 💎 Diamond',   257,  55000, 3),
    ('mlbb', '344 💎 Diamond',   344,  73000, 4),
    ('mlbb', '514 💎 Diamond',   514,  108000, 5),
    ('mlbb', '706 💎 Diamond',   706,  148000, 6),
    ('mlbb', '1412 💎 Diamond',  1412, 289000, 7),
    ('mlbb', '2195 💎 Diamond',  2195, 449000, 8),
    ('ff',   '70 💎 Diamond',    70,   15000, 1),
    ('ff',   '140 💎 Diamond',   140,  29000, 2),
    ('ff',   '355 💎 Diamond',   355,  73000, 3),
    ('ff',   '720 💎 Diamond',   720,  148000, 4),
    ('ff',   '1450 💎 Diamond',  1450, 289000, 5),
    ('ff',   '3625 💎 Diamond',  3625, 710000, 6),
    ('pubg', '60 UC',            60,   15000, 1),
    ('pubg', '325 UC',           325,  73000, 2),
    ('pubg', '660 UC',           660,  148000, 3),
    ('pubg', '1800 UC',          1800, 389000, 4),
    ('pubg', '3850 UC',          3850, 789000, 5)
  ) as v(game_slug, label, amount, price, sort_order)
  join public.games g on g.slug = v.game_slug
 where not exists (select 1 from public.topup_items);


-- ---------------------------------------------------------------------------
-- 4. Nominal top up dihitung server — penutup terakhir celah SEC-02.
--
-- Versi lama WAJIB di-DROP, bukan sekadar ditimpa: Postgres membedakan fungsi
-- berdasarkan tanda tangannya, jadi versi ber-p_amount akan tetap bisa
-- dipanggil dan celahnya tetap terbuka (pelajaran dari migrasi 10).
-- ---------------------------------------------------------------------------
drop function if exists public.create_guest_topup(text, text, text, numeric, text, text);

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

grant execute on function public.create_guest_topup(uuid, text, text, text) to anon, authenticated;
