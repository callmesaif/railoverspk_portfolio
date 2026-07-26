'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LocomotiveForm from '@/components/admin/LocomotiveForm';

export default function EditLocomotivePage({ params }) {
  const { id }             = use(params);
  const [loco, setLoco]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'locomotives', id)).then(snap => {
      if (snap.exists()) setLoco({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [id]);

  return (
    <main style={PAGE}>
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Fleet</div>
          <h1 style={HEADING}>{loading ? 'Loading…' : 'Edit Locomotive'}</h1>
          {loco?.name && <div style={SUB}>{loco.name}</div>}
        </div>
        <Link href="/admin/locomotives" style={BACK}>← Back</Link>
      </div>
      {loading ? <div style={EMPTY}>Loading…</div>
       : !loco ? <div style={EMPTY}>Not found.</div>
       : <LocomotiveForm existing={loco} id={id} />}
    </main>
  );
}

const PAGE    = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' };
const HEADER  = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' };
const EYEBROW = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1 };
const SUB     = { fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' };
const BACK    = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' };
const EMPTY   = { padding: '3rem', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)' };
