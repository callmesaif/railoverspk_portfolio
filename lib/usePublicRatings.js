'use client';
import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RATING_CATS, summarizeAgg } from '@/lib/ratingMath';

/** All reviews' passenger ratings. null while loading, then { [reviewId]: summary } (empty {} on error). */
export function useAllPublicRatings() {
  const [byId, setById] = useState(null);
  useEffect(() => onSnapshot(
    collection(db, 'review_ratings'),
    snap => {
      const m = {};
      snap.docs.forEach(d => { m[d.id] = summarizeAgg(d.data()); });
      setById(m);
    },
    () => setById({})
  ), []);
  return byId;
}

/** One review's passenger ratings. null while loading. */
export function usePublicRating(reviewId) {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    if (!reviewId) return undefined;
    return onSnapshot(
      doc(db, 'review_ratings', reviewId),
      snap => setSummary(summarizeAgg(snap.exists() ? snap.data() : null)),
      () => setSummary(summarizeAgg(null))
    );
  }, [reviewId]);
  return summary;
}

/**
 * Fields to merge into review_ratings/{id} for one passenger's ratings.
 * `given` must already be cleaned (see cleanRatings) and non-empty.
 */
export function buildRatingWrite(given) {
  const data = { updatedAt: serverTimestamp() };
  RATING_CATS.forEach(({ key }) => {
    const v = given[key];
    if (v) { data['n_' + key] = increment(1); data['s_' + key] = increment(v); }
  });
  return data;
}