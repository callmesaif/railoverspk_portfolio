'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import TrainStatusBanner from '@/components/TrainStatusBanner';
import TrainLeaderboard from '@/components/TrainLeaderboard';
import Ticker from '@/components/Ticker';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function HomePage() {
  const router = useRouter();

  // Search States
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [searchName, setSearchName] = useState('');

  // Data States
  const [trains, setTrains] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayIndex = new Date().getDay();
  const todayName = DAYS[todayIndex];
  const todayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][todayIndex];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch Trains
        const tSnap = await getDocs(query(collection(db, 'trains'), limit(6)));
        const tList = tSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrains(tList);

        // Fetch Published Blog Posts / Vlogs
        const pSnap = await getDocs(
          query(
            collection(db, 'posts'),
            where('published', '==', true),
            orderBy('createdAt', 'desc'),
            limit(3)
          )
        );
        const pList = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(pList);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function handleRouteSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromStation.trim()) params.append('from', fromStation.trim());
    if (toStation.trim()) params.append('to', toStation.trim());
    router.push(`/trains?${params.toString()}`);
  }

  function handleTrainSearch(e) {
    e.preventDefault();
    if (searchName.trim()) {
      router.push(`/trains?q=${encodeURIComponent(searchName.trim())}`);
    }
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />
      <TrainStatusBanner />

      {/* ── 1. HERO SECTION ── */}
      <section style={HERO_SECTION}>
        <div style={HERO_BG_WRAPPER}>
          <Image
            src="/images/hero-bg.webp"
            alt="Pakistan Railways Train"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.35 }}
          />
          <div style={HERO_OVERLAY} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '850px' }}>
          <div style={BADGE}>
            <span style={{ fontSize: '13px' }}>🇵🇰</span>
            <span>Pakistan Railways Media Platform</span>
          </div>

          <h1 style={HERO_TITLE}>
            The Rails Are My <span style={{ color: 'var(--accent)' }}>Canvas</span>
          </h1>

          <p style={HERO_SUBTITLE}>
            Documenting Pakistan&apos;s railway heritage, live train status, accurate station schedules,
            fare tables, and high-quality cinematic reviews.
          </p>

          <div style={HERO_CTA_GROUP}>
            <Link href="/trains" style={PRIMARY_BTN}>
              Explore Train Schedules →
            </Link>
            <Link href="/reviews" style={SECONDARY_BTN}>
              Train Reviews & Ratings
            </Link>
          </div>

          {/* ── 2. QUICK ROUTE & TRAIN FINDER CARD ── */}
          <div style={SEARCH_BOX_CONTAINER}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                🔍 Quick Train & Route Finder
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Live Directory</span>
            </div>

            <form onSubmit={handleRouteSearch} style={SEARCH_FORM}>
              <div style={INPUT_GROUP}>
                <label style={INPUT_LABEL}>From Station</label>
                <input
                  type="text"
                  placeholder="e.g. Karachi Cantt"
                  value={fromStation}
                  onChange={e => setFromStation(e.target.value)}
                  style={INPUT_FIELD}
                />
              </div>

              <div style={INPUT_GROUP}>
                <label style={INPUT_LABEL}>To Station</label>
                <input
                  type="text"
                  placeholder="e.g. Lahore Jn"
                  value={toStation}
                  onChange={e => setToStation(e.target.value)}
                  style={INPUT_FIELD}
                />
              </div>

              <button type="submit" style={SEARCH_SUBMIT_BTN}>
                Find Trains
              </button>
            </form>

            <form onSubmit={handleTrainSearch} style={SUB_SEARCH_ROW}>
              <input
                type="text"
                placeholder="Or search by Train Name or Number (e.g. 15UP Karachi Express, Green Line)..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                style={SUB_SEARCH_INPUT}
              />
              <button type="submit" style={SUB_SEARCH_BTN}>
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── TICKER STRIP ── */}
      <Ticker />

      {/* ── 3. TODAY'S TRAIN SCHEDULE GLANCE ── */}
      <section style={{ padding: '4rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={SECTION_HEADER_ROW}>
            <div>
              <div style={SECTION_EYEBROW}>Today: {todayName}</div>
              <h2 style={SECTION_HEADING}>Featured Train Schedules</h2>
            </div>
            <Link href="/trains" style={VIEW_ALL_LINK}>
              View All Trains Directory →
            </Link>
          </div>

          {loading ? (
            <div style={GRID_3}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ ...CARD_BOX, minHeight: '160px', opacity: 0.5 }} />
              ))}
            </div>
          ) : trains.length > 0 ? (
            <div style={GRID_3}>
              {trains.map(t => {
                const schedule = t.weeklySchedule || {};
                const runsToday = schedule[todayKey] !== false;

                return (
                  <div key={t.id} style={CARD_BOX}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={TRAIN_NUM_BADGE}>{t.trainNumber || t.number || 'EXP'}</span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '100px',
                        background: runsToday ? 'rgba(63,202,122,0.15)' : 'rgba(239,68,68,0.15)',
                        color: runsToday ? '#3fca7a' : '#f97070',
                        border: `1px solid ${runsToday ? 'rgba(63,202,122,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>
                        {runsToday ? '● Runs Today' : '○ Off Today'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>
                      {t.name || t.trainName}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '14px' }}>
                      📍 {t.route || `${t.origin || 'Origin'} ➔ ${t.destination || 'Destination'}`}
                    </p>

                    <div style={META_INFO_ROW}>
                      <div>
                        <span style={META_LABEL}>Departure:</span>
                        <span style={META_VALUE}>{t.departureTime || 'See table'}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={META_LABEL}>Total Stops:</span>
                        <span style={META_VALUE}>{t.stops?.length ? `${t.stops.length} Stations` : 'Multiple'}</span>
                      </div>
                    </div>

                    <Link href={`/trains/${t.id}`} style={CARD_ACTION_BTN}>
                      View Stops, Timings & Fares →
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={EMPTY_STATE}>
              Train schedules are currently being compiled. Visit <Link href="/trains" style={{ color: 'var(--accent)' }}>/trains</Link> for direct list.
            </div>
          )}
        </div>
      </section>

      {/* ── 4. LEADERBOARD ── */}
      <section style={{ padding: '4rem 0', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <TrainLeaderboard />
        </div>
      </section>

      {/* ── 5. STATS STRIP ── */}
      <section style={{ padding: '3rem 0', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
        <div className="container">
          <div style={STATS_GRID}>
            <div style={STAT_ITEM}>
              <div style={STAT_VAL}>6M+</div>
              <div style={STAT_LBL}>Total YouTube Views</div>
            </div>
            <div style={STAT_ITEM}>
              <div style={STAT_VAL}>42K+</div>
              <div style={STAT_LBL}>Channel Community</div>
            </div>
            <div style={STAT_ITEM}>
              <div style={STAT_VAL}>80+</div>
              <div style={STAT_LBL}>Documented Reviews</div>
            </div>
            <div style={STAT_ITEM}>
              <div style={STAT_VAL}>3300 HP</div>
              <div style={STAT_LBL}>Locomotive Sound Vault</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. LATEST REVIEWS & BLOG POSTS ── */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={SECTION_HEADER_ROW}>
            <div>
              <div style={SECTION_EYEBROW}>Railway Journal</div>
              <h2 style={SECTION_HEADING}>Recent Posts & Insights</h2>
            </div>
            <Link href="/blogs" style={VIEW_ALL_LINK}>
              All Posts & Reviews →
            </Link>
          </div>

          <div style={GRID_3}>
            {posts.length > 0 ? (
              posts.map(post => (
                <article key={post.id} style={BLOG_CARD}>
                  {post.coverImage && (
                    <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.1em' }}>
                        {post.tags?.[0] || 'Vlog / Review'}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '6px', color: 'var(--text)', lineHeight: 1.35 }}>
                        {post.title}
                      </h3>
                      {post.date && (
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
                          📅 {post.date}
                        </div>
                      )}
                    </div>

                    <Link href={`/blogs/${post.slug || post.id}`} style={{ ...CARD_ACTION_BTN, marginTop: '14px' }}>
                      Read Article & Watch Video →
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div style={{ ...EMPTY_STATE, gridColumn: 'span 3' }}>
                Visit our <Link href="/blogs" style={{ color: 'var(--accent)' }}>Blog</Link> or <Link href="/reviews" style={{ color: 'var(--accent)' }}>Reviews</Link> for latest updates.
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// ── INLINE STYLES MATCHING THE PROJECT THEME ──
const HERO_SECTION = {
  position: 'relative',
  padding: '6rem 1.5rem 4.5rem',
  minHeight: '75vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderBottom: '1px solid var(--border)',
};

const HERO_BG_WRAPPER = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  background: 'var(--bg)',
};

const HERO_OVERLAY = {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(ellipse at center, rgba(10,10,18,0.7) 0%, rgba(10,10,18,0.95) 100%)',
};

const BADGE = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(30,144,255,0.1)',
  border: '1px solid rgba(30,144,255,0.25)',
  padding: '6px 14px',
  borderRadius: '100px',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--accent)',
  marginBottom: '1.25rem',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const HERO_TITLE = {
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
  textTransform: 'uppercase',
  lineHeight: 0.95,
  letterSpacing: '0.04em',
  marginBottom: '1.25rem',
  color: '#ffffff',
};

const HERO_SUBTITLE = {
  fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
  color: 'var(--muted)',
  lineHeight: 1.6,
  maxWidth: '680px',
  margin: '0 auto 2rem',
};

const HERO_CTA_GROUP = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: '2.5rem',
};

const PRIMARY_BTN = {
  background: 'var(--accent)',
  color: '#fff',
  fontSize: '11px',
  fontWeight: 900,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '13px 28px',
  borderRadius: '100px',
  textDecoration: 'none',
  transition: 'transform 0.2s, opacity 0.2s',
  display: 'inline-block',
};

const SECONDARY_BTN = {
  background: 'var(--bg3)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '13px 26px',
  borderRadius: '100px',
  textDecoration: 'none',
  display: 'inline-block',
};

const SEARCH_BOX_CONTAINER = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  padding: '1.5rem',
  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  textAlign: 'left',
};

const SEARCH_FORM = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 140px',
  gap: '12px',
  alignItems: 'flex-end',
};

const INPUT_GROUP = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const INPUT_LABEL = {
  fontSize: '10px',
  fontWeight: 800,
  textTransform: 'uppercase',
  color: 'var(--muted)',
  letterSpacing: '0.1em',
};

const INPUT_FIELD = {
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '13px',
  color: 'var(--text)',
  outline: 'none',
  width: '100%',
};

const SEARCH_SUBMIT_BTN = {
  background: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '12px',
  fontSize: '11px',
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  cursor: 'pointer',
  height: '43px',
};

const SUB_SEARCH_ROW = {
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  gap: '8px',
};

const SUB_SEARCH_INPUT = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  fontSize: '12px',
  color: 'var(--muted)',
  outline: 'none',
};

const SUB_SEARCH_BTN = {
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  color: 'var(--accent)',
  padding: '4px 12px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: 700,
  cursor: 'pointer',
};

const SECTION_HEADER_ROW = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  marginBottom: '2rem',
  flexWrap: 'wrap',
  gap: '12px',
};

const SECTION_EYEBROW = {
  fontSize: '10px',
  fontWeight: 900,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  marginBottom: '4px',
};

const SECTION_HEADING = {
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: 'clamp(2rem, 4vw, 2.8rem)',
  textTransform: 'uppercase',
  lineHeight: 1,
  color: 'var(--text)',
  margin: 0,
};

const VIEW_ALL_LINK = {
  fontSize: '11px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--accent)',
  textDecoration: 'none',
};

const GRID_3 = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.25rem',
};

const CARD_BOX = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const TRAIN_NUM_BADGE = {
  fontSize: '10px',
  fontFamily: 'monospace',
  fontWeight: 900,
  padding: '3px 8px',
  borderRadius: '6px',
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  color: 'var(--accent)',
};

const META_INFO_ROW = {
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  marginBottom: '14px',
};

const META_LABEL = {
  display: 'block',
  fontSize: '9px',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  fontWeight: 700,
};

const META_VALUE = {
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--text)',
};

const CARD_ACTION_BTN = {
  display: 'block',
  textAlign: 'center',
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '9px',
  fontSize: '11px',
  fontWeight: 800,
  color: 'var(--accent)',
  textDecoration: 'none',
};

const STATS_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '1.5rem',
  textAlign: 'center',
};

const STAT_ITEM = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const STAT_VAL = {
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: '3rem',
  lineHeight: 1,
  color: 'var(--accent)',
};

const STAT_LBL = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const BLOG_CARD = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const EMPTY_STATE = {
  padding: '2.5rem',
  textAlign: 'center',
  color: 'var(--muted)',
  fontSize: '13px',
  background: 'var(--bg2)',
  borderRadius: '16px',
  border: '1px solid var(--border)',
};