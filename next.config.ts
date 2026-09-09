import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone runtime for the Vercel container image (Dockerfile.vercel):
  // keeps the production image small without dev dependencies.
  output: 'standalone',
};

export default nextConfig;
