'use client';
import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { href: '/',         label: 'Home'     },
  { href: '/about',    label: 'About'    },
  { href: '/reviews',  label: 'Reviews'  },
  { href: '/blogs',    label: 'Blog'     },
  { href: '/contact',  label: 'Contact'  },
];

const SOCIALS = [
  { label: 'YouTube',   href: 'https://www.youtube.com/@railoverspkofficial', color: '#ff0000',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg> },
  { label: 'Instagram', href: 'https://instagram.com/railoverspk', color: '#e1306c',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg> },
  { label: 'Twitter',   href: 'https://twitter.com/railoverspk', color: '#1da1f2',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { label: 'TikTok',    href: 'https://tiktok.com/@railoverspk', color: '#ff0050',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 3.3a4.5 4.5 0 0 1-4.5-4.5h-3v12.9a2.1 2.1 0 1 1-2.1-2.1c.2 0 .4 0 .6.1V6.1a5.6 5.6 0 0 0-.6 0 5.6 5.6 0 1 0 5.6 5.6V7.8a7.5 7.5 0 0 0 4.5 1.5V6a4.5 4.5 0 0 1-.5 0z"/></svg> },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="rl-footer">
      <div className="rl-footer-inner">
        <div className="rl-footer-top">
          <div className="rl-footer-left">
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              <Image src="/railoverspk_logo.webp" alt="RaiLoversPK" width={64} height={64} style={{ objectFit: 'contain' }} />
            </Link>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
              Documenting the soul of Pakistan Railways through cinematic vision and modern storytelling.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SOCIALS.map(({ label, href, icon, color }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid var(--border2)', background: 'transparent', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.background = color + '18'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'transparent'; }}
                >{icon}</a>
              ))}
            </div>
          </div>

          <div className="rl-footer-nav-cols">
            <div>
              <div style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted2)', marginBottom: '1rem' }}>Pages</div>
              {NAV_LINKS.slice(0, 3).map(({ href, label }) => (
                <Link key={href} href={href} style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', marginBottom: '0.75rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                >{label}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted2)', marginBottom: '1rem' }}>More</div>
              {NAV_LINKS.slice(3).map(({ href, label }) => (
                <Link key={href} href={href} style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', marginBottom: '0.75rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                >{label}</Link>
              ))}
              <Link href="/privacy" style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', marginBottom: '0.75rem' }}>Privacy</Link>
              <Link href="/terms"   style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--muted)', textDecoration: 'none', marginBottom: '0.75rem' }}>Terms</Link>
            </div>
          </div>
        </div>

        <div className="rl-footer-bottom">
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted2)' }}>© {year} RaiLoversPK. All rights reserved.</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted2)' }}>Built with Next.js + Firebase</span>
        </div>
      </div>
    </footer>
  );
}
