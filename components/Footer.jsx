'use client';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '/',         label: 'Home'     },
  { href: '/about',    label: 'About'    },
  { href: '/blogs',    label: 'Blog'     },
  { href: '/polls',    label: 'Polls'    },
  { href: '/contact',  label: 'Contact'  },
];

const SOCIALS = [
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@railoverspkofficial',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
      </svg>
    ),
    color: '#ff0000',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/railoverspk',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/>
      </svg>
    ),
    color: '#e1306c',
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com/railoverspk',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: '#1da1f2',
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@railoverspk',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.6 3.3a4.5 4.5 0 0 1-4.5-4.5h-3v12.9a2.1 2.1 0 1 1-2.1-2.1c.2 0 .4 0 .6.1V6.1a5.6 5.6 0 0 0-.6 0 5.6 5.6 0 1 0 5.6 5.6V7.8a7.5 7.5 0 0 0 4.5 1.5V6a4.5 4.5 0 0 1-0.5 0z"/>
      </svg>
    ),
    color: '#ff0050',
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={FOOTER}>
      <div style={INNER}>

        {/* ── Top row ───────────────────────────── */}
        <div style={TOP_ROW}>

          {/* Left — Logo + tagline */}
          <div style={LEFT}>
            <Link href="/" style={LOGO}>
              <span style={LOGO_DOT} />
              RAILOVERSPK
            </Link>
            <p style={TAGLINE}>
              Documenting the soul of Pakistan Railways through cinematic vision and modern storytelling.
            </p>
            {/* Social icons */}
            <div style={SOCIALS_ROW}>
              {SOCIALS.map(({ label, href, icon, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={SOCIAL_BTN}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = color + '18';
                    e.currentTarget.style.borderColor = color + '55';
                    e.currentTarget.style.color = color;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right — Nav links in 2 columns */}
          <div style={NAV_COLS}>
            <div>
              <div style={COL_LABEL}>Pages</div>
              {NAV_LINKS.slice(0, 3).map(({ href, label }) => (
                <Link key={href} href={href} style={NAV_ITEM}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <div style={COL_LABEL}>More</div>
              {NAV_LINKS.slice(3).map(({ href, label }) => (
                <Link key={href} href={href} style={NAV_ITEM}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ───────────────────────────── */}
        <div style={DIVIDER} />

        {/* ── Bottom row ────────────────────────── */}
        <div style={BOTTOM_ROW}>
          <span style={COPYRIGHT}>
            © {year} RaiLoversPK. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={LEGAL_LINK}>Privacy Policy</Link>
            <Link href="/terms"   style={LEGAL_LINK}>Terms of Service</Link>
            <span style={MADE_WITH}>Built with Next.js + Firebase</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

/* ── Styles ──────────────────────────────────── */
const FOOTER     = { background: '#0c0c12', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 'auto' };
const INNER      = { maxWidth: '1160px', margin: '0 auto', padding: '3.5rem 2.5rem 2rem' };
const TOP_ROW    = { display: 'flex', justifyContent: 'space-between', gap: '4rem', flexWrap: 'wrap', marginBottom: '2.5rem' };

const LEFT       = { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '320px' };
const LOGO       = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.08em', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px' };
const LOGO_DOT   = { width: '7px', height: '7px', borderRadius: '50%', background: '#1E90FF', flexShrink: 0 };
const TAGLINE    = { fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.38)', fontWeight: 400, margin: 0 };
const SOCIALS_ROW= { display: 'flex', gap: '8px', marginTop: '4px' };
const SOCIAL_BTN = { width: '38px', height: '38px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s', flexShrink: 0 };

const NAV_COLS   = { display: 'flex', gap: '3rem' };
const COL_LABEL  = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '1rem' };
const NAV_ITEM   = { display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '0.75rem', transition: 'color 0.2s' };

const DIVIDER    = { height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' };
const BOTTOM_ROW = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' };
const COPYRIGHT  = { fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' };
const MADE_WITH  = { fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' };
const LEGAL_LINK = { fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.06em', textDecoration: 'none', transition: 'color 0.2s' };
