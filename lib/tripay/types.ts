/** Tripay credentials + mode — passed explicitly into every client.ts
 * function (never fetched internally by this module) so this file has zero
 * Supabase/database dependency and stays independently testable. Phase 2
 * (actually calling these from the checkout flow / webhook) is responsible
 * for sourcing a TripayConfig safely — see lib/supabase/admin-queries.ts's
 * getPaymentGatewaySettings() for the admin-session read path, and the
 * not-yet-built service-role path needed for unauthenticated contexts. */
export interface TripayConfig {
  merchantCode: string;
  apiKey: string;
  privateKey: string;
  mode: 'sandbox' | 'production';
}

export interface TripayPaymentChannel {
  code: string;
  name: string;
  type: string;
  feeMerchant: { flat: number; percent: number };
  feeCustomer: { flat: number; percent: number };
  totalFee: { flat: number; percent: number };
  iconUrl: string | null;
  active: boolean;
}

export interface TripayOrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface TripayCreateTransactionParams {
  /** Tripay payment channel code, e.g. "QRIS", "BRIVA", "OVO". */
  method: string;
  /** Our own order_number — set as merchant_ref so the webhook can look the
   * order back up across orders/topup_orders/rekber_orders by this value. */
  merchantRef: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  orderItems: TripayOrderItem[];
  callbackUrl: string;
  returnUrl?: string;
  /** Unix timestamp; defaults to +24h server-side in createTripayTransaction
   * if omitted. */
  expiredAt?: number;
}

export interface TripayCreateTransactionResult {
  reference: string;
  merchantRef: string;
  checkoutUrl: string;
  qrUrl: string | null;
  payCode: string | null;
  payUrl: string | null;
  status: string;
  amount: number;
  expiredAt: number;
  instructions: { title: string; steps: string[] }[];
}

export interface TripayTransactionDetail {
  reference: string;
  merchantRef: string;
  status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED' | 'REFUND';
  paidAt: number | null;
  amount: number;
}

/** Shape of the JSON body Tripay POSTs to our webhook on payment status
 * change. Field names mirror Tripay's documented callback payload. */
export interface TripayCallbackPayload {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  payment_method_code: string;
  total_amount: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  amount_received: number;
  is_closed_payment: 0 | 1;
  status: 'PAID' | 'UNPAID' | 'EXPIRED' | 'FAILED' | 'REFUND';
  paid_at: number | null;
  note: string | null;
}

export type TripayResult<T> = { success: true; data: T } | { success: false; error: string };
