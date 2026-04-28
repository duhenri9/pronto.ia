import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

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

export default withSentryConfig(nextConfig, { silent: true });
