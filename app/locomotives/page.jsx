'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function LocomotivesPage() {
  const [locos,   setLocos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'locomotives'), where('published', '==', true));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setLocos(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => locos.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name?.toLowerCase().includes(q) || l.model?.toLowerCase().includes(q) || l.manufacturer?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchSearch && matchStatus;
  }), [locos, search, statusFilter]);

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      <div className="container" style={{ padding: '4rem 2.5rem 2rem' }}>
        <div className="eyebrow"><span className="eyebrow-line" />Working Fleet</div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem,9vw,7rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          LOCO<span style={{ color: 'var(--accent)' }}>MOTIVES</span>
        </h1>

        <div style={SEARCH_WRAP}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--accent)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, model, manufacturer…" style={SEARCH_INPUT} />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
          {['All', 'active', 'retired'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '7px 16px', borderRadius: '100px', cursor: 'pointer', border: 'none',
              background: statusFilter === s ? 'var(--accent)' : 'var(--bg2)',
              color: statusFilter === s ? '#fff' : 'var(--muted)',
              outline: statusFilter === s ? 'none' : '1px solid var(--border2)',
            }}>
              {s === 'All' ? 'All' : s === 'active' ? '🟢 Active' : '🔴 Retired'}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '0 2.5rem 5rem' }}>
        {loading && (
          <div className="rl-reviews-grid">
            {[...Array(6)].map((_, i) => <div key={i} style={{ background: 'var(--bg2)', borderRadius: '20px', height: '300px', border: '1px solid var(--border)' }} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={EMPTY}>No locomotives found.</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="rl-reviews-grid">
            {filtered.map(l => (
              <Link key={l.id} href={`/locomotives/${l.id}`} style={CARD}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor='var(--accent-border)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border)'; }}
              >
                <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: 'var(--bg3)' }}>
                  {l.coverImage ? (
                    <img src={l.coverImage} alt={l.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🚂</div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />
                  <span style={{
                    position: 'absolute', top: '12px', left: '12px',
                    fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: '100px',
                    background: l.status === 'active' ? 'rgba(63,202,122,0.9)' : 'rgba(239,68,68,0.9)',
                    color: '#fff',
                  }}>
                    {l.status === 'active' ? '🟢 Active' : '🔴 Retired'}
                  </span>
                </div>
                <div style={{ padding: '18px' }}>
                  <h2 className="font-display" style={{ fontSize: '1.5rem', textTransform: 'uppercase', lineHeight: 1, marginBottom: '8px' }}>{l.name}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--muted)' }}>
                    {l.model && <div><strong style={{ color: 'var(--text)' }}>Model:</strong> {l.model}</div>}
                    {l.manufacturer && <div><strong style={{ color: 'var(--text)' }}>Made by:</strong> {l.manufacturer}</div>}
                    {l.depot && <div><strong style={{ color: 'var(--text)' }}>Depot:</strong> {l.depot}</div>}
                  </div>
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const SEARCH_WRAP  = { display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '100px', padding: '13px 20px', maxWidth: '520px' };
const SEARCH_INPUT = { background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 500, flex: 1 };
const CARD         = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'var(--text)', transition: 'transform 0.25s, border-color 0.25s' };
const EMPTY        = { padding: '5rem 2rem', textAlign: 'center', fontSize: '14px', color: 'var(--muted)', fontWeight: 600, border: '1px dashed var(--border2)', borderRadius: '20px' };
