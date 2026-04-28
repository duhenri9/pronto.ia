import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Sobre — Pronto.IA',
  description: 'Uma plataforma educacional que potencializa e multiplica conhecimentos, conectando as oportunidades e desafios da IA ao dia a dia das pessoas.',
};

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-[#0F1535] text-white/90 pt-24 pb-16">
      <Nav />
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6">Sobre o Pronto.IA</h1>

        <p className="text-lg text-[#9DA1B4] mb-8 leading-relaxed">
          Uma plataforma educacional que potencializa e multiplica conhecimentos —
          conectando as oportunidades e desafios da Inteligência Artificial ao
          dia a dia das pessoas.
        </p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Missão</h2>
        <p className="text-[#9DA1B4] leading-relaxed">
          Capacitar pessoas comuns para a era da IA, começando por quem mais precisa:
          o MEI brasileiro. Acreditamos que a economia digital precisa incluir
          quem está na ponta — o microempreendedor, o autônomo, o profissional
          que se vira sozinho.
        </p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Como Nasceu</h2>
        <p className="text-[#9DA1B4] leading-relaxed">
          O Pronto.IA nasceu da observação de que 15 milhões de MEIs no Brasil
          estão desconectados da revolução da IA. Enquanto empresas grandes
          investem milhões em tecnologia, o pequeno empreendedor não tem acesso
          a capacitação. Nossa resposta: uma mentora de IA no WhatsApp, de graça,
          que fala a língua do MEI.
        </p>

        <h2 className="text-2xl font-semibold mt-12 mb-4">Quem Faz</h2>
        <p className="text-[#9DA1B4] leading-relaxed">
          O Pronto.IA é desenvolvido pela WM3 DIGITAL LTDA, uma empresa brasileira
          de tecnologia. Nossa equipe combina experiência em inteligência artificial,
          engenharia de software e design de produto.
        </p>

        <div className="mt-12 p-6 bg-[#1A2150] rounded-xl">
          <p className="text-sm text-[#757994]">
            WM3 DIGITAL LTDA<br />
            CNPJ: 55.060.419/0001-20<br />
            São Paulo — SP — Brasil
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
