'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, updateDoc, deleteField, serverTimestamp, doc, getDoc, increment, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/* Comments live in a subcollection under each parent doc:
     posts/{id}/comments    → field "message"
     reviews/{id}/comments  → field "text"                       */
const SOURCES = [
  { type: 'posts',   label: 'Blog',    titleKey: 'title', href: id => `/blogs/${id}`,   color: '#1E90FF' },
  { type: 'reviews', label: 'Reviews', titleKey: 'name',  href: id => `/reviews/${id}`, color: '#ffb432' },
];

const commentText = c => c.message ?? c.text ?? '';
const commentTime = c => (c.createdAt?.toMillis ? c.createdAt.toMillis() : Date.now());

/* Live listener: all parents of one type + each parent's comments */
function useCommentGroups(source, onError) {
  const { type, titleKey } = source;
  const [parents,  setParents]  = useState(null);
  const [byParent, setByParent] = useState({});

  useEffect(() => {
    return onSnapshot(
      collection(db, type),
      snap => setParents(snap.docs.map(d => ({ id: d.id, title: d.data()[titleKey] || d.id }))),
      err  => { onError(`${type}: ${err.code || err.message}`); setParents([]); }
    );
  }, [type, titleKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const idsKey = parents ? parents.map(p => p.id).join('|') : null;

  useEffect(() => {
    if (!parents) return;
    const unsubs = parents.map(p =>
      onSnapshot(
        collection(db, type, p.id, 'comments'),
        snap => setByParent(prev => ({ ...prev, [p.id]: snap.docs.map(d => ({ id: d.id, ...d.data() })) })),
        err  => { onError(`${type}/${p.id}/comments: ${err.code || err.message}`); setByParent(prev => ({ ...prev, [p.id]: [] })); }
      )
    );
    return () => unsubs.forEach(u => u());
  }, [type, idsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const loading = parents === null || parents.some(p => !(p.id in byParent));

  const groups = (parents || [])
    .map(p => ({
      ...p,
      source,
      comments: [...(byParent[p.id] || [])].sort((a, b) => commentTime(b) - commentTime(a)),
    }))
    .filter(g => g.comments.length > 0);

  return { groups, loading };
}

export default function AdminComments() {
  const [errors,   setErrors]   = useState([]);
  const [tab,      setTab]      = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [replyingTo,  setReplyingTo]  = useState(null);
  const [replyDraft,  setReplyDraft]  = useState('');
  const [savingReply, setSavingReply] = useState(false);

  const addError = msg => setErrors(prev => (prev.includes(msg) ? prev : [...prev, msg]));

  const posts   = useCommentGroups(SOURCES[0], addError);
  const reviews = useCommentGroups(SOURCES[1], addError);

  const loading = posts.loading || reviews.loading;
  const count   = gs => gs.reduce((s, g) => s + g.comments.length, 0);
  const nPosts  = count(posts.groups);
  const nReview = count(reviews.groups);
  const awaiting = [...posts.groups, ...reviews.groups]
    .reduce((s, g) => s + g.comments.filter(c => !c.reply && commentText(c)).length, 0);

  const visible =
    tab === 'posts'   ? posts.groups :
    tab === 'reviews' ? reviews.groups :
    [...posts.groups, ...reviews.groups];

  async function handleDelete(type, parentId, c) {
    if (!window.confirm('Is comment ko delete karna hai? Yeh wapas nahi aayega.')) return;
    setDeleting(c.id);
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, type, parentId, 'comments', c.id));

      // A review comment may carry passenger ratings — take them back out of the totals
      if (type === 'reviews' && c.ratings) {
        const aggRef  = doc(db, 'review_ratings', parentId);
        const aggSnap = await getDoc(aggRef);
        if (aggSnap.exists()) {
          const agg = aggSnap.data();
          const dec = {};
          ['punctuality', 'cleanliness', 'comfort', 'food'].forEach(k => {
            const v = c.ratings[k];
            if (Number.isInteger(v) && (agg['n_' + k] || 0) >= 1 && (agg['s_' + k] || 0) >= v) {
              dec['n_' + k] = increment(-1);
              dec['s_' + k] = increment(-v);
            }
          });
          if (Object.keys(dec).length) batch.update(aggRef, { ...dec, updatedAt: serverTimestamp() });
        }
      }
      await batch.commit();
    } catch (e) {
      alert('Delete failed: ' + (e.code || e.message));
    } finally {
      setDeleting(null);
    }
  }

  function startReply(c) { setReplyingTo(c.id); setReplyDraft(c.reply || ''); }
  function cancelReply()  { setReplyingTo(null); setReplyDraft(''); }

  async function saveReply(type, parentId, commentId) {
    const text = replyDraft.trim();
    if (!text) return;
    setSavingReply(true);
    try {
      await updateDoc(doc(db, type, parentId, 'comments', commentId), {
        reply:     text,
        repliedAt: serverTimestamp(),
      });
      cancelReply();
    } catch (e) {
      alert('Reply save nahi hui: ' + (e.code || e.message));
    } finally {
      setSavingReply(false);
    }
  }

  async function removeReply(type, parentId, commentId) {
    if (!window.confirm('Is reply ko hata dena hai?')) return;
    try {
      await updateDoc(doc(db, type, parentId, 'comments', commentId), {
        reply:     deleteField(),
        repliedAt: deleteField(),
      });
    } catch (e) {
      alert('Reply remove nahi hui: ' + (e.code || e.message));
    }
  }

  const TABS = [
    { key: 'all',     label: 'All',     n: nPosts + nReview },
    { key: 'posts',   label: 'Blog',    n: nPosts           },
    { key: 'reviews', label: 'Reviews', n: nReview          },
  ];

  return (
    <main style={PAGE}>
      <div style={HEADER}>
        <div style={EYEBROW}>Moderation</div>
        <h1 style={HEADING}>Comments</h1>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
          {nPosts + nReview} total comment{nPosts + nReview !== 1 ? 's' : ''} · {awaiting} awaiting reply · live
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={tab === t.key ? TAB_ACTIVE : TAB}>
            {t.label} <span style={{ opacity: 0.7 }}>({t.n})</span>
          </button>
        ))}
      </div>

      {errors.length > 0 && (
        <div style={ERROR_BOX}>
          <strong>Kuch comments load nahi ho sake</strong> (Firestore rules check karo):
          {errors.map(e => <div key={e} style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>{e}</div>)}
        </div>
      )}

      {loading && <div style={EMPTY}>Loading comments…</div>}

      {!loading && visible.length === 0 && errors.length === 0 && (
        <div style={EMPTY}>Abhi koi comments nahi hain.</div>
      )}

      {!loading && visible.map(group => (
        <div key={group.source.type + group.id} style={SECTION}>
          <div style={SEC_HEADER}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexWrap: 'wrap' }}>
              <span style={{ ...TYPE_BADGE, color: group.source.color, borderColor: group.source.color + '55', background: group.source.color + '15' }}>
                {group.source.label}
              </span>
              <div style={SEC_TITLE}>{group.title}</div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{group.comments.length}</span>
            </div>
            <Link href={group.source.href(group.id)} target="_blank" style={VIEW_LINK}>View ↗</Link>
          </div>

          <div style={LIST}>
            {group.comments.map(c => (
              <div key={c.id} style={ROW}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>{c.name || 'Anonymous'}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                      {c.createdAt?.toDate
                        ? c.createdAt.toDate().toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'just now'}
                    </span>
                  </div>
                  {c.ratings && Object.values(c.ratings).some(n => n > 0) && (
                    <div style={RATE_CHIP}>
                      ★ {(Object.values(c.ratings).filter(n => n > 0).reduce((a, b) => a + b, 0) / Object.values(c.ratings).filter(n => n > 0).length).toFixed(1)}
                      <span style={{ opacity: 0.7 }}> · {Object.entries(c.ratings).map(([k, n]) => `${k.slice(0, 5)} ${n}`).join(' · ')}</span>
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {commentText(c) || '— rating only —'}
                  </p>

                  {replyingTo === c.id ? (
                    <div style={{ marginTop: '10px' }}>
                      <textarea
                        value={replyDraft}
                        onChange={e => setReplyDraft(e.target.value)}
                        placeholder="Reply likho…"
                        rows={3}
                        maxLength={1000}
                        autoFocus
                        style={REPLY_INPUT}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => saveReply(group.source.type, group.id, c.id)}
                          disabled={savingReply || !replyDraft.trim()}
                          style={{ ...BTN_BLUE, ...(savingReply || !replyDraft.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
                        >
                          {savingReply ? 'Saving…' : c.reply ? 'Update Reply' : 'Post Reply'}
                        </button>
                        <button onClick={cancelReply} style={BTN_GHOST}>Cancel</button>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginLeft: 'auto' }}>
                          {replyDraft.length}/1000
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {c.reply && (
                        <div style={REPLY_BOX}>
                          <div style={REPLY_LABEL}>↳ Your reply</div>
                          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.reply}</p>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => startReply(c)} style={BTN_BLUE_SOFT}>{c.reply ? 'Edit reply' : '↩ Reply'}</button>
                        {c.reply && (
                          <button onClick={() => removeReply(group.source.type, group.id, c.id)} style={BTN_RED_SOFT}>Remove reply</button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(group.source.type, group.id, c)}
                  disabled={deleting === c.id}
                  style={deleting === c.id ? { ...DEL_BTN, opacity: 0.5 } : DEL_BTN}
                >
                  {deleting === c.id ? '…' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}

const PAGE       = { padding: '2.5rem 1.25rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' };
const HEADER     = { marginBottom: '1.75rem' };
const EYEBROW    = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING    = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' };
const TAB        = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' };
const TAB_ACTIVE = { ...TAB, background: 'rgba(30,144,255,0.15)', color: '#fff', border: '1px solid rgba(30,144,255,0.35)' };
const SECTION    = { marginBottom: '1.75rem' };
const SEC_HEADER = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' };
const SEC_TITLE  = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#fff' };
const TYPE_BADGE = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '100px', border: '1px solid' };
const VIEW_LINK  = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', textDecoration: 'none', flexShrink: 0 };
const LIST       = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' };
const ROW        = { display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const DEL_BTN    = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(249,112,112,0.12)', color: '#f97070', border: '1px solid rgba(249,112,112,0.25)', padding: '6px 12px', borderRadius: '100px', cursor: 'pointer', flexShrink: 0 };
const EMPTY      = { padding: '3rem', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' };
const REPLY_INPUT = { width: '100%', boxSizing: 'border-box', background: '#131320', border: '1px solid rgba(30,144,255,0.35)', borderRadius: '12px', padding: '12px 14px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', lineHeight: 1.6, outline: 'none', resize: 'vertical' };
const REPLY_BOX   = { marginTop: '10px', padding: '10px 14px', background: 'rgba(30,144,255,0.07)', borderLeft: '3px solid #1E90FF', borderRadius: '0 12px 12px 0' };
const REPLY_LABEL = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '4px' };
const BTN_BLUE      = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '8px 16px', cursor: 'pointer' };
const BTN_GHOST     = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '100px', padding: '8px 16px', cursor: 'pointer' };
const BTN_BLUE_SOFT = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1E90FF', background: 'rgba(30,144,255,0.1)', border: '1px solid rgba(30,144,255,0.25)', borderRadius: '100px', padding: '6px 14px', cursor: 'pointer' };
const BTN_RED_SOFT  = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f97070', background: 'transparent', border: '1px solid rgba(249,112,112,0.25)', borderRadius: '100px', padding: '6px 14px', cursor: 'pointer' };
const RATE_CHIP   = { display: 'inline-block', fontSize: '11px', fontWeight: 800, color: '#7cc4ff', background: 'rgba(30,144,255,0.12)', border: '1px solid rgba(30,144,255,0.28)', borderRadius: '100px', padding: '3px 10px', marginBottom: '6px' };
const ERROR_BOX  = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#f97070', marginBottom: '1.25rem' };