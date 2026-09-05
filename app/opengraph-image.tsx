import { ImageResponse } from 'next/og';
import { getSiteSettings } from '@/lib/supabase/queries';

/**
 * Gambar pratinjau bawaan untuk setiap halaman yang tidak punya gambarnya
 * sendiri — halaman muka, katalog, top up, rekber, dan seterusnya.
 *
 * Tanpa berkas ini, menempelkan tautan Paroy Store ke grup WhatsApp cuma
 * memunculkan sebaris teks polos; halaman produk sudah punya foto akunnya
 * sendiri lewat generateMetadata, sisanya tidak punya apa-apa.
 *
 * Digambar dengan ImageResponse, bukan berkas PNG statis, supaya nama toko
 * mengikuti Pengaturan Situs — mengganti nama toko tidak menyisakan gambar
 * lama yang salah.
 *
 * Catatan teknis: ImageResponse hanya mengerti flexbox dan sebagian kecil CSS
 * (tidak ada grid), dan setiap elemen dengan lebih dari satu anak wajib punya
 * `display: flex` eksplisit.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Paroy Store — marketplace akun game, top up, sewa, dan rekber';

export default async function OpengraphImage() {
  const settings = await getSiteSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #06040d 0%, #14092b 55%, #06040d 100%)',
          color: '#f1edff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: 26,
            letterSpacing: '4px',
            color: '#00e5ff',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ width: '56px', height: '4px', background: '#00e5ff' }} />
          Marketplace Gaming
        </div>

        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            marginTop: '28px',
            letterSpacing: '-2px',
            lineHeight: 1.05,
          }}
        >
          {settings.siteName}
        </div>

        <div style={{ fontSize: 38, color: '#9089b8', marginTop: '18px' }}>{settings.tagline}</div>

        <div style={{ display: 'flex', gap: '14px', marginTop: '52px' }}>
          {['Jual Beli Akun', 'Top Up', 'Sewa Akun', 'Rekber'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '14px 26px',
                borderRadius: '999px',
                border: '2px solid rgba(0,229,255,0.35)',
                background: 'rgba(0,229,255,0.08)',
                fontSize: 28,
                color: '#f1edff',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 26, color: '#c6ff3d', marginTop: '46px' }}>
          Serah terima didampingi admin · Proteksi anti-hackback
        </div>
      </div>
    ),
    size
  );
}
