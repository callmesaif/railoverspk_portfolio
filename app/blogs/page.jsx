'use client';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BlogPage() {
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [activeTag,  setActiveTag]  = useState('All');

  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('published', '==', true)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort by date client-side — avoids needing a Firestore composite index
      data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setPosts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Collect all unique tags across posts
  const allTags = useMemo(() => {
    const tags = new Set();
    posts.forEach(p => (p.tags || []).forEach(t => tags.add(t)));
    return ['All', ...Array.from(tags)];
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchSearch =
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchTag = activeTag === 'All' || (p.tags || []).includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [posts, search, activeTag]);

  // Split: first post is hero, rest are grid
  const [hero, ...rest] = filtered;

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* ── Header ───────────────────────────────── */}
      <div className="container" style={{ padding: '4rem 2.5rem 2.5rem' }}>
        <div className="eyebrow"><span className="eyebrow-line" />Writing & Reviews</div>
        <h1
          className="font-display"
          style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '2rem' }}
        >
          THE <span style={{ color: 'var(--accent)' }}>BLOG</span>
        </h1>

        {/* Search */}
        <div style={SEARCH_WRAP}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--accent)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts or tags…"
            style={SEARCH_INPUT}
          />
          {search && (
            <button onClick={() => setSearch('')} style={CLEAR_BTN}>✕</button>
          )}
        </div>

        {/* Tag filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem' }}>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '7px 16px', borderRadius: '100px', cursor: 'pointer', border: 'none',
                background: activeTag === tag ? 'var(--accent)' : 'var(--bg2)',
                color: activeTag === tag ? '#fff' : 'var(--muted)',
                outline: activeTag === tag ? 'none' : '1px solid var(--border2)',
                transition: 'all 0.2s',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────── */}
      <div className="container" style={{ padding: '0 2.5rem 5rem' }}>

        {loading && <LoadingGrid />}

        {!loading && filtered.length === 0 && (
          <div style={EMPTY}>
            {search || activeTag !== 'All'
              ? 'No posts match your search.'
              : 'No posts published yet. Check back soon!'}
          </div>
        )}

        {!loading && hero && (
          <>
            {/* Hero post */}
            <Link href={`/blogs/${hero.id}`} style={HERO_CARD}>
              <div style={{ position: 'relative', flex: '0 0 55%', minHeight: '340px' }}>
                {hero.coverImage ? (
                  <Image src={hero.coverImage} alt={hero.title} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--bg3)' }} />
                )}
                <div style={HERO_IMG_OVERLAY} />
              </div>
              <div style={HERO_BODY}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                  {(hero.tags || []).map(t => <TagPill key={t} label={t} />)}
                </div>
                <h2 style={HERO_TITLE}>{hero.title}</h2>
                <p style={HERO_EXCERPT}>
                  {hero.content?.slice(0, 160)}{hero.content?.length > 160 ? '…' : ''}
                </p>
                <div style={HERO_META}>
                  <span>{hero.date}</span>
                  {hero.videoUrl && <span style={VIDEO_BADGE}>▶ Video</span>}
                </div>
                <span style={READ_MORE}>Read Post →</span>
              </div>
            </Link>

            {/* Rest grid */}
            {rest.length > 0 && (
              <div style={POSTS_GRID}>
                {rest.map(post => <PostCard key={post.id} post={post} />)}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

/* ── Sub-components ──────────────────────────── */

function PostCard({ post }) {
  return (
    <Link href={`/blogs/${post.id}`} style={CARD}>
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
        {post.coverImage ? (
          <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: 'cover', transition: 'transform 0.4s' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🚂</div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
        {post.videoUrl && (
          <div style={CARD_VIDEO_DOT}>▶ Video</div>
        )}
      </div>
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
          {(post.tags || []).slice(0, 2).map(t => <TagPill key={t} label={t} />)}
        </div>
        <h3 style={CARD_TITLE}>{post.title}</h3>
        <p style={CARD_EXCERPT}>{post.content?.slice(0, 100)}{post.content?.length > 100 ? '…' : ''}</p>
        <div style={CARD_META}>{post.date}</div>
      </div>
    </Link>
  );
}

function TagPill({ label }) {
  return (
    <span style={{
      fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase',
      color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
      padding: '3px 10px', borderRadius: '100px',
    }}>
      {label}
    </span>
  );
}

function LoadingGrid() {
  return (
    <div style={POSTS_GRID}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ ...CARD, animation: 'pulse 1.5s ease-in-out infinite' }}>
          <div style={{ height: '180px', background: 'var(--bg3)' }} />
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ height: '10px', background: 'var(--bg3)', borderRadius: '4px', width: '60%' }} />
            <div style={{ height: '16px', background: 'var(--bg3)', borderRadius: '4px' }} />
            <div style={{ height: '12px', background: 'var(--bg3)', borderRadius: '4px', width: '80%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Styles ──────────────────────────────────── */
const SEARCH_WRAP  = { display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '100px', padding: '13px 20px', maxWidth: '520px' };
const SEARCH_INPUT = { background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 500, flex: 1 };
const CLEAR_BTN    = { background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '13px', padding: '0 4px' };

const HERO_CARD    = { display: 'flex', borderRadius: '24px', overflow: 'hidden', background: 'var(--bg2)', border: '1px solid var(--border)', marginBottom: '14px', textDecoration: 'none', color: 'var(--text)', transition: 'border-color 0.2s' };
const HERO_IMG_OVERLAY = { position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 60%)' };
const HERO_BODY    = { flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const HERO_TITLE   = { fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', textTransform: 'uppercase', lineHeight: 1, marginBottom: '1rem' };
const HERO_EXCERPT = { fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem', flex: 1 };
const HERO_META    = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginBottom: '1.25rem' };
const VIDEO_BADGE  = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.15)', color: '#f97070', border: '1px solid rgba(239,68,68,0.25)', padding: '3px 10px', borderRadius: '100px' };
const READ_MORE    = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)' };

const POSTS_GRID   = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' };
const CARD         = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'var(--text)', transition: 'transform 0.2s, border-color 0.2s' };
const CARD_TITLE   = { fontSize: '15px', fontWeight: 700, lineHeight: 1.35, marginBottom: '8px', color: 'var(--text)' };
const CARD_EXCERPT = { fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65, flex: 1, marginBottom: '12px' };
const CARD_META    = { fontSize: '10px', color: 'var(--muted2)', fontWeight: 600, letterSpacing: '0.08em' };
const CARD_VIDEO_DOT = { position: 'absolute', top: '10px', right: '10px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.85)', color: '#fff', padding: '4px 10px', borderRadius: '100px' };
const EMPTY        = { padding: '5rem 2rem', textAlign: 'center', fontSize: '14px', color: 'var(--muted)', fontWeight: 600, border: '1px dashed var(--border2)', borderRadius: '20px' };
