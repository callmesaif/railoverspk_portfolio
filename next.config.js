/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Image optimization ──────────────────────────────────────────────
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com'                   },
      { protocol: 'https', hostname: 'img.youtube.com'               },
      { protocol: 'https', hostname: 'images.unsplash.com'           },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com'},
      { protocol: 'https', hostname: 'i.ibb.co'                      },
      { protocol: 'https', hostname: 'ibb.co'                        },
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
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
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
