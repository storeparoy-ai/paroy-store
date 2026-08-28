import React from 'react';
import GamesTable from '@/components/admin/GamesTable';
import { getAllGamesForAdmin } from '@/lib/supabase/admin-queries';

export default async function AdminGamesPage() {
  const games = await getAllGamesForAdmin();
  return <GamesTable games={games} />;
}
