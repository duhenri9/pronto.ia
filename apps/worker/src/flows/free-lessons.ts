// ============================================
// PRONTO.IA — Free Lesson Content (Gap 4)
// ============================================
// 7 microcápsulas gratuitas com conteúdo detalhado.
// Per spec: cada lição tem lesson_id, title, body (máx 500 chars), cta.
// Stored as structured data for the worker scheduler
// to deliver via FREE_01 template.

export interface FreeLesson {
  lessonId: string;
  dayNumber: number;
  title: string;
  body: string;
  cta: string;
}

export const FREE_LESSONS: FreeLesson[] = [
  {
    lessonId: 'FREE-L01',
    dayNumber: 1,
    title: 'O que é IA generativa',
    body: 'Imagina uma assistente que já leu tudo sobre o seu ramo e te responde na hora. Isso é IA generativa. Não é mágica — é uma ferramenta. Como uma calculadora, só que pra palavras e ideias. Você pergunta, ela responde baseada em tudo que aprendeu.',
    cta: 'Já usou alguma IA antes? Me conta como foi.',
  },
  {
    lessonId: 'FREE-L02',
    dayNumber: 2,
    title: 'Os 3 ingredientes de um bom pedido',
    body: 'Pra IA te ajudar bem, você precisa dar 3 coisas: (1) o que você quer, (2) contexto do seu negócio, (3) como quer a resposta. Exemplo: "Me dá 3 ideias de legenda pra Instagram de uma doceria caseira. Tom afetuoso, pra mães de 25-40 anos." Percebe a diferença?',
    cta: 'Tenta fazer um pedido assim agora e me mostra.',
  },
  {
    lessonId: 'FREE-L03',
    dayNumber: 3,
    title: 'IA pra escrever melhor',
    body: 'Legenda, mensagem de WhatsApp, descrição de produto, bio do Instagram. A IA escreve o rascunho em segundos. Você revisa e deixa com a sua cara. Economiza tempo e soa profissional mesmo sem ter jeito com palavras.',
    cta: 'Me fala uma mensagem difícil que você precisa escrever hoje.',
  },
  {
    lessonId: 'FREE-L04',
    dayNumber: 4,
    title: 'IA pra resumir informação',
    body: 'Tem muito texto pra ler? A IA resume em 3 frases. Contrato, matéria, tutorial, bula de remédio. Você cola o texto e pede: "me explica em 2 linhas o que importa aqui". Pronto.',
    cta: 'Tem algo grande que você precisava ler essa semana? Me manda.',
  },
  {
    lessonId: 'FREE-L05',
    dayNumber: 5,
    title: 'IA pra decidir melhor',
    body: 'Na dúvida entre duas opções? Pergunta pra IA. "Vale mais a pena fazer promoção de 20% ou levar 2 e pagar 1 pra produto X?" Ela te dá os prós e contras com base no que sabe do mercado. A decisão final é sua, mas a análise é dela.',
    cta: 'Tem alguma decisão do negócio que tá te tirando o sono?',
  },
  {
    lessonId: 'FREE-L06',
    dayNumber: 6,
    title: 'O que a IA ainda erra',
    body: 'IA não é perfeita. Ela pode inventar dados, errar contas, dar conselho genérico. Por isso você sempre revisa. Ela é sua estagiária — muito rápida, mas precisa de supervisão. Nunca terceirize decisão final.',
    cta: 'Já pegou algum erro de IA? Se ainda não, fica de olho.',
  },
  {
    lessonId: 'FREE-L07',
    dayNumber: 7,
    title: 'Próximo passo: aplicar no que VOCÊ faz',
    body: 'As primeiras 6 lições foram o básico. Agora a gente pode ir mais fundo no SEU negócio. Salão, comida, conserto — cada um tem um jeito de usar IA. Se quiser ir mais fundo no seu ramo, me fala que eu te conto como.',
    cta: 'Quer ir mais fundo no seu negócio com IA? Me conta o que mais te interessa.',
  },
];

/**
 * Returns the next lesson for a user based on what they've already received.
 * After FREE-L07, returns null (cycle complete — prepares for Pro offer).
 */
export function getNextFreeLesson(completedLessonIds: string[]): FreeLesson | null {
  const completedSet = new Set(completedLessonIds);

  for (const lesson of FREE_LESSONS) {
    if (!completedSet.has(lesson.lessonId)) {
      return lesson;
    }
  }

  // All 7 lessons completed
  return null;
}

/**
 * Formats a lesson for delivery via FREE_01 template.
 */
export function formatLessonForDelivery(lesson: FreeLesson, userName: string): {
  messageText: string;
  lessonId: string;
} {
  const messageText = `Bom dia, ${userName}! Hoje a gente vai falar de: ${lesson.title}.\n\n${lesson.body}\n\n${lesson.cta}`;

  return {
    messageText,
    lessonId: lesson.lessonId,
  };
}
