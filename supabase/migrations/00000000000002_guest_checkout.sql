-- ============================================================================
-- Migration: guest checkout support + product/order field additions
--
-- Purpose:
--   1. Add product fields the frontend UI already expects (original_price,
--      rental_price_hourly, platform, region, is_featured) — additive only,
--      nullable/defaulted so existing rows keep working.
--   2. Allow GUEST (unauthenticated) checkout/top-up/rekber submissions —
--      per PRD, buyers should not be forced to log in to purchase, and
--      "Cek Transaksi" must work publicly via Invoice/Order ID alone.
--   3. Give every order a predictable order_number (server-generated,
--      format PS-YYYYMMDD-XXXX) instead of relying on the client.
--   4. Provide a SECURITY DEFINER lookup function so "Cek Transaksi" can
--      resolve a single order by its number WITHOUT opening full table
--      SELECT access to anonymous users (keeps other buyers' orders private).
--
-- Safe to run multiple times is NOT guaranteed for the CREATE TABLE/POLICY
-- statements below without the DROP IF EXISTS guards already included.
-- Existing data (including the two dummy products from the init migration)
-- is preserved.
-- ============================================================================

-- 1. Product fields ----------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS original_price numeric,
  ADD COLUMN IF NOT EXISTS rental_price_hourly numeric,
  ADD COLUMN IF NOT EXISTS platform text[] DEFAULT ARRAY['Android', 'iOS'],
  ADD COLUMN IF NOT EXISTS region text DEFAULT 'Indonesia',
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- 2. Order number generator ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_order_number(prefix text DEFAULT 'PS')
RETURNS text
LANGUAGE sql
AS $$
  SELECT prefix || '-' || to_char(now(), 'YYYYMMDD') || '-' ||
         lpad(floor(random() * 10000)::text, 4, '0');
$$;

ALTER TABLE public.orders
  ALTER COLUMN order_number SET DEFAULT public.generate_order_number('PS'),
  ADD COLUMN IF NOT EXISTS buyer_name text,
  ADD COLUMN IF NOT EXISTS buyer_whatsapp text;

ALTER TABLE public.topup_orders
  ALTER COLUMN order_number SET DEFAULT public.generate_order_number('TU'),
  ADD COLUMN IF NOT EXISTS buyer_whatsapp text;

ALTER TABLE public.rekber_orders
  ADD COLUMN IF NOT EXISTS order_number text UNIQUE DEFAULT public.generate_order_number('RK'),
  ADD COLUMN IF NOT EXISTS buyer_name text,
  ADD COLUMN IF NOT EXISTS buyer_whatsapp text,
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);

-- 3. Allow guest (unauthenticated) inserts ------------------------------------
-- buyer_id / user_id / requester_id stay nullable for guest orders; RLS is
-- relaxed to accept either a null id (guest) or a matching authenticated id.
DROP POLICY IF EXISTS "Users can create orders." ON public.orders;
CREATE POLICY "Users or guests can create orders." ON public.orders
  FOR INSERT WITH CHECK (buyer_id IS NULL OR auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can create topups." ON public.topup_orders;
CREATE POLICY "Users or guests can create topups." ON public.topup_orders
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create rekber." ON public.rekber_orders;
CREATE POLICY "Users or guests can create rekber." ON public.rekber_orders
  FOR INSERT WITH CHECK (requester_id IS NULL OR auth.uid() = requester_id);

-- 4. Public order lookup by order_number (used by "Cek Transaksi") -----------
-- SECURITY DEFINER: bypasses RLS internally, but only ever returns the one
-- row matching the exact order_number the caller already knows — it does
-- NOT expose the ability to list/browse other people's orders.
CREATE OR REPLACE FUNCTION public.get_order_status(p_order_number text)
RETURNS TABLE (
  order_number text,
  kind text,
  status text,
  amount numeric,
  item_label text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.order_number, 'buy'::text AS kind, o.status, o.amount,
         COALESCE(p.title, o.note, 'Pembelian Akun') AS item_label, o.created_at
  FROM public.orders o
  LEFT JOIN public.products p ON p.id = o.product_id
  WHERE o.order_number = p_order_number

  UNION ALL

  SELECT t.order_number, 'topup'::text AS kind, t.status, t.amount,
         t.item_label, t.created_at
  FROM public.topup_orders t
  WHERE t.order_number = p_order_number

  UNION ALL

  SELECT r.order_number, 'rekber'::text AS kind, r.status, r.amount,
         r.item_description AS item_label, r.created_at
  FROM public.rekber_orders r
  WHERE r.order_number = p_order_number

  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_status(text) TO anon, authenticated;
