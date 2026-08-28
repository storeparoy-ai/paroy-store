import React from 'react';
import { redirect } from 'next/navigation';
import SettingsForm from '@/components/profile/SettingsForm';
import { getCurrentUser } from '@/lib/supabase/queries';

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/profile/pengaturan');

  return <SettingsForm user={user} />;
}
