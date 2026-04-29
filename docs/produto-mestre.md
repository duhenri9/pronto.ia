# Pronto.IA — Produto Mestre

**Versão:** 2.1 (5 correções de gaps aplicadas)
**Fonte de verdade:** Este documento é a referência canônica. Quando algo mudar, muda primeiro aqui, depois no código.

---

## Parte 1 — Fluxos operacionais

### 1.1 Onboarding

**Pontos críticos da implementação:**

- Se o classificador de nome retornar confiança < 0.8, Maria pergunta de novo com reforço: "Como você gosta de ser chamada? Pode ser primeiro nome, apelido, como quiser." Se após 2 tentativas ainda não classificar com confiança, usar a primeira palavra da resposta como display_name (fallback simples, evita travar onboarding).
- Templates: OB_12 (reforço de nome), OB_13 (aceita fallback)

Implementação: `apps/worker/src/flows/onboarding.ts` — `extractName()` + `handleOnboardingName()`

### 1.2.B Conteúdo gratuito — 7 microcápsulas

| ID | Título | Corpo | CTA |
|:---|:---|:---|:---|
| FREE-L01 | O que é IA generativa | "Imagina uma assistente que já leu tudo sobre o seu ramo e te responde na hora. Isso é IA generativa. Não é mágica — é uma ferramenta. Como uma calculadora, só que pra palavras e ideias. Você pergunta, ela responde baseada em tudo que aprendeu." | "Já usou alguma IA antes? Me conta como foi." |
| FREE-L02 | Os 3 ingredientes de um bom pedido | "Pra IA te ajudar bem, você precisa dar 3 coisas: (1) o que você quer, (2) contexto do seu negócio, (3) como quer a resposta. Exemplo: 'Me dá 3 ideias de legenda pra Instagram de uma doceria caseira. Tom afetuoso, pra mães de 25-40 anos.' Percebe a diferença?" | "Tenta fazer um pedido assim agora e me mostra." |
| FREE-L03 | IA pra escrever melhor | "Legenda, mensagem de WhatsApp, descrição de produto, bio do Instagram. A IA escreve o rascunho em segundos. Você revisa e deixa com a sua cara. Economiza tempo e soa profissional mesmo sem ter jeito com palavras." | "Me fala uma mensagem difícil que você precisa escrever hoje." |
| FREE-L04 | IA pra resumir informação | "Tem muito texto pra ler? A IA resume em 3 frases. Contrato, matéria, tutorial, bula de remédio. Você cola o texto e pede: 'me explica em 2 linhas o que importa aqui'. Pronto." | "Tem algo grande que você precisava ler essa semana? Me manda." |
| FREE-L05 | IA pra decidir melhor | "Na dúvida entre duas opções? Pergunta pra IA. 'Vale mais a pena fazer promoção de 20% ou levar 2 e pagar 1 pra produto X?' Ela te dá os prós e contras com base no que sabe do mercado. A decisão final é sua, mas a análise é dela." | "Tem alguma decisão do negócio que tá te tirando o sono?" |
| FREE-L06 | O que a IA ainda erra | "IA não é perfeita. Ela pode inventar dados, errar contas, dar conselho genérico. Por isso você sempre revisa. Ela é sua estagiária — muito rápida, mas precisa de supervisão. Nunca terceirize decisão final." | "Já pegou algum erro de IA? Se ainda não, fica de olho." |
| FREE-L07 | Próximo passo: aplicar no que VOCÊ faz | "As primeiras 6 lições foram o básico. Agora a gente pode ir mais fundo no SEU negócio. Salão, comida, conserto — cada um tem um jeito de usar IA. Se quiser ir mais fundo no seu ramo, me fala que eu te conto como." | "Quer ir mais fundo no seu negócio com IA? Me conta o que mais te interessa." |

Implementação: `apps/worker/src/flows/free-lessons.ts` — `FREE_LESSONS[]`, `getNextFreeLesson()`, `formatLessonForDelivery()`

### 1.4 Pagamento AbacatePay — reconciliação

**Regra para webhook não chegado (limbo do Pix pago):**

- Se webhook não chegar em 24h: Maria não menciona pagamento espontaneamente (P1).
- Se o usuário perguntar "paguei, e agora?", Maria consulta status diretamente na API do Abacate Pay (GET /checkouts/{id}) e responde:
  - Se confirmado: Template PAY_02 (pagamento confirmado) + segue fluxo normal.
  - Se ainda pendente: "Ainda não recebi a confirmação. Me manda o comprovante que eu verifico aqui."
  - Se expirado: Template PAY_09 (Pix expirado) + oferece gerar novo.
- Alerta interno: se `subscription_status = "pending"` por mais de 24h, gerar log de alerta no Sentry para investigação manual.

Implementação: `apps/worker/src/flows/payment.ts` — `checkAbacatePaymentStatus()`, `handlePaymentInquiry()`, `alertStalePayments()`

### 1.5.C Reativação de Pro cancelado

Trigger: usuário com lifecycle_state = "cancelled" ou "churned" envia mensagem com intenção de reativar ("quero voltar pro Pro", "como faço pra assinar de novo", "quero a Bia de volta").

Fluxo:
1. Classifica intenção via regex + Gemini (intent `reactivation_request`)
2. Se confirmado, envia Template REA_01 (acknowledgement)
3. Inicia checkout (mesmo fluxo do 1.4, sem onboarding)

Template REA_01: "{name}, que bom ter você de volta! Te mando o link de pagamento agora mesmo. R$ 29/mês, com a Bia e tudo que você já conhece. Sem pegadinha."

Implementação: `apps/worker/src/flows/renewal.ts` — `handleReactivationRequest()`

### 1.6.B LGPD — Direito ao esquecimento

**Pontos críticos:**

- **Resposta de despedida vai ANTES da anonimização**, porque após anonimizar a Maria não tem nome do usuário pra falar.
- **Hash SHA-256 do número original fica no campo phone** — permite responder a auditoria LGPD sem manter PII.
- **Anonimização é assíncrona via job** e atômica via `db.transaction()`.
- **`lifecycle_state` vira `"deleted"`** (não `"cancelled"`).

Implementação: `apps/worker/src/flows/cancellation.ts` — `lgpdAnonymizeWorker()`

---

## Parte 2 — Prompts operacionais

### 2.2 Prompt Maria — base + contextos dinâmicos

Arquivo: `prompts/personas/maria.md`
Modelo padrão: Haiku 4.5 | Escalação: Sonnet 4.5

**Vocabulário APROVADO:** bora, tá bom, manda ver, beleza, faz tempo, que orgulho, tá ligado, calma aí, vamo nessa, mandou bem, que isso, claro que sim, sem problema, tô aqui, caraca, pode crer, conta tudo, sumida, a gente, né?, aaah, tô passando rapidinho, olha só, demais, conseguiu!, faz parte, acontece, é simples.

**Vocabulário PROIBIDO:** parabéns!, incrível!, fantástico!, vamos lá!, jornada, experiência, plataforma, usuário, user, cliente (para falar do usuário), aluno, engagement, content, implementar, otimizar, maximizar, potencializar, cordialmente, prezada, conforme acordado, aproveite, não perca, acesse já, imperdível, exclusivo, premium, nível mestre, XP. **"Meu bem" PROIBIDO** — soa idoso/regional demais. Maria é prima jovem, não tia.

**Emojis aprovados (1 por mensagem):** 😊 👏 💚 ✨
**Emojis proibidos:** 🚀 🔥 😂🤣 🙏 💰💵 + qualquer emoji em erro/dor/consolo

**Handoff tag:** `<handoff persona="bia">contexto resumido</handoff>`
**Handback tag (Bia):** `<handback>resumo do que foi feito</handback>`

### 2.3 Prompt Bia

Arquivo: `prompts/personas/bia.md`
Modelo padrão: Haiku 4.5 | required_subscription: active_pro
Vertical: salão

**Vocabulário aprovado:** bora, manda ver, tá bombando, arrasou, tá lindo, vai dar certo, manja, sacou, tipo, tipo assim, é o seguinte, olha só, dica, segue o fio.
**Vocabulário proibido:** Mesmo léxico da Maria + "fofa", "querida", "linda" como vocativo.

**Handback por escopo não suportado:**

Se o usuário perguntar sobre vertical que não é salão (ex: food, conserto, tecnologia):

1. Bia responde honestamente: "Isso aí é fora do que eu manjo. A Maria pode te ajudar melhor com essa. Me dá um segundo que chamo ela."
2. Bia emite handback com contexto: `<handback>Usuário perguntou sobre [tema fora do escopo]. Vertical do usuário é {{vertical}} mas pergunta é de outra área. Bia respondeu honestamente e devolveu.</handback>`
3. Maria assume e responde apropriadamente (se for vertical disponível no Pro, oferece; se não, responde com tom geral).

Regra: Bia nunca enrola nem finge que sabe. Transparência total.

### 2.4 Prompt Evaluator

Arquivo: `prompts/personas/evaluator.md`
Modelo: Sonnet 4.5 (sempre — avaliação técnica)
Saída: JSON com completed, score, strengths, improvements, feedback_for_persona

### 2.5 Intent Classifier

Arquivo: `prompts/router/intent-classifier.md`
Modelo: Gemini 2.0 Flash
11 categorias: greeting, question_general, question_vertical, command_admin, command_lgpd_delete, outcome_report, pro_offer_response, cancellation_request, payment_response, reactivation_request, unclear

---

## Parte 3 — Templates de mensagem por gatilho

Códigos canônicos em `apps/worker/src/flows/templates.ts`.
Maria pode parafrasear, mas não pode mudar significado, tom ou estrutura.

### 3.1 Onboarding (OB-01 a OB-13)
### 3.2 Camada gratuita (FREE-01 a FREE-05)
### 3.3 Oferta Pro (PRO-01 a PRO-05)
### 3.4 Pagamento Abacate (PAY-01 a PAY-09)
### 3.5 Renovação (REN-01 a REN-05)
### 3.6 Cancelamento (CAN-01 a CAN-04)
### 3.7 LGPD (LGPD-01 a LGPD-03)
### 3.8 Outcome (OUT-01 a OUT-04)
### 3.9 Reativação (REA-01)

*(Textos completos em `apps/worker/src/flows/templates.ts`)*

---

## Anexo A — Glossário de variáveis

| Variável | Tipo | Origem | Default se null |
|---|---|---|---|
| `{{display_name}}` ou `{name}` | string | `users.display_name` | "amiga" |
| `{{preferred_name}}` | string | `users.preferred_name` | display_name |
| `{{vertical}}` | string | `users.vertical` | "outro" |
| `{{business_context}}` | jsonb | `users.business_context` | {} |
| `{{lifecycle_state}}` | enum | `users.lifecycle_state` | "provisional" |
| `{{pending_action}}` | enum | `users.pending_action` | null |
| `{{preferred_contact_window}}` | string | `users.preferred_contact_window` | null |
| `{{last_active_at}}` | timestamp | `users.last_active_at` | created_at |
| `{{subscription_active}}` | boolean | derivado de `subscriptions` | false |
| `{{subscription_expires_at}}` | timestamp | `subscriptions.current_period_end` | null |
| `{{current_track}}` | string | `user_track_progress.track_id` | null |
| `{{current_lesson_position}}` | int | `user_track_progress.current_lesson_position` | null |
| `{{relevant_memories}}` | text | `user_memory` (top 5) | "" |
| `{{conversation_history}}` | text | últimas 20 messages | "" |
| `{{handoff_context}}` | text | passado pela Maria via tag handoff | "" |

## Anexo B — Mapa intent → prompt → modelo

| Intent | Prompt | Modelo | Justificativa |
|---|---|---|---|
| `greeting` | maria.md | Haiku 4.5 | Resposta simples, baixo risco |
| `question_general` | maria.md | Haiku 4.5 | Pergunta sobre produto/IA |
| `question_vertical` | maria.md | Haiku 4.5 | Maria responde, oferece Pro se elegível |
| `command_admin` | maria.md | Haiku 4.5 | Comando determinístico |
| `command_lgpd_delete` | maria.md | **Sonnet 4.5** | Irreversível, exige nuance |
| `outcome_report` | maria.md | Haiku 4.5 | Celebração + registro |
| `pro_offer_response` | maria.md | **Sonnet 4.5** | Decisão de receita |
| `cancellation_request` | maria.md | **Sonnet 4.5** | Retenção sem ser invasiva |
| `payment_response` | maria.md | **Sonnet 4.5** | Crítico não confundir |
| `reactivation_request` | maria.md | **Sonnet 4.5** | Cliente retornando, precisa de cuidado |
| `exercise_submitted` | bia.md + evaluator.md | **Sonnet 4.5** | Avaliação técnica |
| `onboarding` | maria.md | **Sonnet 4.5** | Cada palavra conta |
| `unclear` | maria.md | Haiku 4.5 | Fallback seguro |

Implementação: `packages/llm/src/model-mapper.ts`

## Anexo C — Critérios de oferta Pro como código

7 critérios obrigatórios (TODOS devem bater):
1. Estado correto (não Pro, não onboarding/LGPD)
2. 7+ dias desde criação
3. 3+ perguntas verticais nos últimos 14 dias
4. 1+ outcome positivo
5. Não oferecido nos últimos 30 dias
6. Sem pending_action conflitante
7. Sem bloqueio temporário

Implementação: `apps/worker/src/flows/pro-eligibility.ts`
