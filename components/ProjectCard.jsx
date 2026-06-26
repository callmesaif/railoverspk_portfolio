"use client"; 
import Image from 'next/image';
import Link from 'next/link';
import firebase from '@/lib/firebase';

const CATEGORY_COLORS = {
  'Vlog':        { bg: 'var(--accent-dim)', border: 'var(--accent-border)', color: 'var(--accent)' },
  'Web Project': { bg: 'rgba(63,202,122,0.1)', border: 'rgba(63,202,122,0.25)', color: '#3fca7a' },
  'Review':      { bg: 'rgba(255,180,50,0.1)', border: 'rgba(255,180,50,0.25)', color: '#ffb432' },
};

export function ProjectCard({ p }) {
  const catStyle = CATEGORY_COLORS[p.category] ?? CATEGORY_COLORS['Vlog'];

  return (
    <article
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.25s, border-color 0.25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--accent-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Image */}
      <div
        style={{
          height: '220px',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <Image
          src={p.img}
          alt={p.title}
          fill
          style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
          }}
        />
        {/* Category badge */}
        <span
          style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            fontSize: '9px',
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            background: catStyle.bg,
            color: catStyle.color,
            border: `1px solid ${catStyle.border}`,
            padding: '5px 12px',
            borderRadius: '100px',
            backdropFilter: 'blur(8px)',
          }}
        >
          {p.category}
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <h2
          className="font-display"
          style={{
            fontSize: '1.8rem',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            marginBottom: '8px',
            lineHeight: 1,
          }}
        >
          {p.title}
        </h2>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--muted)',
            lineHeight: 1.7,
            marginBottom: '16px',
            flex: 1,
          }}
        >
          {p.desc}
        </p>

        {/* Tech tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
          {p.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '5px 12px',
                borderRadius: '100px',
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                border: '1px solid var(--accent-border)',
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* CTA */}
        {p.external ? (
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              textDecoration: 'none',
              padding: '11px 20px',
              borderRadius: '100px',
              border: '1px solid var(--accent-border)',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--accent)';
            }}
          >
            {p.cta} ↗
          </a>
        ) : (
          <Link
            href={p.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              textDecoration: 'none',
              padding: '11px 20px',
              borderRadius: '100px',
              border: '1px solid var(--accent-border)',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--accent)';
            }}
          >
            {p.cta} →
          </Link>
        )}
      </div>
    </article>
  );
}