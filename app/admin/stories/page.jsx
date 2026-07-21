'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'stories'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setStories(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this story?')) return;
    await deleteDoc(doc(db, 'stories', id));
  }

  function isExpired(story) {
    if (!story.expiresAt?.toMillis) return false;
    return story.expiresAt.toMillis() < Date.now();
  }

  function timeLeft(story) {
    if (!story.expiresAt?.toMillis) return '—';
    const diff = story.expiresAt.toMillis() - Date.now();
    if (diff <= 0) return 'Expired';
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m left`;
  }

  return (
    <main style={PAGE}>
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Content</div>
          <h1 style={HEADING}>Stories</h1>
        </div>
        <Link href="/admin/stories/new" style={BTN_PRIMARY}>+ New Story</Link>
      </div>

      {loading ? (
        <div style={EMPTY}>Loading…</div>
      ) : stories.length === 0 ? (
        <div style={EMPTY}>
          No stories yet. <Link href="/admin/stories/new" style={{ color: '#1E90FF' }}>Post one →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
          {stories.map(s => {
            const expired = isExpired(s);
            return (
              <div key={s.id} style={{ ...CARD, opacity: expired ? 0.5 : 1 }}>
                <div style={{ position: 'relative', aspectRatio: '9/16', background: '#131320', borderRadius: '14px', overflow: 'hidden' }}>
                  {s.thumbnailUrl ? (
                    <img src={s.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video src={s.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  )}
                  <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={expired ? BADGE_EXPIRED : BADGE_LIVE}>
                      {expired ? 'Expired' : 'Live'}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: '4px' }}>
                      {s.caption}
                    </div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>{timeLeft(s)}</div>
                  </div>
                </div>
                <button onClick={() => handleDelete(s.id)} style={BTN_DELETE}>Delete</button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const PAGE        = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' };
const HEADER      = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' };
const EYEBROW     = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING     = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1 };
const BTN_PRIMARY = { display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', padding: '11px 20px', borderRadius: '100px', textDecoration: 'none' };
const CARD        = { display: 'flex', flexDirection: 'column', gap: '8px' };
const BADGE_LIVE  = { fontSize: '8px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(63,202,122,0.9)', color: '#fff', padding: '3px 8px', borderRadius: '100px' };
const BADGE_EXPIRED = { fontSize: '8px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.9)', color: '#fff', padding: '3px 8px', borderRadius: '100px' };
const BTN_DELETE  = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f97070', padding: '8px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer' };
const EMPTY       = { padding: '3rem', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 };
