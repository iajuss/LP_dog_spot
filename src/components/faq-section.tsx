const QUESTIONS = [
  {
    question: "Como funciona uma hospedagem?",
    answer:
      "Você escolhe a casa, envia a solicitação com as datas e confirma seu e-mail pelo link que enviamos. Nossa equipe confirma a disponibilidade e combina a rotina do seu cão antes de a estadia começar.",
  },
  {
    question: "Pernoite e hospedagem são a mesma coisa?",
    answer:
      "Pernoite é uma noite fora; hospedagem são vários dias seguidos. Cada espaço informa quais ocasiões recebe, e muitos atendem as duas.",
  },
  {
    question: "E para passar um tempo junto com o cão?",
    answer:
      "É a opção de lazer: você reserva o espaço para usar junto com ele, em um passeio, uma brincadeira ou um treino. O pedido segue o mesmo caminho da estadia.",
  },
  {
    question: "Por que preciso confirmar meu e-mail?",
    answer:
      "É como garantimos que a solicitação é sua e que conseguimos responder. Sem essa confirmação, o pedido não avança.",
  },
  {
    question: "O endereço aparece antes da visita?",
    answer:
      "Não. Na página do espaço você vê a região aproximada no mapa. O endereço completo é combinado direto com você depois que a visita é acertada.",
  },
  {
    question: "Posso levar mais de um cão?",
    answer:
      "Cada espaço informa quantos cães aceita e quais portes. O filtro de busca ajuda a ver só os que cabem no seu grupo.",
  },
  {
    question: "E se não houver espaço na minha região?",
    answer:
      "Use o \"Quero ser avisado\" e conte onde e como gostaria de usar. Avisamos por e-mail assim que abrir uma opção que combine com vocês.",
  },
  {
    question: "Preciso pagar para enviar uma solicitação?",
    answer: "Não. Enviar a solicitação é gratuito. Valores e formas de pagamento são combinados com a equipe antes da visita.",
  },
];

/** Seção 3 do corpo: branco limpo, para a leitura das respostas. */
export function FaqSection() {
  return (
    <section className="flex min-h-[100svh] flex-col justify-center bg-white px-5 py-12 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto w-full max-w-3xl">
        <header>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Tire suas dúvidas</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-950 sm:text-4xl">Perguntas frequentes</h2>
        </header>

        <div className="mt-8 grid gap-3">
          {QUESTIONS.map(({ question, answer }) => (
            <details
              className="group rounded-2xl border border-emerald-950/10 bg-[#f8f4eb] px-5 transition open:border-emerald-950/20"
              key={question}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-bold text-emerald-950">
                {question}
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-lime-300 text-lg leading-none text-emerald-950 transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-5 text-sm leading-6 text-stone-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
