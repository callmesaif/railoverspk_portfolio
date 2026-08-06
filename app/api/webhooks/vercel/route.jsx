import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    if (!payload?.deployment) {
      return NextResponse.json({ message: 'Ignored non-deployment event' }, { status: 200 });
    }

    const deployment = payload.deployment;
    const depId = deployment.id;

    // Build cleaner deployment object
    const depData = {
      id: depId,
      state: deployment.state || type, // e.g. 'BUILDING', 'READY', 'ERROR'
      commitMessage: deployment.meta?.githubCommitMessage || 'Manual / Auto Deployment',
      branch: deployment.meta?.githubCommitRef || 'main',
      url: deployment.url ? `https://${deployment.url}` : '',
      createdAt: deployment.created || Date.now(),
      updatedAt: serverTimestamp(),
    };

    // Firestore document create ya merge update
    await setDoc(doc(db, 'deployments', depId), depData, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vercel Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}