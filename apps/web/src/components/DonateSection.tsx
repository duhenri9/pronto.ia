'use client';

import { useState } from 'react';
import { Heart, X, Copy, Check } from 'lucide-react';
import { MariaAvatar } from './MariaAvatar';

const DONATION_VALUES = [
  { label: 'R$ 10', cents: 1000 },
  { label: 'R$ 25', cents: 2500 },
  { label: 'R$ 50', cents: 5000 },
  { label: 'R$ 100', cents: 10000 },
];

type DonationState = 'idle' | 'loading' | 'success' | 'error';

export function DonateSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<DonationState>('idle');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDonate = async () => {
    const amount = selectedAmount ?? Math.round(parseFloat(customAmount) * 100);
    if (!amount || amount < 500 || amount > 100000) return;

    setState('loading');
    try {
      const res = await fetch('/api/v1/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method: 'PIX' }),
      });
      const data = await res.json();
      if (data.pixCode) {
        setPixCode(data.pixCode);
        setState('success');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setState('idle');
    setSelectedAmount(null);
    setCustomAmount('');
    setPixCode('');
    setCopied(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-body-s font-medium text-green-900 shadow-elev-2 hover:bg-green-400 transition-all duration-fast ease-out hover:scale-105"
        aria-label="Apoie o Pronto.IA"
      >
        <Heart size={18} strokeWidth={2} />
        Apoie
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-elev-3 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <MariaAvatar size={40} />
              <div>
                <h3 className="text-heading-s font-medium text-neutral-900">Apoie o Pronto.IA</h3>
                <p className="text-micro text-text-secondary">Cada real capacita mais pessoas</p>
              </div>
            </div>

            {/* Idle: select amount */}
            {state === 'idle' && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {DONATION_VALUES.map((v) => (
                    <button
                      key={v.cents}
                      onClick={() => { setSelectedAmount(v.cents); setCustomAmount(''); }}
                      className={`rounded-lg border p-3 text-heading-s font-medium transition-all duration-fast ease-out ${
                        selectedAmount === v.cents
                          ? 'border-green-400 bg-green-400/10 text-green-700'
                          : 'border-border-subtle bg-surface text-neutral-900 hover:border-green-400/40'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="font-mono text-micro uppercase tracking-micro text-text-tertiary">
                    Outro valor (R$)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    step="1"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                    placeholder="Digite o valor"
                    className="mt-1 w-full rounded-md border border-border-subtle bg-sunken px-3 py-2 text-body-m text-neutral-900 placeholder:text-text-tertiary focus:border-green-400 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleDonate}
                  disabled={!selectedAmount && (!customAmount || parseFloat(customAmount) < 5)}
                  className="w-full rounded-md bg-green-500 py-3 text-body-m font-medium text-green-900 hover:bg-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Doar via Pix
                </button>
              </>
            )}

            {/* Loading */}
            {state === 'loading' && (
              <div className="flex flex-col items-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                <p className="mt-4 text-body-s text-text-secondary">Gerando Pix...</p>
              </div>
            )}

            {/* Success */}
            {state === 'success' && (
              <div className="flex flex-col items-center">
                <MariaAvatar size={64} />
                <p className="mt-4 text-center font-serif text-body-l italic text-neutral-900">
                  Você ajuda a capacitar o Brasil para a era da IA
                </p>
                <div className="mt-4 w-full rounded-md bg-sunken p-4">
                  <p className="font-mono text-micro uppercase tracking-micro text-text-tertiary mb-2">
                    Código copia-e-cola
                  </p>
                  <p className="text-caption text-neutral-800 break-all select-all">{pixCode}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="mt-3 flex items-center gap-2 rounded-md border border-border-subtle px-4 py-2 text-body-s text-neutral-900 hover:bg-sunken transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar código'}
                </button>
              </div>
            )}

            {/* Error */}
            {state === 'error' && (
              <div className="flex flex-col items-center py-8">
                <p className="text-body-s text-danger">Erro ao gerar Pix. Tente novamente.</p>
                <button
                  onClick={() => setState('idle')}
                  className="mt-4 rounded-md border border-border-subtle px-4 py-2 text-body-s text-neutral-900 hover:bg-sunken transition-colors"
                >
                  Voltar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
