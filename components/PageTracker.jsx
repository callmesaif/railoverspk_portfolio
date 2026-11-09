'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom/i;

/**
 * Drop this once in RootLayout — it auto-tracks every page visit.
 * - skips admin pages and known bots / speed-test tools (they aren't real visitors)
 * - waits until the browser is idle, and only then loads Firebase, so it never delays the page
 */
export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return undefined;
    if (navigator.webdriver || BOT_RE.test(navigator.userAgent)) return undefined;

    const run  = () => import('@/lib/trackView').then(m => m.trackView(pathname));
    const idle = typeof window.requestIdleCallback === 'function';
    const handle = idle ? window.requestIdleCallback(run, { timeout: 4000 }) : window.setTimeout(run, 2000);
    return () => { if (idle) window.cancelIdleCallback(handle); else window.clearTimeout(handle); };
  }, [pathname]);

  return null; // renders nothing
}
