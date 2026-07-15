import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ReviewClient from './ReviewClient';

const SITE_URL = 'https://therails.pk';

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const snap   = await getDoc(doc(db, 'reviews', id));

    if (!snap.exists()) {
      console.log(`[metadata] Review not found: ${id}`);
      return { title: 'Train Review — RaiLoversPK' };
    }

    const r    = snap.data();
    const s    = r.scores || {};
    const vals = [s.punctuality, s.cleanliness, s.comfort, s.food].filter(Boolean);
    const avg  = vals.length ? (vals.reduce((a,b) => a+b,0) / vals.length).toFixed(1) : null;

    // Cover image must be an ABSOLUTE url for previews to work (WhatsApp/FB/Google)
    const imageUrl = r.coverImage?.startsWith('http')
      ? r.coverImage
      : `${SITE_URL}/og-image.jpg`; // fallback to default OG image

    const description = `${r.name} train scorecard. Route: ${r.route}${avg ? `. Overall rating: ${avg}/5` : ''}. Expert review by RaiLoversPK — Pakistan Railways.`;

    return {
      title:       `${r.name} Review — RaiLoversPK`,
      description,
      alternates: { canonical: `${SITE_URL}/reviews/${id}` },
      openGraph: {
        title:       `${r.name} — RaiLoversPK Scorecard`,
        description,
        url:         `${SITE_URL}/reviews/${id}`,
        siteName:    'RaiLoversPK',
        type:        'article',
        images: [{
          url:    imageUrl,
          width:  1200,
          height: 630,
          alt:    r.name,
        }],
      },
      twitter: {
        card:        'summary_large_image',
        title:       `${r.name} — RaiLoversPK Scorecard`,
        description,
        images:      [imageUrl],
      },
    };
  } catch (err) {
    console.error('[metadata] Failed to fetch review for metadata:', err);
    return { title: 'Train Review — RaiLoversPK' };
  }
}

export default function ReviewDetailPage({ params }) {
  return <ReviewClient params={params} />;
}