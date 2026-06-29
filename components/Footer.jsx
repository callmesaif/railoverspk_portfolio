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
  { label: 'Instagram', href: 'https://instagram.com/realinventivecadet', color: '#e1306c',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg> },
  { label: 'Facebook',  href: 'https://www.facebook.com/railoverspk', color: '#1877f2',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.108C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/></svg> },
  { label: 'Twitter',   href: 'https://twitter.com/railoverspk', color: '#1da1f2',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6.011c-.77.342-1.598.572-2.468.676a4.316 4.316 0 0 0 1.892-2.382 8.61 8.61 0 0 1-2.732 1.044 4.298 4.298 0 0 0-7.326 3.92 12.197 12.197 0 0 1-8.854-4.49 4.289 4.289 0 0 0 1.33 5.742 4.266 4.266 0 0 1-1.947-.538v.055a4.3 4.3 0 0 0 3.445 4.213 4.303 4.303 0 0 1-1.94.074 4.302 4.302 0 0 0 4.016 2.98A8.61 8.61 0 0 1 2 19.54a12.147 12.147 0 0 0 6.598 1.933c7.917 0 12.244-6.56 12.244-12.244 0-.187-.004-.373-.012-.558a8.74 8.74 0 0 0 2.143-2.227l.001-.001z"/></svg> },
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
