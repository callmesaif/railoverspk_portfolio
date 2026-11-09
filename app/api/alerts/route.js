import { NextResponse } from 'next/server';
import { runQuery } from '@/lib/firestoreRest';

export const dynamic = 'force-dynamic';

/**
 * Active service alerts for the homepage banner.
 * Cached at the CDN for 60 s, so a thousand visitors cost ~1 Firestore query a minute,
 * and the browser never needs the Firebase SDK just to show a banner.
 */
export async function GET() {
  try {
    const rows = await runQuery({
      from: [{ collectionId: 'daily_reports' }],
      where: { fieldFilter: { field: { fieldPath: 'active' }, op: 'EQUAL', value: { booleanValue: true } } },
    });
    const today = new Date().toISOString().split('T')[0];
    const alerts = rows
      .filter(r => !r.validUntil || r.validUntil >= today)
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
      .slice(0, 5)
      .map(({ id, alertType, affectedTrainNum, affectedTrainName, reason, details, alternativeTrains, date }) =>
        ({ id, alertType, affectedTrainNum, affectedTrainName, reason, details, alternativeTrains, date }));

    return NextResponse.json({ alerts }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json({ alerts: [] }, { headers: { 'Cache-Control': 'public, s-maxage=15' } });
  }
}
