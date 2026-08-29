import Container from '@/components/ui/Container';

/**
 * Generic route-level loading fallback. Rendered automatically by Next.js
 * the instant a link to a still-dynamic (`ƒ`) route is clicked — see each
 * route's `loading.tsx` — so there's always immediate visual feedback
 * instead of a dead pause while the server does its work. Deliberately
 * generic (doesn't try to mirror each destination page's exact layout):
 * its only job is to prove the click registered.
 */
export default function PageSkeleton() {
  return (
    <Container className="py-8 sm:py-10 space-y-6">
      <div className="h-8 w-48 rounded-lg bg-bg-card border border-border-subtle animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-bg-card border border-border-subtle animate-pulse" />
        ))}
      </div>
    </Container>
  );
}
