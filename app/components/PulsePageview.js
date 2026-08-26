'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Fires Pulse.track('pageview') on App Router client navigations.
 * Skips the first mount — pulse.js already records the initial SSR pageview.
 */
function PulsePageviewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (typeof window !== 'undefined' && window.Pulse?.track) {
      window.Pulse.track('pageview');
    }
  }, [pathname, searchParams]);

  return null;
}

export default function PulsePageview() {
  return (
    <Suspense fallback={null}>
      <PulsePageviewInner />
    </Suspense>
  );
}
