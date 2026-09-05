'use client';

/**
 * Jaring terakhir: dipakai kalau yang gagal justru layout root itu sendiri —
 * saat error.tsx tidak sempat dirender karena kerangka halamannya belum ada.
 *
 * Berkas ini menggantikan seluruh dokumen, jadi ia wajib membawa <html> dan
 * <body> sendiri, dan tidak kebagian globals.css sama sekali. Karena itu
 * warnanya ditulis langsung di sini — bukan kemalasan, tapi satu-satunya cara
 * agar halaman ini tidak muncul sebagai teks hitam di atas putih polos yang
 * tampak seperti situs orang lain.
 *
 * Metadata juga tidak didukung di sini (komponen klien), jadi judulnya dipasang
 * lewat <title> ala React.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#0a0714',
          color: '#f1edff',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
          textAlign: 'center',
        }}
      >
        <title>Gangguan Sementara · Paroy Store</title>
        <div style={{ maxWidth: '380px' }}>
          <p
            style={{
              margin: '0 0 12px',
              fontSize: '13px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#00e5ff',
            }}
          >
            Paroy Store
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: '26px', fontWeight: 800 }}>
            Situs Sedang Bermasalah
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: '14px', lineHeight: 1.6, color: '#9089b8' }}>
            Kami tidak bisa memuat halaman ini. Kalau kamu baru menyelesaikan pesanan, pesananmu
            tetap tersimpan — jangan transfer dua kali.
          </p>
          <button
            onClick={() => retry()}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'linear-gradient(90deg, #ff2e9a, #be185d)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Coba Lagi
          </button>
          {error.digest && (
            <p style={{ marginTop: '20px', fontSize: '11px', color: '#6b6490' }}>
              Kode kesalahan: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
