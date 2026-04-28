"use client";

import { useState, useEffect, useRef } from "react";

const TIPS = [
  "42% das médias e grandes empresas já usam IA para aumentar produtividade. Seu pequeno negócio também pode. Fonte: Sebrae + FGV IBRE + Google, 2026.",
  "74% dos MEIs já usam IA concentrada em marketing e divulgação. Se você ainda não está nesse grupo, a Maria te coloca lá. Fonte: Sebrae, 2026.",
  "91% das pequenas e médias empresas reportam aumento de receita com a adoção de IA. Comece hoje e veja a diferença. Fonte: McKinsey Global Institute, 2025.",
  "A cada real investido em IA, pequenos negócios reportam retorno médio de 3,5x em produtividade. Fonte: FGV IBRE, 2026.",
  "Quem usa IA para precificação lucra em média 18% a mais por venda. A Maria te ensina a calcular o preço certo.",
  "Aplicar IA na gestão financeira reduz erros em até 40% e libera tempo para o que realmente importa: vender mais. Fonte: FGV IBRE, 2026.",
  "Pequenos negócios que usam IA para marketing digital têm 3x mais chances de expandir sua base de clientes em 6 meses. Fonte: Sebrae, 2026.",
  "Até 2027, 60% das micro e pequenas empresas brasileiras planejam adotar alguma ferramenta de IA. Não fique para trás. Fonte: McKinsey, 2026.",
];

const TYPING_SPEED = 40; // ms por caractere
const DISPLAY_DURATION = 8000; // 8 segundos para leitura

export function MariaTip() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver para ativar quando visível
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Efeito de digitação
  useEffect(() => {
    if (!isVisible) return;

    const currentTip = TIPS[currentTipIndex];
    let index = 0;
    setIsTyping(true);
    setDisplayedText("");

    const typingInterval = setInterval(() => {
      if (index < currentTip.length) {
        setDisplayedText(currentTip.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, TYPING_SPEED);

    return () => clearInterval(typingInterval);
  }, [currentTipIndex, isVisible]);

  // Rotação automática após digitação + pausa para leitura
  useEffect(() => {
    if (!isVisible || isTyping) return;

    const rotationTimeout = setTimeout(() => {
      setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
    }, DISPLAY_DURATION);

    return () => clearTimeout(rotationTimeout);
  }, [isVisible, isTyping, currentTipIndex]);

  return (
    <div
      ref={cardRef}
      className={`relative bg-[#1A2150] border border-[#252B54] rounded-2xl p-5 max-w-xs shadow-lg transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Ícone de silêncio */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#00D97E]/10 border border-[#00D97E]/20 flex items-center justify-center">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00D97E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
            <line x1="8" x2="16" y1="23" y2="23" />
            <line x1="23" x2="17" y1="3" y2="9" />
            <line x1="17" x2="23" y1="3" y2="9" />
          </svg>
        </div>
        <span className="text-xs font-medium text-[#00D97E] uppercase tracking-wider">
          Dica de Ouro da Maria
        </span>
      </div>

      {/* Texto com efeito de digitação */}
      <p className="text-sm text-[#9DA1B4] leading-relaxed min-h-[80px]">
        {displayedText}
        {isTyping && (
          <span className="inline-block w-0.5 h-4 bg-[#00D97E] ml-0.5 animate-pulse" />
        )}
      </p>

      {/* Indicador de progresso (dots) */}
      <div className="flex items-center gap-1.5 mt-3 justify-center">
        {TIPS.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              index === currentTipIndex ? "bg-[#00D97E]" : "bg-[#4D5274]"
            }`}
          />
        ))}
      </div>

      {/* Seta apontando para baixo */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1A2150] border-r border-b border-[#252B54] rotate-45" />
    </div>
  );
}
