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

const PROOF_BUCKET = 'payment-proofs';
const PROOF_MAX_BYTES = 5 * 1024 * 1024; // 5MB — sama dengan batas bucket
const PROOF_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

/**
 * Unggah bukti transfer milik pembeli tamu, langsung dari browser ke bucket
 * privat `payment-proofs` (migrasi 14).
 *
 * Langsung dari browser, bukan lewat Server Action, karena batas ukuran body
 * Server Action (~1MB) lebih kecil daripada foto kamera HP pada umumnya.
 * Aman karena kebijakan RLS bucket-nya hanya menerima berkas yang masuk ke
 * folder bernama persis sebuah nomor invoice yang ada DAN masih pending —
 * pemeriksaan di bawah ini cuma supaya pesan kesalahannya enak dibaca.
 *
 * Yang dikembalikan adalah PATH di dalam bucket, bukan URL. Bucket-nya privat
 * karena bukti transfer memuat nama dan nomor rekening orang; hanya halaman
 * admin yang boleh membacanya, lewat signed URL berumur pendek.
 */
export async function uploadPaymentProof(
  file: File,
  orderNumber: string
): Promise<{ path: string } | { error: string }> {
  if (!PROOF_MIME.includes(file.type)) {
    return { error: 'Format harus JPG, PNG, WEBP, HEIC, atau PDF.' };
  }
  if (file.size > PROOF_MAX_BYTES) {
    return { error: 'Ukuran berkas maksimal 5MB.' };
  }

  try {
    const supabase = createClient();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    // Nama acak + upsert:false: berkas yang sudah masuk tidak bisa ditimpa,
    // jadi tidak ada cara menghapus jejak bukti yang terlanjur dikirim.
    const path = `${orderNumber}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(PROOF_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) {
      console.error('[uploadPaymentProof] gagal:', uploadError);
      return {
        error:
          'Bukti tidak bisa diunggah — biasanya karena nomor invoice keliru atau pesanannya sudah diverifikasi admin.',
      };
    }

    return { path };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Upload gagal, coba lagi.' };
  }
}
