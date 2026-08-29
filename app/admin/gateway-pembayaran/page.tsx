import React from 'react';
import PaymentGatewaySettingsForm from '@/components/admin/PaymentGatewaySettingsForm';
import { getPaymentGatewaySettings } from '@/lib/supabase/admin-queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminPaymentGatewayPage() {
  const settings = await getPaymentGatewaySettings();
  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-lg text-text-main">Gateway Pembayaran (Tripay)</h2>
      <PaymentGatewaySettingsForm settings={settings} />
    </div>
  );
}
