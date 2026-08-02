/** @type {import('next').NextConfig} */
const nextConfig = {

  // ── Redirects — old URLs ko new pe bhejo ────────────────────────────
  async redirects() {
    return [
      // Old pages jo ab exist nahi karti
      { source: '/blog',               destination: '/blogs',    permanent: true },
      { source: '/vlogs',              destination: '/blogs',    permanent: true },
      { source: '/home',               destination: '/',         permanent: true },
      { source: '/community',          destination: '/',         permanent: true },
      { source: '/community/view',     destination: '/',         permanent: true },
      { source: '/community/view/',    destination: '/',         permanent: true },
      { source: '/heritage',           destination: '/about',    permanent: true },
      { source: '/schedule',           destination: '/reviews',  permanent: true },
      { source: '/planner',            destination: '/reviews',  permanent: true },
      { source: '/fares',              destination: '/refunds',  permanent: true },
      { source: '/support',            destination: '/contact',  permanent: true },
      { source: '/updates',            destination: '/blogs',    permanent: true },
      { source: '/gallery',            destination: '/',         permanent: true },

      // Trailing slash fix
      { source: '/reviews/',           destination: '/reviews',     permanent: true },
      { source: '/blogs/',             destination: '/blogs',        permanent: true },
      { source: '/contact/',           destination: '/contact',      permanent: true },
      { source: '/privacy/',           destination: '/privacy',      permanent: true },
      { source: '/terms/',             destination: '/terms',        permanent: true },
      { source: '/refunds/',           destination: '/refunds',      permanent: true },
      { source: '/about/',             destination: '/about',        permanent: true },
      { source: '/locomotives/',       destination: '/locomotives',  permanent: true },
      { source: '/heritage/',          destination: '/about',        permanent: true },
      { source: '/schedule/',          destination: '/reviews',      permanent: true },
      { source: '/planner/',           destination: '/reviews',      permanent: true },
      { source: '/fares/',             destination: '/refunds',      permanent: true },

      // Old review slug format (named slugs)
      { source: '/reviews/mehran',      destination: '/reviews', permanent: true },
      { source: '/reviews/greenline',   destination: '/reviews', permanent: true },
      { source: '/reviews/karachi',     destination: '/reviews', permanent: true },
      { source: '/reviews/shalimar',    destination: '/reviews', permanent: true },
      { source: '/reviews/khybermail',  destination: '/reviews', permanent: true },
      { source: '/reviews/bolanmail',   destination: '/reviews', permanent: true },
      { source: '/reviews/pakbusiness', destination: '/reviews', permanent: true },
      { source: '/reviews/allamaiqbal', destination: '/reviews', permanent: true },
      { source: '/reviews/karakoram',   destination: '/reviews', permanent: true },
      { source: '/reviews/subakkharam', destination: '/reviews', permanent: true },

      // Offers section — wildcard
      { source: '/offers/:path*',       destination: '/',        permanent: true },

      // Updates section — wildcard
      { source: '/updates/:path*',      destination: '/blogs',   permanent: true },
    ];
  },

  // ── Image optimization ──────────────────────────────────────────────
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com'                    },
      { protocol: 'https', hostname: 'img.youtube.com'                },
      { protocol: 'https', hostname: 'images.unsplash.com'            },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'i.ibb.co'                       },
      { protocol: 'https', hostname: 'ibb.co'                         },
    ],
  },

  // ── Compression ─────────────────────────────────────────────────────
  compress: true,

  // ── Headers — cache static assets aggressively ──────────────────────
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control',  value: 'on'                          },
          { key: 'X-Content-Type-Options',  value: 'nosniff'                     },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Cache fonts and static files for 1 year
        source: '/(.*)\\.(woff|woff2|ttf|eot|ico|svg|png|jpg|jpeg|webp|avif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // ── Experimental ────────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      '@tiptap/react',
      '@tiptap/pm',
      '@tiptap/starter-kit',
      'firebase/firestore',
      'firebase/auth',
    ],
  },
};

module.exports = nextConfig;