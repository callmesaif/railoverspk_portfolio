import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ReviewClient from './ReviewClient';

// ── Dynamic metadata — runs on server ────────────────────────────────
export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const snap   = await getDoc(doc(db, 'reviews', id));
    if (snap.exists()) {
      const r    = snap.data();
      const s    = r.scores || {};
      const vals = [s.punctuality, s.cleanliness, s.comfort, s.food].filter(Boolean);
      const avg  = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
      return {
        title:       `${r.name} Review — RaiLoversPK`,
        description: `${r.name} train scorecard. Route: ${r.route}${avg ? `. Overall: ${avg}/5` : ''}. Expert review by RaiLoversPK.`,
        openGraph: {
          title:  `${r.name} — RaiLoversPK Scorecard`,
          images: r.coverImage ? [{ url: r.coverImage }] : [],
        },
      };
    }
  } catch {}
  return { title: 'Train Review — RaiLoversPK' };
}

// ── Page — delegates all rendering to Client Component ────────────────
export default function ReviewDetailPage({ params }) {
  return <ReviewClient params={params} />;
}
