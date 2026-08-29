import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/service';
import { verifyTripayCallbackSignature } from '@/lib/tripay/client';
import type { TripayCallbackPayload } from '@/lib/tripay/types';

/**
 * Tripay payment-status webhook. Phase 1 (see migration
 * 00000000000008_tripay_settings.sql): this endpoint exists and is fully
 * wired, but nothing in the checkout/topup/rekber flow creates Tripay
 * transactions yet, so Tripay has no reason to call it in practice — it's
 * ready for Phase 2 rather than actively serving traffic today.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the server environment (see
 * utils/supabase/service.ts) because Tripay's request carries no Supabase
 * auth session at all — there's no logged-in "user" to authenticate this
 * request as, yet it still needs to read the private_key (to verify the
 * request really came from Tripay) and update an order's status regardless
 * of who placed it.
 *
 * Always responds 200 even on internal errors (after logging them) — Tripay
 * retries a webhook delivery on non-200 responses, and retrying a request
 * that failed for a reason retries won't fix (bad signature, missing
 * config, order not found) just adds noise. The one thing this endpoint
 * must never do is silently accept an UNVERIFIED signature.
 */

const STATUS_MAP: Record<TripayCallbackPayload['status'], string | null> = {
  PAID: 'paid',
  EXPIRED: 'cancelled',
  FAILED: 'rejected',
  REFUND: 'cancelled',
  UNPAID: null, // no meaningful transition — Tripay shouldn't send this as a callback anyway
};

const ORDER_TABLES = ['orders', 'topup_orders', 'rekber_orders'] as const;

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-callback-signature');

  let supabase: ReturnType<typeof createServiceRoleClient>;
  try {
    supabase = createServiceRoleClient();
  } catch (err) {
    console.error('[tripay/callback] service role client unavailable (Phase 2 not activated yet?):', err);
    return NextResponse.json({ success: true, note: 'not configured' });
  }

  const { data: settings, error: settingsError } = await supabase
    .from('payment_gateway_settings')
    .select('private_key, is_enabled')
    .eq('id', 1)
    .maybeSingle();

  if (settingsError || !settings?.private_key) {
    console.error('[tripay/callback] no private key configured:', settingsError);
    return NextResponse.json({ success: true, note: 'not configured' });
  }

  if (!verifyTripayCallbackSignature(rawBody, signature, settings.private_key)) {
    console.error('[tripay/callback] signature verification failed — rejecting');
    return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
  }

  let payload: TripayCallbackPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
  }

  const nextStatus = STATUS_MAP[payload.status];
  if (!nextStatus) {
    return NextResponse.json({ success: true, note: `status ${payload.status} ignored` });
  }

  for (const table of ORDER_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .update({ status: nextStatus })
      .eq('order_number', payload.merchant_ref)
      .select('id')
      .maybeSingle();
    if (error) {
      console.error(`[tripay/callback] failed updating ${table}:`, error);
      continue;
    }
    if (data) {
      return NextResponse.json({ success: true });
    }
  }

  console.error('[tripay/callback] no order found for merchant_ref:', payload.merchant_ref);
  return NextResponse.json({ success: true, note: 'order not found' });
}
