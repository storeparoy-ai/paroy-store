import { Zap } from 'lucide-react';

export default function HomeHero() {
  return (
    <div className="col-span-2 md-col-span-4 relative z-[1]">
      <div
        className="glass-heavy relative overflow-hidden"
        style={{ minHeight: '150px' }}
      >
        {/* Glow effects */}
        <div
          aria-hidden
          className="absolute -left-10 -top-10 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'rgba(245,158,11,0.12)',  }}
        />
        <div
          aria-hidden
          className="absolute right-1/3 bottom-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: 'rgba(214,95,243,0.08)',  }}
        />

        <div
          className="flex flex-col justify-center h-full relative z-10"
          style={{ padding: '20px 24px 20px 20px', paddingRight: '140px' }}
        >
          {/* Pill badge */}
          <div
            className="inline-flex items-center gap-1.5 mb-2.5 w-fit animate-float"
            style={{
              padding: '4px 10px',
              borderRadius: '99px',
              border: '1px solid rgba(245,158,11,0.22)',
              background: 'rgba(245,158,11,0.08)',
              color: 'var(--primary-400)',
              fontSize: '10px',
              fontWeight: 700,
            }}
          >
            <Zap className="w-3 h-3" aria-hidden />
            PAROY STORE
          </div>

          <h1
            className="font-bold font-heading leading-tight"
            style={{ fontSize: 'clamp(1.25rem, 4vw, 1.875rem)', color: 'var(--text-primary)' }}
          >
            Jual, Beli &{' '}
            <span style={{ color: 'var(--primary-400)' }}>Rental</span>
            <br />
            Akun Game Premium
          </h1>

          <p
            className="mt-1.5 text-xs sm:text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Platform gaming terpercaya nomor 1
          </p>
        </div>

        {/* Mascot / decorative right */}
        <div
          className="absolute bottom-0 right-3 md:right-6 pointer-events-none select-none"
          style={{ width: 'clamp(110px, 20vw, 175px)', height: 'clamp(200px, 38vw, 295px)' }}
          aria-hidden
        >
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-1/2 rounded-full"
            style={{ background: 'rgba(245,158,11,0.2)',  }}
          />
          {/* Stylized controller icon as mascot placeholder */}
          <div
            className="absolute inset-0 flex items-end justify-center pb-4"
            style={{ fontSize: 'clamp(80px, 18vw, 130px)' }}
          >
            🎮
          </div>
        </div>
      </div>
    </div>
  );
}
