-- ============================================================================
-- Migration: CMS foundation — admin-manageable games, site branding/mascot,
-- payment methods, and rekber fee tiers, plus a public Storage bucket for
-- admin-uploaded images (game icons, mascot, etc).
--
-- Context: until now, games/payment methods/rekber fee tiers were hardcoded
-- in the frontend (lib/mock-data.ts, lib/utils.ts) — the user wants the
-- admin to manage all of this from the website itself, no code/Supabase
-- dashboard access required. This migration adds the tables; the app code
-- (separate commits) reads from them with a hardcoded fallback so nothing
-- breaks before this migration is applied.
-- ============================================================================

-- 1. Storage bucket for admin-uploaded images (game icons, mascot, ...) -----
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public read access on public-assets" on storage.objects;
create policy "Public read access on public-assets" on storage.objects
  for select using (bucket_id = 'public-assets');

drop policy if exists "Admins can upload to public-assets" on storage.objects;
create policy "Admins can upload to public-assets" on storage.objects
  for insert with check (
    bucket_id = 'public-assets'
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

drop policy if exists "Admins can update public-assets" on storage.objects;
create policy "Admins can update public-assets" on storage.objects
  for update using (
    bucket_id = 'public-assets'
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

drop policy if exists "Admins can delete from public-assets" on storage.objects;
create policy "Admins can delete from public-assets" on storage.objects
  for delete using (
    bucket_id = 'public-assets'
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- 2. Games (Kategori Game) ----------------------------------------------------
create table if not exists public.games (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  name text not null,
  icon text,              -- emoji fallback, shown when icon_url is not set
  icon_url text,          -- admin-uploaded image, takes priority over `icon`
  color text not null default '#22d3ee',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.games enable row level security;

drop policy if exists "Games are viewable by everyone." on public.games;
create policy "Games are viewable by everyone." on public.games for select using (true);

drop policy if exists "Only admins can insert games." on public.games;
create policy "Only admins can insert games." on public.games
  for insert with check ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can update games." on public.games;
create policy "Only admins can update games." on public.games
  for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can delete games." on public.games;
create policy "Only admins can delete games." on public.games
  for delete using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Seed with the games already hardcoded in the app, so nothing changes
-- visually until the admin edits them.
insert into public.games (slug, name, icon, color, sort_order) values
  ('mlbb', 'Mobile Legends', '⚡', '#3B82F6', 1),
  ('ff', 'Free Fire', '🔥', '#EF4444', 2),
  ('pubg', 'PUBG Mobile', '🎯', '#F59E0B', 3),
  ('valorant', 'Valorant', '🔫', '#EF4444', 4),
  ('genshin', 'Genshin Impact', '🌟', '#8B5CF6', 5),
  ('efootball', 'eFootball', '⚽', '#22C55E', 6),
  ('cod', 'COD Mobile', '💥', '#6B7280', 7)
on conflict (slug) do nothing;

-- Link products to games properly instead of matching on free-text `game`.
-- `game` (text) is KEPT for backward compatibility / old rows; new products
-- set both `game_id` and a denormalized `game` (= games.name) so existing
-- code that still reads `products.game` as text keeps working.
alter table public.products
  add column if not exists game_id uuid references public.games(id);

-- 3. Site Settings (branding, mascot) — singleton row (id = 1) --------------
create table if not exists public.site_settings (
  id integer primary key default 1,
  site_name text not null default 'Paroy Store',
  tagline text,
  mascot_image_url text,
  whatsapp_url text,
  discord_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint site_settings_singleton check (id = 1)
);

alter table public.site_settings enable row level security;

drop policy if exists "Site settings viewable by everyone." on public.site_settings;
create policy "Site settings viewable by everyone." on public.site_settings
  for select using (true);

drop policy if exists "Only admins can insert site settings." on public.site_settings;
create policy "Only admins can insert site settings." on public.site_settings
  for insert with check ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can update site settings." on public.site_settings;
create policy "Only admins can update site settings." on public.site_settings
  for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

insert into public.site_settings (id, site_name, tagline)
values (1, 'Paroy Store', 'Marketplace gaming all-in-one')
on conflict (id) do nothing;

-- 4. Payment Methods -----------------------------------------------------
create table if not exists public.payment_methods (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,   -- e.g. 'bca', 'gopay' — stable key used in orders.payment_method
  label text not null,
  account_number text not null,
  account_name text not null default 'Paroy Store',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.payment_methods enable row level security;

drop policy if exists "Payment methods viewable by everyone." on public.payment_methods;
create policy "Payment methods viewable by everyone." on public.payment_methods
  for select using (true);

drop policy if exists "Only admins can insert payment methods." on public.payment_methods;
create policy "Only admins can insert payment methods." on public.payment_methods
  for insert with check ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can update payment methods." on public.payment_methods;
create policy "Only admins can update payment methods." on public.payment_methods
  for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can delete payment methods." on public.payment_methods;
create policy "Only admins can delete payment methods." on public.payment_methods
  for delete using ((select role from public.profiles where id = auth.uid()) = 'admin');

insert into public.payment_methods (code, label, account_number, account_name, sort_order) values
  ('bca', 'Transfer BCA', '1234567890', 'Paroy Store', 1),
  ('mandiri', 'Transfer Mandiri', '0987654321', 'Paroy Store', 2),
  ('gopay', 'GoPay', '0812-3456-7890', 'Paroy Store', 3),
  ('dana', 'DANA', '0812-3456-7890', 'Paroy Store', 4),
  ('ovo', 'OVO', '0812-3456-7890', 'Paroy Store', 5)
on conflict (code) do nothing;

-- 5. Rekber Fee Tiers -------------------------------------------------------
create table if not exists public.rekber_fee_tiers (
  id uuid default gen_random_uuid() primary key,
  max_amount numeric,  -- null = "and above" (the last/catch-all tier)
  fee numeric not null,
  sort_order integer not null default 0
);

alter table public.rekber_fee_tiers enable row level security;

drop policy if exists "Rekber fee tiers viewable by everyone." on public.rekber_fee_tiers;
create policy "Rekber fee tiers viewable by everyone." on public.rekber_fee_tiers
  for select using (true);

drop policy if exists "Only admins can insert rekber fee tiers." on public.rekber_fee_tiers;
create policy "Only admins can insert rekber fee tiers." on public.rekber_fee_tiers
  for insert with check ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can update rekber fee tiers." on public.rekber_fee_tiers;
create policy "Only admins can update rekber fee tiers." on public.rekber_fee_tiers
  for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can delete rekber fee tiers." on public.rekber_fee_tiers;
create policy "Only admins can delete rekber fee tiers." on public.rekber_fee_tiers
  for delete using ((select role from public.profiles where id = auth.uid()) = 'admin');

insert into public.rekber_fee_tiers (max_amount, fee, sort_order) values
  (100000, 5000, 1),
  (500000, 10000, 2),
  (1000000, 20000, 3),
  (5000000, 35000, 4),
  (null, 50000, 5)
on conflict do nothing;
