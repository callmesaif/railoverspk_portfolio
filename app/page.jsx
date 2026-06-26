'use client';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';

const STATS = [
  { num: '2M+',  label: 'Total Views'    },
  { num: '10+',  label: 'Train Reviews'  },
  { num: '6K',  label: 'Subscribers'    },
  { num: '5+',   label: 'Years On Track' },
];

// ── Paste your YouTube URLs in videoUrl fields below ──────────────────────────
// Thumbnail is auto-fetched from YouTube — no need to upload images manually!
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

// Extract YouTube video ID — handles youtu.be/ID?si=xxx and youtube.com/watch?v=ID
function getYtId(url) {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  const long = url.match(/[?&v=\/embed\/]([a-zA-Z0-9_-]{11})/);
  if (long) return long[1];
  return null;
}

// Get YouTube thumbnail — maxresdefault for featured, hqdefault for smaller cards
function getYtThumb(url, quality = 'hqdefault') {
  const id = getYtId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : '/images/placeholder.webp';
}

const POSTS = [
  {
    tag: 'Train Review',
    title: 'Pakistan Express: The Ultimate Long-Haul Experience',
    date: 'June 10, 2026',
    img: '/images/post-pak-express.webp',
    slug: 'pakistan-express-review',
  },
  {
    tag: 'Journey',
    title: 'Northern Routes: The Most Scenic Rides in Pakistan',
    date: 'May 28, 2026',
    img: '/images/post-northern.webp',
    slug: 'northern-routes',
  },
  {
    tag: 'Guide',
    title: 'How to Book Pakistan Railways Tickets in 2026',
    date: 'May 15, 2026',
    img: '/images/post-booking.webp',
    slug: 'booking-guide-2026',
  },
];

export default function HomePage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Nav />

      {/* ── Hero ─────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '5rem',
          overflow: 'hidden',
        }}
      >
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image
            src="/images/hero-bg.webp"
            alt="Pakistan Railways"
            fill
            priority
            style={{ objectFit: 'cover', opacity: 0.55 }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, rgba(5,5,8,0.15) 0%, rgba(5,5,8,0.55) 55%, #050508 100%)',
            }}
          />
        </div>

        <div className="container animate-in" style={{ position: 'relative', zIndex: 2 }}>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            Pakistan Railway Vlogger · Filmmaker
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(4.5rem, 13vw, 9.5rem)',
              lineHeight: 0.88,
              textTransform: 'uppercase',
              marginBottom: '1.75rem',
            }}
          >
            THE RAILS
            <br />
            ARE MY{' '}
            <span style={{ color: 'var(--accent)' }}>CANVAS</span>
          </h1>

          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.75,
              color: 'var(--muted)',
              maxWidth: '420px',
              marginBottom: '2.5rem',
            }}
          >
            Documenting Pakistan's railway heritage through cinematic
            storytelling. Every journey, every locomotive, every story —
            captured.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/about" className="btn-ghost">
              About Me
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ticker ───────────────────────────────── */}
      <Ticker />

      {/* ── Stats row ────────────────────────────── */}
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'var(--border)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            overflow: 'hidden',
            margin: '3rem 0',
          }}
        >
          {STATS.map(({ num, label }) => (
            <div
              key={label}
              style={{
                background: 'var(--bg2)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
              }}
            >
              <div
                className="font-display"
                style={{ fontSize: '3.2rem', color: 'var(--accent)', lineHeight: 1 }}
              >
                {num}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginTop: '6px',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured Vlogs ───────────────────────── */}
      <section className="container" style={{ padding: '4rem 2.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '2.5rem',
          }}
        >
          <div>
            <div className="sec-label">Featured</div>
            <h2 className="sec-title">Top Vlogs</h2>
          </div>
          <Link
            href="/blogs"
            style={{
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            All blogs →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}
        >
          {VLOGS.map((v) => (
            <VlogCard key={v.id} vlog={v} />
          ))}
        </div>
      </section>

      {/* ── Recent Posts ─────────────────────────── */}
      <section className="container" style={{ padding: '0 2.5rem 5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="sec-label">Writing</div>
          <h2 className="sec-title">Recent Posts</h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
          }}
        >
          {POSTS.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </section>
    </main>
  );
}

/* ── Sub-components ─────────────────────────────── */

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
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'rgba(255,0,0,0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* YouTube Thumbnail — auto fetched */}
      <Image
        src={thumb}
        alt={vlog.title}
        fill
        style={{ objectFit: 'cover' }}
        unoptimized
      />

      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.05) 55%)' }} />

      {/* Badge */}
      {vlog.badge && (
        <span style={{
          position: 'absolute', top: '12px', left: '12px',
          fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase',
          background: 'var(--accent)', color: '#fff', padding: '4px 11px', borderRadius: '100px',
        }}>
          {vlog.badge}
        </span>
      )}

      {/* YouTube play button */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isFeatured ? '56px' : '40px',
        height: isFeatured ? '56px' : '40px',
        borderRadius: '50%',
        background: 'rgba(255,0,0,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(255,0,0,0.4)',
        transition: 'transform 0.2s, background 0.2s',
      }}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
          <path d="M5 3l9 5-9 5V3z" />
        </svg>
      </div>

      {/* Info */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
        <div style={{ fontSize: isFeatured ? '18px' : '13px', fontWeight: 700, lineHeight: 1.3, marginBottom: '4px', color: '#fff' }}>
          {vlog.title}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {vlog.meta}
          {ytId && <span style={{ color: '#f97070', fontWeight: 700 }}>▶ YouTube</span>}
        </div>
      </div>
    </a>
  );
}

function PostCard({ post }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
        textDecoration: 'none',
        display: 'block',
        transition: 'transform 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--border2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
        <Image src={post.img} alt={post.title} fill style={{ objectFit: 'cover' }} />
      </div>
      <div style={{ padding: '18px' }}>
        <div
          style={{
            fontSize: '9px',
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '8px',
          }}
        >
          {post.tag}
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            lineHeight: 1.35,
            marginBottom: '8px',
            color: 'var(--text)',
          }}
        >
          {post.title}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 500 }}>
          {post.date}
        </div>
      </div>
    </Link>
  );
}