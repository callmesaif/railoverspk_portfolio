'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const STATS = [
  { num: '2M+',  label: 'Total Views'    },
  { num: '10+',  label: 'Train Reviews'  },
  { num: '6.5K', label: 'Subscribers'    },
  { num: '5+',   label: 'Years On Track' },
];

const VLOGS = [
  {
    id: 'karakoram-express',
    title: 'Lahore to Khanewal (لاہور سے کراچی کا سفر شدید گرمی میں) Karakoram Express',
    meta: '42K views · Karakoram Express',
    videoUrl: 'https://youtu.be/nHADX1DrIjU?si=vn5xP9usAntTXy27',
    badge: 'Most Viewed',
    featured: true,
  },
  {
    id: 'green-line',
    title: 'Bahawalpur to Lahore (بارش نے سفر کو چار چاند لگا دئیے) Greenline Express',
    meta: '24.5K views',
    videoUrl: 'https://youtu.be/_JX2ChSzRcE?si=E-0dQUmk4-4QWkLD',
  },
  {
    id: 'shalimar-express',
    title: 'Shalimar Express Train Journey | Lahore to Karachi | Shalimar Express Parlor Car Review 🔥',
    meta: '2K views',
    videoUrl: 'https://youtu.be/dhocWOcixiU',
  },
  {
    id: 'sialkot-express',
    title: 'Sialkot Express Journey: Lahore to Wazirabad | Pakistan Railways Vlog | Branch Line Train Journey',
    meta: '1K views',
    videoUrl: 'https://youtu.be/vdBMpDOR8VU',
  },
];

function getYtId(url) {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  const long = url.match(/[?&v=\/embed\/]([a-zA-Z0-9_-]{11})/);
  return long ? long[1] : null;
}

function getYtThumb(url, quality = 'hqdefault') {
  const id = getYtId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
}

export default function HomePage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(
          collection(db, 'posts'),
          where('published', '==', true),
          limit(3)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setPosts(data);
      } catch (e) {
        console.error('Posts fetch error:', e);
      }
    }
    fetchPosts();
  }, []);

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Nav />

      {/* ── Hero ─────────────────────────────────── */}
      <section className="rl-hero">
        <div className="rl-hero-bg">
          <Image
            src="https://i.ibb.co/21wQ5B9Q/hero-bg.webp"
            alt="Pakistan Railways"
            fill
            priority
            sizes="100vw"
            quality={75}
            style={{ objectFit: 'cover', opacity: 0.55 }}
          />
          <div className="rl-hero-overlay" />
        </div>

        <div className="rl-hero-content container">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            Pakistan Railway Vlogger · Filmmaker
          </div>
          <h1
            className="font-display"
            style={{ fontSize: 'clamp(4rem, 13vw, 9.5rem)', lineHeight: 0.88, textTransform: 'uppercase', marginBottom: '1.5rem' }}
          >
            THE RAILS<br />ARE MY{' '}
            <span style={{ color: 'var(--accent)' }}>CANVAS</span>
          </h1>
          <p style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--muted)', maxWidth: '420px', marginBottom: '2rem' }}>
            Documenting Pakistan's railway heritage through cinematic storytelling. Every journey, every locomotive, every story — captured.
          </p>
          <div className="rl-hero-actions">
            <Link href="/about" className="btn-ghost">About Me</Link>
          </div>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────── */}
      <Ticker />

      {/* ── Stats ────────────────────────────────── */}
      <div className="container">
        <div className="rl-stats-grid">
          {STATS.map(({ num, label }) => (
            <div key={label} className="rl-stat-box">
              <div className="rl-stat-num">{num}</div>
              <div className="rl-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured Vlogs ───────────────────────── */}
      <section className="container" style={{ padding: '4rem 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="sec-label">Featured</div>
            <h2 className="sec-title">Top Vlogs</h2>
          </div>
          <Link href="/blogs" style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            All blogs →
          </Link>
        </div>
        <div className="rl-vlogs-grid">
          {VLOGS.map((v) => <VlogCard key={v.id} vlog={v} />)}
        </div>
      </section>

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
    </main>
  );
}

/* ── VlogCard ───────────────────────────────────── */
function VlogCard({ vlog }) {
  const isFeatured = vlog.featured;
  const ytId       = getYtId(vlog.videoUrl);
  const thumb      = getYtThumb(vlog.videoUrl, isFeatured ? 'maxresdefault' : 'hqdefault');
  const href       = vlog.videoUrl || '#';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        gridColumn: isFeatured ? '1 / 3' : undefined,
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        display: 'block',
        aspectRatio: isFeatured ? '2 / 1' : '16 / 9',
        textDecoration: 'none',
        transition: 'transform 0.25s, border-color 0.25s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(255,0,0,0.5)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {thumb && (
        <img
          src={thumb}
          alt={vlog.title}
          loading={isFeatured ? 'eager' : 'lazy'}
          decoding="async"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.05) 55%)' }} />

      {vlog.badge && (
        <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--accent)', color: '#fff', padding: '4px 11px', borderRadius: '100px' }}>
          {vlog.badge}
        </span>
      )}

      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: isFeatured ? '56px' : '40px', height: isFeatured ? '56px' : '40px', borderRadius: '50%', background: 'rgba(255,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(255,0,0,0.4)' }}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="white"><path d="M5 3l9 5-9 5V3z" /></svg>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
        <div style={{ fontSize: isFeatured ? '18px' : '13px', fontWeight: 700, lineHeight: 1.3, marginBottom: '4px', color: '#fff' }}>{vlog.title}</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {vlog.meta}
          {ytId && <span style={{ color: '#f97070', fontWeight: 700 }}>▶ YouTube</span>}
        </div>
      </div>
    </a>
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
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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