'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPollsPage() {
  const [polls,   setPolls]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'polls'), (snap) => {
      setPolls(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this poll? All votes will be lost.')) return;
    await deleteDoc(doc(db, 'polls', id));
  }

  async function toggleActive(id, current) {
    await updateDoc(doc(db, 'polls', id), { isActive: !current });
  }

  return (
    <main style={PAGE}>
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Community</div>
          <h1 style={HEADING}>Polls</h1>
        </div>
        <Link href="/admin/polls/new" style={BTN_PRIMARY}>+ New Poll</Link>
      </div>

      {loading ? (
        <div style={EMPTY}>Loading polls…</div>
      ) : polls.length === 0 ? (
        <div style={EMPTY}>
          No polls yet.{' '}
          <Link href="/admin/polls/new" style={{ color: '#1E90FF' }}>Create one →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {polls.map(poll => {
            const optionsRaw = poll.options || [];
            const options = Array.isArray(optionsRaw) ? optionsRaw : Object.values(optionsRaw);
            const totalVotes = options.reduce((s, o) => s + (o.votes || 0), 0);
            return (
              <div key={poll.id} style={POLL_CARD}>
                {/* Status indicator */}
                <div style={STATUS_DOT(poll.isActive)} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>{poll.question || 'Untitled Poll'}</span>
                    <span style={poll.isActive ? BADGE_ACTIVE : BADGE_EXPIRED}>
                      {poll.isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>

                  {/* Options preview with vote bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {options.map((opt, i) => {
                      const pct = totalVotes > 0 ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', minWidth: '120px' }}>
                            {opt.label}
                          </span>
                          <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#1E90FF', borderRadius: '2px', transition: 'width 0.4s' }} />
                          </div>
                          <span style={{ fontSize: '10px', color: '#1E90FF', fontWeight: 700, minWidth: '36px' }}>
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '8px' }}>
                    {totalVotes} total vote{totalVotes !== 1 ? 's' : ''} · {options.length} options
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => toggleActive(poll.id, poll.isActive)} style={poll.isActive ? BTN_DEACTIVATE : BTN_ACTIVATE}>
                    {poll.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link href={`/admin/polls/${poll.id}`} style={BTN_EDIT}>Edit</Link>
                  <button onClick={() => handleDelete(poll.id)} style={BTN_DELETE}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const PAGE         = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' };
const HEADER       = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' };
const EYEBROW      = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING      = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1 };
const BTN_PRIMARY  = { display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', padding: '11px 20px', borderRadius: '100px', textDecoration: 'none' };
const POLL_CARD    = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '18px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' };
const STATUS_DOT   = (active) => ({ width: '8px', height: '8px', borderRadius: '50%', background: active ? '#3fca7a' : 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: '6px', boxShadow: active ? '0 0 6px rgba(63,202,122,0.5)' : 'none' });
const BADGE_ACTIVE = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(63,202,122,0.15)', color: '#3fca7a', border: '1px solid rgba(63,202,122,0.25)', padding: '3px 9px', borderRadius: '100px' };
const BADGE_EXPIRED= { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.1)', color: '#f97070', border: '1px solid rgba(239,68,68,0.2)', padding: '3px 9px', borderRadius: '100px' };
const BTN_EDIT      = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1E90FF', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(30,144,255,0.25)', background: 'rgba(30,144,255,0.08)', textAlign: 'center' };
const BTN_ACTIVATE  = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3fca7a', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(63,202,122,0.25)', background: 'rgba(63,202,122,0.08)', cursor: 'pointer' };
const BTN_DEACTIVATE= { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer' };
const BTN_DELETE    = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f97070', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer' };
const EMPTY         = { padding: '3rem', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 };
