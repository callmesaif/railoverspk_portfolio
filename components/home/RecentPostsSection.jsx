'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import OptimizedImage from '@/components/OptimizedImage';

export default function RecentPostsSection() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        // Newest few only (not the whole collection) — drafts are filtered out below
        const q = query(collection(db, 'posts'), orderBy('date', 'desc'), limit(8));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.published);
        setPosts(data.slice(0, 3));
      } catch (e) {
        console.error('Posts fetch error:', e);
      }
    }
    fetchPosts();
  }, []);

  return (
    <>
      {/* ── Recent Posts ─────────────────────────── */}
      <section className="container" style={{ padding: '0 2.5rem 5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="sec-label">Writing</div>
          <h2 className="sec-title">Recent Posts</h2>
        </div>

        {posts.length === 0 ? (
          <div className="rl-posts-grid">
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', height: '240px', opacity: 0.5 }} />
            ))}
          </div>
        ) : (
          <div className="rl-posts-grid">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/blogs" style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', textDecoration: 'none' }}>
            View All Posts →
          </Link>
        </div>
      </section>
    </>
  );
}

/* ── PostCard ────────────────────────────────────── */
function PostCard({ post }) {
  return (
    <Link
      href={`/blogs/${post.id}`}
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', textDecoration: 'none', display: 'block', color: 'var(--text)', transition: 'transform 0.2s, border-color 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{ height: '150px', overflow: 'hidden', position: 'relative', background: 'var(--bg3)' }}>
        {post.coverImage ? (
          <OptimizedImage
            src={post.coverImage}
            alt={post.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 360px"
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🚂</div>
        )}
      </div>
      <div style={{ padding: '18px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {(post.tags || []).slice(0, 2).map(t => (
            <span key={t} style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', padding: '3px 9px', borderRadius: '100px' }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.35, marginBottom: '8px', color: 'var(--text)' }}>
          {post.title}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 500 }}>
          {post.date}
        </div>
      </div>
    </Link>
  );
}