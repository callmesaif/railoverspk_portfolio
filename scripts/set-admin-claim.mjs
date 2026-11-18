#!/usr/bin/env node
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const [uid, action = 'grant'] = process.argv.slice(2);

if (!uid || !['grant', 'revoke'].includes(action)) {
  console.error('Usage: node scripts/set-admin-claim.mjs <firebase-user-uid> [grant|revoke]');
  process.exit(1);
}

function serviceAccountFromEnv() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error('Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.');
  }

  return {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
}

try {
  const app = getApps()[0] || initializeApp({ credential: cert(serviceAccountFromEnv()) });
  const auth = getAuth(app);
  const user = await auth.getUser(uid);
  const claims = { ...(user.customClaims || {}) };

  if (action === 'grant') claims.admin = true;
  else delete claims.admin;

  await auth.setCustomUserClaims(uid, claims);

  // Invalidate existing sessions' ID tokens so role changes take effect promptly.
  if (action === 'revoke') {
    await auth.revokeRefreshTokens(uid);
  }

  console.log(`Admin claim ${action === 'grant' ? 'granted to' : 'revoked from'} ${uid}.`);
  console.log('The user must sign in again (or force-refresh their ID token) before the UI reflects the change.');
} catch (error) {
  console.error('Unable to update admin claim:', error.message);
  process.exitCode = 1;
}