import type { UseType } from "./catalog";

/**
 * As três portas de entrada da home. Hospedagem e pernoite são o cerne — o cão
 * fica sob os cuidados de outra casa. Lazer é a opção complementar de quem
 * procura um lugar para usar junto com o cão.
 */
export const STAY_INTENTS = ["hospedagem", "pernoite", "lazer"] as const;
export type StayIntent = (typeof STAY_INTENTS)[number];

export const STAY_INTENT_LABELS: Record<StayIntent, string> = {
  hospedagem: "Hospedagem",
  pernoite: "Pernoite",
  lazer: "Lazer",
};

export const STAY_INTENT_TAGLINES: Record<StayIntent, string> = {
  hospedagem: "Vários dias em uma casa que recebe seu cão",
  pernoite: "Uma noite fora, com abrigo e lugar de descanso",
  lazer: "Um tempo em um espaço reservado, junto com seu cão",
};

/** Ocasiões que o tutor vive junto com o cão — o que a intenção "lazer" cobre. */
export const LEISURE_USES: UseType[] = ["passeio", "brincadeira", "treino", "socializacao"];

/** Ordem em que as ocasiões aparecem na home: estadia primeiro, lazer depois. */
export const USE_TYPES_BY_STAY_PRIORITY: UseType[] = [
  "hospedagem",
  "pernoite",
  "creche",
  "passeio",
  "brincadeira",
  "socializacao",
  "treino",
];

export function usesForIntent(intent: StayIntent): UseType[] {
  return intent === "lazer" ? LEISURE_USES : [intent];
}

/**
 * Caminho de volta: a URL carrega `uso`, e é dele que a página descobre com
 * que intenção o tutor chegou. Creche fica de fora das três portas — continua
 * acessível pelo filtro, mas não é nem estadia noturna nem lazer junto.
 */
export function intentForUseType(useType: UseType | undefined): StayIntent | undefined {
  if (!useType) return undefined;
  if (useType === "hospedagem" || useType === "pernoite") return useType;
  return LEISURE_USES.includes(useType) ? "lazer" : undefined;
}

/** Intenções em que o cão dorme fora e a copy fala de acolhimento. */
export function isOvernightIntent(intent: StayIntent | undefined): boolean {
  return intent === "hospedagem" || intent === "pernoite";
}

export function isStayIntent(value: string | null | undefined): value is StayIntent {
  return typeof value === "string" && (STAY_INTENTS as readonly string[]).includes(value);
}
