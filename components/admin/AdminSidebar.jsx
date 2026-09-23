'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const NAV = [
  { href: '/admin',             label: 'Dashboard',    icon: '▦'  },
  { href: '/admin/posts',       label: 'Posts',        icon: '✎'  },
  { href: '/admin/reviews',     label: 'Reviews',      icon: '★'  },
  { href: '/admin/trains',      label: 'Trains',       icon: '🚆' },
  { href: '/admin/locomotives', label: 'Locos',        icon: '🚂' },
  { href: '/admin/comments',    label: 'Comments',     icon: '💬' },
  { href: '/admin/reports',     label: 'Reports',      icon: '📢' },
];

const SITE_LINKS = [
  { href: '/blogs',       label: 'View Blog'        },
  { href: '/reviews',     label: 'View Reviews'     },
  { href: '/locomotives', label: 'View Locomotives' },
];

// Bottom nav shows only first 5 items + "More" button
const BOTTOM_NAV = NAV.slice(0, 4);

export default function AdminSidebar() {
  const pathname          = usePathname();
  const router            = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleSignOut() {
    await signOut(auth);
    router.replace('/admin/login');
  }

  function isActive(href) {
    return pathname === href || (href !== '/admin' && pathname.startsWith(href));
  }

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────── */}
      <aside style={ASIDE}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Image src="/railoverspk_logo.webp" alt="RaiLoversPK" width={44} height={44} style={{ objectFit: 'contain' }} />
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em', color: '#fff' }}>ADMIN</div>
        </Link>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '2rem', paddingLeft: '2px' }}>
          RaiLoversPK Panel
        </div>

        <nav style={{ flex: 1 }}>
          <div style={SEC_LABEL}>Menu</div>
          {NAV.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '12px', marginBottom: '4px',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
                textDecoration: 'none',
                color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                background: active ? 'rgba(30,144,255,0.15)' : 'transparent',
                border: active ? '1px solid rgba(30,144,255,0.25)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '16px', color: active ? '#1E90FF' : 'rgba(255,255,255,0.3)' }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginBottom: '1rem' }}>
          <div style={SEC_LABEL}>View Site</div>
          {SITE_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} target="_blank" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', borderRadius: '10px', marginBottom: '3px',
              fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
              textDecoration: 'none', color: 'rgba(255,255,255,0.35)',
            }}>↗ {label}</Link>
          ))}
        </div>

        <button onClick={handleSignOut} style={SIGNOUT_BTN}>⎋ Sign Out</button>
      </aside>

      {/* ── Mobile Bottom Nav ─────────────────────────── */}
      <nav className="rl-admin-mobile-nav" style={MOBILE_NAV}>
        {BOTTOM_NAV.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={MOBILE_ITEM}>
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{icon}</span>
              <span style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: active ? '#1E90FF' : 'rgba(255,255,255,0.35)',
              }}>{label}</span>
              {active && <span style={ACTIVE_DOT} />}
            </Link>
          );
        })}

        {/* More button */}
        <button onClick={() => setDrawerOpen(true)} style={MOBILE_ITEM}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>☰</span>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>More</span>
        </button>
      </nav>

      {/* ── Mobile Drawer (More menu) ─────────────────── */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 998,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', bottom: '72px', left: '12px', right: '12px',
              background: '#0c0c12',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '1.25rem',
              zIndex: 999,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                Admin Menu
              </div>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '16px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* All nav items in grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
              {NAV.map(({ href, label, icon }) => {
                const active = isActive(href);
                return (
                  <Link key={href} href={href}
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px 14px', borderRadius: '14px',
                      textDecoration: 'none',
                      background: active ? 'rgba(30,144,255,0.15)' : 'rgba(255,255,255,0.04)',
                      border: active ? '1px solid rgba(30,144,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: active ? '#fff' : 'rgba(255,255,255,0.5)' }}>{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '1rem' }} />

            {/* Site links */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {SITE_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} target="_blank"
                  onClick={() => setDrawerOpen(false)}
                  style={{ fontSize: '11px', fontWeight: 700, color: '#1E90FF', background: 'rgba(30,144,255,0.08)', border: '1px solid rgba(30,144,255,0.2)', borderRadius: '100px', padding: '7px 14px', textDecoration: 'none' }}>
                  ↗ {label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <button onClick={handleSignOut} style={{ ...SIGNOUT_BTN, width: '100%', textAlign: 'center', borderRadius: '14px' }}>
              ⎋ Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Styles ─────────────────────────────────────────── */
const ASIDE       = { width: '220px', flexShrink: 0, background: '#0c0c12', borderRight: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem 1.25rem', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0 };
const SEC_LABEL   = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' };
const SIGNOUT_BTN = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer' };
const MOBILE_NAV  = { display: 'none', /* mobile: shown via .rl-admin-mobile-nav CSS */ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 997, background: '#0c0c12', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 0 max(8px, env(safe-area-inset-bottom))', gridTemplateColumns: 'repeat(5, 1fr)' };
const MOBILE_ITEM = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px 4px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative', textDecoration: 'none', color: 'inherit' };
const ACTIVE_DOT  = { position: 'absolute', bottom: '-2px', width: '4px', height: '4px', borderRadius: '50%', background: '#1E90FF' };