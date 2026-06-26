/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',          // YouTube thumbnails
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',       // YouTube thumbnails (alt)
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',   // Placeholder images
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Firebase Storage
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co', // ImgBB uploads
      },
      {
        protocol: 'https',
        hostname: 'ibb.co',
      },
    ],
  },
};

module.exports = nextConfig;
