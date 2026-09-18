'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackView } from '@/lib/trackView';

/**
 * Drop this once in RootLayout — it auto-tracks every page visit.
 * Runs on client only, silently. Never blocks rendering.
 */
export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return;
    trackView(pathname);
  }, [pathname]);

  return null; // renders nothing
}