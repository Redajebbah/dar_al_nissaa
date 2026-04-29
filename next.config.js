/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Router Cache for dynamic routes so admin changes appear instantly
  experimental: {
    staleTimes: {
      dynamic: 0,  // never cache dynamic pages in the browser router cache
      static: 180, // keep static pages cached for 3 min (fine for non-product pages)
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
};

module.exports = nextConfig;
