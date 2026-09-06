'use client';

import React, { useState, useTransition } from 'react';
import { ShieldCheck, Shield, Loader2, Trash2, KeyRound, Crown } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import PermissionsModal from '@/components/admin/PermissionsModal';
import {
  deleteUserAction,
  updateUserPermissionsAction,
  updateUserRoleAction,
} from '@/lib/supabase/admin-actions';
import { PERMISSION_LABELS, type AdminPermission } from '@/lib/admin-permissions';
import { timeAgo } from '@/lib/utils';
import type { AdminUser } from '@/lib/supabase/admin-queries';

function displayName(user: AdminUser) {
  return user.fullName || user.username || 'Tanpa nama';
}

/**
 * Satu baris = satu pengguna.
 *
 * Role dan izin disimpan sebagai state baris ini karena tombol-tombolnya
 * saling bergantung: mengangkat seseorang jadi admin memunculkan tombol
 * "Atur izin", mencabutnya menghilangkan izin itu lagi (server memang
 * mengosongkannya — lihat updateUserRoleAction), dan tombol Hapus baru hidup
 * setelah statusnya bukan admin. Semua itu harus terlihat seketika, tanpa
 * menunggu halaman dimuat ulang.
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
  const [permissions, setPermissions] = useState<AdminPermission[]>(user.permissions);
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [permsOpen, setPermsOpen] = useState(false);

  const isSelf = user.id === currentUserId;
  const isOwnerRow = role === 'owner';
  const name = displayName(user);

  function toggleRole() {
    const next = role === 'admin' ? 'user' : 'admin';
    startTransition(async () => {
      const result = await updateUserRoleAction(user.id, next);
      if (result.success) {
        setRole(next);
        setPermissions([]); // server mengosongkannya juga; ini supaya tampilan langsung cocok
      }
    });
  }

  return (
    <>
      <tr className="border-b border-border-subtle/60 last:border-0 align-top">
        <td className="py-3 px-4">
          <p className="text-xs text-text-main">{name}</p>
          <p className="text-[10px] text-text-dim">
            {user.username && user.fullName ? `@${user.username} · ` : ''}
            {user.whatsapp ?? 'nomor belum diisi'}
          </p>
        </td>
        <td className="py-3 px-4 space-y-1.5">
          {isOwnerRow ? (
            <Badge variant="trust" size="sm">
              <Crown className="w-3 h-3" />
              Pemilik
            </Badge>
          ) : (
            <Badge variant={role === 'admin' ? 'cyan' : 'neutral'} size="sm">
              {role === 'admin' ? 'Admin' : 'User'}
            </Badge>
          )}

          {/* Izin ditampilkan di daftar, bukan hanya di dalam dialog. Pemilik
              harus bisa melihat sekali lihat siapa memegang apa — kalau harus
              membuka satu per satu, tidak akan pernah diperiksa lagi. */}
          {role === 'admin' && (
            <div className="flex flex-wrap gap-1">
              {permissions.length === 0 ? (
                <span className="text-[10px] text-urgency-orange">Belum diberi izin apa pun</span>
              ) : (
                permissions.map((permission) => (
                  <Badge key={permission} variant="plain" size="sm">
                    {PERMISSION_LABELS[permission].label}
                  </Badge>
                ))
              )}
            </div>
          )}
        </td>
        <td className="py-3 px-4 text-[10px] text-text-dim whitespace-nowrap">{timeAgo(user.createdAt)}</td>
        <td className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-1">
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-text-dim" />
            ) : isOwnerRow ? (
              /* Akun pemilik tidak punya tombol apa pun — bukan karena
                 disembunyikan, tapi karena database menolak setiap perubahan
                 padanya lewat situs (trigger di migrasi 19). Menampilkan
                 tombol yang pasti gagal cuma akan menyesatkan. */
              <span className="text-[10px] text-text-dim">
                {isSelf ? 'Ini kamu — pemilik toko' : 'Pemilik toko'}
              </span>
            ) : isSelf ? (
              <span className="text-[10px] text-text-dim">Ini kamu</span>
            ) : (
              <>
                {role === 'admin' && (
                  <Button size="sm" variant="ghost" onClick={() => setPermsOpen(true)}>
                    <KeyRound className="w-3.5 h-3.5" />
                    Atur izin
                  </Button>
                )}
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

      {/* Dipasang hanya saat terbuka supaya centangannya selalu mulai dari
          keadaan yang tersimpan, tanpa useEffect penyelaras. */}
      {permsOpen && (
        <PermissionsModal
          open={permsOpen}
          onOpenChange={setPermsOpen}
          name={name}
          current={permissions}
          onSave={async (next) => {
            const result = await updateUserPermissionsAction(user.id, next);
            if (result.success) setPermissions(next);
            return result.success ? { success: true } : { success: false, error: result.error };
          }}
        />
      )}

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
  // selesai, supaya pemilik langsung melihat hasil klik-nya.
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
            <th className="py-3 px-4 font-semibold">Akses</th>
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
