'use client';

import React, { useState, useTransition } from 'react';
import { CheckCircle2, AlertCircle, Send, ShieldAlert, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import {
  updateNotificationSettingsAction,
  testNotificationAction,
} from '@/lib/supabase/cms-actions';
import type { AdminNotificationSettings } from '@/lib/supabase/admin-queries';

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 text-xs text-text-main cursor-pointer w-fit">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-brand-cyan cursor-pointer"
      />
      {label}
    </label>
  );
}

export default function NotificationSettingsForm({
  settings,
}: {
  settings: AdminNotificationSettings;
}) {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState(settings.chatId);
  const [isEnabled, setIsEnabled] = useState(settings.isEnabled);
  const [notifyNewOrder, setNotifyNewOrder] = useState(settings.notifyNewOrder);
  const [notifyProofUpload, setNotifyProofUpload] = useState(settings.notifyProofUpload);

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
      const result = await updateNotificationSettingsAction({
        botToken: botToken.trim(),
        chatId: chatId.trim(),
        isEnabled,
        notifyNewOrder,
        notifyProofUpload,
      });
      if (result.success) {
        setSaveStatus('saved');
        setBotToken(''); // token tidak dipajang ulang di input
      } else {
        setSaveStatus('error');
        setSaveError(result.error);
      }
    });
  }

  function handleTest() {
    setTestStatus('idle');
    startTesting(async () => {
      const result = await testNotificationAction({ botToken: botToken.trim(), chatId: chatId.trim() });
      if (result.success) {
        setTestStatus('ok');
        setTestMessage('Pesan terkirim — cek Telegram-mu sekarang.');
      } else {
        setTestStatus('error');
        setTestMessage(result.error);
      }
    });
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 text-xs text-text-muted leading-relaxed">
        <Bell className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p>
            Setiap pesanan masuk dan setiap bukti transfer yang diunggah pembeli akan dikirim ke chat
            Telegram-mu. Cara menyiapkannya:
          </p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>
              Buka Telegram, cari{' '}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-cyan hover:underline"
              >
                @BotFather
              </a>
              , kirim <code className="text-text-dim">/newbot</code>, ikuti sampai dapat token.
            </li>
            <li>
              <strong className="text-text-main">Kirim satu pesan apa saja ke bot barumu</strong> — bot
              tidak bisa memulai chat duluan.
            </li>
            <li>
              Buka <code className="text-text-dim">api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> di
              browser, salin angka setelah <code className="text-text-dim">&quot;chat&quot;:&#123;&quot;id&quot;:</code>
            </li>
          </ol>
          <p>
            Mau notifikasinya masuk ke grup? Undang bot-nya ke grup, lalu pakai chat ID grup itu —
            angkanya diawali tanda minus.
          </p>
        </div>
      </div>

      {!settings.serviceKeyConfigured && (
        <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-urgency-orange/10 border border-urgency-orange/25 text-xs text-urgency-orange leading-relaxed">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Tombol &ldquo;Kirim Tes&rdquo; akan jalan, tapi notifikasi otomatisnya belum.</strong>{' '}
            Pesanan dibuat oleh pengunjung yang belum login, dan pengaturan di halaman ini sengaja cuma
            bisa dibaca admin — jadi server butuh <code>SUPABASE_SERVICE_ROLE_KEY</code> di Vercel untuk
            membacanya atas namamu. Isi sekali, tidak perlu diubah lagi.
          </span>
        </div>
      )}

      <Card variant="default">
        <CardContent className="p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Bot Token"
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder={
                settings.hasBotToken
                  ? '•••••••••••••• (sudah tersimpan, isi untuk ganti)'
                  : '8123456789:AAF...'
              }
            />
            <Input
              label="Chat ID"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="123456789"
            />

            <div className="space-y-2.5 pt-1">
              <Toggle checked={isEnabled} onChange={setIsEnabled} label="Aktifkan notifikasi Telegram" />
              <Toggle
                checked={notifyNewOrder}
                onChange={setNotifyNewOrder}
                label="Beri tahu saat ada pesanan baru"
              />
              <Toggle
                checked={notifyProofUpload}
                onChange={setNotifyProofUpload}
                label="Beri tahu saat bukti transfer diunggah"
              />
            </div>

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
              <Button type="button" variant="outline" onClick={handleTest} isLoading={isTesting}>
                <Send className="w-3.5 h-3.5" />
                Kirim Tes
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
