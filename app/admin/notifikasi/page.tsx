import React from 'react';
import NotificationSettingsForm from '@/components/admin/NotificationSettingsForm';
import { getNotificationSettings } from '@/lib/supabase/admin-queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminNotificationPage() {
  const settings = await getNotificationSettings();
  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-lg text-text-main">Notifikasi Pesanan</h2>
      <NotificationSettingsForm settings={settings} />
    </div>
  );
}
