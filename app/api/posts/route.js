import { adminDb } from '@/lib/firebase-admin';
import { ok, err, verifyAdmin, rateLimit, getCache, setCache } from '@/lib/api-helpers';

// GET /api/posts — published posts are public; drafts require admin authorization.
export async function GET(req) {
  if (!rateLimit(req, 60, 60_000)) return err('Too many requests', 429);

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (slug) {
    try {
      const snap = await adminDb.collection('posts').doc(slug).get();
      if (!snap.exists) return err('Post not found', 404);

      const post = { id: snap.id, ...snap.data() };
      if (post.published !== true) {
        const uid = await verifyAdmin(req);
        if (!uid) return err('Post not found', 404);
        // Never place private drafts in a shared public cache.
        return ok(post);
      }

      return ok(post);
    } catch (e) {
      return err('Unable to retrieve post', 500);
    }
  }

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
  } catch {
    return err('Unable to retrieve posts', 500);
  }
}

// POST — admin only
export async function POST(req) {
  const uid = await verifyAdmin(req);
  if (!uid) return err('Unauthorized', 401);

  try {
    const body = await req.json();
    const ref = await adminDb.collection('posts').add({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setCache('posts_public', null);
    return ok({ id: ref.id }, 201);
  } catch {
    return err('Unable to create post', 500);
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
    return ok({ id });
  } catch {
    return err('Unable to update post', 500);
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
  } catch {
    return err('Unable to delete post', 500);
  }
}