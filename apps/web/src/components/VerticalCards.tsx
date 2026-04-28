'use client';

import { useState } from 'react';
import { Scissors, ChefHat, Wrench, Laptop } from 'lucide-react';

const VERTICALS = [
  {
    slug: 'salao',
    name: 'Salão de Beleza & Estética',
    persona: 'Bia',
    icon: Scissors,
    iconColor: 'text-green-500',
    borderColor: 'hover:border-green-400/50',
    bgGlow: 'hover:bg-green-500/[0.04]',
    description:
      'Agendamento, marketing no Instagram, precificação de serviços, fidelização de clientes com IA.',
    pain: 'Cliente cancela, agenda vazia, post não sai',
  },
  {
    slug: 'food-service',
    name: 'Food Service Local',
    persona: 'Léo',
    icon: ChefHat,
    iconColor: 'text-gold-500',
    borderColor: 'hover:border-gold-400/50',
    bgGlow: 'hover:bg-gold-500/[0.04]',
    description:
      'Cardápio com IA, delivery sem app, precificação dinâmica, WhatsApp como canal de pedido.',
    pain: 'Custo subiu, cliente some, delivery come margem',
  },
  {
    slug: 'home-service',
    name: 'Prestadores de Serviço',
    persona: 'Tião',
    icon: Wrench,
    iconColor: 'text-night-600',
    borderColor: 'hover:border-night-400/50',
    bgGlow: 'hover:bg-night-500/[0.04]',
    description:
      'Orçamento automático, roteamento de visitas, formalização do MEI, captação via Google.',
    pain: 'Falta serviço, orçamento errado, cliente não volta',
  },
  {
    slug: 'tech-service',
    name: 'TI & Tecnologia',
    persona: 'Zé',
    icon: Laptop,
    iconColor: 'text-blue-500',
    borderColor: 'hover:border-blue-400/50',
    bgGlow: 'hover:bg-blue-500/[0.04]',
    description:
      'Precificação de hora/projeto, contratos simples, captação no LinkedIn, automação com IA.',
    pain: 'Freela barato, cliente calote, sem contrato',
  },
] as const;

export function VerticalCards() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {VERTICALS.map((v, i) => {
        const Icon = v.icon;
        const isHovered = hovered === v.slug;
        const isOtherHovered = hovered !== null && hovered !== v.slug;

        return (
          <div
            key={v.slug}
            onMouseEnter={() => setHovered(v.slug)}
            onMouseLeave={() => setHovered(null)}
            className={`
              group relative rounded-lg border bg-surface p-6
              transition-all duration-fast ease-out
              ${v.borderColor} ${v.bgGlow}
              ${isHovered ? 'scale-[1.03] shadow-elev-3' : 'shadow-none'}
              ${isOtherHovered ? 'opacity-60' : 'opacity-100'}
            `}
            style={{
              animation: `cardIn 500ms ${i * 100}ms both cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            {/* Icon */}
            <div className={`text-heading-l ${v.iconColor}`}>
              <Icon size={28} strokeWidth={1.5} />
            </div>

            <h3 className="mt-3 text-heading-s font-medium text-neutral-900">
              {v.name}
            </h3>
            <p className="mt-1 font-mono text-micro uppercase tracking-micro text-green-600">
              especialista: {v.persona}
            </p>
            <p className="mt-3 text-body-s text-text-secondary leading-relaxed">
              {v.description}
            </p>
            <div className="mt-4 rounded-md bg-sunken px-3 py-2">
              <p className="font-mono text-micro uppercase tracking-micro text-text-tertiary">
                dor que resolve
              </p>
              <p className="mt-1 text-body-s text-neutral-900">{v.pain}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
