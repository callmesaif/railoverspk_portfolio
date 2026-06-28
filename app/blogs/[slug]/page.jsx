'use client';
import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BlogPostPage({ params }) {
  const { slug }        = use(params);
  const [post, setPost] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getDoc(doc(db, 'posts', slug))
      .then(snap => {
        if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav /><div style={LOADING}>Loading post…</div>
    </main>
  );

  if (notFound || !post) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>Post not found. <Link href="/blogs" style={{ color: 'var(--accent)' }}>← Back to Blog</Link></div>
    </main>
  );

  const getYouTubeId = (url) => {
    if (!url) return null;
    const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (short) return short[1];
    const long  = url.match(/[?&v=\/embed\/]([a-zA-Z0-9_-]{11})/);
    return long ? long[1] : null;
  };
  const videoId = getYouTubeId(post.videoUrl);

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* ── Cover image — contain so full image shows regardless of ratio ── */}
      {post.coverImage && (
        <div style={{
          width: '100%',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}>
          <img
            src={post.coverImage}
            alt={post.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      )}

      {/* ── Article ── */}
      <article style={{ maxWidth: '780px', margin: '0 auto', padding: '3rem 2.5rem 5rem', position: 'relative', zIndex: 2 }}>
        <Link href="/blogs" style={BACK_LINK}>← Back to Blog</Link>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
          {(post.tags || []).map(t => <span key={t} style={TAG}>{t}</span>)}
        </div>

        {/* Title */}
        <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.92, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>{post.date}</span>
          {post.videoUrl && <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.15)', color: '#f97070', border: '1px solid rgba(239,68,68,0.25)', padding: '3px 10px', borderRadius: '100px' }}>▶ Video included</span>}
        </div>

        <div style={DIVIDER} />

        {/* YouTube embed */}
        {videoId && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f97070' }}>▶</span> Watch the Video
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ fontSize: '15px', lineHeight: 1.85, color: 'rgba(255,255,255,0.75)' }}>
          {(post.content || '').split('\n').map((para, i) =>
            para.trim() ? <p key={i} style={{ marginBottom: '1.25rem' }}>{para}</p> : <br key={i} />
          )}
        </div>

        <div style={DIVIDER} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/blogs" style={BTN_BACK}>← All Posts</Link>
          {post.videoUrl && (
            <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" style={BTN_YT}>Watch on YouTube ↗</a>
          )}
        </div>
      </article>
    </main>
  );
}

const TAG       = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', padding: '4px 11px', borderRadius: '100px' };
const DIVIDER   = { height: '1px', background: 'var(--border)', margin: '2rem 0' };
const BACK_LINK = { display: 'inline-flex', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', marginBottom: '2rem' };
const BTN_BACK  = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', padding: '11px 20px', borderRadius: '100px', border: '1px solid var(--border2)' };
const BTN_YT    = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#ff0000', textDecoration: 'none', padding: '11px 22px', borderRadius: '100px' };
const LOADING   = { padding: '5rem 2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '14px', fontFamily: "'Inter', sans-serif" };
