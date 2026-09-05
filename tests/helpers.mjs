import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Baca kredensial publik dari .env.local kalau ada, kalau tidak dari
 * environment. Berkas .env.local tidak ikut Git, jadi di CI variabelnya
 * dipasang langsung.
 *
 * Hanya kunci ANON yang dipakai seluruh berkas tes — itu memang intinya:
 * setiap pemeriksaan di sini berdiri di posisi orang asing yang mengambil
 * kunci itu dari dalam browser pengunjung, lalu memanggil Supabase langsung
 * tanpa melewati situs sama sekali. Kunci service role tidak boleh muncul di
 * sini; ia menembus RLS, jadi memakainya akan membuat seluruh tes lulus tanpa
 * membuktikan apa pun.
 */
function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // Tidak ada .env.local — wajar di CI.
  }
  return env;
}

const env = loadEnv();
export const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
export const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasCredentials = Boolean(SUPABASE_URL && ANON_KEY);

const headers = () => ({
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  'Content-Type': 'application/json',
});

/** Baca tabel lewat PostgREST sebagai anon. */
export async function selectAs(table, query = 'select=*') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers: headers() });
  return { status: res.status, body: await res.json().catch(() => null) };
}

/** Panggil sebuah RPC sebagai anon. */
export async function rpc(name, args = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(args),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

/** Sisipkan baris sebagai anon (dipakai untuk membuktikan bahwa ia DITOLAK). */
export async function insertAs(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
  return { status: res.status, body: await res.text().catch(() => '') };
}

/** Unggah berkas ke Storage sebagai anon. */
export async function uploadAs(bucket, path, body, contentType = 'image/jpeg') {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': contentType },
    body,
  });
  return { status: res.status, body: await res.text().catch(() => '') };
}

/** Ambil berkas lewat URL publik bucket. */
export async function fetchPublicObject(bucket, path) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`);
  return { status: res.status };
}

/** Minta daftar isi sebuah bucket sebagai anon. */
export async function listBucketAs(bucket) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prefix: '', limit: 100 }),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}
