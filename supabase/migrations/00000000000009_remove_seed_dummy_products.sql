-- Removes the 2 placeholder products inserted by 00000000000000_init.sql
-- (fixed ids 111...1 / 222...2) so the catalog starts empty and reflects
-- only real admin-entered products from here on. Safe to run even if
-- these rows were already deleted or renamed — targets the exact seed ids,
-- never touches anything a real product would have (a fresh gen_random_uuid()).
delete from public.products
where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
