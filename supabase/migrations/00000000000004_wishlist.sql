-- ============================================================================
-- Migration: wishlist table
--
-- PRD 2.8 asks for a wishlist inside the user profile dashboard, but no
-- table existed for it. This adds one, scoped to logged-in users only
-- (wishlisting a guest browsing session doesn't make sense — there's no
-- persistent identity to attach it to).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wishlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wishlist." ON public.wishlists;
CREATE POLICY "Users can view their own wishlist." ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to their own wishlist." ON public.wishlists;
CREATE POLICY "Users can add to their own wishlist." ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from their own wishlist." ON public.wishlists;
CREATE POLICY "Users can remove from their own wishlist." ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- community_posts had SELECT + INSERT policies but no UPDATE policy at all,
-- so a plain RLS UPDATE (even just to bump `likes`) would be denied. Rather
-- than open a broad UPDATE policy (which would let any authenticated user
-- rewrite someone else's post `content`, not just `likes`), use a narrow
-- SECURITY DEFINER function that only ever touches the counter.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_post_likes(p_post_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.community_posts SET likes = likes + 1 WHERE id = p_post_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_post_likes(uuid) TO authenticated;
