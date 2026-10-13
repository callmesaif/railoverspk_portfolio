import { adminDb }                    from '@/lib/firebase-admin';
import { ok, err, verifyAdmin, rateLimit, getCache, setCache } from '@/lib/api-helpers';

export async function GET(req) {
  if (!rateLimit(req, 60, 60_000)) return err('Too many requests', 429);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const cached = getCache(`review_${id}`);
    if (cached) return ok(cached);
    const snap = await adminDb.collection('reviews').doc(id).get();
    if (!snap.exists) return err('Review not found', 404);
    const review = { id: snap.id, ...snap.data() };
    setCache(`review_${id}`, review, 10 * 60_000);
    return ok(review);
  }

  const cached = getCache('reviews_public');
  if (cached) return ok(cached);

  try {
    const snap = await adminDb.collection('reviews')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setCache('reviews_public', reviews, 5 * 60_000);
    return ok(reviews);
  } catch (e) {
    return err(e.message, 500);
  }
}

export async function POST(req) {
  const uid = await verifyAdmin(req);
  if (!uid) return err('Unauthorized', 401);

  try {
    const body = await req.json();
    const ref  = await adminDb.collection('reviews').add({ ...body, createdAt: new Date(), updatedAt: new Date() });
    setCache('reviews_public', null);
    return ok({ id: ref.id }, 201);
  } catch (e) {
    return err(e.message, 500);
  }
}

export async function PATCH(req) {
  const uid = await verifyAdmin(req);
  if (!uid) return err('Unauthorized', 401);

  try {
    const { id, ...data } = await req.json();
    if (!id) return err('ID required');
    await adminDb.collection('reviews').doc(id).update({ ...data, updatedAt: new Date() });
    setCache('reviews_public', null);
    setCache(`review_${id}`, null);
    return ok({ id });
  } catch (e) {
    return err(e.message, 500);
  }
}

export async function DELETE(req) {
  const uid = await verifyAdmin(req);
  if (!uid) return err('Unauthorized', 401);

  try {
    const { id } = await req.json();
    if (!id) return err('ID required');
    await adminDb.collection('reviews').doc(id).delete();
    setCache('reviews_public', null);
    return ok({ deleted: id });
  } catch (e) {
    return err(e.message, 500);
  }
}
