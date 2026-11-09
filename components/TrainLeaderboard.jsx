'use client';
import OptimizedImage from '@/components/OptimizedImage';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useAllPublicRatings } from '@/lib/usePublicRatings';
import { effectiveRating, summaryFor } from '@/lib/ratingMath';

const CATEGORIES = [
  { key: 'overall',     label: 'Overall',     icon: '🏆' },
  { key: 'punctuality', label: 'Punctuality', icon: '⏱' },
  { key: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
  { key: 'comfort',     label: 'Comfort',     icon: '💺' },
  { key: 'food',        label: 'Food',        icon: '🍱' },
];

/* Passenger average first; creator's scorecard only where nobody has rated yet */
function getScore(review, category, pub) {
  const eff = effectiveRating(review, summaryFor(pub, review.id));
  if (category === 'overall') {
    return { value: eff.overall?.value || 0, n: eff.overall?.source === 'public' ? eff.overall.count : 0 };
  }
  const cat = eff.cats[category];
  return { value: cat?.value || 0, n: cat?.source === 'public' ? cat.n : 0 };
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function TrainLeaderboard({ reviews = [], limit = 10, compact = false }) {
  const [activeCat, setActiveCat] = useState('overall');
  const pub = useAllPublicRatings();

  const ranked = useMemo(() => {
    return [...reviews]
      .map(r => { const s = getScore(r, activeCat, pub); return { ...r, _score: s.value, _n: s.n }; })
      .filter(r => r._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);
  }, [reviews, activeCat, limit, pub]);

  if (ranked.length === 0) return null;

  return (
    <div>
      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: compact ? '1rem' : '1.5rem' }}>
        {CATEGORIES.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveCat(key)}
            style={{
              fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '8px 14px', borderRadius: '100px', cursor: 'pointer', border: 'none',
              background: activeCat === key ? 'var(--accent)' : 'var(--bg2)',
              color: activeCat === key ? '#fff' : 'var(--muted)',
              outline: activeCat === key ? 'none' : '1px solid var(--border2)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* Top 3 — big podium cards */}
      {!compact && ranked.length >= 1 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: ranked.length >= 3 ? 'repeat(3,1fr)' : `repeat(${ranked.length},1fr)`,
          gap: '12px',
          marginBottom: '1.5rem',
        }}>
          {ranked.slice(0, 3).map((r, i) => (
            <Link key={r.id} href={`/reviews/${r.id}`} style={{
              textDecoration: 'none',
              background: i === 0 ? 'linear-gradient(135deg, var(--accent-dim), var(--bg2))' : 'var(--bg2)',
              border: i === 0 ? '1px solid var(--accent-border)' : '1px solid var(--border)',
              borderRadius: '20px',
              padding: '1.25rem 1rem',
              textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              transform: i === 0 ? 'scale(1.03)' : 'none',
              transition: 'transform 0.2s, border-color 0.2s',
              order: i === 0 ? 2 : i === 1 ? 1 : 3, // podium order: 2nd, 1st, 3rd
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = i === 0 ? 'var(--accent-border)' : 'var(--border)'}
            >
              <div style={{ fontSize: i === 0 ? '2.5rem' : '2rem' }}>{MEDALS[i]}</div>
              {r.coverImage && (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg3)' }}>
                  <OptimizedImage src={r.coverImage} alt={r.name} sizes="(max-width: 768px) 33vw, 330px" />
                </div>
              )}
              <div className="font-display" style={{ fontSize: '1.1rem', textTransform: 'uppercase', lineHeight: 1.1, color: 'var(--text)' }}>
                {r.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>{r.route}</div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem',
                color: i === 0 ? 'var(--accent)' : 'var(--text)', lineHeight: 1,
              }}>
                {r._score.toFixed(1)}<span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>/5</span>
              </div>
              {r._n > 0 && (
                <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>👥 {r._n} rating{r._n === 1 ? '' : 's'}</div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Rest of the list — simple rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {(compact ? ranked : ranked.slice(3)).map((r, i) => {
          const rank = compact ? i + 1 : i + 4;
          return (
            <Link key={r.id} href={`/reviews/${r.id}`} style={{
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px',
              background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px',
              padding: '10px 16px', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%', background: 'var(--bg3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 900, color: 'var(--muted)', flexShrink: 0,
              }}>
                {rank}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{r.route}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexShrink: 0 }}>
                {r._n > 0 && <span style={{ fontSize: '10px', color: 'var(--muted)' }}>👥 {r._n}</span>}
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--accent)' }}>{r._score.toFixed(1)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}