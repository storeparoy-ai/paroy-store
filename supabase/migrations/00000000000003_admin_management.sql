-- ============================================================================
-- Migration: admin management RLS fixes
--
-- Two pre-existing gaps found while building the Admin Dashboard:
--   1. `products` INSERT policy allowed ANY authenticated user to create
--      products ("auth.uid() IS NOT NULL"), not just admins/sellers — too
--      permissive given the single-seller (Paroy Store only) business
--      decision. There was also no DELETE policy at all on `products`,
--      so admin product deletion would silently fail under RLS.
--   2. `profiles` only had a "user can update own profile" policy, so an
--      admin could never change another user's `role` (needed for the
--      "Pengguna" role-management tab) — RLS would reject it.
-- ============================================================================

-- 1. Products: tighten INSERT to admin-only, add DELETE for admin --------
DROP POLICY IF EXISTS "Admins and sellers can insert products." ON public.products;
CREATE POLICY "Only admins can insert products." ON public.products
  FOR INSERT WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Only admins can delete products." ON public.products;
CREATE POLICY "Only admins can delete products." ON public.products
  FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 2. Profiles: allow admins to update ANY profile (role management) ------
DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
CREATE POLICY "Admins can update any profile." ON public.profiles
  FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
