import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth }      from 'firebase-admin/auth';
import { getStorage }   from 'firebase-admin/storage';

/**
 * Firebase Admin SDK — lazy init, never crashes at build time.
 * Only initializes when first called at RUNTIME (not build time).
 */
let _app = null;

function getAdminApp() {
  if (_app) return _app;
  if (getApps().length > 0) { _app = getApps()[0]; return _app; }

  // Build time pe env vars nahi hoti — silently return null
  const hasSA   = process.env.FIREBASE_SERVICE_ACCOUNT;
  const hasCred = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

  if (!hasSA && !hasCred) return null;

  try {
    const credential = hasSA
      ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      : cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        });

    _app = initializeApp({
      credential,
      storageBucket: 'railspk-official-1de54.firebasestorage.app',
    });
    return _app;
  } catch (e) {
    console.error('[firebase-admin] Init failed:', e.message);
    return null;
  }
}

// Lazy proxy — only connects to Firebase when method is actually called
export const adminDb = {
  collection: (name) => {
    const app = getAdminApp();
    if (!app) throw new Error('Firebase Admin not initialized — check env vars.');
    return getFirestore(app).collection(name);
  },
};

export const adminAuth = {
  verifyIdToken: (token) => {
    const app = getAdminApp();
    if (!app) throw new Error('Firebase Admin not initialized — check env vars.');
    return getAuth(app).verifyIdToken(token);
  },
};

export const adminStorage = {
  bucket: () => {
    const app = getAdminApp();
    if (!app) throw new Error('Firebase Admin not initialized — check env vars.');
    return getStorage(app).bucket();
  },
};