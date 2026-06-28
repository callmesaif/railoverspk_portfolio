'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/components/admin/AdminAuthProvider';
import AdminAnalytics from '@/components/admin/AdminAnalytics';

export default function AdminDashboard() {
  const { user }            = useAdmin();
  const [posts,   setPosts]   = useState([]);
  const [polls,   setPolls]   = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'posts'),   s => setPosts(s.docs));
    const u2 = onSnapshot(collection(db, 'polls'),   s => setPolls(s.docs));
    const u3 = onSnapshot(collection(db, 'reviews'), s => setReviews(s.docs));
    return () => { u1(); u2(); u3(); };
  }, []);

  const stats = [
    { label: 'Total Posts',       value: posts.length,                                    href: '/admin/posts',   color: '#1E90FF' },
    { label: 'Published Posts',   value: posts.filter(d => d.data().published).length,    href: '/admin/posts',   color: '#3fca7a' },
    { label: 'Total Reviews',     value: reviews.length,                                  href: '/admin/reviews', color: '#1E90FF' },
    { label: 'Published Reviews', value: reviews.filter(d => d.data().published).length,  href: '/admin/reviews', color: '#3fca7a' },
    { label: 'Total Polls',       value: polls.length,                                    href: '/admin/polls',   color: '#1E90FF' },
    { label: 'Active Polls',      value: polls.filter(d => d.data().isActive).length,     href: '/admin/polls',   color: '#ffb432' },
  ];

  return (
    <main style={PAGE}>
      {/* Header */}
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Dashboard</div>
          <h1 style={HEADING}>Welcome back</h1>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{user?.email}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/admin/posts/new"   style={BTN_PRIMARY}>+ New Post</Link>
          <Link href="/admin/reviews/new" style={BTN_PRIMARY}>+ New Review</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={STATS_GRID}>
        {stats.map(({ label, value, href, color }) => (
          <Link key={label} href={href} style={STAT_CARD}
            onMouseEnter={e => e.currentTarget.style.borderColor = color + '44'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
          >
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', color, lineHeight: 1, marginBottom: '6px' }}>{value}</div>
            <div style={STAT_LABEL}>{label}</div>
          </Link>
        ))}
      </div>

      {/* Analytics */}
      <div style={SECTION}>
        <AdminAnalytics />
      </div>

      {/* Recent Posts */}
      <RecentTable
        title="Recent Posts" href="/admin/posts"
        items={posts.slice(0, 4).map(d => ({
          id: d.id,
          col1: d.data().title || '—',
          col2: (d.data().tags || []).join(', ') || '—',
          badge: d.data().published,
          badgeTrue: 'Published', badgeFalse: 'Draft',
          editPath: `/admin/posts/${d.id}`,
        }))}
        heads={['Title', 'Tags', 'Status', 'Action']}
        empty="No posts yet."
      />

      {/* Recent Reviews */}
      <RecentTable
        title="Recent Reviews" href="/admin/reviews"
        items={reviews.slice(0, 4).map(d => {
          const r = d.data(); const s = r.scores || {};
          const vals = [s.punctuality,s.cleanliness,s.comfort,s.food].filter(Boolean);
          const avg = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '—';
          return { id: d.id, col1: r.name||'—', col2: `${r.route||'—'}  ★ ${avg}`, badge: r.published, badgeTrue:'Published', badgeFalse:'Draft', editPath:`/admin/reviews/${d.id}` };
        })}
        heads={['Train', 'Route / Score', 'Status', 'Action']}
        empty={<>No reviews yet. <Link href="/admin/reviews/new" style={{color:'#1E90FF'}}>Create one →</Link></>}
      />
    </main>
  );
}

function RecentTable({ title, href, items, heads, empty }) {
  return (
    <div style={SECTION}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</div>
        <Link href={href} style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', textDecoration: 'none' }}>View all →</Link>
      </div>
      <div style={TABLE}>
        <div style={TABLE_HEAD}>
          {heads.map(h => <span key={h}>{h}</span>)}
        </div>
        {items.length === 0
          ? <div style={EMPTY}>{empty}</div>
          : items.map(row => (
            <div key={row.id} style={TABLE_ROW}>
              <span style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>{row.col1}</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{row.col2}</span>
              <span><span style={row.badge ? BADGE_LIVE : BADGE_DRAFT}>{row.badge ? row.badgeTrue : row.badgeFalse}</span></span>
              <span><Link href={row.editPath} style={{ fontSize: '10px', fontWeight: 700, color: '#1E90FF', textDecoration: 'none' }}>Edit</Link></span>
            </div>
          ))}
      </div>
    </div>
  );
}

const PAGE       = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' };
const HEADER     = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' };
const EYEBROW    = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING    = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' };
const STATS_GRID = { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '2.5rem' };
const STAT_CARD  = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', textDecoration: 'none', color: '#fff', display: 'block', transition: 'border-color 0.2s' };
const STAT_LABEL = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' };
const SECTION    = { marginBottom: '2rem' };
const TABLE      = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' };
const TABLE_HEAD = { display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 60px', gap: '1rem', padding: '12px 20px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' };
const TABLE_ROW  = { display: 'grid', gridTemplateColumns: '2fr 1.5fr 100px 60px', gap: '1rem', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' };
const BADGE_LIVE = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(63,202,122,0.15)', color: '#3fca7a', border: '1px solid rgba(63,202,122,0.25)', padding: '4px 10px', borderRadius: '100px' };
const BADGE_DRAFT= { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px' };
const EMPTY      = { padding: '1.5rem', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 600 };
const BTN_PRIMARY= { display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', padding: '11px 20px', borderRadius: '100px', textDecoration: 'none' };
const BTN_GHOST  = { display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)', padding: '11px 20px', borderRadius: '100px', textDecoration: 'none' };
