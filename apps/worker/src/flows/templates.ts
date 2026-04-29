// ============================================
// PRONTO.IA — Message Templates for Pro Flows
// ============================================
// All WhatsApp messages for Pro offer, payment,
// renewal, cancellation and LGPD flows.
// Maria's voice: acolhedor, direto, prático.
// "Meu bem" is neutral and always works.

export const TEMPLATE = {
  // ---- 1.3 Pro Offer ----

  pro_offer_setup: (name: string) =>
    `${name}, queria te contar uma novidade...`,

  pro_offer_pitch:
    'Tenho uma amiga especialista que pode te ajudar todo dia com conteúdo avançado e suporte prioritário. O acesso é R$ 29/mês e você pode cancelar quando quiser. Quer conhecer?',

  pro_accepted_acknowledge:
    'Oba! Vou te mandar o link de pagamento. É rapidinho —Pix em 1 minuto! 🎉',

  pro_declined_graceful:
    'Tudo bem, sem pressão! Eu continuo aqui pra te ajudar sempre que precisar. 😊',

  pro_unclear_ask_again:
    'Desculpa, não entendi bem — você quer conhecer o plano Pro ou prefere continuar como está?',

  // ---- 1.4 Payment ----

  payment_link: (url: string) =>
    `Aqui está o link: ${url}\n\nO Pix expira em 1 hora. Qualquer coisa, é só me chamar!`,

  payment_confirmed:
    'Recebi seu pagamento! Bem-vinda ao Pronto.IA Pro! 🎉 Agora você tem acesso à Bia, nossa especialista, com conteúdo avançado todo dia.',

  payment_expired:
    'Parece que o Pix expirou. Se ainda quiser assinar, me avisa que eu mando um link novo!',

  payment_failed:
    'Deu algum problema com o pagamento. Quer tentar de novo? Posso mandar um link novo.',

  ask_email_for_receipt:
    'Me passa seu email pra eu te mandar o recibo?',

  email_invalid_retry:
    'Hmm, esse email não parece certo. Pode mandar de novo? Tipo: seunome@email.com',

  email_received_handoff_to_bia:
    'Pronto! Recibo enviado. Agora vou te apresentar a Bia — ela manja tudo do seu segmento e vai te ajudar a ir longe!',

  bia_first_introduction: (name: string) =>
    `Oi ${name}! Eu sou a Bia, sua mentora especialista. Vou te mandar dicas e conteúdos avançados todo dia. Bora começar?`,

  // ---- 1.5 Renewal ----

  renewal_reminder: (days: number) =>
    days <= 0
      ? 'Seu plano Pro venceu hoje. Quer renovar? É só me avisar!'
      : days === 1
        ? 'Seu plano Pro vence amanhã. Quer renovar pra não ficar sem a Bia?'
        : `Seu plano Pro vence em ${days} dias. Quer renovar?`,

  renewal_link_generated:
    'Aqui está o link de renovação! Mesmo valor, mesmo processo rápido.',

  renewal_postponed:
    'Beleza, sem pressão! Vou te lembrar de novo se você me chamar antes de vencer.',

  renewal_declined_acknowledge:
    'Entendi. Seu plano vai seguir ativo até o fim do período pago. Depois, eu continuo te ajudando normalmente!',

  // ---- 1.6A Cancellation ----

  cancellation_confirm_ask:
    'Posso confirmar — você quer cancelar o plano Pro?',

  cancellation_ask_reason_optional:
    'Se quiser me contar o motivo, ficaria grata pra melhorar. Mas pode dizer "prefiro não dizer" sem problema.',

  cancellation_aborted:
    'Que bom que ficou! A Bia continua à disposição. 😊',

  cancellation_done: (expiry: string) =>
    `Pronto, cancelamento feito. Seu plano Pro fica ativo até ${expiry}. Depois disso, eu (Maria) continuo te ajudando normalmente!`,

  // ---- 1.6B LGPD ----

  lgpd_delete_confirm_ask:
    'Entendo. Posso confirmar — você quer que eu apague todos os seus dados? Isso é permanente e não tem volta.',

  lgpd_delete_aborted:
    'Ok, seus dados continuam seguros com a gente. Se mudar de ideia, é só falar.',

  lgpd_delete_done:
    'Tudo apagado. Foi um prazer te ajudar! Se um dia quiser voltar, é só me chamar de novo.',

  // ---- Post-cancellation ----

  cancelled_first_contact:
    'Oi! Seu plano Pro venceu, mas eu continuo aqui pra te ajudar com o conteúdo gratuito. Se quiser voltar pro Pro, é só me avisar!',
};
