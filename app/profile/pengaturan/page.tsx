import React from 'react';
import { redirect } from 'next/navigation';
import SettingsForm from '@/components/profile/SettingsForm';
import { getCurrentUser } from '@/lib/supabase/queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/profile/pengaturan');

  return <SettingsForm user={user} />;
}
