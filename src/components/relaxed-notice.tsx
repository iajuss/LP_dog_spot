import Link from "next/link";
import { filtersToSearchParams, type SearchFilters } from "@/lib/domain/filters";

type RelaxedNoticeProps = {
  filters: SearchFilters;
  /** Filtros que a busca precisou ignorar para chegar a algum espaço. */
  relaxed: string[];
};

const listar = (itens: string[]) =>
  itens.length > 1 ? `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}` : itens[0];

/**
 * Aviso de resultado aproximado. O tutor continua vendo espaços em vez de uma
 * tela vazia, e o pedido exato que ele fez continua a um clique de virar aviso
 * de disponibilidade — é assim que a busca sem oferta vira sinal de praça nova.
 */
export function RelaxedNotice({ filters, relaxed }: RelaxedNoticeProps) {
  if (!relaxed.length) return null;

  return (
    <div className="mb-5 rounded-2xl border border-amber-300/70 bg-amber-50 px-5 py-4" role="status">
      <p className="text-sm font-bold text-emerald-950">Ampliamos um pouco a busca</p>
      <p className="mt-1 text-sm leading-6 text-stone-700">
        Não há espaço com todos os critérios que você marcou, então ignoramos {listar(relaxed)} para mostrar o que
        chega mais perto.{" "}
        <Link
          className="font-bold text-emerald-900 underline underline-offset-4"
          href={`/reservar?kind=availability_alert&${filtersToSearchParams(filters).toString()}`}
        >
          Quero ser avisado do que pedi
        </Link>
      </p>
    </div>
  );
}
