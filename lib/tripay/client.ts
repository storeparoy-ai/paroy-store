import { createHmac, timingSafeEqual } from 'crypto';
import type {
  TripayConfig,
  TripayPaymentChannel,
  TripayCreateTransactionParams,
  TripayCreateTransactionResult,
  TripayTransactionDetail,
  TripayResult,
} from './types';

/**
 * Server-only Tripay REST client. NEVER import this from a 'use client'
 * component — it handles the private_key and would otherwise ship it into
 * the browser bundle.
 *
 * Built from Tripay's publicly documented API shape (the interactive
 * developer docs at tripay.co.id/developer require a logged-in merchant
 * account, which doesn't exist yet — Tripay itself is down for maintenance
 * as of 2026-08-29, see [[paroy-store-product-decisions]]). Cross-referenced
 * against multiple independent community SDKs' source for the endpoint
 * paths, field names, and signature algorithm, since those are consistently
 * documented the same way across all of them. NOT yet tested against a real
 * Tripay account — verify against the sandbox once real credentials exist
 * (Phase 2, see the migration 00000000000008 header comment).
 */

function baseUrl(mode: TripayConfig['mode']): string {
  return mode === 'production' ? 'https://tripay.co.id/api' : 'https://tripay.co.id/api-sandbox';
}

function authHeaders(config: TripayConfig): HeadersInit {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  };
}

/** Closed-transaction signature: HMAC-SHA256(merchant_code + merchant_ref +
 * amount, private_key), hex-encoded. This exact concatenation order and
 * algorithm is what every independent Tripay SDK implements identically. */
export function computeTripaySignature(merchantCode: string, merchantRef: string, amount: number, privateKey: string): string {
  return createHmac('sha256', privateKey).update(merchantCode + merchantRef + amount).digest('hex');
}

/** Verifies the `X-Callback-Signature` header Tripay sends on webhook
 * calls: HMAC-SHA256(raw request body, private_key), hex-encoded, compared
 * to the header value. Takes the RAW body string (not a parsed/re-serialized
 * object) — re-serializing JSON can reorder keys or change whitespace and
 * silently break the comparison, so the caller must pass exactly what was
 * received on the wire. Uses a timing-safe comparison to avoid leaking the
 * expected signature through response-time side channels. */
export function verifyTripayCallbackSignature(rawBody: string, signatureHeader: string | null, privateKey: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac('sha256', privateKey).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  const receivedBuf = Buffer.from(signatureHeader, 'hex');
  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

async function tripayFetch<T>(config: TripayConfig, path: string, init?: RequestInit): Promise<TripayResult<T>> {
  try {
    const res = await fetch(`${baseUrl(config.mode)}${path}`, {
      ...init,
      headers: { ...authHeaders(config), ...init?.headers },
    });
    const json = await res.json();
    if (!res.ok || json?.success === false) {
      return { success: false, error: json?.message ?? `Tripay API error (HTTP ${res.status})` };
    }
    return { success: true, data: json.data as T };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Gagal menghubungi Tripay' };
  }
}

/** Fetches the merchant's active payment channels (QRIS, VA banks,
 * e-wallets, ...) — used to populate a dynamic payment-method picker once
 * the checkout flow is wired to Tripay in Phase 2. Also doubles as a
 * lightweight connectivity/credentials test (see testTripayConnectionAction
 * in cms-actions.ts) since it requires no transaction to be created. */
export async function getTripayPaymentChannels(config: TripayConfig): Promise<TripayResult<TripayPaymentChannel[]>> {
  const result = await tripayFetch<
    { code: string; name: string; type: string; fee_merchant: { flat: number; percent: number }; fee_customer: { flat: number; percent: number }; total_fee: { flat: number; percent: number }; icon_url: string | null; active: boolean }[]
  >(config, '/merchant/payment-channel');
  if (!result.success) return result;
  return {
    success: true,
    data: result.data.map((c) => ({
      code: c.code,
      name: c.name,
      type: c.type,
      feeMerchant: c.fee_merchant,
      feeCustomer: c.fee_customer,
      totalFee: c.total_fee,
      iconUrl: c.icon_url,
      active: c.active,
    })),
  };
}

/** Creates a closed (fixed-amount) Tripay transaction. `params.merchantRef`
 * should be our own order_number — the webhook looks the order back up by
 * this value, matching the pattern get_order_status() already uses. */
export async function createTripayTransaction(
  config: TripayConfig,
  params: TripayCreateTransactionParams
): Promise<TripayResult<TripayCreateTransactionResult>> {
  const signature = computeTripaySignature(config.merchantCode, params.merchantRef, params.amount, config.privateKey);
  const expiredTime = params.expiredAt ?? Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  const result = await tripayFetch<{
    reference: string;
    merchant_ref: string;
    checkout_url: string;
    qr_url: string | null;
    pay_code: string | null;
    pay_url: string | null;
    status: string;
    amount: number;
    expired_time: number;
    instructions: { title: string; steps: string[] }[];
  }>(config, '/transaction/create', {
    method: 'POST',
    body: JSON.stringify({
      method: params.method,
      merchant_ref: params.merchantRef,
      amount: params.amount,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      order_items: params.orderItems.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity })),
      callback_url: params.callbackUrl,
      return_url: params.returnUrl,
      expired_time: expiredTime,
      signature,
    }),
  });

  if (!result.success) return result;
  return {
    success: true,
    data: {
      reference: result.data.reference,
      merchantRef: result.data.merchant_ref,
      checkoutUrl: result.data.checkout_url,
      qrUrl: result.data.qr_url,
      payCode: result.data.pay_code,
      payUrl: result.data.pay_url,
      status: result.data.status,
      amount: result.data.amount,
      expiredAt: result.data.expired_time,
      instructions: result.data.instructions ?? [],
    },
  };
}

/** Looks up a transaction's current status by its Tripay reference — useful
 * as a manual "check now" fallback if a webhook call is ever missed. */
export async function getTripayTransactionDetail(config: TripayConfig, reference: string): Promise<TripayResult<TripayTransactionDetail>> {
  const result = await tripayFetch<{ reference: string; merchant_ref: string; status: TripayTransactionDetail['status']; paid_at: number | null; amount: number }>(
    config,
    `/transaction/detail?reference=${encodeURIComponent(reference)}`
  );
  if (!result.success) return result;
  return {
    success: true,
    data: {
      reference: result.data.reference,
      merchantRef: result.data.merchant_ref,
      status: result.data.status,
      paidAt: result.data.paid_at,
      amount: result.data.amount,
    },
  };
}
