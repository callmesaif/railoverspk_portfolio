'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase-auth';
import { useAdmin } from '@/components/admin/AdminAuthProvider';

/* ── tiny inline icon set (no extra dependency) ── */
const ICONS = {
  grid:     <><rect x="3" y="3" width="7" height="7" rx="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.8"/></>,
  pen:      <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
  star:     <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  train:    <><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M9 21l2-4M15 21l-2-4"/><circle cx="9" cy="13.5" r="1"/><circle cx="15" cy="13.5" r="1"/></>,
  loco:     <><path d="M3 17V8h10v9M13 11h4l4 3v3h-8"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
  chat:     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
  bell:     <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  plus:     <path d="M12 5v14M5 12h14"/>,
  logout:   <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>,
  external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></>,
  search:   <><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></>,
  more:     <><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></>,
};

function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const NAV = [
  { href: '/admin',             label: 'Dashboard',   icon: 'grid'  },
  { href: '/admin/posts',       label: 'Posts',       icon: 'pen'   },
  { href: '/admin/reviews',     label: 'Reviews',     icon: 'star'  },
  { href: '/admin/trains',      label: 'Trains',      icon: 'train' },
  { href: '/admin/locomotives', label: 'Locomotives', icon: 'loco'  },
  { href: '/admin/comments',    label: 'Comments',    icon: 'chat'  },
  { href: '/admin/reports',     label: 'Alerts',      icon: 'bell'  },
];

const QUICK = [
  { href: '/admin/posts/new',   label: 'New Post'    },
  { href: '/admin/reviews/new', label: 'New Review'  },
  { href: '/admin/trains/new',  label: 'New Train'   },
  { href: '/admin/reports',     label: 'Daily Alert' },
];

const MOBILE_TABS = NAV.slice(0, 4); // Dashboard, Posts, Reviews, Trains (+ More)

const isActive = (pathname, href) =>
  href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/');

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const ctx      = useAdmin();
  const user     = ctx?.user;

  const [sheet, setSheet] = useState(false);
  const [q,     setQ]     = useState('');
  const [focus, setFocus] = useState(false);

  useEffect(() => { setSheet(false); setQ(''); }, [pathname]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return [...NAV, ...QUICK].filter(i => i.label.toLowerCase().includes(needle)).slice(0, 6);
  }, [q]);

  // Login screen keeps its own look
  if (pathname === '/admin/login' || !user) return <>{children}</>;

  const rawName = user.displayName || (user.email ? user.email.split('@')[0] : 'Admin');
  const name    = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  async function handleSignOut() {
    await signOut(auth);
    router.replace('/admin/login');
  }

  return (
    <div className="gl-root">
      <div className="gl-bg" style={{ backgroundImage: "url('/images/hero-bg.webp')" }} aria-hidden="true" />
      <div className="gl-veil" aria-hidden="true" />

      {/* ── Top bar ── */}
      <header className="gl-top">
        <div className="gl-glass gl-pill gl-welcome">
          <span className="gl-avatar">{name.charAt(0)}</span>
          <span className="gl-welcome-text">Welcome, {name}</span>
        </div>

        <div className="gl-search-wrap">
          <label className="gl-glass gl-pill gl-search">
            <Icon name="search" size={16} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              onKeyDown={e => {
                if (e.key === 'Enter' && results[0]) router.push(results[0].href);
                if (e.key === 'Escape') { setQ(''); e.currentTarget.blur(); }
              }}
              placeholder="Jump to… posts, reviews, new alert"
              aria-label="Jump to page"
            />
          </label>
          {focus && results.length > 0 && (
            <div className="gl-glass gl-results" onMouseDown={e => e.preventDefault()}>
              {results.map(r => (
                <Link key={r.href + r.label} href={r.href} className="gl-result">
                  <Icon name={r.icon || 'plus'} size={16} /> {r.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <a className="gl-glass gl-circle" href="/" target="_blank" rel="noopener noreferrer" title="View site" aria-label="View site">
          <Icon name="external" size={18} />
        </a>
      </header>

      {/* ── Left dock (desktop) ── */}
      <nav className="gl-glass gl-dock" aria-label="Admin navigation">
        {NAV.map(({ href, label, icon }) => (
          <Link key={href} href={href} data-label={label} aria-label={label}
                className={`gl-dock-item${isActive(pathname, href) ? ' is-active' : ''}`}>
            <Icon name={icon} />
          </Link>
        ))}
        <span className="gl-dock-sep" />
        <button className="gl-dock-item" data-label="Sign out" aria-label="Sign out" onClick={handleSignOut}>
          <Icon name="logout" />
        </button>
      </nav>

      <main className="gl-main">{children}</main>

      {/* ── Bottom bar: quick create (desktop) ── */}
      <nav className="gl-glass gl-bottom gl-bottom--desktop" aria-label="Quick actions">
        <Link href="/admin" className={`gl-tab${pathname === '/admin' ? ' is-active' : ''}`}>Overview</Link>
        {QUICK.map(({ href, label }) => (
          <Link key={href} href={href} className={`gl-tab${pathname === href ? ' is-active' : ''}`}>
            {label !== 'Daily Alert' && <Icon name="plus" size={14} />}{label}
          </Link>
        ))}
      </nav>

      {/* ── Bottom bar: main navigation (mobile) ── */}
      <nav className="gl-glass gl-bottom gl-bottom--mobile" aria-label="Admin navigation">
        {MOBILE_TABS.map(({ href, label, icon }) => (
          <Link key={href} href={href} className={`gl-tab${isActive(pathname, href) ? ' is-active' : ''}`}>
            <Icon name={icon} size={19} />{label === 'Dashboard' ? 'Home' : label}
          </Link>
        ))}
        <button className={`gl-tab${sheet ? ' is-active' : ''}`} onClick={() => setSheet(s => !s)} aria-expanded={sheet}>
          <Icon name="more" size={19} />More
        </button>
      </nav>

      {sheet && (
        <>
          <div className="gl-sheet-overlay" onClick={() => setSheet(false)} />
          <div className="gl-glass gl-sheet">
            <div className="gl-sheet-grid">
              {NAV.map(({ href, label, icon }) => (
                <Link key={href} href={href} className={`gl-sheet-item${isActive(pathname, href) ? ' is-active' : ''}`}>
                  <Icon name={icon} size={18} />{label}
                </Link>
              ))}
            </div>
            <div className="gl-sheet-foot">
              <a className="gl-sheet-item" href="/" target="_blank" rel="noopener noreferrer"><Icon name="external" size={16} />View site</a>
              <button className="gl-sheet-item" onClick={handleSignOut}><Icon name="logout" size={16} />Sign out</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}