'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { doc, getDoc, collection, getAggregateFromServer, sum } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PAGE_LABELS = {
  '/':            'Home',
  '/about':       'About',
  '/trains':      'Trains',
  '/reviews':     'Reviews',
  '/blogs':       'Blog',
  '/locomotives': 'Locomotives',
  '/contact':     'Contact',
};

function formatViews(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toLocaleString();
}

const TOTAL_KEY = 'rl_total_visits';
const TOTAL_TTL = 10 * 60 * 1000; // re-ask Firestore at most every 10 min per visitor

export default function PageViewsBadge() {
  const pathname = usePathname();
  const [pageViews,  setPageViews]  = useState(null);
  const [totalViews, setTotalViews] = useState(null);

  // This page's views — one read
  useEffect(() => {
    let alive = true;
    const docId = pathname === '/' ? 'home' : pathname.replace(/^\//, '').replace(/\//g, '_');
    getDoc(doc(db, 'analytics', docId))
      .then(snap => { if (alive) setPageViews(snap.exists() ? snap.data().views || 0 : 0); })
      .catch(() => { if (alive) setPageViews(0); });
    return () => { alive = false; };
  }, [pathname]);

  // Whole-site total — Firestore adds up `views` on the server, so this costs ~1 read instead of one per page
  useEffect(() => {
    let alive = true;
    try {
      const cached = JSON.parse(sessionStorage.getItem(TOTAL_KEY) || 'null');
      if (cached && Date.now() - cached.t < TOTAL_TTL) { setTotalViews(cached.v); return undefined; }
    } catch {}
    getAggregateFromServer(collection(db, 'analytics'), { total: sum('views') })
      .then(res => {
        const v = res.data().total || 0;
        if (!alive) return;
        setTotalViews(v);
        try { sessionStorage.setItem(TOTAL_KEY, JSON.stringify({ v, t: Date.now() })); } catch {}
      })
      .catch(() => { if (alive) setTotalViews(0); });
    return () => { alive = false; };
  }, []);

  const pageLabel = Object.keys(PAGE_LABELS).find(k =>
    k === '/' ? pathname === '/' : pathname.startsWith(k)
  );
  const label = PAGE_LABELS[pageLabel] || 'This Page';

  return (
    <div style={{
      display: 'flex', gap: '12px', flexWrap: 'wrap',
      padding: '14px 0',
      borderTop: '1px solid var(--border)',
      marginTop: '1rem',
    }}>
      {/* Current page views */}
      <div style={BADGE}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent)', flexShrink: 0 }}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span style={BADGE_LABEL}>{label} Page</span>
        <span style={BADGE_NUM}>
          {pageViews === null ? '—' : formatViews(pageViews)} views
        </span>
      </div>

      {/* Total site visits */}
      <div style={BADGE}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#3fca7a', flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span style={BADGE_LABEL}>Total Site</span>
        <span style={{ ...BADGE_NUM, color: '#3fca7a' }}>
          {totalViews === null ? '—' : formatViews(totalViews)} visits
        </span>
      </div>
    </div>
  );
}

const BADGE       = { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '5px 12px' };
const BADGE_LABEL = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' };
const BADGE_NUM   = { fontSize: '11px', fontWeight: 900, color: 'var(--accent)' };
