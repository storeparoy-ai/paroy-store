import React from 'react';
import SiteSettingsForm from '@/components/admin/SiteSettingsForm';
import { getSiteSettings } from '@/lib/supabase/queries';

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-lg text-text-main">Pengaturan Situs</h2>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
