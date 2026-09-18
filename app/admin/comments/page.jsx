'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  collection, onSnapshot, orderBy,
  query, getDocs, deleteDoc, doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminComments() {
  const [groups,   setGroups]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'posts'), async snap => {
      const posts = snap.docs.map(d => ({ id: d.id, title: d.data().title || d.id }));
      const results = await Promise.all(
        posts.map(async post => {
          const q     = query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'desc'));
          const cSnap = await getDocs(q);
          const comments = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          return { ...post, comments };
        })
      );
      setGroups(results.filter(g => g.comments.length > 0));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleDelete(postId, commentId) {
    setDeleting(commentId);
    try {
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      setGroups(prev => prev.map(g =>
        g.id === postId
          ? { ...g, comments: g.comments.filter(c => c.id !== commentId) }
          : g
      ).filter(g => g.comments.length > 0));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(null);
    }
  }

  const totalComments = groups.reduce((s, g) => s + g.comments.length, 0);

  return (
    <main style={PAGE}>
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Moderation</div>
          <h1 style={HEADING}>Comments</h1>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
            {totalComments} total comment{totalComments !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {loading && <div style={EMPTY}>Loading comments…</div>}

      {!loading && groups.length === 0 && (
        <div style={EMPTY}>Abhi koi comments nahi hain.</div>
      )}

      {!loading && groups.map(group => (
        <div key={group.id} style={SECTION}>
          <div style={SEC_HEADER}>
            <div style={SEC_TITLE}>{group.title}</div>
            <Link href={`/blogs/${group.id}`} target="_blank" style={VIEW_LINK}>
              View Post ↗
            </Link>
          </div>

          <div style={TABLE}>
            <div style={TABLE_HEAD}>
              <span>Name</span>
              <span>Message</span>
              <span style={{ textAlign: 'right' }}>Date</span>
              <span style={{ textAlign: 'right' }}>Action</span>
            </div>
            {group.comments.map(c => (
              <div key={c.id} style={TABLE_ROW}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#fff' }}>
                  {c.name || 'Anonymous'}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.message}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {c.createdAt?.toDate
                    ? c.createdAt.toDate().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
                <span style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(group.id, c.id)}
                    disabled={deleting === c.id}
                    style={deleting === c.id ? { ...DEL_BTN, opacity: 0.5 } : DEL_BTN}
                  >
                    {deleting === c.id ? '…' : 'Delete'}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}

const PAGE      = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' };
const HEADER    = { marginBottom: '2.5rem' };
const EYEBROW   = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING   = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' };
const SECTION   = { marginBottom: '2rem' };
const SEC_HEADER= { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' };
const SEC_TITLE = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fff' };
const VIEW_LINK = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', textDecoration: 'none' };
const TABLE     = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' };
const TABLE_HEAD= { display: 'grid', gridTemplateColumns: '140px 1fr 120px 80px', gap: '1rem', padding: '12px 20px', fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)' };
const TABLE_ROW = { display: 'grid', gridTemplateColumns: '140px 1fr 120px 80px', gap: '1rem', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' };
const DEL_BTN   = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(249,112,112,0.12)', color: '#f97070', border: '1px solid rgba(249,112,112,0.25)', padding: '5px 12px', borderRadius: '100px', cursor: 'pointer' };
const EMPTY     = { padding: '3rem', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' };