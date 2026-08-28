'use client';

import React, { useState, useTransition } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { updateSiteSettingsAction } from '@/lib/supabase/cms-actions';
import type { SiteSettings } from '@/lib/supabase/queries';

export default function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [mascotImageUrl, setMascotImageUrl] = useState<string | null>(settings.mascotImageUrl);
  const [whatsappUrl, setWhatsappUrl] = useState(settings.whatsappUrl ?? '');
  const [discordUrl, setDiscordUrl] = useState(settings.discordUrl ?? '');
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('idle');
    startTransition(async () => {
      const result = await updateSiteSettingsAction({
        siteName: siteName.trim() || 'Paroy Store',
        tagline: tagline.trim(),
        mascotImageUrl,
        whatsappUrl: whatsappUrl.trim(),
        discordUrl: discordUrl.trim(),
      });
      if (result.success) {
        setStatus('saved');
      } else {
        setStatus('error');
        setError(result.error);
      }
    });
  }

  return (
    <Card variant="default" className="max-w-lg">
      <CardContent className="p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Situs" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          <Input label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />

          <ImageUploadField
            label="Maskot Homepage"
            value={mascotImageUrl}
            onChange={setMascotImageUrl}
            folder="mascot"
            shape="wide"
          />
          <p className="text-[11px] text-text-dim -mt-3">
            Muncul di section hero homepage. Kosongkan untuk menyembunyikan.
          </p>

          <Input
            label="Link WhatsApp Komunitas"
            value={whatsappUrl}
            onChange={(e) => setWhatsappUrl(e.target.value)}
            placeholder="https://wa.me/62..."
          />
          <Input
            label="Link Discord Komunitas"
            value={discordUrl}
            onChange={(e) => setDiscordUrl(e.target.value)}
            placeholder="https://discord.gg/..."
          />

          {status === 'saved' && (
            <div className="flex items-center gap-2 text-xs text-trust-emerald">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pengaturan disimpan.
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-urgency-red">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" isLoading={isPending}>
            Simpan Pengaturan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
