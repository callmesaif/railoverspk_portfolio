import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LocomotiveClient from './LocomotiveClient';

const SITE_URL = 'https://therails.pk';

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const snap   = await getDoc(doc(db, 'locomotives', id));
    if (snap.exists()) {
      const l = snap.data();
      const imageUrl = l.coverImage?.startsWith('http') ? l.coverImage : `${SITE_URL}/og-image.jpg`;
      const description = `${l.name} — ${l.model || 'locomotive'}${l.manufacturer ? ` by ${l.manufacturer}` : ''}. ${l.status === 'active' ? 'Currently active' : 'Retired'} in Pakistan Railways' fleet.`;

      return {
        title: `${l.name} — Locomotive Fleet | RaiLoversPK`,
        description,
        openGraph: {
          title: `${l.name} — RaiLoversPK Fleet`,
          description,
          url: `${SITE_URL}/locomotives/${id}`,
          siteName: 'RaiLoversPK',
          images: [{ url: imageUrl, width: 1200, height: 630, alt: l.name }],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${l.name} — RaiLoversPK Fleet`,
          description,
          images: [imageUrl],
        },
      };
    }
  } catch (err) {
    console.error('[metadata] locomotive fetch failed:', err);
  }
  return { title: 'Locomotive — RaiLoversPK' };
}

export default function LocomotiveDetailPage({ params }) {
  return <LocomotiveClient params={params} />;
}
