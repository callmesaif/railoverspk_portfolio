'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import ServiceAlerts from '@/components/home/ServiceAlerts';
import LazyOnView from '@/components/LazyOnView';

// Below-the-fold sections: their code, data and images load only when they are about to be scrolled to.
const LatestVlogsSection = dynamic(() => import('@/components/home/LatestVlogsSection'));
const TopRatedSection    = dynamic(() => import('@/components/home/TopRatedSection'));
const RecentPostsSection = dynamic(() => import('@/components/home/RecentPostsSection'));

const STATS = [
  { num: '2M+',  label: 'Total Views'    },
  { num: '10+',  label: 'Train Reviews'  },
  { num: '6.5K', label: 'Subscribers'    },
  { num: '7+',   label: 'Years On Track' },
];

export default function HomePage() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Nav />

      {/* ── Service Alerts Banner (top) ──────────── */}
      <ServiceAlerts />

      {/* ── Hero ─────────────────────────────────── */}
      <section className="rl-hero">
        <div className="rl-hero-bg">
          <Image
            src="/images/hero-bg.webp"
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

      {/* ── Below the fold (loaded on scroll) ────── */}
      <LazyOnView minHeight={480}><LatestVlogsSection /></LazyOnView>
      <LazyOnView minHeight={420}><TopRatedSection /></LazyOnView>
      <LazyOnView minHeight={560}><RecentPostsSection /></LazyOnView>
    </main>
  );
}
