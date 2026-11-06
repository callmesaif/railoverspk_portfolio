'use client';
import { use, useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { db } from '@/lib/firebase';
import {
  doc, getDoc, setDoc, updateDoc, increment,
  collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { usePublicRating, buildRatingWrite } from '@/lib/usePublicRatings';
import { RATING_CATS, effectiveRating, cleanRatings } from '@/lib/ratingMath';

function getYtId(url) {
  if (!url) return null;
  const s = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (s) return s[1];
  const l = url.match(/[?&v=\/embed\/]([a-zA-Z0-9_-]{11})/);
  return l ? l[1] : null;
}

function ScoreBar({ label, value = 0, n = 0, source = null, max = 5 }) {
  const has = value > 0;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 900, color: has ? 'var(--accent)' : 'var(--muted)' }}>
          {has ? `${value.toFixed(1)}/5` : '—'}
          {source === 'public' && <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted)', marginLeft: '6px' }}>({n})</span>}
          {source === 'creator' && <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginLeft: '6px' }}>creator</span>}
        </span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', gap: '3px', marginTop: '6px' }}>
        {[...Array(max)].map((_, i) => (
          <span key={i} style={{ fontSize: '14px', color: i < Math.round(value) ? 'var(--accent)' : 'var(--border2)' }}>★</span>
        ))}
      </div>
    </div>
  );
}

function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', zIndex: 10 }}>✕</button>
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
          style={{ position: 'absolute', left: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer', zIndex: 10 }}>‹</button>
      )}
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '88vh' }}>
        <img src={images[idx]} alt={`Photo ${idx + 1}`} style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }} />
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>{idx + 1} / {images.length}</div>
      </div>
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
          style={{ position: 'absolute', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', fontSize: '22px', cursor: 'pointer', zIndex: 10 }}>›</button>
      )}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
          {images.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
              style={{ width: i === idx ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === idx ? 'var(--accent)' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* One tappable 1–5 star row (tap the same star again to clear) */
function StarPicker({ value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(value === n ? 0 : n)}
          style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', fontSize: '28px', lineHeight: 1, color: n <= value ? 'var(--accent)' : 'var(--border2)', transition: 'color 0.12s' }}
        >★</button>
      ))}
    </div>
  );
}

/* Ratings a passenger attached to their feedback */
function RatingChips({ ratings }) {
  const items = RATING_CATS.filter(x => ratings?.[x.key] > 0);
  if (!items.length) return null;
  const avg   = items.reduce((s, x) => s + ratings[x.key], 0) / items.length;
  const round = Math.round(avg);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '13px', letterSpacing: '1px', color: 'var(--accent)' }}>
          {'★'.repeat(round)}<span style={{ color: 'var(--border2)' }}>{'★'.repeat(5 - round)}</span>
        </span>
        <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--accent)' }}>{avg.toFixed(1)}</span>
      </span>
      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
        {items.map(x => `${x.icon} ${ratings[x.key]}`).join('  ·  ')}
      </span>
    </div>
  );
}

const NO_RATINGS = { punctuality: 0, cleanliness: 0, comfort: 0, food: 0 };

/* Passenger feedback = optional star ratings + optional comment — lazy loaded on scroll */
function CommentsSection({ reviewId }) {
  const [comments, setComments] = useState([]);
  const [name, setName]         = useState('');
  const [text, setText]         = useState('');
  const [ratings, setRatings]   = useState(NO_RATINGS);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [posting, setPosting]   = useState(false);
  const [posted, setPosted]     = useState(false);
  const [error, setError]       = useState('');

  const RATED_KEY = `rl_rated_${reviewId}`;

  useEffect(() => {
    try { setAlreadyRated(!!localStorage.getItem(RATED_KEY)); } catch {}
  }, [RATED_KEY]);

  useEffect(() => {
    const q = query(collection(db, 'reviews', reviewId, 'comments'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, snap => setComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [reviewId]);

  const given     = cleanRatings(ratings);
  const hasRating = Object.keys(given).length > 0;
  const canPost   = !posting && (text.trim().length > 0 || (hasRating && !alreadyRated));

  async function handlePost(e) {
    e.preventDefault();
    if (!canPost) return;
    setPosting(true);
    setError('');
    try {
      const sendRatings = hasRating && !alreadyRated;
      const commentRef  = doc(collection(db, 'reviews', reviewId, 'comments'));

      // Comment and rating totals are written together, so they can never disagree
      const batch = writeBatch(db);
      batch.set(commentRef, {
        name: name.trim() || 'Anonymous',
        text: text.trim(),
        createdAt: serverTimestamp(),
        ...(sendRatings ? { ratings: given } : {}),
      });
      if (sendRatings) {
        batch.set(doc(db, 'review_ratings', reviewId), buildRatingWrite(given), { merge: true });
      }
      await batch.commit();

      if (sendRatings) {
        try { localStorage.setItem(RATED_KEY, '1'); } catch {}
        setAlreadyRated(true);
      }
      setName(''); setText(''); setRatings(NO_RATINGS);
      setPosted(true);
      setTimeout(() => setPosted(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Couldn't post your feedback. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  function timeAgo(ts) {
    if (!ts?.toDate) return '';
    const d = (Date.now() - ts.toDate()) / 1000;
    if (d < 60) return 'just now';
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  }

  return (
    <div>
      <div style={SEC_LABEL}>💬 Passenger Feedback ({comments.length})</div>
      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border2)', borderRadius: '16px', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💭</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No feedback yet — be the first to rate this train!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
          {comments.map(c => (
            <div key={c.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                    {(c.name || 'A')[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{c.name || 'Anonymous'}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{timeAgo(c.createdAt)}</span>
              </div>
              <RatingChips ratings={c.ratings} />
              {c.text && <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.text}</p>}
              {c.reply && (
                <div style={{ marginTop: '10px', marginLeft: '12px', padding: '10px 14px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-dim)', borderRadius: '0 12px 12px 0' }}>
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '4px' }}>✓ RaiLoversPK replied</div>
                  <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text)', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '18px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>Share Your Feedback</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '14px' }}>Rate the train, leave a comment, or both.</div>

        <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: 'var(--bg3)', borderRadius: '14px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
              Rate this train <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </div>
            {alreadyRated ? (
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
                ✓ You&apos;ve already rated this train from this device. You can still leave a comment.
              </div>
            ) : (
              RATING_CATS.map(cat => (
                <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '2px 0', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>{cat.label}</span>
                  <StarPicker value={ratings[cat.key]} label={cat.short} onChange={v => setRatings(r => ({ ...r, [cat.key]: v }))} />
                </div>
              ))
            )}
          </div>

          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name (optional)" maxLength={60} style={C_INPUT} />
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share your experience about this train..." rows={3} maxLength={1000} style={{ ...C_INPUT, resize: 'vertical', minHeight: '80px' }} />
          {error && <div style={{ fontSize: '12px', color: '#f97070', fontWeight: 600 }}>{error}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button type="submit" disabled={!canPost} style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: '100px', padding: '11px 22px', cursor: canPost ? 'pointer' : 'not-allowed', opacity: canPost ? 1 : 0.6 }}>
              {posting ? 'Posting…' : 'Post Feedback'}
            </button>
            {posted && <span style={{ fontSize: '12px', color: '#3fca7a', fontWeight: 600 }}>✓ Thanks for your feedback!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReviewClient({ params }) {
  const { id }              = use(params);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [stats, setStats]   = useState({ views: 0, unique: 0 });
  const [showVideo, setShowVideo] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const commentsRef = useRef(null);
  const pubRating   = usePublicRating(id);

  useEffect(() => {
    getDoc(doc(db, 'reviews', id)).then(snap => {
      if (snap.exists()) setReview({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [id]);

  // Track views after review loads (deferred)
  useEffect(() => {
    if (!id || loading) return;
    const KEY = `rlpk_viewed_${id}`;
    const isUnique = !localStorage.getItem(KEY);
    const statRef  = doc(db, 'review_stats', id);

    const doUpdate = async () => {
      try {
        await updateDoc(statRef, { views: increment(1), unique: isUnique ? increment(1) : increment(0), updatedAt: serverTimestamp() });
      } catch {
        await setDoc(statRef, { views: 1, unique: isUnique ? 1 : 0, updatedAt: serverTimestamp() });
      }
      if (isUnique) localStorage.setItem(KEY, '1');
    };
    // Defer by 2s so it doesn't block LCP
    const t = setTimeout(doUpdate, 2000);

    const unsub = onSnapshot(statRef, snap => {
      if (snap.exists()) setStats({ views: snap.data().views || 0, unique: snap.data().unique || 0 });
    });
    return () => { clearTimeout(t); unsub(); };
  }, [id, loading]);

  // Lazy load comments when user scrolls near them
  useEffect(() => {
    if (!commentsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setShowComments(true); },
      { rootMargin: '200px' }
    );
    observer.observe(commentsRef.current);
    return () => observer.disconnect();
  }, [loading]);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  if (loading) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        Loading scorecard…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );

  if (!review) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>Not found. <Link href="/reviews" style={{ color: 'var(--accent)' }}>← All Reviews</Link></div>
    </main>
  );

  const eff      = effectiveRating(review, pubRating);
  const videoId  = getYtId(review.videoUrl);
  const gallery  = [review.coverImage, ...(review.images || [])].filter(Boolean);
  function goRate() {
    setShowComments(true);
    setTimeout(() => commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />
      {lightbox !== null && <Lightbox images={gallery} startIdx={lightbox} onClose={closeLightbox} />}

      {/* Cover — fixed aspect ratio prevents CLS */}
      {review.coverImage && (
        <div onClick={() => setLightbox(0)} style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '60vh', overflow: 'hidden', cursor: 'zoom-in', background: 'var(--bg2)' }}>
          <img src={review.coverImage} alt={review.name} fetchPriority="high" decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,8,0.1) 0%, rgba(5,5,8,0.55) 60%, var(--bg) 100%)' }} />
          <div style={{ position: 'absolute', bottom: '14px', right: '14px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '7px 13px', fontSize: '11px', color: '#fff', fontWeight: 700 }}>
            🔍 Click to view
          </div>
        </div>
      )}

      <div className="container" style={{ maxWidth: '900px', padding: review.coverImage ? '0 1.5rem 5rem' : '4rem 1.5rem 5rem', marginTop: review.coverImage ? '-80px' : 0, position: 'relative', zIndex: 2 }}>

        {/* Back + Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <Link href="/reviews" style={BACK_LINK}>← All Scorecards</Link>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={STAT_PILL}>👁 <strong>{stats.views.toLocaleString()}</strong> views</div>
            <div style={STAT_PILL}>👤 <strong>{stats.unique.toLocaleString()}</strong> unique</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={VERIFIED_BADGE}>✓ RaiLoversPK Verified</span>
            <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 7vw, 5rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '8px', marginTop: '10px' }}>{review.name}</h1>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{review.route}</div>
          </div>
          {eff.overall && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--accent-border)', borderRadius: '16px', padding: '1rem 1.5rem', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>{eff.overall.source === 'public' ? 'Passenger Rating' : "Creator's Rating"}</div>
              <div className="font-display" style={{ fontSize: '3rem', color: 'var(--accent)', lineHeight: 1 }}>{eff.overall.value.toFixed(1)}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>{eff.overall.source === 'public' ? `from ${eff.overall.count} rating${eff.overall.count === 1 ? '' : 's'}` : 'out of 5.0'}</div>
            </div>
          )}
        </div>

        <div style={DIVIDER} />

        {/* Scores + Fares */}
        <div className="rl-review-detail-grid">
          <div>
            <div style={SEC_LABEL}>Passenger Ratings</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem' }}>
              {RATING_CATS.map(cat => {
                const r = eff.cats[cat.key];
                return <ScoreBar key={cat.key} label={cat.label} value={r.value} n={r.n} source={r.source} />;
              })}
              {!eff.loading && eff.overall?.source !== 'public' && (
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
                  No passenger ratings yet.{' '}
                  <button type="button" onClick={goRate} style={LINK_BTN}>Be the first to rate →</button>
                </div>
              )}
            </div>
          </div>
          <div>
            <div style={SEC_LABEL}>Fares & Classes</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

        {/* Gallery — images have fixed aspect ratio to prevent CLS */}
        {gallery.length > 1 && (
          <>
            <div style={SEC_LABEL}>📸 Gallery ({gallery.length} photos)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '2rem' }}>
              {gallery.map((img, i) => (
                <div key={i} onClick={() => setLightbox(i)}
                  style={{ aspectRatio: '4/3', borderRadius: '10px', overflow: 'hidden', cursor: 'zoom-in', background: 'var(--bg3)', border: '1px solid var(--border)', transition: 'transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                >
                  <img src={img} alt={`Photo ${i + 1}`} loading="lazy" decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Summary */}
        {review.summary && (
          <>
            <div style={SEC_LABEL}>Journey Review</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '15px', lineHeight: 1.85, color: 'rgba(255,255,255,0.72)' }}>
                {review.summary.split('\n').map((p, i) =>
                  p.trim() ? <p key={i} style={{ marginBottom: '1rem' }}>{p}</p> : <br key={i} />
                )}
              </div>
            </div>
          </>
        )}

        {/* YouTube — lazy click-to-play */}
        {videoId && (
          <>
            <div style={SEC_LABEL}>▶ Watch the Review</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', marginBottom: '2rem' }}>
              {showVideo ? (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                  <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} title={review.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
                </div>
              ) : (
                <div onClick={() => setShowVideo(true)} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000', cursor: 'pointer' }}>
                  <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt="Video thumbnail" loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(255,0,0,0.5)' }}>
                      <svg width="22" height="22" viewBox="0 0 16 16" fill="white"><path d="M5 3l9 5-9 5V3z" /></svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div style={DIVIDER} />

        {/* Comments — lazy rendered via IntersectionObserver */}
        <div ref={commentsRef}>
          {showComments ? (
            <CommentsSection reviewId={id} />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
              Loading comments…
            </div>
          )}
        </div>

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
const STAT_PILL     = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '100px', padding: '5px 12px' };
const LINK_BTN      = { background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, fontSize: '12px', fontFamily: 'inherit' };
const C_INPUT       = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text)', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, outline: 'none' };