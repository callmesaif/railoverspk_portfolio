'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/',            label: 'Home'        },
  { href: '/about',       label: 'About'       },
  { href: '/trains',      label: 'Trains'      },
  { href: '/reviews',     label: 'Reviews'     },
  { href: '/blogs',       label: 'Blog'        },
  { href: '/locomotives', label: 'Locomotives' },
  { href: '/contact',     label: 'Contact'     },
];

const TAP_REQUIRED = 5;

export default function Nav() {
  const pathname        = usePathname();
  const router          = useRouter();
  const [open, setOpen] = useState(false);

  // ── Secret admin tap logic ──────────────────────────
  const tapCount  = useRef(0);
  const tapTimer  = useRef(null);
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [tapFeedback,    setTapFeedback]    = useState(false);

  const handleLogoTap = useCallback(() => {
    tapCount.current += 1;

    // Visual feedback on each tap
    setTapFeedback(true);
    setTimeout(() => setTapFeedback(false), 150);

    // Reset timer on each tap
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);

    if (tapCount.current >= TAP_REQUIRED) {
      tapCount.current = 0;
      clearTimeout(tapTimer.current);
      setShowAdminPopup(true);
    }
  }, []);

  function goToAdmin() {
    setShowAdminPopup(false);
    router.push('/admin');
  }

  return (
    <>
      <nav className="rl-nav">
        {/* Logo — tap 5x to open admin */}
        <div
          onClick={handleLogoTap}
          style={{
            cursor: 'pointer',
            transform: tapFeedback ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.1s ease',
            borderRadius: '12px',
          }}
        >
          <Image
            src="/railoverspk_logo.webp"
            alt="RaiLoversPK"
            width={48}
            height={48}
            style={{ objectFit: 'contain', display: 'block' }}
            priority
          />
        </div>

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

      {/* Mobile drawer */}
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

      {/* ── Admin Secret Popup ────────────────────────── */}
      {showAdminPopup && (
        <div
          onClick={() => setShowAdminPopup(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0c0c12',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '2rem',
              width: '100%',
              maxWidth: '320px',
              textAlign: 'center',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* Icon */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'rgba(30,144,255,0.12)',
              border: '1px solid rgba(30,144,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', margin: '0 auto 1rem',
            }}>
              🔐
            </div>

            <div style={{
              fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px',
            }}>
              Admin Access
            </div>

            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.8rem', textTransform: 'uppercase',
              color: '#fff', marginBottom: '8px', lineHeight: 1,
            }}>
              RaiLoversPK
            </h2>

            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Admin panel mein jaane ke liye confirm karein.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={goToAdmin}
                style={{
                  fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: '#fff',
                  background: '#1E90FF', border: 'none',
                  borderRadius: '100px', padding: '14px',
                  cursor: 'pointer', width: '100%',
                }}
              >
                Admin Panel Kholein →
              </button>
              <button
                onClick={() => setShowAdminPopup(false)}
                style={{
                  fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                  background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '100px', padding: '13px',
                  cursor: 'pointer', width: '100%',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}