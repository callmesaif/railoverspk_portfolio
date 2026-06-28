'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const NAV = [
  { href: '/admin',         label: 'Dashboard', icon: '▦' },
  { href: '/admin/posts',   label: 'Blog Posts', icon: '✎' },
  { href: '/admin/reviews', label: 'Reviews',    icon: '★' },
];

const SITE_LINKS = [
  { href: '/blogs',   label: 'View Blog'    },
  { href: '/reviews', label: 'View Reviews' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    router.replace('/admin/login');
  }

  return (
    <aside style={ASIDE}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Image src="/railoverspk_logo.webp" alt="RaiLoversPK" width={44} height={44} style={{ objectFit: 'contain' }} />
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em', color: '#fff' }}>ADMIN</div>
      </Link>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '2rem', paddingLeft: '2px' }}>
        RaiLoversPK Panel
      </div>

      <nav style={{ flex: 1 }}>
        <div style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>Menu</div>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
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
        <div style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem' }}>View Site</div>
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
  );
}

const ASIDE      = { width: '220px', flexShrink: 0, background: '#0c0c12', borderRight: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem 1.25rem', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0 };
const SIGNOUT_BTN= { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer', textAlign: 'left', width: '100%' };
