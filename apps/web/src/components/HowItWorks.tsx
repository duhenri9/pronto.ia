'use client';

import { useState } from 'react';
import { Smartphone, Timer, Heart } from 'lucide-react';

const STEPS = [
  {
    slug: 'whatsapp',
    step: '01',
    name: 'Abre o WhatsApp',
    description: 'Manda um "oi" pra Maria. Sem app extra, sem login, sem dor de cabeça.',
    icon: Smartphone,
    iconColor: 'text-green-500',
    borderColor: 'hover:border-green-400/50',
    bgGlow: 'hover:bg-green-500/[0.04]',
  },
  {
    slug: 'microlicao',
    step: '02',
    name: '5 min por dia',
    description: 'Microlições no seu ritmo. Maria adapta o conteúdo pro seu tipo de negócio.',
    icon: Timer,
    iconColor: 'text-gold-500',
    borderColor: 'hover:border-gold-400/50',
    bgGlow: 'hover:bg-gold-500/[0.04]',
  },
  {
    slug: 'seu-jeito',
    step: '03',
    name: 'Do seu jeito',
    description: 'Aprende ouvindo, lendo ou praticando. Maria respeita seu tempo e seu vocabulário.',
    icon: Heart,
    iconColor: 'text-rose-500',
    borderColor: 'hover:border-rose-400/50',
    bgGlow: 'hover:bg-rose-500/[0.04]',
  },
] as const;

export function HowItWorks() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="border-t border-border-subtle py-20 md:py-24">
      <div className="mx-auto max-w-container px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-micro font-medium uppercase tracking-micro text-green-600">
            simples assim
          </span>
          <h2 className="mt-3 text-display-m tracking-display text-neutral-900">
            Como funciona?
          </h2>
          <p className="mt-4 font-serif text-body-l italic text-text-secondary">
            Sem plataforma complicada. Sem aula gravada de 2 horas. É conversa,
            é prática, é resultado.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isHovered = hovered === step.slug;
            const isOtherHovered = hovered !== null && hovered !== step.slug;

            return (
              <div
                key={step.slug}
                onMouseEnter={() => setHovered(step.slug)}
                onMouseLeave={() => setHovered(null)}
                className={`
                  group relative rounded-lg border bg-surface p-6
                  transition-all duration-fast ease-out
                  ${step.borderColor} ${step.bgGlow}
                  ${isHovered ? 'scale-[1.03] shadow-elev-3' : 'shadow-none'}
                  ${isOtherHovered ? 'opacity-60' : 'opacity-100'}
                `}
                style={{
                  animation: `cardIn 500ms ${i * 100 + 100}ms both cubic-bezier(0.22, 1, 0.36, 1)`,
                }}
              >
                {/* Step number + icon row */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-micro font-medium uppercase tracking-micro text-text-tertiary">
                    passo {step.step}
                  </span>
                  <div className={`text-heading-l ${step.iconColor}`}>
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                </div>

                <h3 className="mt-3 text-heading-s font-medium text-neutral-900">
                  {step.name}
                </h3>
                <p className="mt-2 text-body-s text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
