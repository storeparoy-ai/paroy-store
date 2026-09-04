-- Hides the 2 placeholder products inserted by 00000000000000_init.sql
-- (fixed ids 111...1 / 222...2) from the catalog, without deleting them.
--
-- A hard DELETE was tried first and rejected by Postgres (23503, foreign
-- key violation on orders.product_id) — real orders already reference
-- product 111...1 from earlier test checkouts run against this project,
-- so deleting the row would either fail (as it did) or require deleting
-- those order rows too, which is real transaction history, not seed data,
-- and not something to destroy silently. Marking the product 'inactive'
-- achieves the same practical goal — it disappears from every public
-- query, which all filter `.eq('status', 'active')` (see
-- lib/supabase/queries.ts) — while leaving both the product row and every
-- order that references it fully intact. Fully reversible (UPDATE ...
-- SET status = 'active' undoes it) and still shows in the admin Produk
-- table (status: inactive) rather than vanishing without a trace.
update public.products
set status = 'inactive'
where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
