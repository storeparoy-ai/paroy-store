'use client';

import React, { useState, useTransition } from 'react';
import { ShieldCheck, Shield, Loader2, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { deleteUserAction, updateUserRoleAction } from '@/lib/supabase/admin-actions';
import { timeAgo } from '@/lib/utils';
import type { AdminUser } from '@/lib/supabase/admin-queries';

function displayName(user: AdminUser) {
  return user.fullName || user.username || 'Tanpa nama';
}

/**
 * Satu baris = satu pengguna, dua aksi: ubah role dan hapus.
 *
 * Role disimpan di state lokal baris ini karena tombol Hapus bergantung
 * padanya: akun admin sengaja tidak bisa langsung dihapus (lihat migrasi 18),
 * jadi setelah "Cabut Admin" diklik tombol Hapus harus langsung ikut hidup
 * tanpa menunggu muat ulang halaman.
 */
function UserRow({
  user,
  currentUserId,
  onDeleted,
}: {
  user: AdminUser;
  currentUserId: string;
  onDeleted: (id: string) => void;
}) {
  const [role, setRole] = useState(user.role);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isSelf = user.id === currentUserId;
  const name = displayName(user);

  function toggleRole() {
    const next = role === 'admin' ? 'user' : 'admin';
    startTransition(async () => {
      const result = await updateUserRoleAction(user.id, next);
      if (result.success) setRole(next);
    });
  }

  return (
    <>
      <tr className="border-b border-border-subtle/60 last:border-0">
        <td className="py-3 px-4">
          <p className="text-xs text-text-main">{name}</p>
          <p className="text-[10px] text-text-dim">
            {user.username && user.fullName ? `@${user.username} · ` : ''}
            {user.whatsapp ?? 'nomor belum diisi'}
          </p>
        </td>
        <td className="py-3 px-4">
          <Badge variant={role === 'admin' ? 'trust' : 'neutral'} size="sm">
            {role === 'admin' ? 'Admin' : 'User'}
          </Badge>
        </td>
        <td className="py-3 px-4 text-[10px] text-text-dim whitespace-nowrap">{timeAgo(user.createdAt)}</td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1">
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-text-dim" />
            ) : isSelf ? (
              <span className="text-[10px] text-text-dim">Ini kamu</span>
            ) : (
              <>
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
                {/* Admin tidak langsung bisa dihapus — cabut dulu statusnya.
                    Tombolnya tetap terlihat (dinonaktifkan) supaya jelas
                    fiturnya ada, bukan hilang. Judulnya dipasang di <span>
                    pembungkus, bukan di tombolnya: tombol yang disabled kena
                    `pointer-events-none`, jadi tooltip di situ tidak akan
                    pernah muncul justru saat alasannya paling dibutuhkan. */}
                <span
                  title={
                    role === 'admin'
                      ? 'Cabut status admin dulu sebelum menghapus akun ini'
                      : `Hapus akun ${name}`
                  }
                  className="inline-flex"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={role === 'admin'}
                    onClick={() => setConfirmOpen(true)}
                    className="text-urgency-red hover:text-urgency-red hover:bg-urgency-red/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="sr-only">Hapus {name}</span>
                  </Button>
                </span>
              </>
            )}
          </div>
        </td>
      </tr>

      <DeleteConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Hapus akun ${name}?`}
        description="Akun, profil, wishlist, dan postingan komunitasnya dihapus permanen. Riwayat pesanannya TIDAK ikut terhapus — pesanan tetap tercatat atas nama dan nomor WhatsApp-nya seperti pesanan tamu, jadi laporan penjualan tidak berubah. Tindakan ini tidak bisa dibatalkan."
        onConfirm={async () => {
          const result = await deleteUserAction(user.id);
          if (result.success) onDeleted(user.id);
          return result.success ? { success: true } : { success: false, error: result.error };
        }}
      />
    </>
  );
}

export default function UsersTable({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  // Baris yang sudah dihapus dibuang dari tampilan tanpa menunggu revalidasi
  // selesai, supaya admin langsung melihat hasil klik-nya.
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const visible = users.filter((user) => !deletedIds.includes(user.id));

  if (visible.length === 0) {
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
          {visible.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              onDeleted={(id) => setDeletedIds((prev) => [...prev, id])}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
