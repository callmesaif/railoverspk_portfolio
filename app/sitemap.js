const BASE_URL     = 'https://therails.pk';
const PROJECT_ID   = 'railspk-official-1de54';
const FIRESTORE    = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const STATIC_PAGES = [
  { url: '/',            priority: 1.0, changefreq: 'weekly'  },
  { url: '/about',       priority: 0.8, changefreq: 'monthly' },
  { url: '/trains',      priority: 0.9, changefreq: 'daily'   },
  { url: '/reviews',     priority: 0.9, changefreq: 'daily'   },
  { url: '/blogs',       priority: 0.9, changefreq: 'daily'   },
  { url: '/locomotives', priority: 0.7, changefreq: 'weekly'  },
  { url: '/contact',     priority: 0.6, changefreq: 'yearly'  },
  { url: '/privacy',     priority: 0.3, changefreq: 'yearly'  },
  { url: '/terms',       priority: 0.3, changefreq: 'yearly'  },
  { url: '/refunds',     priority: 0.4, changefreq: 'monthly' },
];

/**
 * Fetch published docs from Firestore REST API — works on server/edge.
 */
async function fetchPublished(collectionName, urlPrefix, priority, changefreq) {
  try {
    const url =
      `${FIRESTORE}/${collectionName}` +
      `?pageSize=200` +
      `&orderBy=updatedAt desc`;

    const res  = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const json = await res.json();
    const docs = json.documents || [];

    return docs
      .filter(d => d.fields?.published?.booleanValue === true)
      .map(d => {
        const id         = d.name.split('/').pop();
        const updatedAt  = d.fields?.updatedAt?.timestampValue || new Date().toISOString();
        return {
          url:             `${BASE_URL}${urlPrefix}/${id}`,
          lastModified:    updatedAt,
          changeFrequency: changefreq,
          priority,
        };
      });
  } catch {
    return [];
  }
}

export default async function sitemap() {
  const today = new Date().toISOString();

  const staticRoutes = STATIC_PAGES.map(({ url, priority, changefreq }) => ({
    url:             `${BASE_URL}${url}`,
    lastModified:    today,
    changeFrequency: changefreq,
    priority,
  }));

  const [blogRoutes, reviewRoutes, locoRoutes, trainRoutes] = await Promise.all([
    fetchPublished('posts',       '/blogs',       0.7, 'monthly'),
    fetchPublished('reviews',     '/reviews',     0.8, 'monthly'),
    fetchPublished('locomotives', '/locomotives', 0.6, 'monthly'),
    fetchPublished('trains',      '/trains',      0.8, 'weekly'),
  ]);

  return [...staticRoutes, ...blogRoutes, ...reviewRoutes, ...locoRoutes, ...trainRoutes];
}