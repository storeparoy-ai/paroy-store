'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

type ActionResult = { success: true } | { success: false; error: string };

const ORDER_TABLE: Record<'buy' | 'topup' | 'rekber', string> = {
  buy: 'orders',
  topup: 'topup_orders',
  rekber: 'rekber_orders',
};

/** Defense-in-depth: RLS is the real backstop (every mutating policy below
 * requires `profiles.role = 'admin'`), but checking here too means a
 * non-admin gets a clean error message instead of a raw Postgres RLS
 * rejection. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const, error: 'Kamu harus masuk sebagai admin.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') return { supabase, ok: false as const, error: 'Akses ditolak — bukan admin.' };

  return { supabase, ok: true as const };
}

export async function updateOrderStatusAction(
  kind: 'buy' | 'topup' | 'rekber',
  id: string,
  status: string
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from(ORDER_TABLE[kind]).update({ status }).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/pesanan');
  return { success: true };
}

export interface ProductInput {
  title: string;
  game: string;
  price: number;
  originalPrice?: number;
  canRental: boolean;
  rentalPriceDaily?: number;
  rentalPriceHourly?: number;
  status: string;
  region: string;
  platform: string[];
  images: string[];
  specs: Record<string, string>;
  isFeatured: boolean;
}

function toRow(input: ProductInput) {
  return {
    title: input.title,
    game: input.game,
    price: input.price,
    original_price: input.originalPrice ?? null,
    can_rental: input.canRental,
    rental_price_daily: input.canRental ? (input.rentalPriceDaily ?? null) : null,
    rental_price_hourly: input.canRental ? (input.rentalPriceHourly ?? null) : null,
    status: input.status,
    region: input.region,
    platform: input.platform,
    images: input.images,
    specs: input.specs,
    is_featured: input.isFeatured,
  };
}

export async function createProductAction(input: ProductInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('products').insert(toRow(input));
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/produk');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}

export async function updateProductAction(id: string, input: ProductInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('products').update(toRow(input)).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/produk');
  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  revalidatePath('/');
  return { success: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('products').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/produk');
  revalidatePath('/products');
  revalidatePath('/');
  return { success: true };
}

export async function updateUserRoleAction(userId: string, role: 'user' | 'admin'): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/pengguna');
  return { success: true };
}
