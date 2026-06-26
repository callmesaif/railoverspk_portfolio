'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';
import { collection, query, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function PollsPage() {
  const [polls,   setPolls]   = useState([]);
  const [loading, setLoading] = useState(true);
  // voted: { [pollId]: optionIndex }
  const [voted,   setVoted]   = useState(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('rlpk_votes') || '{}'); } catch { return {}; }
  });
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    const q = query(collection(db, 'polls'));
    const unsub = onSnapshot(q, snap => {
      setPolls(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleVote(pollId, optionIndex) {
    if (voted[pollId] !== undefined) return; // already voted
    // Increment vote in Firestore
    await updateDoc(doc(db, 'polls', pollId), {
      [`options.${optionIndex}.votes`]: increment(1),
    });
    const newVoted = { ...voted, [pollId]: optionIndex };
    setVoted(newVoted);
    localStorage.setItem('rlpk_votes', JSON.stringify(newVoted));
  }

  const active  = polls.filter(p => p.isActive);
  const expired = polls.filter(p => !p.isActive);
  const shown   = activeTab === 'active' ? active : expired;

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* ── Header ───────────────────────────────── */}
      <div className="container" style={{ padding: '4rem 2.5rem 2.5rem' }}>
        <div className="eyebrow"><span className="eyebrow-line" />Community</div>
        <h1
          className="font-display"
          style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '0.5rem' }}
        >
          COMMUNITY <span style={{ color: 'var(--accent)' }}>POLLS</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '2rem', maxWidth: '480px', lineHeight: 1.7 }}>
          Vote on railway topics, share your opinion, and see what fellow rail fans think.
        </p>

        {/* Active / Expired toggle */}
        <div style={TOGGLE_ROW}>
          <button
            onClick={() => setActiveTab('active')}
            style={{ ...TOGGLE_BTN, ...(activeTab === 'active' ? TOGGLE_ACTIVE : {}) }}
          >
            🟢 Active ({active.length})
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            style={{ ...TOGGLE_BTN, ...(activeTab === 'expired' ? TOGGLE_EXPIRED : {}) }}
          >
            🔴 Closed ({expired.length})
          </button>
        </div>
      </div>

      {/* ── Polls grid ───────────────────────────── */}
      <div className="container" style={{ padding: '0 2.5rem 5rem' }}>
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', height: '240px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {!loading && shown.length === 0 && (
          <div style={EMPTY}>
            {activeTab === 'active' ? 'No active polls right now. Check back soon!' : 'No closed polls yet.'}
          </div>
        )}

        {!loading && shown.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {shown.map(poll => (
              <PollCard
                key={poll.id}
                poll={poll}
                userVote={voted[poll.id]}
                onVote={(idx) => handleVote(poll.id, idx)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function PollCard({ poll, userVote, onVote }) {
  const hasVoted = userVote !== undefined;

  // Firestore sometimes stores options as object {0:{...},1:{...}} instead of array
  const optionsRaw = poll.options || [];
  const optionsArr = Array.isArray(optionsRaw) ? optionsRaw : Object.values(optionsRaw);
  // Ensure each option has a label field (handle both {label, votes} and {text, votes} formats)
  const options = optionsArr.map(o =>
    typeof o === 'string' ? { label: o, votes: 0 } : { ...o, label: o.label || o.text || '' }
  );

  const totalVotes  = options.reduce((s, o) => s + (o.votes || 0), 0);
  const showResults = hasVoted || !poll.isActive;

  return (
    <div style={POLL_CARD}>
      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <span style={poll.isActive ? BADGE_ACTIVE : BADGE_EXPIRED}>
          {poll.isActive ? '🟢 Active' : '🔴 Closed'}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Question */}
      <h2
        className="font-display"
        style={{ fontSize: '1.5rem', textTransform: 'uppercase', lineHeight: 1.05, marginBottom: '1.5rem' }}
      >
        {poll.question}
      </h2>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {options.map((opt, i) => {
          const pct      = totalVotes > 0 ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
          const isChosen = userVote === i;

          return showResults ? (
            /* Results view */
            <div key={i} style={RESULT_ROW}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: isChosen ? 700 : 500, color: isChosen ? 'var(--accent)' : 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isChosen && <span style={{ fontSize: '11px' }}>✓</span>}
                  {opt.label || `Option ${i + 1}`}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: isChosen ? 'var(--accent)' : 'var(--muted)' }}>
                  {pct}%
                </span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${pct}%`, height: '100%', borderRadius: '3px',
                  background: isChosen ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', fontWeight: 600 }}>
                {opt.votes || 0} vote{opt.votes !== 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            /* Vote button */
            <button key={i} onClick={() => onVote(i)} style={VOTE_BTN}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)'; }}
            >
              {opt.label || opt.text || `Option ${i + 1}`}
            </button>
          );
        })}
      </div>

      {hasVoted && poll.isActive && (
        <div style={VOTED_NOTE}>✓ You voted · Results update live</div>
      )}
    </div>
  );
}

/* ── Styles ──────────────────────────────────── */
const TOGGLE_ROW    = { display: 'flex', gap: '6px', padding: '5px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '100px', width: 'fit-content', marginBottom: '0' };
const TOGGLE_BTN    = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '100px', border: 'none', cursor: 'pointer', color: 'var(--muted)', background: 'transparent', transition: 'all 0.2s' };
const TOGGLE_ACTIVE = { background: 'var(--accent)', color: '#fff' };
const TOGGLE_EXPIRED= { background: 'rgba(239,68,68,0.85)', color: '#fff' };

const POLL_CARD     = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column' };
const BADGE_ACTIVE  = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(63,202,122,0.12)', color: '#3fca7a', border: '1px solid rgba(63,202,122,0.25)', padding: '4px 12px', borderRadius: '100px' };
const BADGE_EXPIRED = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.1)', color: '#f97070', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 12px', borderRadius: '100px' };
const RESULT_ROW    = { background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px 14px' };
const VOTE_BTN      = { background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '13px 16px', color: 'var(--text)', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s, color 0.2s' };
const VOTED_NOTE    = { marginTop: '14px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', textAlign: 'center', paddingTop: '14px', borderTop: '1px solid var(--border)' };
const EMPTY         = { padding: '5rem 2rem', textAlign: 'center', fontSize: '14px', color: 'var(--muted)', fontWeight: 600, border: '1px dashed var(--border2)', borderRadius: '20px' };