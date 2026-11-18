import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/api-helpers';

export async function GET(req) {
  const uid = await verifyAdmin(req);
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = process.env.VERCEL_BEARER_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return NextResponse.json({ error: 'Deployment status is not configured' }, { status: 503 });
  }

  try {
    const url = new URL('https://api.vercel.com/v6/deployments');
    url.searchParams.set('projectId', projectId);
    url.searchParams.set('limit', '5');

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[admin/deployments] Vercel API returned', res.status);
      return NextResponse.json({ error: 'Unable to retrieve deployments' }, { status: 502 });
    }

    const data = await res.json();
    const deployments = (Array.isArray(data.deployments) ? data.deployments : []).map((item) => ({
      id: item.uid || item.id || null,
      url: item.url || null,
      state: item.state || item.readyState || null,
      createdAt: item.createdAt || item.created || null,
      target: item.target || null,
    }));

    return NextResponse.json({ deployments }, {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    });
  } catch (error) {
    console.error('[admin/deployments] Request failed:', error);
    return NextResponse.json({ error: 'Unable to retrieve deployments' }, { status: 502 });
  }
}