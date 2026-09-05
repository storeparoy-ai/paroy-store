import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  hasCredentials,
  selectAs,
  rpc,
  insertAs,
  uploadAs,
  fetchPublicObject,
  listBucketAs,
} from './helpers.mjs';

/**
 * Tes regresi keamanan — dijalankan dari posisi penyerang.
 *
 * Setiap pemeriksaan di sini pernah dilakukan dengan tangan, satu per satu,
 * lewat curl: sesudah migrasi 10, 11, 12, 13, 14, 15, 16, dan 17. Delapan kali
 * pekerjaan yang sama. Berkas ini membekukannya jadi sesuatu yang bisa
 * dijalankan ulang kapan pun ada perubahan.
 *
 * Yang diuji bukan kode aplikasi, melainkan DATABASE-nya: kebijakan RLS,
 * tanda tangan RPC, dan kebijakan Storage. Itu disengaja. Kunci anon ada di
 * dalam browser setiap pengunjung, jadi siapa pun bisa memanggil Supabase
 * langsung tanpa melewati situs — pemeriksaan di sisi aplikasi tidak berarti
 * apa-apa terhadap penyerang seperti itu. Batas keamanan yang sebenarnya ada
 * di Postgres, dan itu yang diperiksa di sini.
 *
 * Semuanya membaca, atau menulis sesuatu yang memang HARUS ditolak. Satu-
 * satunya tulisan yang berhasil adalah baris pembatas laju bertanda "uji",
 * yang terhapus sendiri dalam sehari.
 *
 * Jalankan: npm test
 */

const skip = !hasCredentials;

before(() => {
  if (skip) {
    console.warn(
      '\n  ! NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan.' +
        '\n    Tes keamanan dilewati — isi .env.local atau pasang variabelnya.\n'
    );
  }
});

/** Kosong berarti RLS menolak: PostgREST membalas 200 dengan array kosong
 * untuk baris yang tidak lolos kebijakan, bukan 403. */
function assertTidakTerbaca(hasil, nama) {
  assert.equal(hasil.status, 200, `${nama}: status tak terduga ${hasil.status}`);
  assert.deepEqual(hasil.body, [], `${nama} BOCOR — anon berhasil membaca ${JSON.stringify(hasil.body).slice(0, 200)}`);
}

describe('Data pribadi tidak terbaca publik', { skip }, () => {
  test('profiles tidak bisa dipanen (SEC-03)', async () => {
    // Dulu SELECT-nya `USING (true)`: nama lengkap dan nomor WhatsApp setiap
    // pengguna bisa diunduh siapa saja yang punya kunci anon.
    assertTidakTerbaca(await selectAs('profiles', 'select=id,full_name,whatsapp'), 'profiles');
  });

  test('public_profiles boleh dibaca, tapi tidak memuat nomor WhatsApp', async () => {
    const { status } = await selectAs('public_profiles', 'select=id,full_name&limit=1');
    assert.equal(status, 200, 'public_profiles harusnya bisa dibaca — leaderboard & komunitas memakainya');

    // Diperiksa dengan MEMINTA kolom terlarang, bukan dengan menengok baris
    // yang terkirim. Kalau caranya menengok baris, tesnya lulus palsu selama
    // tabelnya masih kosong — persis keadaan toko ini sekarang.
    for (const kolom of ['whatsapp', 'role', 'email']) {
      const { body } = await selectAs('public_profiles', `select=${kolom}&limit=1`);
      assert.equal(
        body?.code,
        '42703',
        `public_profiles punya kolom "${kolom}" — view-nya harus tetap sempit. Balasan: ${JSON.stringify(body).slice(0, 160)}`
      );
    }
  });

  test('tabel pesanan tidak bisa dibaca langsung', async () => {
    assertTidakTerbaca(await selectAs('orders', 'select=buyer_name,buyer_whatsapp,amount'), 'orders');
    assertTidakTerbaca(await selectAs('topup_orders', 'select=buyer_whatsapp,amount'), 'topup_orders');
    assertTidakTerbaca(await selectAs('rekber_orders', 'select=buyer_name,buyer_whatsapp'), 'rekber_orders');
  });

  test('tabel berisi rahasia hanya untuk admin', async () => {
    // Token bot Telegram, private key Tripay, dan catatan pembatas laju.
    assertTidakTerbaca(await selectAs('notification_settings'), 'notification_settings');
    assertTidakTerbaca(await selectAs('payment_gateway_settings'), 'payment_gateway_settings');
    assertTidakTerbaca(await selectAs('guest_rate_limit'), 'guest_rate_limit');
  });
});

describe('Harga selalu dari database, bukan dari browser (SEC-02)', { skip }, () => {
  test('tanda tangan lama create_guest_order yang menerima nominal sudah hilang', async () => {
    // Postgres membedakan fungsi per tanda tangan: CREATE OR REPLACE saja
    // akan meninggalkan versi lama tetap bisa dipanggil. Migrasi 10 men-DROP
    // eksplisit — tes ini yang menjaga agar itu tidak pernah kembali.
    const { body } = await rpc('create_guest_order', {
      p_buyer_name: 'uji',
      p_buyer_whatsapp: '08123456789',
      p_product_id: '00000000-0000-0000-0000-000000000000',
      p_amount: 1000,
      p_payment_method: 'bca',
      p_mode: 'buy',
    });
    assert.equal(
      body?.code,
      'PGRST202',
      `Fungsi lama yang menerima p_amount MASIH ADA — harga bisa ditentukan pembeli. Balasan: ${JSON.stringify(body).slice(0, 200)}`
    );
  });

  test('tanda tangan lama create_guest_topup yang menerima nominal sudah hilang', async () => {
    const { body } = await rpc('create_guest_topup', {
      p_game: 'mlbb',
      p_game_user_id: '123',
      p_item_label: '86 Diamond',
      p_amount: 1000,
      p_payment_method: 'bca',
      p_buyer_whatsapp: '08123456789',
    });
    assert.equal(body?.code, 'PGRST202', `Fungsi top up lama masih ada: ${JSON.stringify(body).slice(0, 200)}`);
  });

  test('memesan produk yang tidak ada ditolak', async () => {
    const { body } = await rpc('create_guest_order', {
      p_buyer_name: 'uji',
      p_buyer_whatsapp: '08123456789',
      p_product_id: '00000000-0000-0000-0000-000000000000',
      p_payment_method: 'bca',
      p_mode: 'buy',
      p_note: null,
      p_rental_unit: null,
      p_rental_qty: null,
    });
    assert.ok(body?.message, `Harusnya ditolak, malah: ${JSON.stringify(body).slice(0, 200)}`);
    assert.match(body.message, /tidak ditemukan|tidak tersedia/i);
  });

  test('rekber tanpa produk ditolak', async () => {
    const { body } = await rpc('create_guest_rekber', {
      p_buyer_name: 'uji',
      p_buyer_whatsapp: '08123456789',
      p_product_id: null,
      p_item_description: 'akun apa saja',
    });
    assert.ok(body?.message, `Harusnya ditolak, malah: ${JSON.stringify(body).slice(0, 200)}`);
    assert.match(body.message, /harus menyertakan produk/i);
  });
});

describe('Nomor invoice tidak bisa ditebak', { skip }, () => {
  test('formatnya 6 karakter heksadesimal, bukan 4 digit', async () => {
    // Format lama PS-YYYYMMDD-9999 cuma punya 10.000 kemungkinan per hari:
    // dua pesanan bisa bertabrakan di kolom UNIQUE (pesanan kedua GAGAL), dan
    // seluruh ruang nomor bisa ditebak habis — berbahaya sejak nomor invoice
    // jadi kunci "boleh melampirkan bukti transfer ke pesanan ini".
    const terlihat = new Set();
    for (let i = 0; i < 3; i++) {
      const { body } = await rpc('generate_order_number', { prefix: 'PS' });
      assert.match(
        String(body),
        /^PS-\d{8}-[0-9A-F]{6}$/,
        `Format nomor invoice mundur ke versi yang mudah ditebak: ${body}`
      );
      terlihat.add(body);
    }
    assert.equal(terlihat.size, 3, 'Tiga nomor berturut-turut tidak boleh sama');
  });
});

describe('Bukti transfer (OPS-03)', { skip }, () => {
  test('melampirkan bukti ke invoice karangan ditolak', async () => {
    const { body } = await rpc('attach_payment_proof', {
      p_order_number: 'PS-19700101-ZZZZZZ',
      p_path: 'PS-19700101-ZZZZZZ/palsu.jpg',
    });
    assert.equal(body, false, `Bukti berhasil ditempel ke pesanan yang tidak ada: ${JSON.stringify(body)}`);
  });

  test('path di luar folder invoice sendiri ditolak', async () => {
    // Tanpa pemeriksaan ini, seseorang bisa menunjuk lampiran pesanan orang
    // lain ke berkas miliknya.
    const { body } = await rpc('attach_payment_proof', {
      p_order_number: 'PS-19700101-AAAAAA',
      p_path: 'PS-19700101-BBBBBB/curang.jpg',
    });
    assert.equal(body, false, 'Path milik invoice lain diterima');
  });

  test('mengunggah ke folder invoice karangan ditolak Storage', async () => {
    const { status, body } = await uploadAs(
      'payment-proofs',
      'PS-19700101-ZZZZZZ/uji.jpg',
      'bukan-gambar-sungguhan'
    );
    assert.ok(
      status === 400 || status === 403,
      `Unggahan ke folder invoice yang tidak ada DITERIMA (status ${status}): ${body.slice(0, 200)}`
    );
  });

  test('bucket bukti transfer tidak publik', async () => {
    // Bukti transfer memuat nama dan nomor rekening orang.
    const { status } = await fetchPublicObject('payment-proofs', 'apa-saja.jpg');
    assert.notEqual(status, 200, 'Berkas bucket payment-proofs bisa diambil lewat URL publik');
  });

  test('daftar isi bucket tidak bisa dibaca anon', async () => {
    // Nama berkas di dalamnya adalah nomor invoice orang lain — daftarnya
    // saja sudah kebocoran, bahkan sebelum berkasnya bisa dibuka.
    const { body } = await listBucketAs('payment-proofs');
    assert.deepEqual(body, [], `Isi bucket bukti transfer bisa didaftar: ${JSON.stringify(body).slice(0, 200)}`);
  });
});

describe('Komunitas', { skip }, () => {
  test('anon tidak bisa menulis komentar', async () => {
    const { status } = await insertAs('community_comments', {
      post_id: '00000000-0000-0000-0000-000000000000',
      author_id: '00000000-0000-0000-0000-000000000000',
      content: 'spam',
    });
    assert.ok(status >= 400, `Komentar anonim BERHASIL masuk (status ${status})`);
  });

  test('anon tidak bisa menulis postingan', async () => {
    const { status } = await insertAs('community_posts', {
      author_id: '00000000-0000-0000-0000-000000000000',
      content: 'spam',
    });
    assert.ok(status >= 400, `Postingan anonim BERHASIL masuk (status ${status})`);
  });
});

describe('Pembatas laju (OPS-05)', { skip }, () => {
  test('kuota dihormati dalam jendela waktunya', async () => {
    // Kunci unik per jalannya tes supaya tidak mengganggu jalan berikutnya.
    // Barisnya terhapus sendiri dalam sehari (lihat migrasi 16).
    const kunci = `uji-otomatis-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const args = { p_key: kunci, p_action: 'selftest', p_limit: 2, p_window_seconds: 600 };
    assert.equal((await rpc('rate_limit_ok', args)).body, true, 'percobaan ke-1 harusnya lolos');
    assert.equal((await rpc('rate_limit_ok', args)).body, true, 'percobaan ke-2 harusnya lolos');
    assert.equal((await rpc('rate_limit_ok', args)).body, false, 'percobaan ke-3 harusnya DITOLAK');
  });

  test('kunci terlalu pendek ditolak', async () => {
    const { body } = await rpc('rate_limit_ok', {
      p_key: 'x',
      p_action: 'selftest',
      p_limit: 5,
      p_window_seconds: 600,
    });
    assert.equal(body, false, 'Kunci sependek satu huruf diterima — pembatasnya bisa diakali');
  });
});

describe('Umpan aktivitas beranda', { skip }, () => {
  test('bentuk kembaliannya sempit — hanya empat kolom', async () => {
    // Sama seperti public_profiles: diperiksa lewat permintaan kolom, supaya
    // tidak lulus palsu selama belum ada satu pun transaksi selesai.
    const { body: ok } = await selectAs('rpc/get_recent_activity', 'select=actor,action,item_label,created_at');
    assert.ok(!ok?.code || ok.code !== '42703', `Kolom yang seharusnya ada malah tidak: ${JSON.stringify(ok).slice(0, 160)}`);

    for (const kolom of ['buyer_name', 'buyer_whatsapp', 'status', 'amount']) {
      const { body } = await selectAs('rpc/get_recent_activity', `select=${kolom}`);
      assert.equal(
        body?.code,
        '42703',
        `Umpan aktivitas memuat kolom "${kolom}" — itu data yang tidak boleh keluar. Balasan: ${JSON.stringify(body).slice(0, 160)}`
      );
    }
  });

  test('tidak pernah memuat nama lengkap atau pesanan yang belum dibayar', async () => {
    const { status, body } = await rpc('get_recent_activity', { p_limit: 8 });
    assert.equal(status, 200, `get_recent_activity gagal: ${JSON.stringify(body).slice(0, 200)}`);
    assert.ok(Array.isArray(body), 'harusnya mengembalikan array');
    for (const baris of body) {
      assert.ok(
        !('buyer_name' in baris) && !('buyer_whatsapp' in baris) && !('status' in baris),
        `Umpan aktivitas membocorkan kolom: ${Object.keys(baris).join(', ')}`
      );
      if (baris.actor) {
        // "Rizky A." atau "Rizky" — tidak pernah dua kata utuh.
        assert.match(
          baris.actor,
          /^[^\s]+(\s[A-Za-z]\.)?$/u,
          `Nama tidak disamarkan: ${baris.actor}`
        );
      }
    }
  });
});

describe('Pelacakan pesanan publik', { skip }, () => {
  test('get_order_status ada dan tidak membocorkan data pembeli', async () => {
    const { status, body } = await rpc('get_order_status', { p_order_number: 'PS-19700101-ZZZZZZ' });
    assert.equal(status, 200, `get_order_status gagal — Cek Transaksi ikut mati: ${JSON.stringify(body).slice(0, 200)}`);
    assert.deepEqual(body, [], 'invoice karangan harusnya tidak menghasilkan apa-apa');
  });
});
