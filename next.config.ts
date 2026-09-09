import type { NextConfig } from 'next';

const API_PROXY_TARGET = 'https://nandy1.i-dacs.com';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone runtime for the Vercel container image (Dockerfile.vercel):
  // keeps the production image small without dev dependencies.
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${API_PROXY_TARGET}/health`,
      },
    ];
  },
};

export default nextConfig;
