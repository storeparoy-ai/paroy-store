'use client';

import React, { useState, useTransition } from 'react';
import { CheckCircle2, AlertCircle, Wifi, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { updatePaymentGatewaySettingsAction, testTripayConnectionAction } from '@/lib/supabase/cms-actions';
import type { AdminPaymentGatewaySettings } from '@/lib/supabase/admin-queries';

export default function PaymentGatewaySettingsForm({ settings }: { settings: AdminPaymentGatewaySettings }) {
  const [merchantCode, setMerchantCode] = useState(settings.merchantCode);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [privateKey, setPrivateKey] = useState('');
  const [mode, setMode] = useState<'sandbox' | 'production'>(settings.mode);
  const [isEnabled, setIsEnabled] = useState(settings.isEnabled);
  const hasStoredPrivateKey = settings.privateKey.length > 0;

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [isSaving, startSaving] = useTransition();

  const [testStatus, setTestStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [isTesting, startTesting] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveStatus('idle');
    startSaving(async () => {
      const result = await updatePaymentGatewaySettingsAction({
        merchantCode: merchantCode.trim(),
        apiKey: apiKey.trim(),
        privateKey: privateKey.trim(),
        mode,
        isEnabled,
      });
      if (result.success) {
        setSaveStatus('saved');
        setPrivateKey('');
      } else {
        setSaveStatus('error');
        setSaveError(result.error);
      }
    });
  }

  function handleTestConnection() {
    setTestStatus('idle');
    const keyToTest = privateKey.trim() || (hasStoredPrivateKey ? settings.privateKey : '');
    startTesting(async () => {
      const result = await testTripayConnectionAction({
        merchantCode: merchantCode.trim(),
        apiKey: apiKey.trim(),
        privateKey: keyToTest,
        mode,
      });
      if (result.success) {
        setTestStatus('ok');
        setTestMessage(`Berhasil terhubung — ${result.channelCount} metode pembayaran aktif ditemukan.`);
      } else {
        setTestStatus('error');
        setTestMessage(result.error);
      }
    });
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 text-xs text-text-muted leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
        <span>
          Kredensial ini disimpan aman (cuma bisa dibaca/diubah admin) dan belum dipakai untuk memproses pembayaran
          sungguhan — checkout/top up/rekber masih pakai transfer manual seperti sekarang. Begitu Merchant Code, API
          Key, dan Private Key sudah diisi dan tombol &ldquo;Test Koneksi&rdquo; berhasil, kabari untuk lanjut
          diaktifkan ke alur pembayaran.
        </span>
      </div>

      <Card variant="default">
        <CardContent className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Merchant Code"
              value={merchantCode}
              onChange={(e) => setMerchantCode(e.target.value)}
              placeholder="T0001"
            />
            <Input label="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="DEV-xxxxxxxxxxxxxxxx" />
            <Input
              label="Private Key"
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder={hasStoredPrivateKey ? '•••••••••••••• (sudah tersimpan, isi untuk ganti)' : 'Belum diisi'}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-muted">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'sandbox' | 'production')}
                className="w-full h-11 bg-bg-card border border-border-subtle rounded-xl text-sm text-text-main px-4 focus:outline-none focus:border-brand-cyan/50 cursor-pointer"
              >
                <option value="sandbox">Sandbox (uji coba, transaksi tidak nyata)</option>
                <option value="production">Production (transaksi nyata)</option>
              </select>
            </div>

            <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="w-4 h-4 accent-brand-cyan cursor-pointer"
              />
              Aktifkan Tripay untuk alur pembayaran (belum berlaku di Phase 1)
            </label>

            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-xs text-trust-emerald">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pengaturan disimpan.
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-xs text-urgency-red">
                <AlertCircle className="w-3.5 h-3.5" />
                {saveError}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Simpan Pengaturan
              </Button>
              <Button type="button" variant="outline" onClick={handleTestConnection} isLoading={isTesting}>
                <Wifi className="w-3.5 h-3.5" />
                Test Koneksi
              </Button>
            </div>

            {testStatus !== 'idle' && (
              <div
                className={`flex items-start gap-2 p-3 rounded-lg text-xs ${
                  testStatus === 'ok'
                    ? 'bg-trust-emerald/10 border border-trust-emerald/25 text-trust-emerald'
                    : 'bg-urgency-red/10 border border-urgency-red/25 text-urgency-red'
                }`}
              >
                {testStatus === 'ok' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                )}
                <span>{testMessage}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
