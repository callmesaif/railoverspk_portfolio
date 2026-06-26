'use client';
import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BlogPostPage({ params }) {
  const { slug } = use(params);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getDoc(doc(db, 'posts', slug))
      .then(snap => {
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching post:', err);
        setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>Loading post…</div>
    </main>
  );

  if (notFound || !post) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>
        Post not found.{' '}
        <Link href="/blogs" style={{ color: 'var(--accent)' }}>← Back to Blog</Link>
      </div>
    </main>
  );

  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };
  const videoId = getYouTubeId(post.videoUrl);

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* Cover image */}
      {post.coverImage && (
        <div style={{ position: 'relative', height: '480px', overflow: 'hidden' }}>
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            style={{ objectFit: 'cover', opacity: 0.65 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,8,0.1) 0%, rgba(5,5,8,0.6) 60%, #050508 100%)' }} />
        </div>
      )}

      {/* Article */}
      <article
        className="container"
        style={{
          maxWidth: '780px',
          padding: post.coverImage ? '0 2.5rem 5rem' : '4rem 2.5rem 5rem',
          marginTop: post.coverImage ? '-120px' : 0,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Back link */}
        <Link href="/blogs" style={BACK_LINK}>← Back to Blog</Link>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
          {(post.tags || []).map(t => (
            <span key={t} style={TAG}>{t}</span>
          ))}
        </div>

        {/* Title */}
        <h1 className="font-display" style={TITLE}>{post.title}</h1>

        {/* Meta */}
        <div style={META_ROW}>
          <span style={META_ITEM}>{post.date}</span>
          {post.videoUrl && <span style={{ ...META_ITEM, color: '#f97070' }}>▶ Video included</span>}
        </div>

        <div style={DIVIDER} />

        {/* YouTube embed */}
        {videoId && (
          <div style={VIDEO_WRAP}>
            <div style={VIDEO_LABEL}><span style={{ color: '#f97070' }}>▶</span> Watch the Video</div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '16px', overflow: 'hidden', background: '#000' }}>
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
        <div style={CONTENT}>
          {(post.content || '').split('\n').map((para, i) =>
            para.trim()
              ? <p key={i} style={{ marginBottom: '1.25rem' }}>{para}</p>
              : <br key={i} />
          )}
        </div>

        <div style={DIVIDER} />

        {/* Footer nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/blogs" style={BTN_BACK}>← All Posts</Link>
          {post.videoUrl && (
            <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" style={BTN_YT}>
              Watch on YouTube ↗
            </a>
          )}
        </div>
      </article>
    </main>
  );
}

const TAG       = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', padding: '4px 11px', borderRadius: '100px' };
const TITLE     = { fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 0.92, textTransform: 'uppercase', marginBottom: '1.25rem' };
const META_ROW  = { display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.5rem' };
const META_ITEM = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em' };
const DIVIDER   = { height: '1px', background: 'var(--border)', margin: '2rem 0' };
const VIDEO_WRAP  = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' };
const VIDEO_LABEL = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' };
const CONTENT   = { fontSize: '15px', lineHeight: 1.85, color: 'rgba(255,255,255,0.75)', fontWeight: 400 };
const BACK_LINK = { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', marginBottom: '2rem' };
const BTN_BACK  = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', padding: '11px 20px', borderRadius: '100px', border: '1px solid var(--border2)' };
const BTN_YT    = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#ff0000', textDecoration: 'none', padding: '11px 22px', borderRadius: '100px' };
const LOADING   = { padding: '5rem 2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '14px', fontFamily: "'Inter', sans-serif" };
