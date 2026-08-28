import { createClient } from '@/utils/supabase/client';

const BUCKET = 'public-assets';
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

/**
 * Uploads an image straight from the admin's browser to Supabase Storage
 * (bucket `public-assets`, public-read / admin-write per migration
 * 00000000000005) and returns its public URL. Runs client-side only — no
 * server involved, so it needs the caller's own authenticated admin
 * session (enforced by the bucket's RLS policies, not this function).
 */
export async function uploadPublicImage(
  file: File,
  folder: string
): Promise<{ url: string } | { error: string }> {
  if (!file.type.startsWith('image/')) {
    return { error: 'File harus berupa gambar.' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { error: 'Ukuran gambar maksimal 4MB.' };
  }

  try {
    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) return { error: uploadError.message };

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Upload gagal, coba lagi.' };
  }
}
