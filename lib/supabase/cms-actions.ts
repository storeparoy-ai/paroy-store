'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { getTripayPaymentChannels } from '@/lib/tripay/client';

type ActionResult = { success: true } | { success: false; error: string };

/** Same defense-in-depth pattern as lib/supabase/admin-actions.ts —
 * RLS (profiles.role = 'admin') is the real backstop for every table
 * touched below (see migration 00000000000005). */
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

// ---------------------------------------------------------------------------
// Games (Kategori Game)
// ---------------------------------------------------------------------------

export interface GameInput {
  slug: string;
  name: string;
  icon: string;
  iconUrl: string | null;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

function gameToRow(input: GameInput) {
  return {
    slug: input.slug,
    name: input.name,
    icon: input.icon || null,
    icon_url: input.iconUrl,
    color: input.color,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  };
}

function revalidateGameDependents() {
  // Games show up basically everywhere — homepage quick-select, katalog
  // filters, product cards/detail (game badge), admin product form.
  revalidatePath('/admin/kategori-game');
  revalidatePath('/admin/produk');
  revalidatePath('/');
  revalidatePath('/products');
}

export async function createGameAction(input: GameInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('games').insert(gameToRow(input));
  if (error) return { success: false, error: error.message };

  revalidateGameDependents();
  return { success: true };
}

export async function updateGameAction(id: string, input: GameInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('games').update(gameToRow(input)).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidateGameDependents();
  return { success: true };
}

export async function deleteGameAction(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('games').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidateGameDependents();
  return { success: true };
}

// ---------------------------------------------------------------------------
// Flash Sales
// ---------------------------------------------------------------------------

export interface FlashSaleInput {
  productId: string;
  salePrice: number;
  stock: number;
  startsAt: string; // ISO datetime
  endsAt: string; // ISO datetime
  isActive: boolean;
}

function flashSaleToRow(input: FlashSaleInput) {
  return {
    product_id: input.productId,
    sale_price: input.salePrice,
    stock: input.stock,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    is_active: input.isActive,
  };
}

function revalidateFlashSaleDependents() {
  revalidatePath('/admin/flash-sale');
  revalidatePath('/');
}

export async function createFlashSaleAction(input: FlashSaleInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('flash_sales').insert(flashSaleToRow(input));
  if (error) return { success: false, error: error.message };

  revalidateFlashSaleDependents();
  return { success: true };
}

export async function updateFlashSaleAction(id: string, input: FlashSaleInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('flash_sales').update(flashSaleToRow(input)).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidateFlashSaleDependents();
  return { success: true };
}

export async function deleteFlashSaleAction(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('flash_sales').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidateFlashSaleDependents();
  return { success: true };
}

// ---------------------------------------------------------------------------
// Site Settings (branding, mascot)
// ---------------------------------------------------------------------------

export interface SiteSettingsInput {
  siteName: string;
  tagline: string;
  mascotImageUrl: string | null;
  whatsappUrl: string;
  discordUrl: string;
}

export async function updateSiteSettingsAction(input: SiteSettingsInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase
    .from('site_settings')
    .update({
      site_name: input.siteName,
      tagline: input.tagline,
      mascot_image_url: input.mascotImageUrl,
      whatsapp_url: input.whatsappUrl,
      discord_url: input.discordUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/pengaturan');
  revalidatePath('/');
  revalidatePath('/community');
  return { success: true };
}

// ---------------------------------------------------------------------------
// Payment Methods
// ---------------------------------------------------------------------------

export interface PaymentMethodInput {
  code: string;
  label: string;
  accountNumber: string;
  accountName: string;
  isActive: boolean;
  sortOrder: number;
}

function paymentMethodToRow(input: PaymentMethodInput) {
  return {
    code: input.code,
    label: input.label,
    account_number: input.accountNumber,
    account_name: input.accountName,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
}

function revalidatePaymentDependents() {
  revalidatePath('/admin/metode-pembayaran');
  revalidatePath('/checkout');
}

export async function createPaymentMethodAction(input: PaymentMethodInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('payment_methods').insert(paymentMethodToRow(input));
  if (error) return { success: false, error: error.message };

  revalidatePaymentDependents();
  return { success: true };
}

export async function updatePaymentMethodAction(id: string, input: PaymentMethodInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('payment_methods').update(paymentMethodToRow(input)).eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePaymentDependents();
  return { success: true };
}

export async function deletePaymentMethodAction(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('payment_methods').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePaymentDependents();
  return { success: true };
}

// ---------------------------------------------------------------------------
// Rekber Fee Tiers
// ---------------------------------------------------------------------------

export interface RekberFeeTierInput {
  maxAmount: number | null;
  fee: number;
  sortOrder: number;
}

function revalidateRekberDependents() {
  revalidatePath('/admin/tarif-rekber');
  revalidatePath('/rekber');
}

export async function createRekberFeeTierAction(input: RekberFeeTierInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('rekber_fee_tiers').insert({
    max_amount: input.maxAmount,
    fee: input.fee,
    sort_order: input.sortOrder,
  });
  if (error) return { success: false, error: error.message };

  revalidateRekberDependents();
  return { success: true };
}

export async function updateRekberFeeTierAction(id: string, input: RekberFeeTierInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase
    .from('rekber_fee_tiers')
    .update({ max_amount: input.maxAmount, fee: input.fee, sort_order: input.sortOrder })
    .eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidateRekberDependents();
  return { success: true };
}

export async function deleteRekberFeeTierAction(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('rekber_fee_tiers').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidateRekberDependents();
  return { success: true };
}

// ---------------------------------------------------------------------------
// Price Ranges (Rentang Harga filter on /products)
// ---------------------------------------------------------------------------

export interface PriceRangeInput {
  minAmount: number | null;
  maxAmount: number | null;
  sortOrder: number;
}

function revalidatePriceRangeDependents() {
  revalidatePath('/admin/rentang-harga');
  revalidatePath('/products');
}

export async function createPriceRangeAction(input: PriceRangeInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('product_price_ranges').insert({
    min_amount: input.minAmount,
    max_amount: input.maxAmount,
    sort_order: input.sortOrder,
  });
  if (error) return { success: false, error: error.message };

  revalidatePriceRangeDependents();
  return { success: true };
}

export async function updatePriceRangeAction(id: string, input: PriceRangeInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase
    .from('product_price_ranges')
    .update({ min_amount: input.minAmount, max_amount: input.maxAmount, sort_order: input.sortOrder })
    .eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePriceRangeDependents();
  return { success: true };
}

export async function deletePriceRangeAction(id: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from('product_price_ranges').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePriceRangeDependents();
  return { success: true };
}

// ---------------------------------------------------------------------------
// Payment Gateway Settings (Tripay) — Phase 1: storage only, see migration
// 00000000000008_tripay_settings.sql header for the two-phase plan.
// ---------------------------------------------------------------------------

export interface PaymentGatewaySettingsInput {
  merchantCode: string;
  apiKey: string;
  /** Empty string means "leave the existing private key unchanged" — the
   * form never round-trips the real secret back into a plain input, so
   * there's no way for the admin to "clear" it accidentally by re-saving
   * the form without retyping it. */
  privateKey: string;
  mode: 'sandbox' | 'production';
  isEnabled: boolean;
}

export async function updatePaymentGatewaySettingsAction(input: PaymentGatewaySettingsInput): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const update: Record<string, unknown> = {
    merchant_code: input.merchantCode,
    api_key: input.apiKey,
    mode: input.mode,
    is_enabled: input.isEnabled,
    updated_at: new Date().toISOString(),
  };
  if (input.privateKey) update.private_key = input.privateKey;

  const { error } = await guard.supabase.from('payment_gateway_settings').update(update).eq('id', 1);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/gateway-pembayaran');
  return { success: true };
}

/** Fetches the merchant's live payment-channel list as a connectivity
 * check — no transaction is created, so this is safe to call as often as
 * the admin wants while getting their credentials right. Takes the
 * credentials directly from the form (not yet-saved values included) so
 * "Test Koneksi" works before hitting Save. */
export async function testTripayConnectionAction(input: {
  merchantCode: string;
  apiKey: string;
  privateKey: string;
  mode: 'sandbox' | 'production';
}): Promise<{ success: true; channelCount: number } | { success: false; error: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  if (!input.apiKey || !input.privateKey || !input.merchantCode) {
    return { success: false, error: 'Isi Merchant Code, API Key, dan Private Key dulu.' };
  }

  const result = await getTripayPaymentChannels({
    merchantCode: input.merchantCode,
    apiKey: input.apiKey,
    privateKey: input.privateKey,
    mode: input.mode,
  });
  if (!result.success) return { success: false, error: result.error };
  return { success: true, channelCount: result.data.length };
}
