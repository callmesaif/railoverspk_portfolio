'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';

const CATEGORIES = [
  { key: 'overall',     label: 'Overall',     icon: '🏆' },
  { key: 'punctuality', label: 'Punctuality', icon: '⏱' },
  { key: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
  { key: 'comfort',     label: 'Comfort',     icon: '💺' },
  { key: 'food',        label: 'Food',        icon: '🍱' },
];

function getScore(review, category) {
  const s = review.scores || {};
  if (category === 'overall') {
    const vals = [s.punctuality, s.cleanliness, s.comfort, s.food].filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }
  return s[category] || 0;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function TrainLeaderboard({ reviews = [], limit = 10, compact = false }) {
  const [activeCat, setActiveCat] = useState('overall');

  const ranked = useMemo(() => {
    return [...reviews]
      .map(r => ({ ...r, _score: getScore(r, activeCat) }))
      .filter(r => r._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);
  }, [reviews, activeCat, limit]);

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
                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg3)' }}>
                  <img src={r.coverImage} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
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
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', color: 'var(--accent)', flexShrink: 0 }}>
                {r._score.toFixed(1)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
