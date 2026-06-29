import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import BlogClient from './BlogClient';

// ── Dynamic metadata — runs on server ────────────────────────────────
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const snap     = await getDoc(doc(db, 'posts', slug));
    if (snap.exists()) {
      const p = snap.data();
      return {
        title:       `${p.title} — RaiLoversPK`,
        description: p.content?.slice(0, 160) || 'Read this blog post on RaiLoversPK.',
        openGraph: {
          title:  p.title,
          images: p.coverImage ? [{ url: p.coverImage }] : [],
        },
      };
    }
  } catch {}
  return { title: 'Blog Post — RaiLoversPK' };
}

// ── Page — delegates rendering to Client Component ────────────────────
export default function BlogPostPage({ params }) {
  return <BlogClient params={params} />;
}
