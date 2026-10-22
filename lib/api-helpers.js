import { NextResponse } from 'next/server';

/* ─────────────────────────────────────────
   Success / Error response helpers
───────────────────────────────────────── */
export const ok    = (data, status = 200)  => NextResponse.json({ success: true,  data },           { status });
export const err   = (msg,  status = 400)  => NextResponse.json({ success: false, error: msg },     { status });
export const unauth = ()                   => NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

/* ─────────────────────────────────────────
   Verify Firebase ID token from header
   Usage: const uid = await verifyAdmin(req);
          if (!uid) return unauth();
───────────────────────────────────────── */
export async function verifyAdmin(req) {
  try {
    const header = req.headers.get('Authorization') || '';
    const token  = header.replace('Bearer ', '').trim();
    if (!token) return null;

    const { adminAuth } = await import('@/lib/firebase-admin');
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid || null;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────
   Simple in-memory rate limiter
   Usage: if (!rateLimit(req, 10, 60000)) return err('Too many requests', 429);
───────────────────────────────────────── */
const rateLimitStore = new Map();

export function rateLimit(req, maxRequests = 20, windowMs = 60_000) {
  const ip  = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = `${ip}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count   = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  rateLimitStore.set(key, entry);

  // Cleanup old entries every 1000 requests
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore) {
      if (now > v.resetAt) rateLimitStore.delete(k);
    }
  }

  return entry.count <= maxRequests;
}

/* ─────────────────────────────────────────
   Cache helper (in-memory, server-side)
   Usage: const cached = getCache('key');
          if (cached) return ok(cached);
          setCache('key', data, 300_000); // 5 min
───────────────────────────────────────── */
const cacheStore = new Map();

export function getCache(key) {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cacheStore.delete(key); return null; }
  return entry.data;
}

export function setCache(key, data, ttlMs = 300_000) {
  cacheStore.set(key, { data, expiresAt: Date.now() + ttlMs });
}