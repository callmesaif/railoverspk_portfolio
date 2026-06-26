import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';

const TAGS = [
  { label: 'Filmmaker',        accent: true  },
  { label: 'Train Reviewer',   accent: true  },
  { label: 'Pakistan Railways', accent: false },
  { label: 'Travel Blogger',   accent: false },
  { label: 'YouTube Creator',  accent: false },
  { label: 'Next.js Dev',      accent: false },
];

const TIMELINE = [
  {
    year: '2019',
    title: 'First vlog posted',
    desc: 'Uploaded the first railway video — a raw ride on the Khyber Mail. 200 views. Kept going anyway.',
  },
  {
    year: '2021',
    title: 'Channel hits 10K subscribers',
    desc: 'The Quetta night journey blew up, bringing the first real wave of audience. The brand took shape.',
  },
  {
    year: '2023',
    title: 'Launched RaiLoversPK.com',
    desc: "Built the full Next.js + Firebase platform: train scorecards, live journey planner, dynamic offers — Pakistan's first railway review hub.",
  },
  {
    year: '2026',
    title: '6M+ views, 80+ reviews',
    desc: 'Now Pakistan\'s most watched railway content creator. Still riding every route, still rating every train.',
  },
];

export const metadata = {
  title: 'About — RaiLoversPK',
  description: "The story behind Pakistan's leading railway vlogger and filmmaker.",
};

export default function AboutPage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Nav />

      {/* ── Hero split ───────────────────────────── */}
      <section
        className="container animate-in"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '5rem',
          alignItems: 'center',
          padding: '5rem 2.5rem',
        }}
      >
        {/* Portrait */}
        <div
          style={{
            position: 'relative',
            borderRadius: '28px',
            overflow: 'hidden',
            aspectRatio: '4 / 5',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
          }}
        >
          <Image
            src="/images/portrait.jpg"
            alt="RaiLoversPK creator"
            fill
            style={{ objectFit: 'cover' }}
          />

          {/* Live badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              background: 'rgba(5,5,8,0.82)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border2)',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent)',
                flexShrink: 0,
                animation: 'pulse-dot 1.4s ease-in-out infinite',
              }}
            />
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                RaiLoversPK · Creator
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                Pakistan's Railway Vlogger
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            The Story
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(3rem, 7vw, 5.5rem)',
              lineHeight: 0.9,
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            BORN ON
            <br />
            THE{' '}
            <span style={{ color: 'var(--accent)' }}>TRACKS</span>
          </h1>

          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.8,
              color: 'var(--muted)',
              marginBottom: '1rem',
            }}
          >
            I'm a filmmaker and railway enthusiast from Pakistan, documenting
            the soul of Pakistan Railways through cinematic video and honest
            reviews. What started as a passion for trains became a movement —
            millions of people now travel smarter because of this work.
          </p>
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.8,
              color: 'var(--muted)',
              marginBottom: '2rem',
            }}
          >
            From overnight economy journeys to first-class sleepers, I've
            ridden every major route and rated every major train. RaiLoversPK
            is the definitive guide to Pakistan by rail.
          </p>

          {/* Tags */}
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '2rem' }}
          >
            {TAGS.map(({ label, accent }) => (
              <span
                key={label}
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '7px 16px',
                  borderRadius: '100px',
                  border: accent
                    ? '1px solid var(--accent-border)'
                    : '1px solid var(--border2)',
                  color: accent ? 'var(--accent)' : 'var(--muted)',
                  background: accent ? 'var(--accent-dim)' : 'transparent',
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <Link href="/contact" className="btn-primary">
            Work With Me
          </Link>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────── */}
      <section
        className="container"
        style={{ padding: '0 2.5rem 5rem' }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <div className="sec-label">Journey</div>
          <h2 className="sec-title">Timeline</h2>
        </div>

        {TIMELINE.map(({ year, title, desc }) => (
          <div
            key={year}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: '2rem',
              padding: '2rem 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              className="font-display"
              style={{ fontSize: '2rem', color: 'var(--accent)', lineHeight: 1 }}
            >
              {year}
            </div>
            <div>
              <div
                style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}
              >
                {title}
              </div>
              <div
                style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}
              >
                {desc}
              </div>
            </div>
          </div>
        ))}
      </section>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </main>
  );
}
