'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ReviewForm from '@/components/admin/ReviewForm';

export default function EditReviewPage({ params }) {
  const { id }              = use(params);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'reviews', id)).then(snap => {
      if (snap.exists()) setReview({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [id]);

  // Flatten scores back to form fields
  const existing = review ? {
    ...review,
    punctuality: review.scores?.punctuality ?? 0,
    cleanliness: review.scores?.cleanliness ?? 0,
    comfort:     review.scores?.comfort     ?? 0,
    food:        review.scores?.food        ?? 0,
  } : null;

  return (
    <main style={PAGE}>
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Train Reviews</div>
          <h1 style={HEADING}>{loading ? 'Loading…' : 'Edit Scorecard'}</h1>
          {review?.name && <div style={SUB}>{review.name}</div>}
        </div>
        <Link href="/admin/reviews" style={BACK}>← Back</Link>
      </div>
      {loading   ? <div style={EMPTY}>Loading scorecard…</div>
       : !review ? <div style={EMPTY}>Scorecard not found.</div>
       : <ReviewForm existing={existing} id={id} />}
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
