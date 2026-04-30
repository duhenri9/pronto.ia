# Pronto.IA · Plano de Lançamento e Refatoração

> **Versão:** 1.0 final · 30/abr/2026
> **Status:** Aprovado por Ed Henrique · Pronto para implementação
> **Audiência:** Dev sênior (implementação), Ed (validação contínua)
>
> Documento consolidado a partir do plano do Tech Lead com correções técnicas, ajustes operacionais e adição do Data Core como linha de receita complementar.
>
> Substitui versão anterior do tech lead. Quando algo aqui muda, muda **primeiro aqui**, depois no código.

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Modelo de Acesso · Founder Benefit](#2-modelo-de-acesso--founder-benefit)
3. [Cap de 1.000 Founders · Implementação](#3-cap-de-1000-founders--implementação)
4. [Priorização dos Especialistas](#4-priorização-dos-especialistas)
5. [Data Core como Linha de Receita](#5-data-core-como-linha-de-receita)
6. [Plano de Execução · Sprints](#6-plano-de-execução--sprints)
7. [Alterações Técnicas · Schema e Código](#7-alterações-técnicas--schema-e-código)
8. [Comunicação e Templates da Maria](#8-comunicação-e-templates-da-maria)
9. [LGPD e Anonimização](#9-lgpd-e-anonimização)
10. [Métricas e Dashboards](#10-métricas-e-dashboards)
11. [Checklist de Validação](#11-checklist-de-validação)
12. [Anexos](#12-anexos)

---

## 1. Visão Geral

O Pronto.IA entra em fase de lançamento com modelo de acesso dual:

**Camada gratuita** — Maria conversa, entrega 7 microcápsulas de IA, qualifica o MEI e oferece o Pro quando critérios objetivos baterem.

**Camada Pro (R$ 29/mês)** — acesso aos especialistas. Estrutura em duas fases:

- **Fase de Lançamento (cap de 1.000 founders):** R$ 29/mês dá acesso vitalício a **todos** os especialistas, atuais e futuros. `plan_tier = "founder"` com `founder_benefit_locked = true`.
- **Pós-Lançamento (após cap de 1.000 atingido):** R$ 29/mês dá acesso a **1 especialista escolhido**. `plan_tier = "pro_single"`.

O **Zé da TI** entra ainda na fase de lançamento como segundo especialista, multiplicando valor da oferta founder e funcionando como gancho de aquisição. Ordem de ataque: Bia → Zé → Léo → Tião.

O **Data Core** é ativado desde o dia 1 como infraestrutura que vira linha de receita complementar a partir do mês 4-6 (relatórios B2B pro Sebrae, fintechs e bancos digitais).

### Princípios inegociáveis preservados

Os 5 princípios do `jornada-cliente.md` continuam absolutos:

1. **Respeito radical pelo silêncio do usuário** (P1) — sem reengajamento, sem mensagem espontânea promocional
2. **Zero fricção na entrada** — sem cadastro, sem formulário, direto pro WhatsApp
3. **Maria gratuita pra sempre**
4. **R$ 29/mês é o único preço de assinatura individual**
5. **Honestidade radical sobre o que ainda não existe**

A novidade é que durante a fase de lançamento, R$ 29 dá acesso vitalício a 4 especialistas. Pós-fase, R$ 29 dá acesso a 1. Não há tier intermediário.

---

## 2. Modelo de Acesso · Founder Benefit

### 2.1 Fase de Lançamento

| Atributo | Valor |
|---|---|
| Cap de assinaturas | 1.000 founders |
| Preço | R$ 29/mês |
| Inclui | Todos os especialistas, atuais (Bia, Zé) e futuros (Léo, Tião) |
| Tier no banco | `plan_tier = "founder"` |
| Benefício travado | `founder_benefit_locked = true` |
| Persistência | Mantido em cancelamento e reativação |
| Encerramento | Quando contador atinge 1.000 OU quando Ed decidir manualmente, o que vier primeiro |

**Comunicação central:** "Quem entra agora garante o acesso a todos os especialistas para sempre, por R$ 29/mês."

### 2.2 Pós-Lançamento

| Atributo | Valor |
|---|---|
| Preço | R$ 29/mês por especialista |
| Inclui | 1 especialista escolhido pelo aluno no momento da assinatura |
| Tier no banco | `plan_tier = "pro_single"` |
| Coluna adicional | `selected_specialist` (varchar — `bia`, `ze`, `leo`, `tiao`) |
| Mudança de especialista | Permitida 1x a cada 90 dias, sem custo adicional |

### 2.3 Permanência do benefício founder

Esta é a regra de ouro do tier founder:

```
Founder cancela → mantém founder_benefit_locked = true.
Founder reativa após 30 dias → volta como founder, R$ 29/mês, acesso total.
Founder reativa após 6 meses → volta como founder, R$ 29/mês, acesso total.
Founder reativa após 2 anos → volta como founder, R$ 29/mês, acesso total.

Sem letra miúda. Sem pegadinha. Sem reset.
```

Razão: confiança vale mais que receita marginal. Founder que volta depois de 2 anos volta porque confia. Quebrar a promessa destrói cohort inteiro de advocates.

**Exceção única:** se o aluno exercer "apaga tudo" (LGPD), perde o benefício porque a conta foi anonimizada. Aluno é avisado disso na confirmação do delete.

---

## 3. Cap de 1.000 Founders · Implementação

### 3.1 Por que 1.000

Decisão racional baseada em três variáveis:

**Estatística:** cohort de 1.000 é grande o suficiente pra análise comportamental significativa, distribuição por vertical e A/B test futuro.

**Receita base garantida:** 1.000 × R$ 29 × 12 meses = R$ 348.000 ARR no cohort fundador no primeiro ano (assumindo retenção alta típica de founders).

**Escassez real:** quando contador atingir 700-850, vira gatilho de conversão honesto. Acima de 2.000 dilui escassez.

### 3.2 Implementação técnica · contador atômico

A regra crítica é: **não pode haver race condition**. Se dois webhooks chegarem simultaneamente quando contador = 999, sistema precisa garantir que apenas um vira founder.

**Schema:**

```sql
CREATE TABLE launch_phase_config (
  id INT PRIMARY KEY DEFAULT 1,
  founder_cap INT NOT NULL DEFAULT 1000,
  founder_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  CONSTRAINT singleton CHECK (id = 1)
);

INSERT INTO launch_phase_config (id) VALUES (1);
```

**Webhook AbacatePay com transação atômica:**

```typescript
async function determineTier(userId: string): Promise<'founder' | 'pro_single'> {
  return await db.transaction(async (tx) => {
    const config = await tx
      .select()
      .from(launchPhaseConfig)
      .where(eq(launchPhaseConfig.id, 1))
      .for('update')  // 👈 lock pessimista crítico
      .limit(1)
      .then(rows => rows[0]);

    if (config.endedAt !== null) {
      return 'pro_single';
    }

    if (config.founderCount >= config.founderCap) {
      await tx
        .update(launchPhaseConfig)
        .set({ endedAt: new Date() })
        .where(eq(launchPhaseConfig.id, 1));
      return 'pro_single';
    }

    await tx
      .update(launchPhaseConfig)
      .set({ founderCount: config.founderCount + 1 })
      .where(eq(launchPhaseConfig.id, 1));

    return 'founder';
  });
}
```

**O `FOR UPDATE` é não-negociável.** Sem ele, race condition vira realidade.

### 3.3 Display público do contador

Landing page mostra contador atualizado a cada 60 segundos (cache SSR).

```
[FASE DE LANÇAMENTO ATIVA]
873 / 1000 founders já garantiram acesso vitalício
```

**Não fakear contador.** Se chegar a 1.000 mesmo, encerra. Honestidade é parte do valor da marca.

### 3.4 Override manual de Ed

Em casos excepcionais (parceria estratégica, jornalista, beta tester crítico), Ed pode forçar tier founder via endpoint admin:

```
POST /admin/founders/grant
Body: { user_id, reason, granted_by }
```

Esses casos não contam pro cap de 1.000 público — vão pra contador interno separado `manual_founders`. Auditoria completa. Limite sugerido: 50 manuais ao longo de toda a fase.

---

## 4. Priorização dos Especialistas

| Prioridade | Persona | Vertical | Quando entra | Justificativa |
|---|---|---|---|---|
| 1 | **Bia** | Salão de beleza, estética | MVP atual (Sprint 1-2) | Maior vertical digital (1,8M MEIs SAM 540k). Melhor PMF. |
| 2 | **Zé da TI** | Fundação digital transversal | Sprint 3 (mês 2-3) | Multiplicador de 6M MEIs cross-vertical. Aumenta retenção dos outros. |
| 3 | **Léo** | Food service, marmita, lanchonete | Mês 5-7 | TAM 1,9M, SAM 570k. Reusa aprendizado da Bia. |
| 4 | **Tião** | Eletricistas, encanadores, prestadores | Mês 9-12 | Público mais offline, conversão difícil, menor TAM digital. |

### Por que Zé da TI antes de Léo

Mudança em relação ao plano original (que era Bia → Léo → Tião → Zé). Justificativa:

**Razão 1 — TAM cross-vertical de 6 milhões.** Zé não é vertical, é camada transversal. Atende qualquer MEI sem fundação digital, independente do ramo.

**Razão 2 — multiplica retenção.** Aluna entra pela Bia, descobre que precisa configurar Google Meu Negócio antes de marketing avançado. Zé entrega isso. Aluna fica engajada, completa trilhas, vira advocate.

**Razão 3 — conteúdo durável.** Google Meu Negócio em 2026 funciona basicamente igual em 2030. Custo de manutenção do Zé é o menor dos 4.

**Razão 4 — gancho de aquisição forte.** Pitch "configuração grátis de Google Meu Negócio + WhatsApp Business" é viral. Zé pode ser usado como hook em campanhas.

**Razão 5 — outcome rápido.** MEI vê resultado em 1 semana (cliente novo achando o negócio no mapa). Bia entrega valor em 4-8 semanas. Zé é a prova rápida da tese.

**Razão 6 — alinhado com fase founder.** Cada especialista a mais incluído no benefício founder dobra o valor percebido sem aumentar preço. "R$ 29 vitalício pra Bia + Zé" é pitch mais forte que "R$ 29 vitalício só Bia."

### Conteúdo do Zé · estrutura

7 microcápsulas equivalentes às da Bia, mas focadas em fundação digital:

| Lição | Título | Objetivo |
|---|---|---|
| ZE-L01 | Por que aparecer no Google muda seu negócio | Conceito de presença digital |
| ZE-L02 | Configurando seu Google Meu Negócio em 15 minutos | Passo a passo guiado |
| ZE-L03 | WhatsApp Business: catálogo, mensagens automáticas, perfil | Setup completo |
| ZE-L04 | Foto profissional com celular: regras simples | Fotografia básica |
| ZE-L05 | Bio.site ou Linktree: seu link único | Agregador de contatos |
| ZE-L06 | Segurança digital: senha forte, 2FA, golpes do Pix | Proteção básica |
| ZE-L07 | Respondendo review: o que falar e o que evitar | Reputação online |

**Tom do Zé:** "técnico do bairro que conserta computador e explica sem enrolação." Mais paciente que o Tião, menos enérgico que o Léo. Cor de marca: azul técnico `#3B82F6`.

**Vocabulário aprovado do Zé:** "deixa eu te mostrar uma coisa", "isso aqui é mais fácil do que parece", "você já faz isso sem saber", "não tem segredo não", "passa devagar comigo", "anota aí", "vai funcionar".

---

## 5. Data Core como Linha de Receita

### 5.1 O que é

Sistema de coleta, estruturação, anonimização e exportação de dados comportamentais agregados sobre MEIs brasileiros usando IA. Não é feature de produto — é **ativo estratégico** que vira receita complementar.

### 5.2 Dados coletados (já implementado parcialmente no schema atual)

| Categoria | Dados | Origem |
|---|---|---|
| Perfil | Vertical, cidade, faixa de tempo de formalização, faixa de faturamento estimado | Onboarding + business_context |
| Comportamento | Padrões de uso, horários, taxa de engajamento por trilha | Tabela `messages` + `user_lesson_completions` |
| Dores | Perguntas mais frequentes, temas com mais abandono | `messages` + `intent` classification |
| Outcomes | Impacto financeiro reportado (faixas, sem valor exato) | Tabela `outcomes` |
| Geográfico | Distribuição por município/estado | Onboarding |

### 5.3 Modelos de monetização · ordem de implementação

**Modelo 1 — Relatórios trimestrais agregados (mês 4-9)**

Vende relatórios estáticos PDF/PowerBI com tendências e insights agregados. Zero PII. Ticket R$ 30-100k por cliente.

Clientes-alvo prioritários:

- **Sebrae nacional e estaduais** — interessados em entender comportamento real do MEI pra desenhar políticas e conteúdo. Ticket R$ 50-150k por relatório anual.
- **Bancos digitais PJ** (Nubank PJ, Cora, Conta Simples, Stone, PagBank) — interessados em pulse de demanda. Ticket R$ 30-80k.
- **Marcas que vendem para MEI** (Linx, Sympla, mLabs, Hotmart) — segmentação por intenção de compra. Ticket R$ 20-60k.
- **Investidores e research firms** — relatório macro. Ticket R$ 50-200k.

ARR potencial mês 12 com 5-8 clientes: **R$ 200-600k.**

**Modelo 2 — Dashboard B2B SaaS (mês 13-18)**

Cliente paga assinatura mensal pra acessar dashboard `/insights-b2b` com dados agregados em tempo real. MRR recurring. Ticket R$ 5-30k/mês.

Implementação só depois do Modelo 1 ter provado demanda. ARR potencial mês 24: **R$ 500-1.500k.**

**Modelo 3 — Lead generation com opt-in explícito (mês 18+)**

Aluno do Pro **escolhe** receber recomendações de parceiros. Pronto.IA cobra parceiros por lead qualificada. R$ 30-100/lead.

**Implementação só após 5.000 alunos ativos pagantes.** Antes disso, risco de marca alto demais. Opt-in tem que ser explícito, granular ("quero receber sobre maquininha de cartão? Sim/Não") e revogável a qualquer momento.

**Modelo 4 — Produtos derivados premium (mês 18+)**

Index de Performance do MEI BR, ranking de cidades, benchmark setorial. Pode ser B2C (R$ 49 por relatório individual) ou licenciado pra mídia (Exame, InfoMoney por exclusividade trimestral).

### 5.4 Modelos NÃO recomendados

**Não vende dados PII pra ninguém.** Em hipótese alguma. Mesmo com consentimento explícito.

**Não vende para empresas de cobrança ou crédito predatório.** Mesmo que o ticket seja alto, dano de marca destrói o produto principal.

**Não vende dados que permitam re-identificar indivíduos.** Anonimização robusta com k-anonymity > 50 é regra mínima.

### 5.5 Pipeline de exportação separado

Dado de produção que alimenta Maria não é o mesmo dado que vai pra cliente B2B.

```
┌─────────────────────┐
│  Postgres produção  │
│  (Maria + Worker)   │
└──────────┬──────────┘
           │ ETL diário
           ▼
┌─────────────────────┐
│   Data Warehouse    │
│  (BigQuery ou       │
│   ClickHouse)       │
│                     │
│  Anonimizado +      │
│  Agregado           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Relatórios PDF     │
│  Dashboard B2B      │
│  API enrichment     │
└─────────────────────┘
```

Cliente B2B nunca toca produção. Garante isolamento de risco e performance.

### 5.6 Cronograma realista

| Mês | Atividade | Receita esperada |
|---|---|---|
| 1-3 | Infra: dashboard `/admin/insights`, pipeline ETL, anonimização, política revisada | R$ 0 |
| 4-6 | Primeiro mockup de relatório, apresentação a 3-5 contatos Sebrae/banco | R$ 0 |
| 7-9 | Primeiro contrato piloto (1 cliente, ticket R$ 15-30k) | R$ 15-30k pontual |
| 10-12 | Escala pra 3-5 clientes, ticket R$ 30-80k | R$ 100-300k anual |
| 13-18 | Lança Modelo 2 (Dashboard B2B SaaS) | MRR R$ 50-150k |

---

## 6. Plano de Execução · Sprints

### Sprint 1 — Fundação Operacional (em andamento, 80% completo)

Status atual conforme última auditoria do dev:

- ✅ README atualizado
- ✅ Worker BullMQ local
- ❌ Deploy Railway (aguardando credenciais — desbloquear esta semana)
- ✅ Sentry web + worker
- ✅ Rate limit + allowlist
- ✅ Cost baseline

**Pendência crítica:** deploy Railway. Sem isso, nada vai pro ar.

### Sprint 2 — Otimização (em andamento, 90% completo)

- ✅ Prompt caching (TTL aceitável, sem monitoring de hit/miss — fica como dívida)
- ✅ Roteador de intents conectado ao inbound
- ✅ Kill switch LLM operacional
- ✅ Lições gratuitas reescritas (4, 5, 7)

**Pendência:** monitoring de cache hit/miss. Não bloqueia. Fica pra Sprint 3.

### Sprint 3 — Zé da TI + Founder Benefit (5-7 dias)

**Bloco A · Founder Benefit (2 dias):**

- Schema: `plan_tier`, `founder_benefit_locked`, `selected_specialist` em `subscriptions`
- Schema: tabela `launch_phase_config` com contador atômico
- Webhook AbacatePay com transação `FOR UPDATE` decidindo tier
- Função `canAccessSpecialist(user, specialist)` em `packages/llm/src/access.ts`
- Endpoint admin `POST /admin/founders/grant` para overrides manuais
- Endpoint público `GET /api/v1/launch-phase` que retorna `{ active, count, cap }` para landing

**Bloco B · Zé da TI (3-4 dias):**

- Criar `prompts/personas/ze-da-ti.md` seguindo estrutura `basePrompt + ---DYNAMIC---`
- Criar `apps/worker/src/flows/ze-lessons.ts` com 7 lições (ZE-L01 a ZE-L07)
- Adicionar intent `question_fundacao_digital` ao roteador (regex + Gemini fallback)
- Adicionar Zé ao `model-mapper.ts` (default Haiku, escalation Sonnet em momentos críticos)
- Atualizar prompts da Maria para mencionar Zé na oferta Pro durante fase founder
- Templates novos: `PRO-02-FOUNDER`, `ZE-01`, `ZE-02-HANDOFF`
- Atualizar Bia para fazer handback para Zé quando assunto for fundação digital

**Bloco C · Validação (1 dia):**

- Teste end-to-end: novo usuário entra durante fase founder, paga, recebe acesso a Bia e Zé
- Teste de race condition: 1.000 webhooks simulados em paralelo, verifica que apenas 1.000 viram founder
- Teste de fim de fase: usuário 1.001 entra como `pro_single`
- Teste de override manual

### Sprint 4 — Beta Público + Data Core Inicial (7-10 dias)

**Bloco A · Beta:**

- Landing page com contador founder em destaque
- Convite explícito a 10-50 usuários reais (família, amigos donos de MEI, contatos próximos)
- Monitoramento intensivo Sentry primeiros 7 dias
- Reuniões diárias Ed + dev pra revisar logs e ajustar

**Bloco B · Data Core Infraestrutura:**

- Dashboard `/admin/insights` com métricas agregadas
- Pipeline ETL Postgres → BigQuery (ou ClickHouse)
- Política de privacidade revisada com cláusula explícita de dados agregados
- Anonimização k-anonymity > 50 implementada
- Mockup de relatório B2B trimestral (PDF estático com 10-15 páginas)

### Sprint 5 — Léo (mês 5-7)

Replica estrutura do Zé. Estimativa: 5 dias. Léo aprende com tudo que Bia e Zé já implementaram.

### Sprint 6 — Data Core Comercial (mês 6-9)

- Apresentações a 5 contatos Sebrae/bancos
- Refinamento do relatório com base em feedback
- Primeiro contrato piloto (ticket R$ 15-30k)
- Aprendizado de ciclo de vendas B2B

### Sprint 7 — Tião (mês 9-12)

Último especialista. Replica estrutura. ~5 dias.

---

## 7. Alterações Técnicas · Schema e Código

### 7.1 Schema · alterações na tabela `subscriptions`

```sql
ALTER TABLE subscriptions
  ADD COLUMN plan_tier VARCHAR(20),  -- 👈 SEM default, controle no webhook
  ADD COLUMN founder_benefit_locked BOOLEAN DEFAULT false,
  ADD COLUMN selected_specialist VARCHAR(20);  -- só usado quando tier=pro_single

-- Constraint de integridade
ALTER TABLE subscriptions
  ADD CONSTRAINT plan_tier_valid
  CHECK (plan_tier IN ('founder', 'pro_single'));

-- Constraint: pro_single deve ter selected_specialist
ALTER TABLE subscriptions
  ADD CONSTRAINT pro_single_must_have_specialist
  CHECK (
    plan_tier != 'pro_single' OR selected_specialist IS NOT NULL
  );

-- Constraint: founder não tem selected_specialist
ALTER TABLE subscriptions
  ADD CONSTRAINT founder_no_selected_specialist
  CHECK (
    plan_tier != 'founder' OR selected_specialist IS NULL
  );
```

**Crítico:** `plan_tier` é `NULL` por default e setado **explicitamente** pelo webhook. Sem default `'founder'` para evitar bug de assinatura manual virar founder por engano.

### 7.2 Schema · tabela `launch_phase_config`

```sql
CREATE TABLE launch_phase_config (
  id INT PRIMARY KEY DEFAULT 1,
  founder_cap INT NOT NULL DEFAULT 1000,
  founder_count INT NOT NULL DEFAULT 0,
  manual_founder_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  CONSTRAINT singleton CHECK (id = 1)
);

INSERT INTO launch_phase_config (id) VALUES (1);
```

### 7.3 Função de verificação de acesso

```typescript
// packages/llm/src/access.ts

export type Specialist = 'bia' | 'ze' | 'leo' | 'tiao';

export async function canAccessSpecialist(
  userId: string,
  specialist: Specialist
): Promise<boolean> {
  const sub = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active'),
    ),
  });

  if (!sub) return false;

  if (sub.planTier === 'founder') {
    return true;  // founder tem acesso a tudo
  }

  if (sub.planTier === 'pro_single') {
    return sub.selectedSpecialist === specialist;
  }

  return false;
}
```

### 7.4 Webhook AbacatePay com decisão de tier

```typescript
// apps/web/app/api/v1/webhooks/abacate/route.ts

export async function POST(req: Request) {
  const event = await validateAndParseWebhook(req);

  if (event.type !== 'checkout.paid') {
    return Response.json({ ok: true });
  }

  const userId = event.metadata.user_id;

  // Decide tier ATOMICAMENTE
  const tier = await determineTier(userId);

  // Cria subscription com tier correto
  await db.transaction(async (tx) => {
    const subscription = await tx.insert(subscriptions).values({
      userId,
      status: 'active',
      planTier: tier,
      founderBenefitLocked: tier === 'founder',
      selectedSpecialist: tier === 'pro_single' ? 'bia' : null,  // default no MVP
      currentPeriodStart: new Date(),
      currentPeriodEnd: addDays(new Date(), 30),
      abacateSubscriptionId: event.subscription_id,
    });

    await tx.update(users)
      .set({ lifecycleState: 'active_pro', pendingAction: 'awaiting_email' })
      .where(eq(users.id, userId));
  });

  // Maria envia confirmação
  await enqueueOutbound({
    user_id: userId,
    template: tier === 'founder' ? 'PAY_02_FOUNDER' : 'PAY_02_PRO_SINGLE',
  });

  return Response.json({ ok: true });
}
```

### 7.5 Reativação preservando founder

```typescript
// apps/worker/src/flows/renewal.ts

export async function handleReactivationRequest(userId: string) {
  const lastSub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
    orderBy: desc(subscriptions.createdAt),
  });

  // PROMESSA FOUNDER: tier preservado em reativação, sem reset
  const newTier = lastSub?.founderBenefitLocked ? 'founder' : 'pro_single';

  // Gera novo checkout, tier vai como metadata pra webhook usar
  const checkout = await abacatePay.createCheckout({
    amount: 2900,
    methods: ['pix'],
    metadata: {
      user_id: userId,
      product: 'prontoia_pro_monthly',
      forced_tier: newTier,  // 👈 webhook respeita esse tier independente do contador
    },
  });

  // Maria envia link
  await sendMessage(userId, 'REA_01_FOUNDER_PRESERVED', { checkout_url: checkout.url });
}
```

---

## 8. Comunicação e Templates da Maria

### 8.1 Templates atualizados ou novos

| Código | Gatilho | Texto canônico |
|---|---|---|
| `PRO-02-FOUNDER` | Oferta Pro durante fase founder | "Você tá pronta pra um nível mais profundo. Tenho aqui o Pronto.IA Pro — R$ 29/mês. Te dá acesso à Bia inteira (e ao Zé da TI também). E olha que importante: nessa fase de lançamento, quem entra ganha esse acesso pra sempre por R$ 29. Quando a gente chegar em mil assinantes, esse benefício acaba. Quer entrar?" |
| `PRO-02-POST-LAUNCH` | Oferta Pro pós fase founder | "Você tá pronta pra um nível mais profundo. O Pronto.IA Pro é R$ 29/mês e te dá acesso à Bia (ou outro especialista do seu negócio). Pode cancelar quando quiser, sem pegadinha. Quer conhecer?" |
| `PAY-02-FOUNDER` | Pagamento confirmado · founder | "Recebi! Tá tudo certo. E você acabou de garantir o acesso vitalício a todos os especialistas — atuais e futuros — pelos R$ 29/mês. Bem-vindo ao grupo founder." |
| `PAY-02-PRO-SINGLE` | Pagamento confirmado · pro_single | "Recebi! Tá tudo certo. Agora você tem acesso à Bia." |
| `ZE-01` | Apresentação do Zé após pagamento founder | "E olha só, deixa eu te apresentar mais alguém. Esse é o Zé da TI, nosso especialista em fundação digital — Google Meu Negócio, WhatsApp Business, essas coisas que dão base pro resto funcionar. Como você é founder, ele já tá disponível pra você. Quer começar com ele ou com a Bia?" |
| `ZE-02-HANDOFF` | Bia faz handback pro Zé | "Isso aí que você tá pedindo é mais especialidade do Zé da TI. Vou chamar ele aqui pra você." |
| `REA-01-FOUNDER-PRESERVED` | Reativação founder | "Boa! Vou gerar o link agora. E olha, lembrando: você é founder, então continua R$ 29/mês com acesso a todos os especialistas. Promessa cumprida." |

### 8.2 Indicador visual na landing

```
[Banner topo da landing]
🟢 FASE DE LANÇAMENTO ATIVA
873 / 1000 founders já garantiram acesso vitalício a todos os especialistas
```

Quando atingir cap:

```
🔴 FASE DE LANÇAMENTO ENCERRADA
1000/1000 founders garantidos. Agora R$ 29/mês = 1 especialista escolhido.
```

### 8.3 Email de boas-vindas founder

Quando aluno paga R$ 29 durante fase founder, sistema dispara email via Resend documentando a promessa por escrito (não apenas chat):

```
Assunto: Bem-vindo ao Pronto.IA Pro · Você é Founder

[Nome],

Você acabou de garantir um lugar entre os 1.000 primeiros do Pronto.IA.

Isso significa:
- Acesso vitalício a todos os especialistas (Bia, Zé da TI, e os que vierem)
- R$ 29/mês mantidos enquanto você quiser
- Mesmo se cancelar e voltar depois, esse benefício continua

Como funciona:
- Cancela quando quiser, sem fidelidade
- Volta quando quiser, mesmo benefício
- Esse email é o registro escrito da promessa

Recibo do mês: R$ 29,00 · [data]

Bem-vindo,
Maria do Pronto.IA
```

Esse email é arquivo legal/contratual da promessa. Não é só marketing.

---

## 9. LGPD e Anonimização

### 9.1 Termo de uso revisado

Adicionar parágrafo explícito antes do beta público:

> "**Uso de dados agregados.** Pronto.IA pode usar dados agregados e completamente anônimos (sem qualquer informação que permita identificar você ou seu negócio) para gerar relatórios estatísticos, pesquisas de mercado e produtos derivados. Esses dados nunca incluem seu nome, telefone, conteúdo de mensagens individuais ou qualquer informação pessoal. Você pode pedir 'apaga tudo' a qualquer momento e seus dados serão removidos completamente da nossa base."

### 9.2 Anonimização robusta · regras técnicas

**K-anonymity mínimo de 50.** Antes de exportar qualquer dado agregado, sistema verifica que cada combinação de atributos tem ao menos 50 indivíduos. Se vertical=salão, cidade=Belo Horizonte, faixa_faturamento=2-3k tem só 12 alunos, **não exporta esse cruzamento.** Sobe granularidade até bater 50.

**Granularidade mínima por atributo:**

| Atributo | Granularidade exportável |
|---|---|
| Cidade | Sim (município ok) |
| Bairro | **Não** (re-identificação possível) |
| Idade | Faixas de 5 anos |
| Faturamento | Faixas pré-definidas (até 1k, 1-3k, 3-5k, 5-7k, 7k+) |
| Tempo de formalização | Faixas (<6m, 6m-1ano, 1-2anos, 2+anos) |
| Vertical | Sim |
| Gênero | Faixa M/F/Não informado |

**Mensagens individuais nunca exportadas.** Apenas estatísticas agregadas (top 10 perguntas mais frequentes, taxa de abandono por trilha, etc.).

**Outcomes em faixas:** "X% dos alunos relatou aumento de receita". Nunca "Aluno Y faturou R$ Z."

### 9.3 Auditoria de exportação

Toda exportação de dados pra cliente B2B passa por auditoria:

```sql
CREATE TABLE data_export_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exported_at TIMESTAMP DEFAULT NOW(),
  client_name VARCHAR(100),
  report_type VARCHAR(50),
  rows_exported INT,
  k_anonymity_min INT,
  approved_by VARCHAR(100),
  hash_of_export TEXT
);
```

Cada exportação registra hash do conteúdo. Se houver disputa futura, sistema prova exatamente o que foi enviado.

---

## 10. Métricas e Dashboards

### 10.1 Dashboard `/admin/founders`

Painel separado pra acompanhar o cohort founder:

- Contador atual (X/1000)
- Distribuição por vertical (% Bia, Zé interesse)
- Distribuição geográfica (top 10 cidades)
- Retenção mês a mês desse cohort vs novos
- NPS específico desse grupo
- Outcomes reportados pelo cohort

### 10.2 Dashboard `/admin/insights` (Data Core)

Painel de insights agregados que vira base pro relatório B2B:

- Top 20 perguntas mais frequentes nos últimos 30 dias
- Taxa de conclusão de trilha por vertical
- Distribuição de outcomes por faixa de faturamento
- Tempo médio do primeiro outcome após onboarding
- Mapa de calor de uso por hora do dia

### 10.3 Métrica norte preservada

**% de alunos com impacto financeiro mensurável em 60 dias.** Continua a única métrica que define se o produto está funcionando.

Métricas adicionais para fase founder:

- **Taxa de conversão founder:** % de visitas na landing que viram founder dentro da fase
- **Velocidade de fill do cap:** dias para atingir 1000 founders
- **Retenção founder M+1, M+3, M+6**

---

## 11. Checklist de Validação

### Sprint 3 (Founder Benefit + Zé da TI)

- [ ] Migration de `subscriptions` aplicada (plan_tier, founder_benefit_locked, selected_specialist)
- [ ] Tabela `launch_phase_config` criada com singleton constraint
- [ ] Webhook AbacatePay decide tier atomicamente (FOR UPDATE)
- [ ] Função `canAccessSpecialist` implementada e testada
- [ ] Endpoint `POST /admin/founders/grant` para override manual
- [ ] Endpoint `GET /api/v1/launch-phase` para landing
- [ ] Race condition testada (1000 webhooks simulados em paralelo)
- [ ] `prompts/personas/ze-da-ti.md` criado seguindo estrutura `---DYNAMIC---`
- [ ] 7 lições do Zé implementadas em `ze-lessons.ts`
- [ ] Intent `question_fundacao_digital` no roteador
- [ ] Templates `PRO-02-FOUNDER`, `PAY-02-FOUNDER`, `ZE-01`, `ZE-02-HANDOFF` adicionados
- [ ] Email de boas-vindas founder via Resend
- [ ] Bia faz handback para Zé quando assunto é fundação digital

### Sprint 4 (Beta + Data Core)

- [ ] Landing page com contador founder visível
- [ ] Política de privacidade revisada com cláusula de dados agregados
- [ ] Pipeline ETL Postgres → BigQuery funcional
- [ ] K-anonymity > 50 implementado
- [ ] Dashboard `/admin/insights` ativo
- [ ] Mockup de relatório B2B em PDF
- [ ] 10-50 usuários reais convidados
- [ ] Sentry monitorado diariamente primeiros 7 dias

### Sprint 6 (Data Core Comercial)

- [ ] 5 contatos Sebrae/bancos identificados
- [ ] 3 apresentações realizadas
- [ ] Refinamento do relatório baseado em feedback
- [ ] 1 contrato piloto fechado (R$ 15-30k)

---

## 12. Anexos

### A · Glossário de tiers e estados

| Estado/Tier | Significado |
|---|---|
| `founder` | Acesso vitalício a todos especialistas, R$ 29/mês, durante fase de lançamento |
| `pro_single` | Acesso a 1 especialista escolhido, R$ 29/mês, pós fase de lançamento |
| `founder_benefit_locked = true` | Tier founder preservado em cancelamento e reativação |
| `selected_specialist` | Para `pro_single`, qual especialista o aluno escolheu |
| `manual_founder` | Founder concedido por override admin (não conta no cap público) |

### B · Comparação de receita · cenário founder vs sem founder

Cenário A (atual, sem founder benefit):
- 1.296 pagantes mês 12 × R$ 29 = R$ 37.584 MRR

Cenário B (com founder benefit + Zé):
- 1.000 founders × R$ 29 = R$ 29.000 MRR (cohort fundador)
- 296 pro_single × R$ 29 = R$ 8.584 MRR (cohort pós-fase)
- Total: R$ 37.584 MRR (mesmo)

**No mês 12, MRR é equivalente.** Diferença aparece a partir do mês 13:

Cenário B mês 24:
- 1.000 founders mantidos (retenção alta) × R$ 29 = R$ 29.000
- 4.500 pro_single × R$ 29 = R$ 130.500
- **Total mês 24: R$ 159.500 MRR** (vs R$ 37.584 só founders)

Founders viram base de retenção e advocacy. Pricing pós-fase aumenta ARPU médio gradualmente.

### C · Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Race condition no contador | Baixa | Alto | `FOR UPDATE` + teste de carga |
| Founder ressente fim da fase | Baixa | Médio | Comunicação clara desde o dia 1, benefício real preservado |
| Sebrae não compra relatório | Média | Médio | Tem 4-5 outros canais (bancos, marcas, governo) |
| Concorrente copia modelo | Alta | Baixo | Moat real é relacionamento com MEIs, não modelo |
| LGPD vira problema | Baixa | Alto | Anonimização robusta + auditoria + termo de uso revisado |

---

**Próximos passos imediatos:**

1. Dev sênior aprova e implementa Sprint 3 (Founder Benefit + Zé da TI)
2. Ed prepara conteúdo das 7 lições do Zé em paralelo (~2-3 sessões de 2h)
3. Política de privacidade atualizada com cláusula Data Core (advogado revisa)
4. Identificação de 5 contatos Sebrae/banco pra apresentar relatório B2B no mês 4-6

Quando algo neste documento mudar, **muda primeiro aqui**, depois no código. Documento é fonte de verdade.
