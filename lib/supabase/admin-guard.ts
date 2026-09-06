import { createClient } from '@/utils/supabase/server';
import {
  can,
  isOwner,
  PERMISSION_LABELS,
  type AdminAccess,
  type AdminPermission,
} from '@/lib/admin-permissions';

/**
 * Pemeriksaan hak akses untuk Server Action — dipakai admin-actions.ts dan
 * cms-actions.ts.
 *
 * LAPIS PERTAMA, BUKAN PENGAMAN. Yang benar-benar menahan adalah RLS: sejak
 * migrasi 19 setiap kebijakan memanggil `admin_can(...)` atau `is_owner()`,
 * dan itu berlaku juga saat seseorang memanggil Supabase langsung dengan
 * kunci publik tanpa lewat situs sama sekali. Gunanya di sini supaya orang
 * yang tidak berhak mendapat kalimat yang bisa dibaca, bukan penolakan
 * Postgres mentah — dan supaya aksi yang seharusnya ditolak tidak sempat
 * menyentuh database.
 *
 * Berkas ini sengaja TIDAK ber-'use server': modul Server Action hanya boleh
 * mengekspor fungsi async, sementara helper di bawah perlu dipakai bersama
 * oleh dua modul aksi.
 */
async function requireAccess(check: (access: AdminAccess) => boolean, denial: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const, error: 'Kamu harus masuk sebagai admin.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, permissions')
    .eq('id', user.id)
    .maybeSingle();

  const access: AdminAccess = {
    role: profile?.role === 'owner' || profile?.role === 'admin' ? profile.role : 'user',
    permissions: profile?.permissions ?? [],
  };

  if (!check(access)) return { supabase, ok: false as const, error: denial };
  return { supabase, ok: true as const, access };
}

/** Aksi yang butuh satu izin tertentu. Pemilik selalu lolos. */
export function requirePermission(permission: AdminPermission) {
  return requireAccess(
    (access) => can(access, permission),
    `Akses ditolak — akunmu tidak punya izin "${PERMISSION_LABELS[permission].label}".`
  );
}

/** Aksi yang hanya boleh dilakukan pemilik toko: nomor rekening tujuan, kunci
 * Tripay, token bot, pengaturan situs, dan pengelolaan pengguna. */
export function requireOwner() {
  return requireAccess(isOwner, 'Akses ditolak — hanya pemilik toko yang boleh melakukan ini.');
}
