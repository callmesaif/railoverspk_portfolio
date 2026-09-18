import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Track a page view in Firestore analytics collection.
 * Each document ID = URL path (slashes replaced with underscores).
 * e.g. /trains/123 → trains_123
 */
export async function trackView(path) {
  try {
    // Sanitize path to use as Firestore doc ID
    const docId = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '_');
    const ref   = doc(db, 'analytics', docId);
    const snap  = await getDoc(ref);

    if (snap.exists()) {
      await updateDoc(ref, {
        views:    increment(1),
        lastSeen: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        path,
        views:     1,
        lastSeen:  serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }
  } catch (err) {
    // Silent fail — never break the page for analytics
    console.warn('[trackView] error:', err);
  }
}