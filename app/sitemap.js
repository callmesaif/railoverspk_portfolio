import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BASE_URL = 'https://therails.pk';

// Static pages
const STATIC_PAGES = [
  { url: '/',          priority: '1.0', changefreq: 'weekly'  },
  { url: '/about',     priority: '0.8', changefreq: 'monthly' },
  { url: '/reviews',   priority: '0.9', changefreq: 'daily'   },
  { url: '/blogs',     priority: '0.9', changefreq: 'daily'   },
  { url: '/polls',     priority: '0.7', changefreq: 'daily'   },
  { url: '/contact',   priority: '0.6', changefreq: 'yearly'  },
  { url: '/privacy',   priority: '0.3', changefreq: 'yearly'  },
  { url: '/terms',     priority: '0.3', changefreq: 'yearly'  },
];

export default async function sitemap() {
  const today = new Date().toISOString();

  // Static pages
  const staticRoutes = STATIC_PAGES.map(({ url, priority, changefreq }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: today,
    changeFrequency: changefreq,
    priority: parseFloat(priority),
  }));

  // Dynamic blog posts from Firestore
  let blogRoutes = [];
  try {
    const q = query(collection(db, 'posts'), where('published', '==', true));
    const snap = await getDocs(q);
    blogRoutes = snap.docs.map(doc => {
      const data = doc.data();
      return {
        url: `${BASE_URL}/blogs/${doc.id}`,
        lastModified: data.updatedAt?.toDate?.()?.toISOString?.() || today,
        changeFrequency: 'monthly',
        priority: 0.7,
      };
    });
  } catch (err) {
    console.error('Sitemap: could not fetch blog posts', err);
  }

  return [...staticRoutes, ...blogRoutes];
}
