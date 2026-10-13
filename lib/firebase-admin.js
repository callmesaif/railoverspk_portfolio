import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth }      from 'firebase-admin/auth';
import { getStorage }   from 'firebase-admin/storage';

/**
 * Firebase Admin SDK — server only.
 * Supports both:
 *   - FIREBASE_SERVICE_ACCOUNT (single JSON string) — recommended
 *   - FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (separate vars)
 */
function initAdmin() {
  if (getApps().length > 0) return getApps()[0];

  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Single JSON env var (easiest)
    credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  } else {
    // Separate env vars
    credential = cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    });
  }

  return initializeApp({
    credential,
    storageBucket: 'railspk-official-1de54.firebasestorage.app',
  });
}

const adminApp     = initAdmin();
export const adminDb      = getFirestore(adminApp);
export const adminAuth    = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
export default adminApp;
