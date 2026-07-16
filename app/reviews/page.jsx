'use client';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import TrainLeaderboard from '@/components/TrainLeaderboard';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function StarRow({ score, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[...Array(max)].map((_, i) => (
        <span key={i} style={{ fontSize: '12px', color: i < score ? 'var(--accent)' : 'var(--border2)' }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [activeRoute, setActiveRoute] = useState('All');
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), where('published', '==', true));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => {
        const rawData = d.data();
        
        // 🚨 CRITICAL FIX: Firestore Objects ko wapis array mein normalize karna[cite: 1]
        const normalizedFares = rawData.fares 
          ? (Array.isArray(rawData.fares) ? rawData.fares : Object.values(rawData.fares))
          : [];

        return { 
          id: d.id, 
          ...rawData,
          fares: normalizedFares // Safe fallback for mapping[cite: 1]
        };
      });
      
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setReviews(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const routes = useMemo(() => {
    const set = new Set(reviews.map(r => r.route).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [reviews]);

  const filtered = useMemo(() => reviews.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name?.toLowerCase().includes(q) || r.route?.toLowerCase().includes(q);
    const matchRoute  = activeRoute === 'All' || r.route === activeRoute;
    return matchSearch && matchRoute;
  }), [reviews, search, activeRoute]);

  const overallScore = r => {
    const s = r.scores || {};
    const vals = [s.punctuality, s.cleanliness, s.comfort, s.food].filter(v => v > 0);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
  };

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* Header */}
      <div className="container" style={{ padding: '4rem 2.5rem 2rem' }}>
        <div className="eyebrow"><span className="eyebrow-line" />Official Expert Ratings</div>
        <h1 className="font-display" style={{ fontSize: 'clamp(3rem,10vw,7rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '1rem' }}>
          TRAIN <span style={{ color: 'var(--accent)' }}>SCORECARDS</span>
        </h1>
      </div>

      {/* Leaderboard section */}
      {!loading && reviews.length > 0 && (
        <div className="container" style={{ padding: '0 2.5rem 3rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1.25rem', cursor: 'pointer', flexWrap: 'wrap', gap: '10px',
          }}
            onClick={() => setShowLeaderboard(s => !s)}
          >
            <div>
              <div className="sec-label">🏆 Rankings</div>
              <h2 className="sec-title" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>Top Rated Trains</h2>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {showLeaderboard ? '▲ Hide' : '▼ Show'}
            </span>
          </div>
          {showLeaderboard && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '1.5rem' }}>
              <TrainLeaderboard reviews={reviews} limit={10} />
            </div>
          )}
        </div>
      )}

      {/* Search + Filters */}
      <div className="container" style={{ padding: '0 2.5rem 2.5rem' }}>
        <div style={SEARCH_WRAP}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--accent)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search train or route…" style={SEARCH_INPUT} />
          {search && <button onClick={() => setSearch('')} style={CLEAR_BTN}>✕</button>}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem' }}>
          {routes.map(r => (
            <button key={r} onClick={() => setActiveRoute(r)} style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '7px 16px', borderRadius: '100px', cursor: 'pointer', border: 'none',
              background: activeRoute === r ? 'var(--accent)' : 'var(--bg2)',
              color: activeRoute === r ? '#fff' : 'var(--muted)',
              outline: activeRoute === r ? 'none' : '1px solid var(--border2)',
              transition: 'all 0.2s',
            }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container rl-reviews-grid-wrap" style={{ padding: '0 2.5rem 5rem' }}>
        {loading && (
          <div className="rl-reviews-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderRadius: '20px', height: '340px', border: '1px solid var(--border)' }} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={EMPTY}>No scorecards found. Try a different search or filter.</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="rl-reviews-grid">
            {filtered.map(r => {
              const avg = overallScore(r);
              return (
                <Link key={r.id} href={`/reviews/${r.id}`} style={CARD}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor='var(--accent-border)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border)'; }}
                >
                  <div style={{ position: 'relative', height: '180px', flexShrink: 0, overflow: 'hidden' }}>
                    {r.coverImage
                      ? <Image src={r.coverImage} alt={r.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ objectFit: 'cover', transition: 'transform 0.4s' }} unoptimized />
                      : <div style={{ position: 'absolute', inset: 0, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🚂</div>
                    }
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }} />

                    {avg && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--accent-border)', borderRadius: '12px', padding: '6px 10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '2px' }}>Score</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', color: 'var(--accent)', lineHeight: 1 }}>{avg}</div>
                      </div>
                    )}

                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '10px', color: '#3fca7a' }}>✓</span>
                      <span style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff' }}>Verified</span>
                    </div>
                  </div>

                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h2 className="font-display" style={{ fontSize: '1.5rem', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' }}>{r.name}</h2>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>
                      {r.route}
                    </div>

                    <div style={{ background: 'var(--bg3)', borderRadius: '12px', padding: '12px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { label: '⏱ Punctuality', val: r.scores?.punctuality },
                        { label: '🧹 Cleanliness', val: r.scores?.cleanliness },
                        { label: '💺 Comfort',     val: r.scores?.comfort     },
                        { label: '🍱 Food',        val: r.scores?.food        },
                      ].map(({ label, val }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                          <StarRow score={val || 0} />
                        </div>
                      ))}
                    </div>

                    {/* Fares safe slicing after normalization */}
                    {(r.fares || []).slice(0, 2).map((f, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                        <span style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.class}</span>
                        <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 700 }}>{f.price}</span>
                      </div>
                    ))}

                    <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                        View Full Scorecard →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

const SEARCH_WRAP  = { display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '100px', padding: '13px 20px', maxWidth: '520px' };
const SEARCH_INPUT = { background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 500, flex: 1 };
const CLEAR_BTN    = { background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '13px' };
const CARD         = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'var(--text)', transition: 'transform 0.25s, border-color 0.25s' };
const EMPTY        = { padding: '5rem 2rem', textAlign: 'center', fontSize: '14px', color: 'var(--muted)', fontWeight: 600, border: '1px dashed var(--border2)', borderRadius: '20px' };