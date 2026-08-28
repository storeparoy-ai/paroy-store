'use client';

import React, { useState, useTransition } from 'react';
import { ShieldCheck, Shield, Loader2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { updateUserRoleAction } from '@/lib/supabase/admin-actions';
import { timeAgo } from '@/lib/utils';
import type { AdminUser } from '@/lib/supabase/admin-queries';

function UserRow({ user, currentUserId }: { user: AdminUser; currentUserId: string }) {
  const [role, setRole] = useState(user.role);
  const [isPending, startTransition] = useTransition();
  const isSelf = user.id === currentUserId;

  function toggleRole() {
    const next = role === 'admin' ? 'user' : 'admin';
    startTransition(async () => {
      const result = await updateUserRoleAction(user.id, next);
      if (result.success) setRole(next);
    });
  }

  return (
    <tr className="border-b border-border-subtle/60 last:border-0">
      <td className="py-3 px-4">
        <p className="text-xs text-text-main">{user.fullName || user.username || '—'}</p>
        <p className="text-[10px] text-text-dim">{user.whatsapp ?? '—'}</p>
      </td>
      <td className="py-3 px-4">
        <Badge variant={role === 'admin' ? 'trust' : 'neutral'} size="sm">
          {role === 'admin' ? 'Admin' : 'User'}
        </Badge>
      </td>
      <td className="py-3 px-4 text-[10px] text-text-dim whitespace-nowrap">{timeAgo(user.createdAt)}</td>
      <td className="py-3 px-4">
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-text-dim" />
        ) : isSelf ? (
          <span className="text-[10px] text-text-dim">Ini kamu</span>
        ) : (
          <Button size="sm" variant="ghost" onClick={toggleRole}>
            {role === 'admin' ? (
              <>
                <Shield className="w-3.5 h-3.5" />
                Cabut Admin
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Jadikan Admin
              </>
            )}
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function UsersTable({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  if (users.length === 0) {
    return <p className="text-sm text-text-muted py-10 text-center">Belum ada pengguna terdaftar.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-subtle">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-bg-card-alt border-b border-border-subtle text-[10px] uppercase tracking-wider text-text-dim">
            <th className="py-3 px-4 font-semibold">Pengguna</th>
            <th className="py-3 px-4 font-semibold">Role</th>
            <th className="py-3 px-4 font-semibold">Daftar</th>
            <th className="py-3 px-4 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} currentUserId={currentUserId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
