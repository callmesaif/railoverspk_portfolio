'use client';
import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function ScoreBar({ label, score, max = 5 }) {
  const pct = (score / max) * 100;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--accent)' }}>{score}/5</span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
        {[...Array(max)].map((_, i) => (
          <span key={i} style={{ fontSize: '14px', color: i < score ? 'var(--accent)' : 'var(--border2)' }}>★</span>
        ))}
      </div>
    </div>
  );
}

function getYtId(url) {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  const long = url.match(/[?&v=\/embed\/]([a-zA-Z0-9_-]{11})/);
  return long ? long[1] : null;
}

export default function ReviewClient({ params }) {
  const { id }              = use(params);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'reviews', id)).then(snap => {
      if (snap.exists()) setReview({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav /><div style={LOADING}>Loading scorecard…</div>
    </main>
  );

  if (!review) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>Scorecard not found. <Link href="/reviews" style={{ color: 'var(--accent)' }}>← All Reviews</Link></div>
    </main>
  );

  const scores   = review.scores || {};
  const videoId  = getYtId(review.videoUrl);
  const avgScore = (() => {
    const vals = [scores.punctuality, scores.cleanliness, scores.comfort, scores.food].filter(v => v > 0);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
  })();

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />
      {review.coverImage && (
        <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
          <Image src={review.coverImage} alt={review.name} fill priority style={{ objectFit: 'cover', opacity: 0.6 }} unoptimized />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,8,0.1) 0%, rgba(5,5,8,0.6) 60%, var(--bg) 100%)' }} />
        </div>
      )}

      <div className="container" style={{ maxWidth: '900px', padding: review.coverImage ? '0 2.5rem 5rem' : '4rem 2.5rem 5rem', marginTop: review.coverImage ? '-100px' : 0, position: 'relative', zIndex: 2 }}>
        <Link href="/reviews" style={BACK_LINK}>← All Scorecards</Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div>
            <span style={VERIFIED_BADGE}>✓ RaiLoversPK Verified</span>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '8px', marginTop: '8px' }}>
              {review.name}
            </h1>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{review.route}</div>
          </div>
          {avgScore && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--accent-border)', borderRadius: '20px', padding: '1.5rem 2rem', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Overall</div>
              <div className="font-display" style={{ fontSize: '4rem', color: 'var(--accent)', lineHeight: 1 }}>{avgScore}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>out of 5.0</div>
            </div>
          )}
        </div>

        <div style={DIVIDER} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={SEC_LABEL}>Ratings</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
              <ScoreBar label="⏱ Punctuality" score={scores.punctuality || 0} />
              <ScoreBar label="🧹 Cleanliness" score={scores.cleanliness || 0} />
              <ScoreBar label="💺 Comfort"     score={scores.comfort     || 0} />
              <ScoreBar label="🍱 Food"        score={scores.food        || 0} />
            </div>
          </div>
          <div>
            <div style={SEC_LABEL}>Fares & Classes</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(review.fares || []).length === 0
                ? <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No fare data available.</div>
                : (review.fares || []).map((f, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: i < review.fares.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>{f.class}</span>
                    <span style={{ fontSize: '15px', fontWeight: 900, fontStyle: 'italic', color: 'var(--accent)' }}>{f.price}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {review.summary && (
          <>
            <div style={SEC_LABEL}>Journey Review</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '15px', lineHeight: 1.85, color: 'rgba(255,255,255,0.72)' }}>
                {review.summary.split('\n').map((p, i) =>
                  p.trim() ? <p key={i} style={{ marginBottom: '1rem' }}>{p}</p> : <br key={i} />
                )}
              </div>
            </div>
          </>
        )}

        {videoId && (
          <>
            <div style={SEC_LABEL}>Watch the Review</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={review.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>
          </>
        )}

        <div style={DIVIDER} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/reviews" style={BTN_BACK}>← All Scorecards</Link>
          {review.videoUrl && (
            <a href={review.videoUrl} target="_blank" rel="noopener noreferrer" style={BTN_YT}>Watch on YouTube ↗</a>
          )}
        </div>
      </div>
    </main>
  );
}

const BACK_LINK     = { display: 'inline-flex', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', marginBottom: '2rem' };
const VERIFIED_BADGE= { fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'rgba(63,202,122,0.12)', color: '#3fca7a', border: '1px solid rgba(63,202,122,0.25)', padding: '4px 12px', borderRadius: '100px' };
const SEC_LABEL     = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' };
const DIVIDER       = { height: '1px', background: 'var(--border)', margin: '2rem 0' };
const BTN_BACK      = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', padding: '11px 20px', borderRadius: '100px', border: '1px solid var(--border2)' };
const BTN_YT        = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#ff0000', textDecoration: 'none', padding: '11px 22px', borderRadius: '100px' };
const LOADING       = { padding: '5rem 2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '14px', fontFamily: "'Inter', sans-serif" };
