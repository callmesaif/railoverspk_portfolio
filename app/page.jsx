'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import TrainLeaderboard from '@/components/TrainLeaderboard';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LatestVlogs from '@/components/LatestVlogs';

const STATS = [
  { num: '2M+',  label: 'Total Views'    },
  { num: '10+',  label: 'Train Reviews'  },
  { num: '6.5K', label: 'Subscribers'    },
  { num: '7+',   label: 'Years On Track' },
];

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [topReviews, setTopReviews] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(
          collection(db, 'posts'),
          where('published', '==', true)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setPosts(data.slice(0, 3));
      } catch (e) {
        console.error('Posts fetch error:', e);
      }
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('published', '==', true)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTopReviews(data);
      } catch (e) {
        console.error('Reviews fetch error:', e);
      }
    }
    fetchReviews();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'daily_reports'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const today = new Date().toISOString().split('T')[0];
      setAlerts(snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => r.active && (!r.validUntil || r.validUntil >= today))
      );
    });
    return unsub;
  }, []);

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Nav />

      {/* ── Hero ─────────────────────────────────── */}
      <section className="rl-hero">
        <div className="rl-hero-bg">
          <Image
            src="https://i.ibb.co/TDLdP6kz/hero-bg.webp"
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

      {/* ── Latest Vlogs ─────────────────────────── */}
      <section className="container" style={{ padding: '4rem 2.5rem' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <div className="sec-label">🎬 YouTube</div>
            <h2 className="sec-title">Latest Vlogs</h2>
          </div>

          <a
            href="https://www.youtube.com/@railoverspkofficial"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: '#f97070',
              textDecoration: 'none', display: 'flex',
              alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
            </svg>
            View Channel →
          </a>
        </div>
        <LatestVlogs />
      </section>

      {/* ── Service Alerts ───────────────────────── */}
      {alerts.length > 0 && (
        <section className="container" style={{ padding: '0 2.5rem 2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div className="sec-label">⚠️ Live Updates</div>
            <h2 className="sec-title">Service Alerts</h2>
          </div>
          {alerts.map(alert => {
            const COLOR = {
              suspended: '#f97070', delayed: '#ffb432',
              diverted: '#a78bfa', maintenance: '#1E90FF', restored: '#3fca7a',
            }[alert.alertType] || '#ffb432';
            const ICON = {
              suspended: '🔴', delayed: '🟡', diverted: '🔀',
              maintenance: '🔧', restored: '🟢',
            }[alert.alertType] || '⚠️';
            return (
              <div key={alert.id} style={{
                background: COLOR + '0d',
                border: `1px solid ${COLOR}33`,
                borderLeft: `4px solid ${COLOR}`,
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{ICON}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                        {alert.affectedTrainNum ? `#${alert.affectedTrainNum} ` : ''}{alert.affectedTrainName}
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 900, padding: '2px 9px', borderRadius: '100px', background: COLOR + '22', color: COLOR, textTransform: 'uppercase', letterSpacing: '0.1em', border: `1px solid ${COLOR}44` }}>
                        {alert.alertType}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: alert.alternativeTrains?.length ? '8px' : 0, lineHeight: 1.6 }}>
                      {alert.reason}{alert.details ? ` — ${alert.details}` : ''}
                    </div>
                    {alert.alternativeTrains?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Alternatives:</span>
                        {alert.alternativeTrains.map(t => (
                          <span key={t.id} style={{ fontSize: '11px', fontWeight: 700, color: '#3fca7a', background: 'rgba(63,202,122,0.1)', border: '1px solid rgba(63,202,122,0.25)', padding: '3px 10px', borderRadius: '100px' }}>
                            🚆 {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{alert.date}</span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ── Top Rated Trains (Leaderboard) ───────── */}
      {topReviews.length > 0 && (
        <section className="container" style={{ padding: '0 2.5rem 4rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="sec-label">🏆 Rankings</div>
              <h2 className="sec-title">Top Rated Trains</h2>
            </div>
            <Link href="/reviews" style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              All Scorecards →
            </Link>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '1.5rem' }}>
            <TrainLeaderboard reviews={topReviews} limit={5} compact />
          </div>
        </section>
      )}

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