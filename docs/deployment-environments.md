# Deployment Environments

This document is the operational source of truth for environment variables,
WhatsApp provider mode, and secret placement across Pronto.IA services.

## Principles

- Never commit a real `.env` file.
- Never bake secrets into the Docker image.
- Store runtime secrets in Railway and Vercel dashboards.
- Treat every `NEXT_PUBLIC_*` variable as public.
- Use `WHATSAPP_*` names as the canonical Meta Cloud API variables.
- Keep `META_WHATSAPP_*` only as temporary compatibility aliases during migration.

## Environment Matrix

### Railway

Use Railway for the worker and persistent backend processes.

Required or expected there:

- `DATABASE_URL`
- `REDIS_URL`
- `ANTHROPIC_API_KEY`
- `WHATSAPP_PROVIDER`
- `ZAPI_INSTANCE_ID`
- `ZAPI_TOKEN`
- `ZAPI_SECURITY_TOKEN`
- `WHATSAPP_API_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `JWT_SECRET`
- `COOKIE_SECRET`
- `ADMIN_SECRET`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `RESEND_API_KEY`
- `GOOGLE_AI_API_KEY`
- `LLM_PROVIDER_PRIMARY`
- `LLM_PROVIDER_FALLBACK`
- `LLM_FALLBACK_ENABLED`
- `USD_TO_BRL_CENTS`

### Vercel

Use Vercel for the Next.js web app.

Only expose what the web app or Next.js server runtime actually needs:

- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `ABACATE_PAY_API_KEY`
- `SENTRY_DSN`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

Do not expose these in `NEXT_PUBLIC_*`:

- `ANTHROPIC_API_KEY`
- `ZAPI_INSTANCE_ID`
- `ZAPI_TOKEN`
- `ZAPI_SECURITY_TOKEN`
- `WHATSAPP_API_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_APP_SECRET`
- `JWT_SECRET`
- `COOKIE_SECRET`
- `ADMIN_SECRET`

## WhatsApp Provider Modes

### 1. MVP with Z-API

Use this while the product is still validating with the unofficial provider:

```env
WHATSAPP_PROVIDER=zapi
ZAPI_INSTANCE_ID=...
ZAPI_TOKEN=...
ZAPI_SECURITY_TOKEN=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<uuid>
```

Characteristics:

- Fastest path for MVP operations.
- Depends on a non-official WhatsApp integration.
- Suitable for pilot validation, not the desired long-term state.

### 2. Hybrid Transition

Use this while preparing the official Meta path without breaking the MVP.

```env
WHATSAPP_PROVIDER=zapi
ZAPI_INSTANCE_ID=...
ZAPI_TOKEN=...
ZAPI_SECURITY_TOKEN=...

WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<uuid>
WHATSAPP_APP_SECRET=...
```

Characteristics:

- Z-API remains active.
- Meta credentials can be added and tested in parallel.
- The code accepts both canonical and legacy Meta names during the transition.

### 3. Official Meta Cloud API

Use this after migration is validated:

```env
WHATSAPP_PROVIDER=cloud_api
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<uuid>
WHATSAPP_APP_SECRET=...
```

Characteristics:

- Official provider path.
- Better long-term operational posture.
- Canonical variable names should be used from this point onward.

## Canonical vs Legacy Variable Names

Canonical names used by the codebase:

- `WHATSAPP_API_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`

Legacy compatibility aliases still accepted:

- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`

Rule:

- New deployments should use only `WHATSAPP_*`.
- Legacy aliases exist only to reduce migration friction.

## Local Development

Local setup can still use:

```bash
cp .env.example .env
```

But:

- `.env` stays local only.
- `.env` must not be committed.
- `.env` must not be copied into the worker image.

## Docker Safety

Current expected behavior:

- `.dockerignore` blocks `.env` and `.env.*`
- `.env.example` is allowed for documentation only
- secrets must arrive at runtime from Railway or Vercel

If a future Docker change reintroduces `COPY .env*`, treat that as a security regression.
