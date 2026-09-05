import React from 'react';
import TopupItemsTable from '@/components/admin/TopupItemsTable';
import { getAllTopupItemsForAdmin } from '@/lib/supabase/admin-queries';
import { getGames } from '@/lib/supabase/queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminTopupPage() {
  const [items, games] = await Promise.all([getAllTopupItemsForAdmin(), getGames()]);
  return <TopupItemsTable items={items} games={games} />;
}
