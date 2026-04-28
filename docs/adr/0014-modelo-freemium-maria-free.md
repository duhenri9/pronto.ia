# ADR-0014: Maria Free + Agentes Especializados Pagos

## Status

Aceito · 28/abr/2026

## Contexto

O Pronto.IA precisa de um modelo de monetização sustentável que não comprometa a missão de acesso gratuito à capacitação em IA. O custo de infraestrutura (LLM + WhatsApp) escala com o número de usuários ativos.

O modelo anterior previa um plano Pro genérico (R$ 29/mês) para "trilhas avançadas" — um conceito abstrato que não diferenciava valor suficiente para converter.

## Decisão

Adotar modelo **Maria Free + Agentes Especializados Pagos**:

- **Maria Free**: assistente generalista, acesso gratuito vitalício, responde apenas quando solicitada. Nunca inicia conversa — reduz custo de WhatsApp (Z-API cobra por mensagem enviada).
- **Agentes Especializados (Bia, Léo, Tião, Zé)**: acesso pago (R$ 29/mês), conteúdo avançado verticalizado, suporte prioritário. Cada agente tem prompt mestre restrito ao seu segmento.
- **Upsell natural**: a Maria identifica necessidade específica do usuário (3+ perguntas sobre o mesmo tema) e oferece conectar com a especialista.

## Mapeamento de Agentes

| Agente | Segmento | Preço | Persona |
|---|---|---|---|
| Maria | Todos (generalista) | Grátis | Acolhedor, direto, onboarding |
| Bia | Salão de Beleza & Estética | R$ 29/mês | Especialista em gestão de salão |
| Léo | Food Service Local | R$ 29/mês | Especialista em restaurante/dark kitchen |
| Tião | Prestadores de Serviço | R$ 29/mês | Especialista em construção/manutenção |
| Zé | TI & Tecnologia | R$ 29/mês | Especialista em assistência técnica |

## Consequências

### Positivas
- Maria como gateway gratuito reduz barreira de entrada
- Agentes geram receita recorrente previsível (R$ 29/mês por vertical)
- Custo de WhatsApp reduzido (Maria nunca inicia conversa)
- Custo de LLM otimizado (agentes têm prompts mais enxutos, só usuários pagantes)
- Upsell natural e contextual — não forçado, baseado no comportamento do usuário
- Economia de auto-aprendizagem: Maria melhora com relatórios diários de interações

### Negativas
- Requer verificação de assinatura ativa no worker (fase 3)
- Requer página de checkout por vertical (fase 3)
- Usuário gratuito pode sentir limite se Maria não for suficiente para necessidades específicas
- Necessita contador de perguntas por segmento no banco (fase 3)

### Mitigações
- Maria responde bem o básico — upsell só quando há demanda real
- Worker verifica `subscriptions` table antes de permitir acesso ao agente
- Checkout reutiliza estrutura de doação (DonateSection) com Abacate Pay

## Quando implementar

Fase 3 (mês 4-6), após validação do MVP gratuito com 300+ alunos.

Gatilho: 300 alunos ativos + feedback positivo + custos projetados exigindo receita.

## Referências

- Prompt Maria v1.2.0: regra 9 (nunca iniciar conversa), regra 10 (upsell especializado)
- ADR-0012: Payments (Abacate Pay + Stripe)
- Tabela `subscriptions` já existe no schema Drizzle
- Enum `payment_provider` (ABACATE, STRIPE) já corrigido