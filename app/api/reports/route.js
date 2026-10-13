import { adminDb }                    from '@/lib/firebase-admin';
import { ok, err, verifyAdmin, rateLimit, getCache, setCache } from '@/lib/api-helpers';

// GET /api/reports — public (for homepage + trains page alerts)
export async function GET(req) {
  if (!rateLimit(req, 60, 60_000)) return err('Too many requests', 429);

  const cached = getCache('reports_active');
  if (cached) return ok(cached);

  try {
    const today = new Date().toISOString().split('T')[0];
    const snap  = await adminDb.collection('daily_reports')
      .where('active', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const reports = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => !r.validUntil || r.validUntil >= today);

    setCache('reports_active', reports, 2 * 60_000); // 2 min cache (alerts need to be fresh)
    return ok(reports);
  } catch (e) {
    return err(e.message, 500);
  }
}

// POST — admin only
export async function POST(req) {
  const uid = await verifyAdmin(req);
  if (!uid) return err('Unauthorized', 401);

  try {
    const body = await req.json();
    const ref  = await adminDb.collection('daily_reports').add({
      ...body,
      active:    true,
      createdAt: new Date(),
      date:      new Date().toISOString().split('T')[0],
    });
    setCache('reports_active', null);
    return ok({ id: ref.id }, 201);
  } catch (e) {
    return err(e.message, 500);
  }
}

// DELETE — admin only
export async function DELETE(req) {
  const uid = await verifyAdmin(req);
  if (!uid) return err('Unauthorized', 401);

  try {
    const { id } = await req.json();
    if (!id) return err('ID required');
    await adminDb.collection('daily_reports').doc(id).delete();
    setCache('reports_active', null);
    return ok({ deleted: id });
  } catch (e) {
    return err(e.message, 500);
  }
}
