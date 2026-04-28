# ADR-0011: Worker Hosting on Railway

## Status

Approved

## Context

Pronto.IA requires a persistent worker process to handle:
- WhatsApp inbound/outbound message processing
- Scheduled message delivery (daily check-ins, re-engagement)
- BullMQ job queue consumption from Redis
- Exercise evaluation pipeline (Anthropic Sonnet calls)

Next.js on Vercel cannot host long-running worker processes. Vercel serverless functions have execution time limits (10s hobby, 60s pro) that are incompatible with queue-driven workloads.

## Decision

Host the BullMQ worker on **Railway** (railway.app).

Railway provides:
- Persistent container runtime (no execution time limits)
- Built-in Redis hosting (compatible with our BullMQ queue)
- GitHub-integrated deploys (push to branch = deploy)
- Startups plan with generous free tier
- Dockerfile or Nixpacks build support
- sa-east-1 region availability (LGPD proximity)

## Architecture Impact

```
Vercel  →  Next.js 15 (frontend + API Routes + webhooks)
Railway →  BullMQ worker (Redis queue consumer)
Neon    →  PostgreSQL 16 (sa-east-1)
Anthropic → Claude API (direct, no proxy)
Z-API/Cloud API → WhatsApp Business
```

The worker repository will be a separate `apps/worker` package in the monorepo, deployed independently to Railway via Dockerfile.

## Consequences

### Positive
- Worker can run indefinitely — no timeout constraints
- Railway Redis can replace local Redis in production
- Independent deploy pipeline for worker ( Railway deploys on push)
- Cost-efficient for early stage (Railway free tier covers MVP traffic)

### Negative
- Two deploy targets (Vercel + Railway) — adds operational complexity
- Railway container sleeps on inactivity (starter plan) — needs keep-alive or upgrade
- Additional monitoring surface (Railway logs separate from Vercel)

### Mitigations
- Single `pnpm deploy:worker` script that triggers Railway deploy
- Health check endpoint in worker for Railway restart policy
- Sentry unified across both Vercel and Railway (same project, different environments)

## References

- Railway documentation: https://docs.railway.app
- BullMQ documentation: https://docs.bullmq.io
- Decision made by senior reviewer, 2025-04