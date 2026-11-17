import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function isValidVercelSignature(rawBody, signature, secret) {
  if (!signature || !/^[a-f0-9]{40}$/i.test(signature)) return false;

  const expected = createHmac('sha1', secret).update(rawBody, 'utf8').digest();
  const received = Buffer.from(signature, 'hex');

  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(req) {
  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[vercel-webhook] VERCEL_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-vercel-signature') || '';

  if (!isValidVercelSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { type, payload } = body || {};
  const deployment = payload?.deployment;
  const depId = deployment?.id;

  if (!deployment || typeof depId !== 'string' || !depId || depId.length > 200) {
    return NextResponse.json({ message: 'Ignored non-deployment event' }, { status: 200 });
  }

  try {
    const depData = {
      id: depId,
      state: typeof deployment.state === 'string' ? deployment.state : (type || 'UNKNOWN'),
      commitMessage: typeof deployment.meta?.githubCommitMessage === 'string'
        ? deployment.meta.githubCommitMessage.slice(0, 500)
        : 'Manual / Auto Deployment',
      branch: typeof deployment.meta?.githubCommitRef === 'string'
        ? deployment.meta.githubCommitRef.slice(0, 200)
        : 'main',
      url: typeof deployment.url === 'string' && deployment.url
        ? `https://${deployment.url.replace(/^https?:\/\//i, '')}`
        : '',
      createdAt: Number.isFinite(deployment.created) ? deployment.created : Date.now(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection('deployments').doc(depId).set(depData, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[vercel-webhook] Failed to persist deployment event:', error);
    return NextResponse.json({ error: 'Unable to process deployment event' }, { status: 500 });
  }
}