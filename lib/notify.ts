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
import { absoluteUrl } from '@/lib/site';
import {
  DEFAULT_TEMPLATES,
  contohNilai,
  escapeHtml as esc,
  formatRupiah,
  renderTemplate,
  whatsappLink,
} from '@/lib/notify-template';

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
  templateNewOrder: string;
  templateProofUpload: string;
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
      .select('bot_token, chat_id, is_enabled, notify_new_order, notify_proof_upload, template_new_order, template_proof_upload')
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
        // Kolom kosong berarti 'pakai bawaan'. Mengirim template kosong akan
        // ditolak Telegram dan notifikasinya hilang tanpa jejak — justru saat
        // pemilik paling tidak menyangka.
        templateNewOrder: data.template_new_order?.trim() || DEFAULT_TEMPLATES.newOrder,
        templateProofUpload: data.template_proof_upload?.trim() || DEFAULT_TEMPLATES.proofUpload,
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

  return {
    botToken,
    chatId,
    isEnabled: true,
    notifyNewOrder: true,
    notifyProofUpload: true,
    templateNewOrder: DEFAULT_TEMPLATES.newOrder,
    templateProofUpload: DEFAULT_TEMPLATES.proofUpload,
  };
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

/** Jam Indonesia, untuk penanda {waktu}. Server Vercel berjalan di UTC, jadi
 * tanpa timeZone eksplisit notifikasinya akan menyebut jam yang tidak cocok
 * dengan jam di HP pemilik toko. */
function jamWib(): string {
  return (
    new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(new Date()) + ' WIB'
  );
}

/** Bungkus pengiriman otomatis: cari kredensial, hormati sakelar on/off, dan
 * jangan pernah melempar apa pun ke pemanggil. */
async function dispatch(
  channel: 'newOrder' | 'proofUpload',
  susun: (settings: NotificationSettings) => string
): Promise<void> {
  const settings = await resolveSettings();
  if (!settings || !settings.isEnabled) return;
  if (channel === 'newOrder' && !settings.notifyNewOrder) return;
  if (channel === 'proofUpload' && !settings.notifyProofUpload) return;

  const text = susun(settings);
  if (!text.trim()) return;

  await sendTelegramMessage({ botToken: settings.botToken, chatId: settings.chatId }, text);
}

/**
 * Pesanan baru masuk. Dipanggil dari dalam `after()` supaya pembeli tidak
 * menunggu jaringan Telegram sebelum melihat nomor invoice-nya.
 *
 * Susunan pesannya datang dari template yang bisa disunting pemilik di
 * Admin -> Notifikasi. Yang TIDAK ikut disunting adalah nilai-nilainya: nama
 * pembeli dan catatan itu input bebas dari pengunjung, jadi di-escape dulu
 * sebelum masuk ke template ber-parse_mode HTML.
 */
export async function notifyNewOrder(order: OrderNotification): Promise<void> {
  await dispatch('newOrder', (settings) =>
    renderTemplate(settings.templateNewOrder, {
      jenis: KIND_LABEL[order.kind],
      invoice: esc(order.orderNumber),
      item: esc(order.itemLabel),
      nominal: formatRupiah(order.amount),
      pembeli: order.buyerName ? esc(order.buyerName) : '',
      whatsapp: order.buyerWhatsapp ? whatsappLink(order.buyerWhatsapp) : '',
      metode: order.paymentMethod ? esc(order.paymentMethod) : '',
      catatan: order.note ? esc(order.note) : '',
      link: absoluteUrl('/admin/pesanan'),
      waktu: jamWib(),
    })
  );
}

/** Bukti transfer diunggah — ini momen admin benar-benar perlu bertindak,
 * jadi ia dapat notifikasi sendiri, bukan cuma numpang di pesan pesanan. */
export async function notifyProofUploaded(orderNumber: string): Promise<void> {
  await dispatch('proofUpload', (settings) =>
    renderTemplate(settings.templateProofUpload, {
      invoice: esc(orderNumber),
      link: absoluteUrl('/admin/pesanan'),
      waktu: jamWib(),
    })
  );
}

/**
 * Pesan uji dari dashboard.
 *
 * Merender TEMPLATE YANG SEDANG DISUNTING dengan data contoh, bukan kalimat
 * generik. Itu bedanya antara tes yang berguna dan tes yang menipu: satu tag
 * <b> yang tidak ditutup membuat Telegram menolak SELURUH pesan, dan tanpa
 * tes yang memakai template sungguhan kesalahan itu baru ketahuan saat ada
 * pesanan asli yang notifikasinya tidak pernah datang.
 *
 * Kredensialnya dioper pemanggil, bukan dari resolveSettings(), supaya token
 * baru bisa diuji SEBELUM disimpan.
 */
export function buildTestMessage(template?: string): string {
  const isi = renderTemplate(
    template?.trim() || DEFAULT_TEMPLATES.newOrder,
    contohNilai(absoluteUrl('/admin/pesanan'))
  );

  return ['<b>🧪 Pesan uji — bukan pesanan sungguhan</b>', '', isi].join('\n');
}
