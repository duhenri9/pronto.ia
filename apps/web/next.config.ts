import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@pronto-ia/database',
    '@pronto-ia/types',
    '@pronto-ia/auth',
    '@pronto-ia/events',
    '@pronto-ia/whatsapp',
    '@pronto-ia/llm',
  ],
};

export default nextConfig;
