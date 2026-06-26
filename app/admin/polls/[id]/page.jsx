'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PollForm from '@/components/admin/PollForm';

export default function EditPollPage({ params }) {
  const { id } = use(params);
  const [poll, setPoll]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'polls', id)).then(snap => {
      if (snap.exists()) setPoll({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [id]);

  return (
    <main style={PAGE}>
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Polls</div>
          <h1 style={HEADING}>{loading ? 'Loading…' : 'Edit Poll'}</h1>
          {poll?.question && <div style={SUBTITLE}>{poll.question}</div>}
        </div>
        <Link href="/admin/polls" style={BACK}>← Back to Polls</Link>
      </div>
      {loading ? (
        <div style={EMPTY}>Loading poll…</div>
      ) : !poll ? (
        <div style={EMPTY}>Poll not found.</div>
      ) : (
        <PollForm existing={poll} id={id} />
      )}
    </main>
  );
}

const PAGE     = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '700px' };
const HEADER   = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' };
const EYEBROW  = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING  = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1 };
const SUBTITLE = { fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', maxWidth: '500px' };
const BACK     = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' };
const EMPTY    = { padding: '3rem', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)' };
