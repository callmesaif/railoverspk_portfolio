'use client';
import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, setDoc, updateDoc, increment,
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';

/* ── YouTube ID helper ─────────────────────── */
function getYtId(url) {
  if (!url) return null;
  const s = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (s) return s[1];
  const l = url.match(/[?&v=\/embed\/]([a-zA-Z0-9_-]{11})/);
  return l ? l[1] : null;
}

/* ── Score bar ─────────────────────────────── */
function ScoreBar({ label, score, max = 5 }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--accent)' }}>{score}/5</span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${(score/max)*100}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
        {[...Array(max)].map((_,i) => (
          <span key={i} style={{ fontSize: '14px', color: i < score ? 'var(--accent)' : 'var(--border2)' }}>★</span>
        ))}
      </div>
    </div>
  );
}

/* ── Image Lightbox ────────────────────────── */
function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', zIndex: 10 }}>✕</button>

      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
          style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer', zIndex: 10 }}>‹</button>
      )}

      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh', position: 'relative' }}>
        <img src={images[idx]} alt={`Gallery ${idx + 1}`} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }} />
        <div style={{ position: 'absolute', bottom: '-32px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
          {idx + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
          style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '48px', height: '48px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer', zIndex: 10 }}>›</button>
      )}

      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
          {images.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
              style={{ width: i === idx ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === idx ? 'var(--accent)' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Comments ──────────────────────────────── */
function CommentsSection({ reviewId }) {
  const [comments, setComments] = useState([]);
  const [name,     setName]     = useState('');
  const [text,     setText]     = useState('');
  const [posting,  setPosting]  = useState(false);
  const [posted,   setPosted]   = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews', reviewId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [reviewId]);

  async function handlePost(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'reviews', reviewId, 'comments'), {
        name:      name.trim() || 'Anonymous',
        text:      text.trim(),
        createdAt: serverTimestamp(),
      });
      setName(''); setText('');
      setPosted(true);
      setTimeout(() => setPosted(false), 3000);
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setPosting(false);
    }
  }

  function timeAgo(ts) {
    if (!ts?.toDate) return '';
    const diff = (Date.now() - ts.toDate().getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  }

  return (
    <div>
      <div style={SEC_LABEL}>💬 Comments ({comments.length})</div>

      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border2)', borderRadius: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💭</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No comments yet — be the first!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {comments.map(c => (
            <div key={c.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                    {(c.name || 'A')[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{c.name || 'Anonymous'}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{timeAgo(c.createdAt)}</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>Leave a Comment</div>
        <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)" style={COMMENT_INPUT} />
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share your experience about this train..." required rows={3} style={{ ...COMMENT_INPUT, resize: 'vertical', minHeight: '90px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="submit" disabled={posting || !text.trim()} style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: '100px', padding: '12px 24px', cursor: posting || !text.trim() ? 'not-allowed' : 'pointer', opacity: posting || !text.trim() ? 0.6 : 1 }}>
              {posting ? 'Posting…' : 'Post Comment'}
            </button>
            {posted && <span style={{ fontSize: '12px', color: '#3fca7a', fontWeight: 600 }}>✓ Posted!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function ReviewClient({ params }) {
  const { id }            = use(params);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [stats, setStats]   = useState({ views: 0, unique: 0 });

  /* ── Fetch review ── */
  useEffect(() => {
    getDoc(doc(db, 'reviews', id)).then(snap => {
      if (snap.exists()) setReview({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [id]);

  /* ── Track views — all imports from same firebase/firestore ── */
  useEffect(() => {
    if (!id) return;
    const KEY      = `rlpk_viewed_${id}`;
    const isUnique = !localStorage.getItem(KEY);
    const statRef  = doc(db, 'review_stats', id);

    const doUpdate = async () => {
      try {
        await updateDoc(statRef, {
          views:     increment(1),
          unique:    isUnique ? increment(1) : increment(0),
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Doc doesn't exist yet — create it
        await setDoc(statRef, {
          views:     1,
          unique:    isUnique ? 1 : 0,
          updatedAt: serverTimestamp(),
        });
      }
      if (isUnique) localStorage.setItem(KEY, '1');
    };
    doUpdate();

    const unsub = onSnapshot(statRef, snap => {
      if (snap.exists()) {
        setStats({ views: snap.data().views || 0, unique: snap.data().unique || 0 });
      }
    });
    return unsub;
  }, [id]);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  if (loading) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav /><div style={LOADING}>Loading scorecard…</div>
    </main>
  );

  if (!review) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>Not found. <Link href="/reviews" style={{ color: 'var(--accent)' }}>← All Reviews</Link></div>
    </main>
  );

  const scores   = review.scores || {};
  const videoId  = getYtId(review.videoUrl);
  const gallery  = [review.coverImage, ...(review.images || [])].filter(Boolean);
  const avgScore = (() => {
    const vals = [scores.punctuality, scores.cleanliness, scores.comfort, scores.food].filter(v => v > 0);
    return vals.length ? (vals.reduce((a,b) => a+b,0) / vals.length).toFixed(1) : null;
  })();

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {lightbox !== null && gallery.length > 0 && (
        <Lightbox images={gallery} startIdx={lightbox} onClose={closeLightbox} />
      )}

      {/* Cover image */}
      {review.coverImage && (
        <div onClick={() => setLightbox(0)} style={{ position: 'relative', height: '420px', overflow: 'hidden', cursor: 'zoom-in' }}>
          <img src={review.coverImage} alt={review.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,8,0.1) 0%, rgba(5,5,8,0.6) 60%, var(--bg) 100%)' }} />
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px 14px', fontSize: '11px', color: '#fff', fontWeight: 700 }}>
            🔍 Click to view
          </div>
        </div>
      )}

      <div className="container" style={{ maxWidth: '900px', padding: review.coverImage ? '0 2.5rem 5rem' : '4rem 2.5rem 5rem', marginTop: review.coverImage ? '-100px' : 0, position: 'relative', zIndex: 2 }}>

        {/* Back + Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/reviews" style={BACK_LINK}>← All Scorecards</Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={STAT_PILL}>👁 <strong>{stats.views.toLocaleString()}</strong> views</div>
            <div style={STAT_PILL}>👤 <strong>{stats.unique.toLocaleString()}</strong> unique</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div>
            <span style={VERIFIED_BADGE}>✓ RaiLoversPK Verified</span>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '8px', marginTop: '10px' }}>{review.name}</h1>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{review.route}</div>
          </div>
          {avgScore && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--accent-border)', borderRadius: '20px', padding: '1.25rem 1.75rem', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>Overall</div>
              <div className="font-display" style={{ fontSize: '3.5rem', color: 'var(--accent)', lineHeight: 1 }}>{avgScore}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>out of 5.0</div>
            </div>
          )}
        </div>

        <div style={DIVIDER} />

        {/* Scores + Fares */}
        <div className="rl-review-detail-grid">
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

        {/* Gallery */}
        {gallery.length > 1 && (
          <>
            <div style={SEC_LABEL}>📸 Gallery ({gallery.length} photos)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '2rem' }}>
              {gallery.map((img, i) => (
                <div key={i} onClick={() => setLightbox(i)}
                  style={{ aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden', cursor: 'zoom-in', position: 'relative', background: 'var(--bg3)', border: '1px solid var(--border)', transition: 'transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <img src={img} alt={`Photo ${i+1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {i === 0 && <div style={{ position: 'absolute', top: '6px', left: '6px', fontSize: '8px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--accent)', color: '#fff', padding: '3px 8px', borderRadius: '100px' }}>Cover</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary */}
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

        {/* YouTube */}
        {videoId && (
          <>
            <div style={SEC_LABEL}>▶ Watch the Review</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                <iframe src={`https://www.youtube.com/embed/${videoId}`} title={review.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
              </div>
            </div>
          </>
        )}

        <div style={DIVIDER} />

        {/* Comments */}
        <CommentsSection reviewId={id} />

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

const SEC_LABEL     = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' };
const DIVIDER       = { height: '1px', background: 'var(--border)', margin: '2rem 0' };
const BACK_LINK     = { display: 'inline-flex', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' };
const VERIFIED_BADGE= { fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'rgba(63,202,122,0.12)', color: '#3fca7a', border: '1px solid rgba(63,202,122,0.25)', padding: '4px 12px', borderRadius: '100px' };
const BTN_BACK      = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', padding: '11px 20px', borderRadius: '100px', border: '1px solid var(--border2)' };
const BTN_YT        = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#ff0000', textDecoration: 'none', padding: '11px 22px', borderRadius: '100px' };
const LOADING       = { padding: '5rem 2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '14px', fontFamily: "'Inter', sans-serif" };
const STAT_PILL     = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '6px 14px' };
const COMMENT_INPUT = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text)', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, outline: 'none' };