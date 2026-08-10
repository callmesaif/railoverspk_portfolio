import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TrainClient from './TrainClient';

const SITE_URL = 'https://therails.pk';

export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const snap   = await getDoc(doc(db, 'trains', id));
    if (snap.exists()) {
      const t = snap.data();
      const desc = `${t.name} train — ${t.origin} to ${t.destination}. ${t.frequency || ''} service. Check timings, stops, and fares on RaiLoversPK.`;
      return {
        title: `${t.name} — Train Schedule | RaiLoversPK`,
        description: desc,
        openGraph: {
          title: `${t.name} — RaiLoversPK`,
          description: desc,
          images: t.coverImage ? [{ url: t.coverImage }] : [],
        },
      };
    }
  } catch {}
  return { title: 'Train Schedule — RaiLoversPK' };
}

export default function TrainDetailPage({ params }) {
  return <TrainClient params={params} />;
}