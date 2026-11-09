'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TrainLeaderboard from '@/components/TrainLeaderboard';

export default function TopRatedSection() {
  const [topReviews, setTopReviews] = useState([]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const q = query(collection(db, 'reviews'), where('published', '==', true));
        const snap = await getDocs(q);
        setTopReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Reviews fetch error:', e);
      }
    }
    fetchReviews();
  }, []);

  return (
    <>
      {/* ── Top Rated Trains (Leaderboard) ───────── */}
      {topReviews.length > 0 && (
        <section className="container" style={{ padding: '0 2.5rem 4rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="sec-label">🏆 Rankings</div>
              <h2 className="sec-title">Top Rated Trains</h2>
            </div>
            <Link href="/reviews" style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              All Scorecards →
            </Link>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '24px', padding: '1.5rem' }}>
            <TrainLeaderboard reviews={topReviews} limit={5} compact />
          </div>
        </section>
      )}

    </>
  );
}
