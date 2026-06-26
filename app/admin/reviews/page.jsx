'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reviews'), snap => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this scorecard? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'reviews', id));
  }

  async function togglePublish(id, current) {
    await updateDoc(doc(db, 'reviews', id), { published: !current });
  }

  const filtered = reviews.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.route?.toLowerCase().includes(search.toLowerCase())
  );

  // Overall score helper
  const overallScore = (r) => {
    const s = r.scores || {};
    const vals = [s.punctuality, s.cleanliness, s.comfort, s.food].filter(Boolean);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  };

  return (
    <main style={PAGE}>
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Scorecards</div>
          <h1 style={HEADING}>Train Reviews</h1>
        </div>
        <Link href="/admin/reviews/new" style={BTN_PRIMARY}>+ New Scorecard</Link>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by train name or route…" style={SEARCH} />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {filtered.length} scorecard{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? <div style={EMPTY}>Loading…</div>
        : filtered.length === 0 ? (
          <div style={EMPTY}>
            No scorecards yet. <Link href="/admin/reviews/new" style={{ color: '#1E90FF' }}>Create one →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(r => (
              <div key={r.id} style={CARD}>
                {/* Cover thumb */}
                {r.coverImage && (
                  <div style={{ width: '80px', height: '60px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#131320' }}>
                    <img src={r.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>{r.name || 'Untitled'}</span>
                    <span style={r.published ? BADGE_LIVE : BADGE_DRAFT}>
                      {r.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
                    {r.route || '—'}
                  </div>
                  {/* Score pills */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { label: '⏱', val: r.scores?.punctuality },
                      { label: '🧹', val: r.scores?.cleanliness },
                      { label: '💺', val: r.scores?.comfort     },
                      { label: '🍱', val: r.scores?.food        },
                    ].map(({ label, val }) => val ? (
                      <span key={label} style={SCORE_PILL}>{label} {val}/5</span>
                    ) : null)}
                    <span style={{ ...SCORE_PILL, background: 'rgba(30,144,255,0.15)', color: '#1E90FF', border: '1px solid rgba(30,144,255,0.25)' }}>
                      ★ {overallScore(r)} avg
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                  <button onClick={() => togglePublish(r.id, r.published)}
                    style={r.published ? BTN_UNPUBLISH : BTN_PUBLISH_SM}>
                    {r.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link href={`/admin/reviews/${r.id}`} style={BTN_EDIT}>Edit</Link>
                  <button onClick={() => handleDelete(r.id)} style={BTN_DELETE}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </main>
  );
}

const PAGE         = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' };
const HEADER       = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' };
const EYEBROW      = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING      = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1 };
const BTN_PRIMARY  = { display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', padding: '11px 20px', borderRadius: '100px', textDecoration: 'none' };
const SEARCH       = { flex: 1, background: '#0c0c12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', outline: 'none' };
const CARD         = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' };
const SCORE_PILL   = { fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' };
const BADGE_LIVE   = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(63,202,122,0.15)', color: '#3fca7a', border: '1px solid rgba(63,202,122,0.25)', padding: '3px 9px', borderRadius: '100px' };
const BADGE_DRAFT  = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 9px', borderRadius: '100px' };
const BTN_EDIT     = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1E90FF', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(30,144,255,0.25)', background: 'rgba(30,144,255,0.08)' };
const BTN_PUBLISH_SM={ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3fca7a', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(63,202,122,0.25)', background: 'rgba(63,202,122,0.08)', cursor: 'pointer' };
const BTN_UNPUBLISH= { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer' };
const BTN_DELETE   = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f97070', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer' };
const EMPTY        = { padding: '3rem', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 };
