import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Count a page view in the Firestore `analytics` collection.
 * Doc ID = URL path (slashes → underscores), e.g. /trains/123 → trains_123.
 * One merged write with an atomic increment — no read needed first.
 */
export async function trackView(path) {
  try {
    const docId = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '_');
    await setDoc(
      doc(db, 'analytics', docId),
      { path, views: increment(1), lastSeen: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    // Silent fail — never break the page for analytics
    console.warn('[trackView] error:', err);
  }
}
