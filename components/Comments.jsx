'use client';
import { useEffect, useState } from 'react';
import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [name,     setName]     = useState('');
  const [message,  setMessage]  = useState('');
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState('');

  /* ── Live comments listener ── */
  useEffect(() => {
    if (!postId) return;
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [postId]);

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const trimName = name.trim();
    const trimMsg  = message.trim();
    if (!trimMsg) { setError('Message likhna zaruri hai.'); return; }

    setSending(true);
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        name:      trimName || 'Anonymous',
        message:   trimMsg,
        createdAt: serverTimestamp(),
      });
      setName('');
      setMessage('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch {
      setError('Comment send nahi hua — dobara try karein.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section style={WRAP}>
      {/* Header */}
      <div style={HEADER}>
        <div style={EYEBROW}>Community</div>
        <h2 style={HEADING}>
          Comments
          {!loading && comments.length > 0 && (
            <span style={COUNT}>{comments.length}</span>
          )}
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={FORM}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={60}
          style={INPUT}
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Leave a comment…"
          rows={4}
          maxLength={1000}
          required
          style={{ ...INPUT, resize: 'vertical', borderRadius: '14px', lineHeight: 1.6 }}
        />
        {error && <div style={ERROR}>{error}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button type="submit" disabled={sending} style={sending ? { ...BTN, opacity: 0.6, cursor: 'not-allowed' } : BTN}>
            {sending ? 'Sending…' : 'Post Comment'}
          </button>
          {sent && <span style={SUCCESS}>✓ Comment posted!</span>}
          <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: 'auto' }}>
            {message.length}/1000
          </span>
        </div>
      </form>

      {/* Comments list */}
      <div style={{ marginTop: '2rem' }}>
        {loading && (
          <div style={EMPTY}>Loading comments…</div>
        )}
        {!loading && comments.length === 0 && (
          <div style={EMPTY}>Pehla comment aap ka ho sakta hai! 🚂</div>
        )}
        {!loading && comments.map((c, i) => (
          <div key={c.id} style={{ ...COMMENT_CARD, ...(i === 0 ? { borderTop: '1px solid var(--border)' } : {}) }}>
            <div style={AVATAR}>
              {(c.name?.[0] || 'A').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={NAME}>{c.name || 'Anonymous'}</span>
                {c.createdAt?.toDate && (
                  <span style={DATE}>
                    {c.createdAt.toDate().toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <p style={MSG}>{c.message}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Styles ── */
const WRAP        = { marginTop: '3rem', fontFamily: "'Inter', sans-serif" };
const HEADER      = { marginBottom: '1.5rem' };
const EYEBROW     = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '6px' };
const HEADING     = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', textTransform: 'uppercase', lineHeight: 1, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' };
const COUNT       = { fontSize: '1rem', fontFamily: "'Inter', sans-serif", fontWeight: 700, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)', padding: '2px 10px', borderRadius: '100px' };
const FORM        = { display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem' };
const INPUT       = { background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: '100px', padding: '12px 18px', fontSize: '13px', color: 'var(--text)', fontFamily: "'Inter', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' };
const BTN         = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: 'var(--accent)', border: 'none', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', transition: 'opacity 0.2s' };
const ERROR       = { fontSize: '12px', color: '#f97070', fontWeight: 600 };
const SUCCESS     = { fontSize: '12px', color: '#3fca7a', fontWeight: 700 };
const EMPTY       = { padding: '2rem', textAlign: 'center', fontSize: '13px', color: 'var(--muted)', border: '1px dashed var(--border2)', borderRadius: '16px' };
const COMMENT_CARD= { display: 'flex', gap: '14px', padding: '1.25rem 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' };
const AVATAR      = { width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 900, flexShrink: 0 };
const NAME        = { fontSize: '13px', fontWeight: 700, color: 'var(--text)' };
const DATE        = { fontSize: '11px', color: 'var(--muted)' };
const MSG         = { fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0, wordBreak: 'break-word' };