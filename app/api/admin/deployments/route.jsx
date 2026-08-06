import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const token = process.env.VERCEL_BEARER_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;

    if (!token || !projectId) {
      return NextResponse.json({ error: 'Missing Vercel credentials' }, { status: 500 });
    }

    // Free Vercel REST API endpoint
    const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 15 }, // 15 seconds Cache
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}