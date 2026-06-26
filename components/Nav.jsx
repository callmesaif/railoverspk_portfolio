'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/',         label: 'Home'     },
  { href: '/about',    label: 'About'    },
  { href: '/blogs',    label: 'Blog'     },
  { href: '/polls',    label: 'Polls'    },
  { href: '/contact',  label: 'Contact'  },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 99,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
        height: '62px',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <Image
          src="/railoverspk_logo.webp"
          alt="RaiLoversPK"
          width={52}
          height={52}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: active ? 'var(--text)' : 'var(--muted)',
                textDecoration: 'none',
                paddingBottom: '4px',
                borderBottom: active ? '1px solid var(--accent)' : '1px solid transparent',
                transition: 'color 0.2s',
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right side — theme toggle + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ThemeToggle />
        <Link href="/contact" className="btn-primary" style={{ padding: '10px 20px' }}>
          Get In Touch
        </Link>
      </div>
    </nav>
  );
}
