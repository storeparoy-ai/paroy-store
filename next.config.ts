import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // See DESIGN.md / AGENTS.md context: this app was forcing every single
  // route fully dynamic (no caching at all) purely because the root layout
  // reads the session cookie for the Header's login state. Cache Components
  // lets that one dynamic sliver stream in via <Suspense> while the rest of
  // each page is prerendered/cached — the fix for "every click re-queries
  // the database from scratch" reported 2026-08-29.
  cacheComponents: true,
  images: {
    // Next 16 only allows quality 75 unless listed here. 85 is used for
    // product photos (ProductGallery): screenshots full of small in-game text
    // soften visibly at 75.
    qualities: [75, 85],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'media.jbalwikobra.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
