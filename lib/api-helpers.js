import { NextResponse } from 'next/server';

/* ─────────────────────────────────────────
   Success / Error response helpers
───────────────────────────────────────── */
export const ok     = (data, status = 200) => NextResponse.json({ success: true, data }, { status });
export const err    = (msg, status = 400) => NextResponse.json({ success: false, error: msg }, { status });
export const unauth = () => NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

/* ─────────────────────────────────────────
   Verify Firebase ID token AND admin role.
   A valid signed-in Firebase account alone is
   not sufficient for administrative access.
───────────────────────────────────────── */
export async function verifyAdmin(req) {
  try {
    const header = req.headers.get('authorization') || '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1]?.trim();
    if (!token) return null;

    const { adminAuth } = await import('@/lib/firebase-admin');
    // checkRevoked=true rejects disabled users and revoked sessions.
    const decoded = await adminAuth.verifyIdToken(token, true);

    return decoded.admin === true ? decoded.uid : null;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────
   Simple in-memory rate limiter.
   NOTE: This is best-effort only in serverless
   deployments; use a shared store for durable
   cross-instance enforcement.
───────────────────────────────────────── */
const rateLimitStore = new Map();

export function rateLimit(req, maxRequests = 20, windowMs = 60_000) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = ip;
  const now = Date.now();

  const entry = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  rateLimitStore.set(key, entry);

  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore) {
      if (now > v.resetAt) rateLimitStore.delete(k);
    }
  }

  return entry.count <= maxRequests;
}

/* ─────────────────────────────────────────
   Cache helper (in-memory, server-side)
───────────────────────────────────────── */
const cacheStore = new Map();

export function getCache(key) {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(key, data, ttlMs = 300_000) {
  if (data == null) {
    cacheStore.delete(key);
    return;
  }
  cacheStore.set(key, { data, expiresAt: Date.now() + ttlMs });
}