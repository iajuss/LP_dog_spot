/**
 * Fica fora de `combo-box.tsx` de propósito: aquele módulo é "use client", e
 * um Server Component não pode chamar função vinda de módulo cliente. O
 * FilterPanel é servidor e monta as opções, então o helper mora aqui.
 */
export type ComboOption = {
  label: string;
  value: string;
  /** Campo enviado no formulário quando esta opção é escolhida. */
  param?: string;
};

/** Atalho para listas simples, em que rótulo e valor são iguais. */
export const toComboOptions = (values: readonly string[]): ComboOption[] =>
  values.map((value) => ({ label: value, value }));
