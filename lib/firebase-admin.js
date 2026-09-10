import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const adminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Newlines handle karne ke liye replace lagaya gaya hai
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const adminApp = getApps().length === 0
  ? initializeApp({ credential: cert(adminConfig) })
  : getApps()[0];

export const adminDb = getFirestore(adminApp);