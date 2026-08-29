import React from 'react';
import GamesTable from '@/components/admin/GamesTable';
import { getAllGamesForAdmin } from '@/lib/supabase/admin-queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminGamesPage() {
  const games = await getAllGamesForAdmin();
  return <GamesTable games={games} />;
}
