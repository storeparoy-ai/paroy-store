-- ============================================================================
-- Migration: admin-manageable price ranges for the /products filter.
--
-- Context: the "Rentang Harga" filter chips on the katalog page were
-- hardcoded (< Rp 200rb / Rp 200rb-400rb / Rp 400rb-600rb / > Rp 600rb).
-- User wants these editable from the admin dashboard like every other CMS
-- table added in migration 00000000000005. Each row is independent
-- (min_amount/max_amount, either nullable) rather than a chained ladder —
-- gives the admin full freedom, e.g. overlapping promo ranges, not just a
-- fixed staircase. The app reads this with a hardcoded fallback (same
-- resilience pattern as every other CMS table), so nothing breaks before
-- this migration is applied.
-- ============================================================================

create table if not exists public.product_price_ranges (
  id uuid default gen_random_uuid() primary key,
  min_amount numeric,  -- null = no lower bound ("< max_amount")
  max_amount numeric,  -- null = no upper bound ("> min_amount")
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.product_price_ranges enable row level security;

drop policy if exists "Price ranges are viewable by everyone." on public.product_price_ranges;
create policy "Price ranges are viewable by everyone." on public.product_price_ranges
  for select using (true);

drop policy if exists "Only admins can insert price ranges." on public.product_price_ranges;
create policy "Only admins can insert price ranges." on public.product_price_ranges
  for insert with check ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can update price ranges." on public.product_price_ranges;
create policy "Only admins can update price ranges." on public.product_price_ranges
  for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can delete price ranges." on public.product_price_ranges;
create policy "Only admins can delete price ranges." on public.product_price_ranges
  for delete using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Seed with the ranges already hardcoded in the app, so nothing changes
-- visually until the admin edits them.
insert into public.product_price_ranges (min_amount, max_amount, sort_order)
select * from (values
  (null::numeric, 200000::numeric, 1),
  (200000::numeric, 400000::numeric, 2),
  (400000::numeric, 600000::numeric, 3),
  (600000::numeric, null::numeric, 4)
) as seed(min_amount, max_amount, sort_order)
where not exists (select 1 from public.product_price_ranges);
