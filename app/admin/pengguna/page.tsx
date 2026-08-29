import React from 'react';
import UsersTable from '@/components/admin/UsersTable';
import { getAllUsersForAdmin } from '@/lib/supabase/admin-queries';
import { getCurrentUser } from '@/lib/supabase/queries';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function AdminUsersPage() {
  const [users, currentUser] = await Promise.all([getAllUsersForAdmin(), getCurrentUser()]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-lg text-text-main">Pengguna ({users.length})</h2>
      </div>
      <UsersTable users={users} currentUserId={currentUser?.id ?? ''} />
    </div>
  );
}
