'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TrainForm from '@/components/admin/TrainForm';

export default function EditTrainPage({ params }) {
  const { id }             = use(params);
  const [train, setTrain]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'trains', id)).then(snap => {
      if (snap.exists()) setTrain({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [id]);

  return (
    <main style={{ padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' }}>Train Database</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1 }}>
            {loading ? 'Loading…' : 'Edit Train'}
          </h1>
          {train?.name && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{train.name}</div>}
        </div>
        <Link href="/admin/trains" style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Back</Link>
      </div>
      {loading    ? <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
       : !train   ? <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Not found.</div>
       : <TrainForm existing={train} id={id} />}
    </main>
  );
}