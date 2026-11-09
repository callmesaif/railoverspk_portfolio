'use client';
import LatestVlogs from '@/components/LatestVlogs';

export default function LatestVlogsSection() {
  return (
    <>
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

    </>
  );
}
