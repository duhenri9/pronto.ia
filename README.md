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
| Auth jose (JWT HS256) | ✅ Implementado (tech debt — ADR pendente) |
| Event bus tipado | ✅ Implementado |
| BullMQ worker + Redis queue | ❌ Não implementado |
| Sentry error tracking | ❌ Não implementado |
| Storybook / Lighthouse CI | 🔜 Fase 2+ |
| Payments (Abacate Pay + Stripe) | 🔜 Fase 3 |

## Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Frontend + API | **Next.js 15** App Router | apps/web |
| ORM | **Drizzle ORM** + postgres.js | packages/database |
| Auth | **jose** (HS256 JWT) | packages/auth · tech debt reconhecido |
| LLM | **Anthropic Claude** (Haiku 4.5 / Sonnet 4.5) | packages/llm · API key direta |
| WhatsApp | **Meta Cloud API** (produção) / **Z-API** (pilot) | packages/whatsapp · factory pattern |
| DB | **PostgreSQL 16** | docker-compose.dev.yml |
| Queue | **Redis 7** (docker) + **BullMQ** (pendente) | worker hosted on Railway (ADR-0011) |
| Types | **Zod** + TypeScript strict | packages/types |
| Events | Typed EventEmitter | packages/events |

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
  web/            Next.js 15 (App Router + API Routes)
packages/
  database/       Drizzle ORM + schema + migrations
  auth/           jose JWT (sign/verify) + bcryptjs
  types/          Shared TypeScript types + Zod schemas
  llm/            Anthropic Claude client + guardrails
  whatsapp/       Cloud API + Z-API (factory pattern)
  events/         Typed domain event bus
prompts/
  personas/       Versioned persona system prompts (YAML frontmatter + MD)
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

> ADRs completos em `docs/adr/`.

## Roadmap

- ✅ Schema completo (users, trilhas, enrollment, whatsapp, llm, payments, LGPD)
- ✅ Stack migrada (Next.js + Drizzle + Anthropic + jose)
- ✅ Persona prompts versionados
- ✅ WhatsApp client factory
- 🔜 BullMQ worker (Railway)
- 🔜 Sentry (plan grátis, 1 import + 1 ENV)
- 🔜 Auth refactor (jose → melhor solução)
- 🔜 Payments (Abacate Pay + Stripe — Phase 3)

## Licença

Projeto privado. Todos os direitos reservados.