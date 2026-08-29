-- ============================================================================
-- Migration: Tripay payment gateway settings (admin-only, holds secrets).
--
-- Context: Tripay integration is being built in two phases. Phase 1 (this
-- migration): a place to store the Merchant Code / API Key / Private Key
-- once the user's teammate registers the merchant account (Tripay itself is
-- down for maintenance as of 2026-08-29, blocking registration) — admin can
-- paste them in whenever they're ready, no code/redeploy needed. Phase 2
-- (later, once real credentials exist to test against): actually wire the
-- checkout/topup/rekber flows to create real Tripay transactions and handle
-- the payment webhook — needs a Supabase service_role key to read this table
-- from unauthenticated contexts (guest checkout, Tripay's webhook), which
-- isn't requested yet since nothing needs it until Phase 2 activates.
--
-- Unlike every other CMS table (games, site_settings, payment_methods, ...),
-- this one is NOT publicly readable — it holds a private signing key, so
-- only admins can SELECT or UPDATE it, same as any other admin-only secret.
-- ============================================================================

create table if not exists public.payment_gateway_settings (
  id integer primary key default 1,
  provider text not null default 'tripay',
  merchant_code text,
  api_key text,
  private_key text,
  mode text not null default 'sandbox' check (mode in ('sandbox', 'production')),
  is_enabled boolean not null default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  constraint payment_gateway_settings_singleton check (id = 1)
);

alter table public.payment_gateway_settings enable row level security;

drop policy if exists "Only admins can view payment gateway settings." on public.payment_gateway_settings;
create policy "Only admins can view payment gateway settings." on public.payment_gateway_settings
  for select using ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can insert payment gateway settings." on public.payment_gateway_settings;
create policy "Only admins can insert payment gateway settings." on public.payment_gateway_settings
  for insert with check ((select role from public.profiles where id = auth.uid()) = 'admin');

drop policy if exists "Only admins can update payment gateway settings." on public.payment_gateway_settings;
create policy "Only admins can update payment gateway settings." on public.payment_gateway_settings
  for update using ((select role from public.profiles where id = auth.uid()) = 'admin');

insert into public.payment_gateway_settings (id, provider, mode, is_enabled)
values (1, 'tripay', 'sandbox', false)
on conflict (id) do nothing;
