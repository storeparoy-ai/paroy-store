/**
 * Template pesan notifikasi — bagian yang bisa diubah pemilik dari dashboard.
 *
 * Modul murni: tidak menyentuh database, jaringan, maupun `next/headers`.
 * Itu disengaja supaya berkas yang sama dipakai DUA tempat — server saat
 * benar-benar mengirim, dan komponen klien saat menampilkan pratinjau. Kalau
 * dua tempat itu memakai kode berbeda, pratinjaunya cepat atau lambat akan
 * berbohong.
 */

export const TEMPLATE_KEYS = ['newOrder', 'proofUpload'] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

/** Nilai yang bisa disisipkan, beserta penjelasan untuk daftar di dashboard. */
export const PLACEHOLDERS: Record<TemplateKey, { key: string; hint: string }[]> = {
  newOrder: [
    { key: '{jenis}', hint: 'Top Up / Pembelian Akun / Sewa Akun / Rekber' },
    { key: '{invoice}', hint: 'Nomor invoice, mis. TU-20260906-3F1B08' },
    { key: '{item}', hint: 'Barang yang dipesan' },
    { key: '{nominal}', hint: 'Rp20.000' },
    { key: '{pembeli}', hint: 'Nama pembeli' },
    { key: '{whatsapp}', hint: 'Nomor WhatsApp, otomatis jadi tautan wa.me' },
    { key: '{metode}', hint: 'Metode pembayaran yang dipilih' },
    { key: '{catatan}', hint: 'Catatan tambahan, mis. ID game' },
    { key: '{link}', hint: 'Tautan ke halaman Pesanan' },
    { key: '{waktu}', hint: 'Jam pesanan masuk (WIB)' },
  ],
  proofUpload: [
    { key: '{invoice}', hint: 'Nomor invoice' },
    { key: '{link}', hint: 'Tautan ke halaman Pesanan' },
    { key: '{waktu}', hint: 'Jam bukti diunggah (WIB)' },
  ],
};

export const DEFAULT_TEMPLATES: Record<TemplateKey, string> = {
  newOrder: [
    '<b>{jenis}</b>',
    '',
    'Invoice  : <code>{invoice}</code>',
    'Item     : {item}',
    'Nominal  : <b>{nominal}</b>',
    'Pembeli  : {pembeli}',
    'WhatsApp : {whatsapp}',
    'Bayar    : {metode}',
    'Catatan  : {catatan}',
    '',
    '⏳ Menunggu bukti transfer dari pembeli.',
    '{link}',
  ].join('\n'),

  proofUpload: [
    '<b>💸 Bukti transfer masuk</b>',
    '',
    'Invoice : <code>{invoice}</code>',
    'Jam     : {waktu}',
    '',
    'Cek buktinya lalu ubah status pesanan.',
    '{link}',
  ].join('\n'),
};

/**
 * Telegram menolak SELURUH pesan kalau ada `<`, `>`, atau `&` yang tidak
 * di-escape saat parse_mode HTML. Nama pembeli itu input bebas — seorang
 * "Andi & Rekan" sudah cukup untuk membuat notifikasi hilang tanpa jejak.
 *
 * Yang di-escape hanya NILAI-nya, bukan templatenya: template ditulis pemilik
 * toko sendiri, dan justru gunanya supaya ia bisa memakai <b> dan <code>.
 */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function formatRupiah(amount: number): string {
  return `Rp${new Intl.NumberFormat('id-ID').format(Math.round(amount))}`;
}

/** Nomor Indonesia jadi tautan wa.me yang bisa langsung diklik dari Telegram. */
export function whatsappLink(nomor: string): string {
  const digits = nomor.replace(/\D/g, '').replace(/^0/, '62');
  return `<a href="https://wa.me/${digits}">${escapeHtml(nomor)}</a>`;
}

/**
 * Isi template dengan nilai sungguhan.
 *
 * Satu aturan yang perlu diketahui pemilik, dan ditulis juga di dashboard:
 * BARIS YANG NILAINYA KOSONG DIBUANG SELURUHNYA. Tanpa itu, pesanan top up
 * (yang memang tidak menyimpan nama pembeli) akan mengirim baris
 * "Pembeli  : " menggantung setiap kali. Baris yang tidak mengandung
 * placeholder sama sekali — judul, garis pemisah, kalimat penutup — tidak
 * pernah ikut terbuang.
 */
export function renderTemplate(template: string, values: Record<string, string | null | undefined>): string {
  const baris = template.split('\n');
  const hasil: string[] = [];

  for (const line of baris) {
    const dipakai = line.match(/\{[a-z]+\}/gi) ?? [];

    if (dipakai.length > 0) {
      const semuaKosong = dipakai.every((p) => {
        const v = values[p.slice(1, -1)];
        return v === null || v === undefined || v === '';
      });
      if (semuaKosong) continue;
    }

    hasil.push(line.replace(/\{([a-z]+)\}/gi, (cocok, nama) => values[nama] ?? cocok));
  }

  return hasil.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Contoh data untuk pratinjau di dashboard dan untuk tombol "Kirim Tes".
 * Sengaja memakai angka dan nama yang jelas-jelas karangan. */
export function contohNilai(link: string): Record<string, string> {
  return {
    jenis: '⚡ Top Up',
    invoice: 'TU-20260906-A1B2C3',
    item: 'Mobile Legends — 86 💎 Diamond',
    nominal: formatRupiah(20000),
    pembeli: 'Budi (contoh)',
    whatsapp: whatsappLink('081234567890'),
    metode: 'Transfer BRI',
    catatan: 'ID game: 123456789 (8888)',
    link,
    waktu: '20:46 WIB',
  };
}
