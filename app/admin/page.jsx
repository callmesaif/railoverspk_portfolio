'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/components/admin/AdminAuthProvider';

export default function AdminDashboard() {
  const { user }        = useAdmin();
  const [posts, setPosts] = useState([]);
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const unsubPosts = onSnapshot(collection(db, 'posts'), (snap) => setPosts(snap.docs));
    const unsubPolls = onSnapshot(collection(db, 'polls'), (snap) => setPolls(snap.docs));
    return () => { unsubPosts(); unsubPolls(); };
  }, []);

  const stats = [
    { label: 'Total Posts',    value: posts.length,                                             href: '/admin/posts',  color: '#1E90FF' },
    { label: 'Published',      value: posts.filter(d => d.data().published).length,             href: '/admin/posts',  color: '#3fca7a' },
    { label: 'Total Polls',    value: polls.length,                                             href: '/admin/polls',  color: '#1E90FF' },
    { label: 'Active Polls',   value: polls.filter(d => d.data().isActive).length,              href: '/admin/polls',  color: '#ffb432' },
  ];

  return (
    <main style={PAGE}>
      {/* Header */}
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Dashboard</div>
          <h1 style={HEADING}>Welcome back</h1>
          <div style={EMAIL}>{user?.email}</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/admin/posts/new" style={BTN_PRIMARY}>+ New Post</Link>
          <Link href="/admin/polls/new" style={BTN_GHOST}>+ New Poll</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={STATS_GRID}>
        {stats.map(({ label, value, href, color }) => (
          <Link key={label} href={href} style={STAT_CARD}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', color, lineHeight: 1, marginBottom: '6px' }}>
              {value}
            </div>
            <div style={STAT_LABEL}>{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent posts */}
      <div style={SECTION}>
        <div style={SEC_HEADER}>
          <div style={SEC_TITLE}>Recent Posts</div>
          <Link href="/admin/posts" style={SEC_LINK}>View all →</Link>
        </div>
        <div style={TABLE}>
          <div style={TABLE_HEAD}>
            <span>Title</span><span>Tags</span><span>Status</span><span>Actions</span>
          </div>
          {posts.slice(0, 5).map((doc) => {
            const p = doc.data();
            return (
              <div key={doc.id} style={TABLE_ROW}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{p.title || '—'}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  {(p.tags || []).join(', ') || '—'}
                </span>
                <span>
                  <span style={p.published ? BADGE_LIVE : BADGE_DRAFT}>
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                </span>
                <span style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/admin/posts/${doc.id}`} style={ACTION_LINK}>Edit</Link>
                </span>
              </div>
            );
          })}
          {posts.length === 0 && <div style={EMPTY}>No posts yet — create your first one.</div>}
        </div>
      </div>

      {/* Recent polls */}
      <div style={SECTION}>
        <div style={SEC_HEADER}>
          <div style={SEC_TITLE}>Recent Polls</div>
          <Link href="/admin/polls" style={SEC_LINK}>View all →</Link>
        </div>
        <div style={TABLE}>
          <div style={TABLE_HEAD}>
            <span>Question</span><span>Options</span><span>Status</span><span>Actions</span>
          </div>
          {polls.slice(0, 5).map((doc) => {
            const p = doc.data();
            return (
              <div key={doc.id} style={TABLE_ROW}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>{p.question || '—'}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  {(p.options || []).length} options
                </span>
                <span>
                  <span style={p.isActive ? BADGE_LIVE : BADGE_DRAFT}>
                    {p.isActive ? 'Active' : 'Expired'}
                  </span>
                </span>
                <span style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/admin/polls/${doc.id}`} style={ACTION_LINK}>Edit</Link>
                </span>
              </div>
            );
          })}
          {polls.length === 0 && <div style={EMPTY}>No polls yet — create your first one.</div>}
        </div>
      </div>
    </main>
  );
}

/* ── Styles ─────────────────────────────────────── */
const PAGE       = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' };
const HEADER     = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' };
const EYEBROW    = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING    = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' };
const EMAIL      = { fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 };
const STATS_GRID = { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '2.5rem' };
const STAT_CARD  = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', textDecoration: 'none', color: '#fff', transition: 'border-color 0.2s', display: 'block' };
const STAT_LABEL = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' };
const SECTION    = { marginBottom: '2rem' };
const SEC_HEADER = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' };
const SEC_TITLE  = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' };
const SEC_LINK   = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', textDecoration: 'none' };
const TABLE      = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' };
const TABLE_HEAD = { display: 'grid', gridTemplateColumns: '2fr 1fr 100px 80px', gap: '1rem', padding: '12px 20px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' };
const TABLE_ROW  = { display: 'grid', gridTemplateColumns: '2fr 1fr 100px 80px', gap: '1rem', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' };
const BADGE_LIVE = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(63,202,122,0.15)', color: '#3fca7a', border: '1px solid rgba(63,202,122,0.25)', padding: '4px 10px', borderRadius: '100px' };
const BADGE_DRAFT= { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '100px' };
const ACTION_LINK= { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1E90FF', textDecoration: 'none' };
const EMPTY      = { padding: '2rem', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontWeight: 600 };
const BTN_PRIMARY= { display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', padding: '11px 20px', borderRadius: '100px', textDecoration: 'none' };
const BTN_GHOST  = { display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)', padding: '11px 20px', borderRadius: '100px', textDecoration: 'none' };
