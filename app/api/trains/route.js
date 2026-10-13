import { adminDb }                    from '@/lib/firebase-admin';
import { ok, err, verifyAdmin, rateLimit, getCache, setCache } from '@/lib/api-helpers';

// GET /api/trains — public, cached 5 min
export async function GET(req) {
  if (!rateLimit(req, 60, 60_000)) return err('Too many requests', 429);

  const cached = getCache('trains_public');
  if (cached) return ok(cached);

  try {
    const snap = await adminDb.collection('trains')
      .where('published', '==', true)
      .orderBy('name')
      .get();

    const trains = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setCache('trains_public', trains, 5 * 60_000);
    return ok(trains);
  } catch (e) {
    return err(e.message, 500);
  }
}

// POST /api/trains — admin only
export async function POST(req) {
  const uid = await verifyAdmin(req);
  if (!uid) return err('Unauthorized', 401);

  try {
    const body = await req.json();
    const ref  = await adminDb.collection('trains').add({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setCache('trains_public', null); // Invalidate cache
    return ok({ id: ref.id }, 201);
  } catch (e) {
    return err(e.message, 500);
  }
}

// PATCH /api/trains — admin only
export async function PATCH(req) {
  const uid = await verifyAdmin(req);
  if (!uid) return err('Unauthorized', 401);

  try {
    const { id, ...data } = await req.json();
    if (!id) return err('ID required');

    await adminDb.collection('trains').doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    setCache('trains_public', null);
    return ok({ id });
  } catch (e) {
    return err(e.message, 500);
  }
}

// DELETE /api/trains — admin only
export async function DELETE(req) {
  const uid = await verifyAdmin(req);
  if (!uid) return err('Unauthorized', 401);

  try {
    const { id } = await req.json();
    if (!id) return err('ID required');

    await adminDb.collection('trains').doc(id).delete();
    setCache('trains_public', null);
    return ok({ deleted: id });
  } catch (e) {
    return err(e.message, 500);
  }
}
