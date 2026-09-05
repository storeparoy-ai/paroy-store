/**
 * Notifikasi pesanan masuk lewat Telegram.
 *
 * Modul server-only — jangan diimpor dari komponen klien: TELEGRAM_BOT_TOKEN
 * tidak berawalan NEXT_PUBLIC_ justru supaya tidak pernah ikut ke browser.
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
 *   2. Diam kalau belum dikonfigurasi. Tanpa env var, fungsi ini no-op, jadi
 *      dev lokal dan preview deployment tidak berisik dan tidak gagal.
 */

const TELEGRAM_API = 'https://api.telegram.org';
const SEND_TIMEOUT_MS = 6000;

export type OrderKind = 'buy' | 'rental' | 'topup' | 'rekber';

const KIND_LABEL: Record<OrderKind, string> = {
  buy: '🛒 Pembelian Akun',
  rental: '⏱️ Sewa Akun',
  topup: '⚡ Top Up',
  rekber: '🛡️ Rekber',
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

async function send(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return; // belum dikonfigurasi — sengaja diam

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      // Tanpa timeout, API Telegram yang menggantung akan menahan fungsi
      // serverless tetap hidup sampai batas maksimum — dibayar per detik.
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });

    if (!res.ok) {
      // Badan respons Telegram menjelaskan penyebabnya (chat id salah, bot
      // diblokir, HTML tidak valid) — tanpa ini kegagalannya tak terlacak.
      console.error('[notify] Telegram menolak:', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[notify] gagal mengirim:', err);
  }
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

  await send(lines.join('\n'));
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

  await send(lines.join('\n'));
}
