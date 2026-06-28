'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminAnalytics() {
  const [pages,   setPages]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'analytics'));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.views || 0) - (a.views || 0));
      setPages(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const totalViews = pages.reduce((s, p) => s + (p.views || 0), 0);

  return (
    <div style={WRAP}>
      <div style={HEADER}>
        <div style={EYEBROW}>Site Analytics</div>
        <h2 style={HEADING}>Page Views</h2>
        <div style={TOTAL}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', color: '#1E90FF', lineHeight: 1 }}>{totalViews.toLocaleString()}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>Total Views</span>
        </div>
      </div>

      {loading ? (
        <div style={EMPTY}>Loading analytics…</div>
      ) : pages.length === 0 ? (
        <div style={EMPTY}>No views yet — add trackView() to your pages.</div>
      ) : (
        <div style={TABLE}>
          <div style={TABLE_HEAD}>
            <span>Page</span>
            <span style={{ textAlign: 'right' }}>Views</span>
            <span style={{ textAlign: 'right' }}>Last Seen</span>
          </div>
          {pages.map(page => {
            const maxViews = pages[0]?.views || 1;
            const pct = Math.round((page.views / maxViews) * 100);
            return (
              <div key={page.id} style={TABLE_ROW}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                    {page.path || '/' + page.id}
                  </div>
                  {/* Bar */}
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#1E90FF', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
                <div style={{ fontSize: '18px', fontFamily: "'Bebas Neue', sans-serif", color: '#1E90FF', textAlign: 'right', flexShrink: 0 }}>
                  {(page.views || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'right', flexShrink: 0 }}>
                  {page.lastSeen?.toDate
                    ? new Date(page.lastSeen.toDate()).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
                    : '—'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const WRAP      = { fontFamily: "'Inter', sans-serif", color: '#fff' };
const HEADER    = { marginBottom: '1.5rem' };
const EYEBROW   = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING   = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', textTransform: 'uppercase', lineHeight: 1, marginBottom: '1rem' };
const TOTAL     = { display: 'inline-flex', flexDirection: 'column', background: '#0c0c12', border: '1px solid rgba(30,144,255,0.25)', borderRadius: '16px', padding: '1.25rem 2rem', marginBottom: '0.5rem' };
const TABLE     = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' };
const TABLE_HEAD= { display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: '1rem', padding: '12px 20px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' };
const TABLE_ROW = { display: 'grid', gridTemplateColumns: '1fr 80px 100px', gap: '1rem', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' };
const EMPTY     = { padding: '2rem', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 600 };
