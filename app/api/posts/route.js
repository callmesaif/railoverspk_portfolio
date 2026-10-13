import { adminDb }                    from '@/lib/firebase-admin';
import { ok, err, verifyAdmin, rateLimit, getCache, setCache } from '@/lib/api-helpers';

// GET /api/posts — public, cached 5 min
export async function GET(req) {
  if (!rateLimit(req, 60, 60_000)) return err('Too many requests', 429);

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  // Single post by slug
  if (slug) {
    const cached = getCache(`post_${slug}`);
    if (cached) return ok(cached);

    const snap = await adminDb.collection('posts').doc(slug).get();
    if (!snap.exists) return err('Post not found', 404);
    const post = { id: snap.id, ...snap.data() };
    setCache(`post_${slug}`, post, 10 * 60_000);
    return ok(post);
  }

  // All published posts
  const cached = getCache('posts_public');
  if (cached) return ok(cached);

  try {
    const snap = await adminDb.collection('posts')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setCache('posts_public', posts, 5 * 60_000);
    return ok(posts);
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
    const ref  = await adminDb.collection('posts').add({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setCache('posts_public', null);
    return ok({ id: ref.id }, 201);
  } catch (e) {
    return err(e.message, 500);
  }
}

// PATCH — admin only
export async function PATCH(req) {
  const uid = await verifyAdmin(req);
  if (!uid) return err('Unauthorized', 401);

  try {
    const { id, ...data } = await req.json();
    if (!id) return err('ID required');
    await adminDb.collection('posts').doc(id).update({ ...data, updatedAt: new Date() });
    setCache('posts_public', null);
    setCache(`post_${id}`, null);
    return ok({ id });
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
    await adminDb.collection('posts').doc(id).delete();
    setCache('posts_public', null);
    return ok({ deleted: id });
  } catch (e) {
    return err(e.message, 500);
  }
}
