import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://quotation-api.dunamu.com https://open.er-api.com; frame-src 'self' https://www.youtube.com https://youtube.com;",
          },
        ],
      },
    ];
  },

  // Redirects for old HTML URLs to new Next.js routes
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pages/auth/:path*.html',
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/pages/k-col web software/protected/:path*.html',
        destination: '/k-col/:path*',
        permanent: true,
      },
      {
        source: '/pages/k-col web software/:path*.html',
        destination: '/k-col/:path*',
        permanent: true,
      },
      {
        source: '/pages/K-product/:path*.html',
        destination: '/k-product/:path*',
        permanent: true,
      },
      {
        source: '/pages/:path*.html',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },

  // Rewrite /health to API route
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health',
      },
    ];
  },
};

export default nextConfig;
