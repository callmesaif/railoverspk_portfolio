'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/components/admin/AdminAuthProvider';
import useAllComments from '@/components/admin/useAllComments';

const SECTIONS = { '': 'Home', blogs: 'Blog', reviews: 'Reviews', trains: 'Trains', locomotives: 'Locos', about: 'About', contact: 'Contact' };
const ALERT_COLORS = { suspended: '#f97070', delayed: '#ffb432', diverted: '#a78bfa', maintenance: '#38bdf8', restored: '#3fca7a' };

const sectionOf = path => SECTIONS[(path || '/').split('/').filter(Boolean)[0] || ''] ?? 'Other';
const toMs      = ts => (ts?.toMillis ? ts.toMillis() : 0);
const fmtDate   = ms => (ms ? new Date(ms).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : '—');
const fmt       = n  => (n == null ? '—' : n.toLocaleString());
const short     = n  => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(n));

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

/* Subscribe to a collection; on error fall back to an empty list so the UI never hangs */
function listen(name, set, map = d => ({ id: d.id, ...d.data() })) {
  return onSnapshot(collection(db, name), s => set(s.docs.map(map)), () => set([]));
}

export default function AdminDashboard() {
  const { user } = useAdmin();
  const [posts,   setPosts]   = useState(null);
  const [reviews, setReviews] = useState(null);
  const [pages,   setPages]   = useState(null);
  const [alerts,  setAlerts]  = useState(null);

  useEffect(() => {
    const unsubs = [
      listen('posts',   setPosts),
      listen('reviews', setReviews),
      listen('daily_reports', setAlerts),
      listen('analytics', setPages, d => {
        const v = d.data();
        return { path: v.path || (d.id === 'home' ? '/' : '/' + d.id.replace(/_/g, '/')), views: v.views || 0 };
      }),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const parents = useMemo(() => [
    ...(posts   || []).map(p => ({ type: 'posts',   id: p.id, title: p.title || p.id })),
    ...(reviews || []).map(r => ({ type: 'reviews', id: r.id, title: r.name  || r.id })),
  ], [posts, reviews]);
  const { comments, ready } = useAllComments(parents);

  /* ── derived numbers ── */
  const totalVisits = pages ? pages.reduce((s, p) => s + p.views, 0) : null;
  const pubPosts    = posts   ? posts.filter(p => p.published).length   : null;
  const pubReviews  = reviews ? reviews.filter(r => r.published).length : null;
  const awaiting    = ready   ? comments.filter(c => !c.reply).length   : null;

  const today = new Date().toISOString().split('T')[0];
  const activeAlerts = (alerts || []).filter(a => a.active && (!a.validUntil || a.validUntil >= today));

  const sections = useMemo(() => {
    const map = {};
    (pages || []).forEach(p => { const k = sectionOf(p.path); map[k] = (map[k] || 0) + p.views; });
    return Object.entries(map).map(([label, views]) => ({ label, views })).sort((a, b) => b.views - a.views).slice(0, 7);
  }, [pages]);
  const maxViews = sections.length ? sections[0].views : 0;

  const labelFor = path => {
    const [, seg, id] = path.split('/');
    if (!seg) return 'Home';
    if (id && seg === 'reviews') return 'Review: ' + ((reviews || []).find(r => r.id === id)?.name || 'Review page');
    if (id && seg === 'blogs')   return 'Post: '   + ((posts   || []).find(p => p.id === id)?.title || 'Blog page');
    if (id && seg === 'trains')  return 'Train page';
    return SECTIONS[seg] ? SECTIONS[seg] + ' page' : path;
  };
  const topPages = [...(pages || [])].sort((a, b) => b.views - a.views).slice(0, 3);

  const recent = useMemo(() => {
    const items = [
      ...(posts || []).map(p => ({ key: 'p' + p.id, kind: 'Post', title: p.title || 'Untitled', status: p.published ? 'Published' : 'Draft', tone: p.published ? 'ok' : 'muted', time: toMs(p.createdAt), href: `/admin/posts/${p.id}` })),
      ...(reviews || []).map(r => ({ key: 'r' + r.id, kind: 'Review', title: r.name || 'Untitled', status: r.published ? 'Published' : 'Draft', tone: r.published ? 'ok' : 'muted', time: toMs(r.createdAt), href: `/admin/reviews/${r.id}` })),
      ...comments.map(c => ({ key: `c${c.type}${c.parentId}${c.id}`, kind: 'Comment', title: `${c.name || 'Anonymous'}: ${(c.message ?? c.text ?? '').slice(0, 70)}`, status: c.reply ? 'Replied' : 'Needs reply', tone: c.reply ? 'ok' : 'warn', time: toMs(c.createdAt), href: '/admin/comments' })),
    ];
    return items.sort((a, b) => b.time - a.time).slice(0, 8);
  }, [posts, reviews, comments]);

  const loadingRecent = posts === null || reviews === null;

  const rawName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Admin');
  const name    = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return (
    <div className="gl-page">
      <header className="gl-head">
        <div className="gl-eyebrow">Dashboard</div>
        <h1 className="gl-h1">{greeting()}, {name}</h1>
        <p className="gl-sub">Here&rsquo;s how RaiLoversPK is doing right now.</p>
      </header>

      <div className="gl-grid">
        {/* ── Overview ── */}
        <section className="gl-glass gl-card gl-pad gl-overview">
          <div className="gl-label">Total Visits</div>
          <div className="gl-big">{fmt(totalVisits)}</div>
          <span className="gl-chip gl-chip--ok">● Live · all pages</span>
          <div className="gl-actions">
            <Link href="/admin/posts/new"   className="gl-btn">+ New Post</Link>
            <Link href="/admin/reviews/new" className="gl-btn gl-btn--glass">+ New Review</Link>
          </div>
          <div className="gl-inset">
            <div className="gl-inset-title">Top pages</div>
            {topPages.length === 0 && <div className="gl-toprow gl-muted">No visits recorded yet</div>}
            {topPages.map(p => (
              <div key={p.path} className="gl-toprow">
                <span className="gl-ellipsis">{labelFor(p.path)}</span>
                <b>{fmt(p.views)}</b>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mini stats ── */}
        <div className="gl-minis">
          <Link href="/admin/posts" className="gl-glass gl-card gl-pad gl-mini gl-card--accent">
            <div className="gl-label">Posts</div>
            <div className="gl-num">{fmt(posts?.length)}</div>
            <span className="gl-chip">{fmt(pubPosts)} published</span>
          </Link>
          <Link href="/admin/reviews" className="gl-glass gl-card gl-pad gl-mini">
            <div className="gl-label">Reviews</div>
            <div className="gl-num">{fmt(reviews?.length)}</div>
            <span className="gl-chip">{fmt(pubReviews)} published</span>
          </Link>
          <Link href="/admin/comments" className={`gl-glass gl-card gl-pad gl-mini${awaiting > 0 ? ' gl-card--warn' : ''}`}>
            <div className="gl-label">Awaiting reply</div>
            <div className="gl-num">{fmt(awaiting)}</div>
            <span className="gl-chip">{awaiting === 0 ? 'All caught up' : 'Comments'}</span>
          </Link>
          <Link href="/admin/reports" className="gl-glass gl-card gl-pad gl-mini">
            <div className="gl-label">Active alerts</div>
            <div className="gl-num">{fmt(alerts ? activeAlerts.length : null)}</div>
            <span className="gl-chip">Service updates</span>
          </Link>
        </div>

        {/* ── Chart ── */}
        <section className="gl-glass gl-card gl-pad gl-chart">
          <div className="gl-cardhead">
            <div className="gl-cardtitle">Visits by section</div>
          </div>
          {sections.length === 0 ? (
            <div className="gl-empty">{pages === null ? 'Loading…' : 'No visit data yet.'}</div>
          ) : (
            <>
              <div className="gl-bars">
                {sections.map(s => (
                  <div key={s.label} className="gl-bar-col">
                    <div className="gl-bar-val">{short(s.views)}</div>
                    <div className="gl-bar-track">
                      <div className={`gl-bar${s.views === maxViews ? ' gl-bar--top' : ''}`}
                           style={{ height: `${Math.max(6, (s.views / maxViews) * 100)}%` }} />
                    </div>
                    <div className="gl-bar-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="gl-legend">
                <span><i style={{ background: '#1E90FF' }} />Busiest section</span>
                <span><i style={{ background: 'rgba(255,255,255,.4)' }} />Others</span>
              </div>
            </>
          )}
        </section>

        {/* ── Recent activity ── */}
        <section className="gl-glass gl-card gl-pad gl-recent">
          <div className="gl-cardhead">
            <div className="gl-cardtitle">Recent activity</div>
            <Link href="/admin/comments" className="gl-link">Comments →</Link>
          </div>
          <div className="gl-tr gl-th"><span>Type</span><span>Activity</span><span>Status</span><span className="gl-hide-sm">Date</span><span /></div>
          {loadingRecent && <div className="gl-empty">Loading…</div>}
          {!loadingRecent && recent.length === 0 && <div className="gl-empty">Nothing yet — create your first post or review.</div>}
          {recent.map(r => (
            <Link key={r.key} href={r.href} className="gl-tr">
              <span><i className="gl-kind">{r.kind}</i></span>
              <span className="gl-ellipsis">{r.title}</span>
              <span><b className={`gl-status gl-status--${r.tone}`}>{r.status}</b></span>
              <span className="gl-hide-sm gl-muted">{fmtDate(r.time)}</span>
              <span className="gl-go">→</span>
            </Link>
          ))}
        </section>

        {/* ── Service alerts ── */}
        <section className="gl-glass gl-card gl-pad gl-alerts">
          <div className="gl-cardhead">
            <div className="gl-cardtitle">Service alerts</div>
            <Link href="/admin/reports" className="gl-link">Manage →</Link>
          </div>
          {alerts === null && <div className="gl-empty">Loading…</div>}
          {alerts !== null && activeAlerts.length === 0 && <div className="gl-empty">All services normal ✓</div>}
          {activeAlerts.slice(0, 4).map(a => (
            <div key={a.id} className="gl-alert">
              <span className="gl-dot" style={{ background: ALERT_COLORS[a.alertType] || '#ffb432' }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {a.affectedTrainNum ? `#${a.affectedTrainNum} ` : ''}{a.affectedTrainName}
                </div>
                <div className="gl-muted" style={{ fontSize: 12, marginTop: 2 }}>
                  <span style={{ textTransform: 'capitalize' }}>{a.alertType}</span> · {a.reason}
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}