import React from 'react';
import PaymentGatewaySettingsForm from '@/components/admin/PaymentGatewaySettingsForm';
import { getPaymentGatewaySettings } from '@/lib/supabase/admin-queries';

export default async function AdminPaymentGatewayPage() {
  const settings = await getPaymentGatewaySettings();
  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-lg text-text-main">Gateway Pembayaran (Tripay)</h2>
      <PaymentGatewaySettingsForm settings={settings} />
    </div>
  );
}
