# Product Requirements Document (PRD) — Paroy Store 2.0

> **Platform:** Marketplace Gaming All-in-One (Top Up Kilat, Jual Beli Akun, Rental Akun, Rekber Escrow)  
> **Target Style:** Dark Cyberpunk yang Disiplin (Steam-inspired, padat konten, grid & tipografi terukur)

---

## 1. Visi & Tujuan Produk
Paroy Store adalah platform transaksi gaming terpercaya, cepat, dan modern. Memfasilitasi:
1. **Top Up Game Otomatis 1 Detik:** Dukungan multi-game (MLBB, Free Fire, PUBG, Genshin, Valorant) dengan pembayaran QRIS, e-wallet, bank transfer, dan retail.
2. **Jual Beli Akun Sultan & Terverifikasi:** Katalog akun dengan spesifikasi jelas, anti-hackback warranty, dan sistem filter dinamis.
3. **Rental / Sewa Akun Game:** Sewa akun per jam / harian untuk pemain yang ingin mencoba skin & rank tinggi dengan harga terjangkau.
4. **Rekber (Escrow) Otomatis:** Penengah transaksi pihak ketiga yang aman dan transparan, menahan dana hingga kedua belah pihak menyelesaikan serah terima akun.

---

## 2. Alur Pengguna & Fitur Inti (Tahap 2 Scope)

### 2.1. Homepage
* **Hero Promo:** Banner promo flash deals & CTA utama.
* **Flash Sale Carousel:** Listing produk diskon dengan countdown timer urgensi (`#F97316`).
* **Game Quick Select / Kategori Dinamis:** Grid game yang dapat ditambah/diupdate dinamis tanpa modifikasi kode.
* **Trust Signal Strip:** Jaminan 100% anti hackback, garansi uang kembali, rating 4.9/5 (`#34D399`).
* **Live Activity Ticker:** Riwayat transaksi sukses real-time untuk membangun *social proof*.

### 2.2. Top Up Kilat
* Input User ID & Zone/Server ID dengan validasi otomatis.
* Pilihan nominal diamond/koin/voucher terstruktur.
* Pilihan metode pembayaran lengkap (QRIS, BCA/Mandiri/BRI/BNI, GoPay/DANA/OVO/ShopeePay, Alfamart/Indomaret).
* Pengiriman otomatis 1 detik.

### 2.3. Katalog Jual Beli Akun
* Filter berdasarkan Game, Rentang Harga, Tipe Akun, dan Status Penjual.
* Full-width responsive grid dengan slot penyeimbang jika produk sedikit.
* Kartu produk informatif dengan badge game, spec chip (wr, hero, skin), harga, dan tombol CTA.

### 2.4. Rental Akun
* Sistem durasi sewa fleksibel (per jam, harian, mingguan).
* Instruksi login aman dan panduan anti-hackback.

### 2.5. Detail Produk & Checkout
* Galeri screenshot HD, spesifikasi lengkap, informasi seller, rating & ulasan.
* Tombol CTA Beli Langsung / Ajukan Rekber.
* Halaman ringkasan checkout dengan countdown pembayaran 15 menit, invoice ID, dan instruksi bayar.

### 2.6. Cek Transaksi
* Lacak status pesanan publik via Invoice / Order ID tanpa harus login.

### 2.7. Alur Rekber Escrow
* Formulir pengajuan rekber dengan kalkulator biaya jasa otomatis transparan.
* Pelacakan status transaksi step-by-step (Pengajuan &rarr; Pembayaran &rarr; Pengecekan Akun &rarr; Serah Terima &rarr; Selesai).

### 2.8. Leaderboard, Komunitas, & Profil User
* Peringkat Top Spender (Harian, Mingguan, Bulanan).
* Forum diskusi komunitas gamer & link WhatsApp/Discord resmi.
* Dashboard user (riwayat pesanan, wishlist, pengaturan akun).

---

## 3. Dashboard Admin (Tahap 3 Scope)
* **Flash Sale Manager:** CRUD produk flash sale, diskon & timer.
* **Payment Method Settings:** Toggle metode bayar aktif/nonaktif.
* **User Access Management:** Manajemen role & status akun pengguna.
* **Rekber Settings:** Konfigurasi tarif jasa per tier nominal transaksi.
* **Top Up Provider Settings:** Konfigurasi produk & denom top up per game.
* **Kategori Game:** Tambah/kelola game & kategori secara dinamis.
