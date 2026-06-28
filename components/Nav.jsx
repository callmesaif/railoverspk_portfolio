'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/',         label: 'Home'     },
  { href: '/about',    label: 'About'    },
  { href: '/reviews',  label: 'Reviews'  },
  { href: '/blogs',    label: 'Blog'     },
  { href: '/contact',  label: 'Contact'  },
];

export default function Nav() {
  const pathname        = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="rl-nav">
        <Link href="/" className="rl-nav-logo" onClick={() => setOpen(false)}>
          <Image src="/railoverspk_logo.webp" alt="RaiLoversPK" width={48} height={48} style={{ objectFit: 'contain' }} priority />
        </Link>

        <div className="rl-nav-links">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`rl-nav-link ${active ? 'rl-nav-link-active' : ''}`}>
                {label}
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle />
          <Link href="/contact" className="btn-primary rl-nav-cta" style={{ padding: '10px 18px', fontSize: '10px' }}>
            Get In Touch
          </Link>
          <button onClick={() => setOpen(o => !o)} className="rl-hamburger" aria-label="Toggle menu">
            {open
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            }
          </button>
        </div>
      </nav>

      {open && (
        <div className="rl-drawer-overlay" onClick={() => setOpen(false)}>
          <div className="rl-drawer" onClick={e => e.stopPropagation()}>
            {links.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`rl-drawer-link ${pathname === href ? 'rl-drawer-link-active' : ''}`}
                onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href="/contact" className="rl-drawer-cta" onClick={() => setOpen(false)}>
              Get In Touch
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
