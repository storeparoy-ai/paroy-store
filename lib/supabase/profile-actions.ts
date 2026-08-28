'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

type ActionResult = { success: true } | { success: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const, error: 'Kamu harus masuk dulu.' };
  return { supabase, ok: true as const, user };
}

export async function updateProfileAction(input: { fullName: string; whatsapp: string }): Promise<ActionResult> {
  const guard = await requireUser();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase
    .from('profiles')
    .update({ full_name: input.fullName, whatsapp: input.whatsapp })
    .eq('id', guard.user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/profile/pengaturan');
  return { success: true };
}

/** Toggles a product in/out of the current user's wishlist. Requires
 * migration 00000000000004_wishlist.sql to be applied — fails gracefully
 * with a clear error otherwise. */
export async function toggleWishlistAction(productId: string): Promise<ActionResult & { wishlisted?: boolean }> {
  const guard = await requireUser();
  if (!guard.ok) return { success: false, error: guard.error };

  const { data: existing } = await guard.supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', guard.user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    const { error } = await guard.supabase.from('wishlists').delete().eq('id', existing.id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/profile/wishlist');
    return { success: true, wishlisted: false };
  }

  const { error } = await guard.supabase.from('wishlists').insert({ user_id: guard.user.id, product_id: productId });
  if (error) return { success: false, error: error.message };
  revalidatePath('/profile/wishlist');
  return { success: true, wishlisted: true };
}

export async function createCommunityPostAction(input: { content: string; game?: string }): Promise<ActionResult> {
  const guard = await requireUser();
  if (!guard.ok) return { success: false, error: guard.error };
  if (!input.content.trim()) return { success: false, error: 'Tulis sesuatu dulu ya.' };

  const { error } = await guard.supabase.from('community_posts').insert({
    author_id: guard.user.id,
    content: input.content.trim(),
    game: input.game || null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath('/community');
  return { success: true };
}

/** Uses the increment_post_likes() RPC (see migration 00000000000004)
 * instead of a plain UPDATE — community_posts has no general UPDATE RLS
 * policy on purpose (so nobody can rewrite someone else's post content),
 * so a narrow SECURITY DEFINER function handles just this counter. */
export async function likePostAction(postId: string): Promise<ActionResult> {
  const guard = await requireUser();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.rpc('increment_post_likes', { p_post_id: postId });
  if (error) return { success: false, error: error.message };
  revalidatePath('/community');
  return { success: true };
}
