// lib/analytics.js
// Simple page view tracker using Firestore
// Call trackView(pagePath) on any page to record a view

import { db } from '@/lib/firebase';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';

export async function trackView(path) {
  try {
    const key = path.replace(/\//g, '_').replace(/^_/, '') || 'home';
    await setDoc(
      doc(db, 'analytics', key),
      {
        path,
        views: increment(1),
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    // Silent fail — don't break the page
  }
}
