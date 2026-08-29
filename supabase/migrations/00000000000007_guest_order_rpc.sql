-- ============================================================================
-- Migration: fix guest checkout via SECURITY DEFINER order-creation RPCs.
--
-- Root cause of the "42501 row-level security policy" error that blocked
-- every guest Checkout/Top Up/Rekber submission: the app (and every raw SQL
-- test) inserts AND asks Postgres to return the new row (`.insert().select()`
-- in supabase-js == `INSERT ... RETURNING` in SQL). Returning a row requires
-- the SELECT policy to also permit reading it back — and the existing SELECT
-- policies ("Users can view their own X.") only match `auth.uid() = owner_id`,
-- which is never true for a guest row (owner_id IS NULL, auth.uid() IS NULL,
-- NULL = NULL is NULL, not true). So the INSERT itself was fine; the
-- mandatory read-back after it was what failed — same error message either
-- way, which is what made this so hard to isolate (confirmed by reproducing
-- the identical failure on a disposable scratch table with zero relation to
-- these tables, using a maximally permissive `WITH CHECK (true)` INSERT
-- policy and no SELECT policy at all).
--
-- Broadening the SELECT policies to also allow `owner_id IS NULL` was
-- considered and rejected: it would let ANY anonymous visitor list every
-- guest order's buyer name/WhatsApp number/amount via a wildcard REST query
-- (e.g. GET /rest/v1/orders?buyer_id=is.null), not just look up one they
-- already know the invoice number for. Instead, guest order creation goes
-- through a SECURITY DEFINER RPC — the same pattern already used by
-- get_order_status() for the public "Cek Transaksi" lookup — which returns
-- ONLY the new order_number, nothing else, and needs no SELECT policy grant
-- at all since it reads the just-inserted row as its own (elevated) owner.
-- ============================================================================

-- 1. Restore the real guest-insert policy on topup_orders — this replaces
--    the "TEMP full open test" policy left in place during investigation.
DROP POLICY IF EXISTS "TEMP full open test" ON public.topup_orders;
DROP POLICY IF EXISTS "Users can create topups." ON public.topup_orders;
DROP POLICY IF EXISTS "Users or guests can create topups." ON public.topup_orders;
CREATE POLICY "Users or guests can create topups." ON public.topup_orders
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- (orders / rekber_orders INSERT policies were already correct — re-asserted
-- here anyway so this migration is a complete, idempotent guest-checkout fix
-- on its own.)
DROP POLICY IF EXISTS "Users can create orders." ON public.orders;
DROP POLICY IF EXISTS "Users or guests can create orders." ON public.orders;
CREATE POLICY "Users or guests can create orders." ON public.orders
  FOR INSERT WITH CHECK (buyer_id IS NULL OR auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can create rekber." ON public.rekber_orders;
DROP POLICY IF EXISTS "Users or guests can create rekber." ON public.rekber_orders;
CREATE POLICY "Users or guests can create rekber." ON public.rekber_orders
  FOR INSERT WITH CHECK (requester_id IS NULL OR auth.uid() = requester_id);

-- 2. Guest-safe order-creation RPCs (SECURITY DEFINER, narrow return value) -

CREATE OR REPLACE FUNCTION public.create_guest_order(
  p_buyer_name text,
  p_buyer_whatsapp text,
  p_product_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_mode text DEFAULT 'buy',
  p_note text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number text;
BEGIN
  INSERT INTO public.orders (buyer_id, buyer_name, buyer_whatsapp, product_id, amount, mode, note, payment_method, status)
  VALUES (auth.uid(), p_buyer_name, p_buyer_whatsapp, p_product_id, p_amount, COALESCE(p_mode, 'buy'), p_note, p_payment_method, 'pending')
  RETURNING order_number INTO v_order_number;
  RETURN v_order_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_guest_topup(
  p_game text,
  p_game_user_id text,
  p_item_label text,
  p_amount numeric,
  p_payment_method text,
  p_buyer_whatsapp text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number text;
BEGIN
  INSERT INTO public.topup_orders (user_id, buyer_whatsapp, game, game_user_id, item_label, amount, payment_method, status)
  VALUES (auth.uid(), p_buyer_whatsapp, p_game, p_game_user_id, p_item_label, p_amount, p_payment_method, 'pending')
  RETURNING order_number INTO v_order_number;
  RETURN v_order_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_guest_rekber(
  p_buyer_name text,
  p_buyer_whatsapp text,
  p_item_description text,
  p_amount numeric,
  p_fee numeric,
  p_product_id uuid DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number text;
BEGIN
  INSERT INTO public.rekber_orders (requester_id, buyer_name, buyer_whatsapp, product_id, item_description, amount, fee, seller_contact, status)
  VALUES (auth.uid(), p_buyer_name, p_buyer_whatsapp, p_product_id, p_item_description, p_amount, p_fee, 'Paroy Store (Official)', 'pending')
  RETURNING order_number INTO v_order_number;
  RETURN v_order_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_guest_order(text, text, uuid, numeric, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_guest_topup(text, text, text, numeric, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_guest_rekber(text, text, text, numeric, numeric, uuid) TO anon, authenticated;

-- 3. Clean up the investigation's disposable scratch table.
DROP TABLE IF EXISTS public._debug_test;
