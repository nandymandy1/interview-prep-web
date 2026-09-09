import type { NextConfig } from 'next';
import { resolveApiProxyTarget } from './src/lib/proxy-target';

const apiProxyTarget = resolveApiProxyTarget(process.env.API_PROXY_TARGET);

if (apiProxyTarget === undefined) {
  console.warn(
    '[web] API_PROXY_TARGET is missing or invalid — /api requests will NOT be proxied to Express.',
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone runtime for the Vercel container image (Dockerfile.vercel):
  // keeps the production image small without dev dependencies.
  output: 'standalone',
  async rewrites() {
    if (!apiProxyTarget) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${apiProxyTarget}/health`,
      },
    ];
  },
};

export default nextConfig;
