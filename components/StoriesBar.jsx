'use client';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import StoryViewer from './StoryViewer';

export default function StoriesBar() {
  const [stories, setStories] = useState([]);
  const [activeIdx, setActiveIdx] = useState(null); // null = closed

  useEffect(() => {
    // Only fetch stories that haven't expired yet
    const q = query(
      collection(db, 'stories'),
      where('published', '==', true),
      where('expiresAt', '>', Timestamp.now())
    );
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setStories(data);
    }, () => {
      // If composite index isn't ready yet, fail silently — bar just won't show
      setStories([]);
    });
    return unsub;
  }, []);

  if (stories.length === 0) return null;

  return (
    <>
      <div style={{ padding: '1.5rem 2.5rem', overflowX: 'auto' }} className="container">
        <div style={{ display: 'flex', gap: '16px' }}>
          {stories.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveIdx(i)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', padding: '2.5px',
                background: 'linear-gradient(135deg, var(--accent), #ff0050)',
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                  border: '2.5px solid var(--bg)', background: 'var(--bg3)',
                }}>
                  {s.thumbnailUrl ? (
                    <img src={s.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🚂</div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.authorName || 'RaiLoversPK'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeIdx !== null && (
        <StoryViewer
          stories={stories}
          startIdx={activeIdx}
          onClose={() => setActiveIdx(null)}
        />
      )}
    </>
  );
}
