import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8f4eb] px-5 py-6 text-emerald-950 sm:px-8 lg:px-12">
      <header className="mx-auto flex max-w-3xl items-center justify-between">
        <BrandLogo />
        <Link className="text-sm font-bold text-emerald-900 underline underline-offset-4" href="/">
          Voltar para a home
        </Link>
      </header>

      <section className="mx-auto max-w-3xl py-16 sm:py-24">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Privacidade</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Informações de privacidade</h1>
        <div className="mt-8 space-y-8 rounded-3xl bg-white p-6 text-base leading-7 text-stone-700 shadow-sm sm:p-10">
          <p>
            Usamos os dados enviados por você para responder à sua solicitação, entrar em contato sobre a estadia e
            melhorar a experiência de uso da Pátio Livre.
          </p>
          <div>
            <h2 className="text-xl font-black text-emerald-950">O que pode ser informado</h2>
            <p className="mt-2">Dados de contato e as informações necessárias para encontrar um espaço adequado ao seu cão.</p>
          </div>
          <div>
            <h2 className="text-xl font-black text-emerald-950">Como usamos essas informações</h2>
            <p className="mt-2">Somente para atender sua solicitação e manter você informado sobre os próximos passos.</p>
          </div>
          <p className="font-semibold text-emerald-950">Você continua no controle do que escolhe compartilhar.</p>
        </div>
      </section>
    </main>
  );
}
