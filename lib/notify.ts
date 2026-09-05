/**
 * Notifikasi pesanan masuk lewat Telegram.
 *
 * Modul server-only — jangan diimpor dari komponen klien: token bot itu
 * setara kata sandi, siapa pun yang memilikinya bisa mengirim pesan atas nama
 * bot dan membaca riwayat chat yang diikutinya.
 *
 * Latar: layar sukses checkout menjanjikan verifikasi "maks. 10 menit" ke
 * pembeli, tapi sampai sekarang tidak ada apa pun yang memberi tahu admin
 * bahwa sebuah pesanan masuk — janji itu cuma bisa ditepati kalau dashboard
 * dipelototi seharian. Telegram dipilih karena gratis, langsung berdering di
 * HP, dan tidak perlu mendaftar layanan berbayar seperti gateway WhatsApp.
 *
 * Dua aturan yang dipegang seluruh modul ini:
 *
 *   1. TIDAK PERNAH melempar error. Kegagalan mengirim notifikasi tidak boleh
 *      membuat pesanan yang sudah tersimpan tampak gagal di mata pembeli —
 *      itu justru mengubah masalah kecil (admin telat tahu) jadi masalah besar
 *      (pembeli mengira uangnya hangus dan memesan ulang).
 *   2. Diam kalau belum dikonfigurasi. Tanpa kredensial, fungsi ini no-op,
 *      jadi dev lokal dan preview deployment tidak berisik dan tidak gagal.
 */

import { createServiceRoleClient } from '@/utils/supabase/service';

const TELEGRAM_API = 'https://api.telegram.org';
const SEND_TIMEOUT_MS = 6000;

export type OrderKind = 'buy' | 'rental' | 'topup' | 'rekber';

const KIND_LABEL: Record<OrderKind, string> = {
  buy: '🛒 Pembelian Akun',
  rental: '⏱️ Sewa Akun',
  topup: '⚡ Top Up',
  rekber: '🛡️ Rekber',
};

export type TelegramCredentials = { botToken: string; chatId: string };

type NotificationSettings = TelegramCredentials & {
  isEnabled: boolean;
  notifyNewOrder: boolean;
  notifyProofUpload: boolean;
};

export type OrderNotification = {
  kind: OrderKind;
  orderNumber: string;
  itemLabel: string;
  amount: number;
  buyerName?: string | null;
  buyerWhatsapp?: string | null;
  paymentMethod?: string | null;
  note?: string | null;
};

/**
 * Ambil kredensial Telegram.
 *
 * Urutannya sengaja: tabel `notification_settings` dulu (bisa diubah admin
 * kapan saja tanpa deploy ulang), environment variable sebagai cadangan.
 *
 * Tabelnya hanya bisa dibaca admin — dan pesanan datang dari pembeli tamu
 * yang di mata Postgres adalah `anon` — jadi pembacaan di sini memakai
 * service role key. Alternatif "bikin fungsi SECURITY DEFINER yang
 * mengembalikan token ke anon" sudah dipertimbangkan dan dibuang: kunci anon
 * ada di dalam browser setiap pengunjung, jadi itu sama saja menempelkan
 * token bot di halaman muka situs.
 *
 * Kalau service role key belum diatur, jalur env var di bawah tetap bekerja,
 * jadi notifikasi tidak mati total hanya karena satu variabel belum diisi.
 */
async function resolveSettings(): Promise<NotificationSettings | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('notification_settings')
      .select('bot_token, chat_id, is_enabled, notify_new_order, notify_proof_upload')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    if (data?.bot_token && data?.chat_id) {
      return {
        botToken: data.bot_token,
        chatId: data.chat_id,
        isEnabled: data.is_enabled !== false,
        notifyNewOrder: data.notify_new_order !== false,
        notifyProofUpload: data.notify_proof_upload !== false,
      };
    }
  } catch (err) {
    // Belum ada service role key, atau migrasi 15 belum jalan. Bukan alasan
    // untuk gagal — turun ke env var, dan catat sekali supaya terlihat di log
    // kenapa notifikasinya diam.
    console.warn('[notify] tidak bisa membaca notification_settings, memakai env var:', err);
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return null;

  return { botToken, chatId, isEnabled: true, notifyNewOrder: true, notifyProofUpload: true };
}

/** Telegram menolak SELURUH pesan kalau ada `<`, `>`, atau `&` yang tidak
 * di-escape saat parse_mode HTML. Nama pembeli itu input bebas — seorang
 * "Andi & Rekan" sudah cukup untuk membuat notifikasi hilang tanpa jejak. */
function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatRupiah(amount: number): string {
  return `Rp${new Intl.NumberFormat('id-ID').format(Math.round(amount))}`;
}

/** URL situs untuk tautan langsung ke pesanan. Vercel menyediakan
 * VERCEL_PROJECT_PRODUCTION_URL sendiri (tanpa protokol), jadi tidak ada yang
 * perlu diatur manual kecuali kalau nanti pakai domain lain. */
function siteUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : null;
}

/**
 * Kirim satu pesan. Mengembalikan pesan kesalahan dari Telegram apa adanya
 * supaya tombol "Kirim Tes" di dashboard bisa menampilkannya — tanpa itu,
 * admin cuma tahu "gagal" tanpa tahu apakah token yang salah, chat ID yang
 * salah, atau bot-nya belum pernah diajak bicara.
 */
export async function sendTelegramMessage(
  creds: TelegramCredentials,
  text: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${creds.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: creds.chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      // Tanpa timeout, API Telegram yang menggantung akan menahan fungsi
      // serverless tetap hidup sampai batas maksimum — dibayar per detik.
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (res.ok) return { ok: true };

    const body = (await res.json().catch(() => null)) as { description?: string } | null;
    const error = body?.description ?? `Telegram menolak dengan kode ${res.status}.`;
    console.error('[notify] Telegram menolak:', res.status, error);
    return { ok: false, error };
  } catch (err) {
    const error =
      err instanceof Error && err.name === 'TimeoutError'
        ? 'Telegram tidak menjawab dalam 6 detik.'
        : err instanceof Error
          ? err.message
          : 'Gagal menghubungi Telegram.';
    console.error('[notify] gagal mengirim:', err);
    return { ok: false, error };
  }
}

/** Bungkus pengiriman otomatis: cari kredensial, hormati sakelar on/off, dan
 * jangan pernah melempar apa pun ke pemanggil. */
async function dispatch(text: string, channel: 'newOrder' | 'proofUpload'): Promise<void> {
  const settings = await resolveSettings();
  if (!settings || !settings.isEnabled) return;
  if (channel === 'newOrder' && !settings.notifyNewOrder) return;
  if (channel === 'proofUpload' && !settings.notifyProofUpload) return;

  await sendTelegramMessage({ botToken: settings.botToken, chatId: settings.chatId }, text);
}

/** Pesanan baru masuk. Dipanggil dari dalam `after()` supaya pembeli tidak
 * menunggu jaringan Telegram sebelum melihat nomor invoice-nya. */
export async function notifyNewOrder(order: OrderNotification): Promise<void> {
  const base = siteUrl();
  const lines = [
    `<b>${KIND_LABEL[order.kind]}</b>`,
    '',
    `Invoice  : <code>${esc(order.orderNumber)}</code>`,
    `Item     : ${esc(order.itemLabel)}`,
    `Nominal  : <b>${formatRupiah(order.amount)}</b>`,
  ];

  if (order.buyerName) lines.push(`Pembeli  : ${esc(order.buyerName)}`);
  if (order.buyerWhatsapp) {
    const digits = order.buyerWhatsapp.replace(/\D/g, '').replace(/^0/, '62');
    lines.push(`WhatsApp : <a href="https://wa.me/${digits}">${esc(order.buyerWhatsapp)}</a>`);
  }
  if (order.paymentMethod) lines.push(`Bayar    : ${esc(order.paymentMethod)}`);
  if (order.note) lines.push(`Catatan  : ${esc(order.note)}`);

  lines.push('', '⏳ Menunggu bukti transfer dari pembeli.');
  if (base) lines.push(`${base}/admin/pesanan`);

  await dispatch(lines.join('\n'), 'newOrder');
}

/** Bukti transfer diunggah — ini momen admin benar-benar perlu bertindak,
 * jadi ia dapat notifikasi sendiri, bukan cuma numpang di pesan pesanan. */
export async function notifyProofUploaded(orderNumber: string): Promise<void> {
  const base = siteUrl();
  const lines = [
    '<b>💸 Bukti transfer masuk</b>',
    '',
    `Invoice : <code>${esc(orderNumber)}</code>`,
    '',
    'Cek buktinya lalu ubah status pesanan.',
  ];
  if (base) lines.push(`${base}/admin/pesanan`);

  await dispatch(lines.join('\n'), 'proofUpload');
}

/** Pesan uji dari dashboard admin. Sengaja memakai kredensial yang dioper
 * pemanggil, bukan hasil resolveSettings(), supaya admin bisa menguji token
 * baru SEBELUM menyimpannya. */
export function buildTestMessage(): string {
  return [
    '<b>✅ Notifikasi Paroy Store aktif</b>',
    '',
    'Kalau pesan ini sampai, notifikasi pesanan sudah terhubung ke chat yang benar.',
  ].join('\n');
}
