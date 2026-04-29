# Pronto.IA

Plataforma brasileira de treinamento em IA para MEIs (microempreendedores individuais).
WhatsApp-first: a mentora virtual Maria entrega microlições diretamente no WhatsApp do aluno.
Web é repositório — dashboard de progresso, certificados, gestão de trilhas.

## Status

🚧 **Em desenvolvimento ativo · Fase MVP**

| Funcionalidade | Estado |
|---|---|
| Schema Drizzle (13 tabelas, enums, LGPD) | ✅ Implementado |
| API Routes Next.js (health, auth, trilhas) | ✅ Implementado |
| Anthropic Claude client + guardrails | ✅ Implementado |
| Persona prompts (Maria, Bia, Léo, Tião, Evaluator) | ✅ Implementado |
| WhatsApp Cloud API + Z-API client | ✅ Implementado |
| Auth jose (JWT HS256) | ✅ Implementado (tech debt — ADR-0013) |
| Event bus tipado | ✅ Implementado |
| BullMQ worker + Redis queue | ✅ Implementado (3 processors) |
| Sentry error tracking | ✅ Implementado |
| Intent router (11 categorias + Gemini Flash) | ✅ Implementado + conectado ao inbound processor |
| Model escalation (Haiku → Sonnet por intent) | ✅ Implementado |
| Fluxos operacionais (onboarding, pagamento, cancelamento, LGPD, reativação) | ✅ Implementado |
| 7 microcápsulas gratuitas (FREE-L01 a FREE-L07) | ✅ Implementado |
| LLM kill switch (Redis flag + admin endpoints) | ✅ Implementado |
| Rate limiting + cost baseline | ✅ Implementado |
| Storybook / Lighthouse CI | 🔜 Fase 2+ |
| Payments (Abacate Pay + Stripe) | 🔜 Fase 3 |
| Deploy Railway (worker + migrations Neon) | 🔜 Pendente (credenciais) |

## Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Frontend + API | **Next.js 15** App Router | apps/web |
| ORM | **Drizzle ORM** + postgres.js | packages/database |
| Auth | **jose** (HS256 JWT) | packages/auth · tech debt reconhecido |
| LLM | **Anthropic Claude** (Haiku 4.5 / Sonnet 4.5) | packages/llm · kill switch via Redis |
| WhatsApp | **Z-API** (provider primário) | packages/whatsapp |
| Pagamento | **AbacatePay** (Pix + Cartão) | Phase 3 |
| DB | **PostgreSQL 16** (Neon, região sa-east-1) | packages/database |
| Queue | **Redis 7** + **BullMQ** | apps/worker · Railway |
| Infra Web | **Vercel** | Deploy via git push |
| Infra Worker | **Railway** | Processos persistentes + Redis nativo |
| Monorepo | **pnpm** + **Turborepo** | |
| Observabilidade | **Sentry** | Web + Worker |

## Architecture

```
┌───────────────────────────────────────────────┐
│  Vercel — Next.js 15 App Router               │
│  (frontend + API Routes)                      │
├───────────────────────────────────────────────┤
│  Railway — BullMQ worker + Redis              │
│  (WhatsApp inbound/outbound, scheduled msgs)  │
├───────────────────────────────────────────────┤
│  Neon — PostgreSQL 16 (sa-east-1)             │
│  (Drizzle ORM)                                │
├───────────────────────────────────────────────┤
│  Anthropic — Claude Haiku 4.5 + Sonnet 4.5   │
│  (direct API, no proxy)                       │
├───────────────────────────────────────────────┤
│  Z-API → Cloud API — WhatsApp Business        │
│  (factory: pilot → production)                │
└───────────────────────────────────────────────┘
```

## Monorepo Structure

```
apps/
  web/            Next.js 15 (App Router + API Routes + Admin endpoints)
  worker/         BullMQ worker (inbound/outbound/scheduled processors)
packages/
  database/       Drizzle ORM + schema + migrations + SQL helpers
  auth/           jose JWT (sign/verify) + bcryptjs
  types/          Shared TypeScript types + Zod schemas
  llm/            Anthropic Claude client + guardrails + kill switch + intent router + model mapper
  whatsapp/       Cloud API + Z-API (factory pattern)
  events/         Typed domain event bus
prompts/
  personas/       Versioned persona system prompts (YAML frontmatter + MD)
  router/         Intent classifier prompt (Gemini Flash)
docs/
  adr/            Architecture Decision Records
```

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment config
cp .env.example .env
# Fill in: ANTHROPIC_API_KEY, JWT_SECRET, WHATSAPP_API_TOKEN, etc.

# 3. Start PostgreSQL + Redis
docker compose -f docker-compose.dev.yml up -d

# 4. Generate Drizzle schema & push to DB
pnpm --filter @pronto-ia/database db:generate
pnpm --filter @pronto-ia/database db:push

# 5. Start dev server
pnpm --filter @pronto-ia/web dev
```

## ADRs

| ID | Decisão | Status |
|---|---|---|
| 0011 | Worker hosting on Railway | ✅ Aprovado |
| 0012 | Payments: Abacate Pay + Stripe | ✅ Aprovado (Phase 3) |
| 0013 | Auth migration: jose → Better Auth | 📋 Proposto (gatilho: 500 users / B2G) |

> ADRs completos em `docs/adr/`.

## Roadmap

- ✅ Schema completo (users, trilhas, enrollment, whatsapp, llm, payments, LGPD)
- ✅ Stack migrada (Next.js + Drizzle + Anthropic + jose)
- ✅ Persona prompts versionados (Maria, Bia, Léo, Tião, Evaluator)
- ✅ WhatsApp client factory
- ✅ BullMQ worker (3 queues: inbound, outbound, scheduled)
- ✅ Sentry error tracking
- ✅ Intent router (11 categorias, Gemini Flash 2.0, conectado ao inbound processor)
- ✅ Model escalation (Haiku → Sonnet por intent crítico)
- ✅ Fluxos operacionais (onboarding, pagamento, cancelamento, LGPD, reativação)
- ✅ 7 microcápsulas gratuitas (FREE-L01 a FREE-L07)
- ✅ LLM kill switch (Redis flag + admin API endpoints)
- ✅ Rate limiting + cost baseline
- 🔜 Deploy Railway (worker + migrations Neon)
- 🔜 Auth refactor (jose → Better Auth — ADR-0013)
- 🔜 Payments (Abacate Pay + Stripe — Phase 3, ADR-0012)

## Licença

Projeto privado. Todos os direitos reservados.