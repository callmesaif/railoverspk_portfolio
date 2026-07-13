'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function getYouTubeId(url) {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  const long  = url.match(/[?&v=\/embed\/]([a-zA-Z0-9_-]{11})/);
  return long ? long[1] : null;
}

export default function BlogClient({ params }) {
  const { slug }        = use(params);
  const [post, setPost] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

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
      <Nav />
      <div style={LOADING}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        Loading post…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );

  if (notFound || !post) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>Post not found. <Link href="/blogs" style={{ color: 'var(--accent)' }}>← Back to Blog</Link></div>
    </main>
  );

  const videoId = getYouTubeId(post.videoUrl);
  const isHTML  = post.content?.trim().startsWith('<');

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* Cover image — fixed aspect ratio prevents CLS */}
      {post.coverImage && (
        <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: '70vh', overflow: 'hidden', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={post.coverImage}
            alt={post.title}
            width={1200}
            height={675}
            fetchPriority="high"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>
      )}

      <article style={{ maxWidth: '780px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <Link href="/blogs" style={BACK_LINK}>← Back to Blog</Link>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
          {(post.tags || []).map(t => <span key={t} style={TAG}>{t}</span>)}
        </div>

        {/* Title */}
        <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 0.95, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>{post.date}</span>
          {post.videoUrl && (
            <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.15)', color: '#f97070', border: '1px solid rgba(239,68,68,0.25)', padding: '3px 10px', borderRadius: '100px' }}>
              ▶ Video included
            </span>
          )}
        </div>

        <div style={DIVIDER} />

        {/* YouTube — lazy click-to-play (saves ~400KB on mobile) */}
        {videoId && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f97070' }}>▶</span> Watch the Video
            </div>
            {showVideo ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            ) : (
              <div onClick={() => setShowVideo(true)} style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', background: '#000', cursor: 'pointer' }}>
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt="Video thumbnail"
                  loading="lazy"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(255,0,0,0.5)' }}>
                    <svg width="24" height="24" viewBox="0 0 16 16" fill="white"><path d="M5 3l9 5-9 5V3z" /></svg>
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                  Click to play
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content — HTML or plain text */}
        {isHTML ? (
          <>
            <div className="rl-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
            <style>{`
              .rl-post-content { font-size: 15px; line-height: 1.85; color: rgba(255,255,255,0.75); }
              .rl-post-content p { margin-bottom: 1.1rem; }
              .rl-post-content h2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(1.5rem,4vw,2rem); text-transform: uppercase; margin: 2rem 0 0.75rem; color: #fff; line-height: 1; }
              .rl-post-content h3 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(1.2rem,3vw,1.5rem); text-transform: uppercase; margin: 1.5rem 0 0.5rem; color: #fff; }
              .rl-post-content h4 { font-size: 1rem; font-weight: 700; margin: 1.25rem 0 0.4rem; color: #fff; }
              .rl-post-content strong { color: #fff; font-weight: 700; }
              .rl-post-content em { font-style: italic; }
              .rl-post-content u { text-decoration: underline; }
              .rl-post-content s { text-decoration: line-through; opacity: 0.6; }
              .rl-post-content ul { padding-left: 1.5rem; margin: 0.75rem 0; list-style: disc; }
              .rl-post-content ol { padding-left: 1.5rem; margin: 0.75rem 0; list-style: decimal; }
              .rl-post-content li { margin-bottom: 0.35rem; }
              .rl-post-content blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; margin: 1.25rem 0; color: rgba(255,255,255,0.55); font-style: italic; }
              .rl-post-content code { background: rgba(255,255,255,0.08); border-radius: 4px; padding: 2px 6px; font-family: monospace; font-size: 13px; color: var(--accent); }
              .rl-post-content pre { background: #050508; border-radius: 10px; padding: 1rem; margin: 1rem 0; overflow-x: auto; }
              .rl-post-content pre code { background: none; color: #3fca7a; padding: 0; }
              .rl-post-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0; }
              .rl-post-content a { color: var(--accent); text-decoration: underline; }
              .rl-post-content img { max-width: 100%; height: auto; border-radius: 10px; margin: 1rem 0; display: block; }
              .rl-post-content table { border-collapse: collapse; width: 100%; margin: 1rem 0; display: block; overflow-x: auto; }
              .rl-post-content th { background: rgba(30,144,255,0.12); border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; font-weight: 700; font-size: 12px; text-transform: uppercase; color: var(--accent); text-align: left; }
              .rl-post-content td { border: 1px solid rgba(255,255,255,0.08); padding: 8px 12px; font-size: 13px; }
              .rl-post-content tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
              @media (max-width: 768px) {
                .rl-post-content { font-size: 14px; }
                .rl-post-content table { font-size: 12px; }
              }
            `}</style>
          </>
        ) : (
          <div style={{ fontSize: '15px', lineHeight: 1.85, color: 'rgba(255,255,255,0.75)' }}>
            {(post.content || '').split('\n').map((para, i) =>
              para.trim() ? <p key={i} style={{ marginBottom: '1.25rem' }}>{para}</p> : <br key={i} />
            )}
          </div>
        )}

        <div style={DIVIDER} />

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
const DIVIDER   = { height: '1px', background: 'var(--border)', margin: '2rem 0' };
const BACK_LINK = { display: 'inline-flex', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', marginBottom: '2rem' };
const BTN_BACK  = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', padding: '11px 20px', borderRadius: '100px', border: '1px solid var(--border2)' };
const BTN_YT    = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#ff0000', textDecoration: 'none', padding: '11px 22px', borderRadius: '100px' };
const LOADING   = { padding: '5rem 2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '14px', fontFamily: "'Inter', sans-serif" };