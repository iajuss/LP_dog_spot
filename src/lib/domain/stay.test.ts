import { USE_TYPES } from "./catalog";
import {
  LEISURE_USES,
  STAY_INTENTS,
  STAY_INTENT_LABELS,
  STAY_INTENT_TAGLINES,
  USE_TYPES_BY_STAY_PRIORITY,
  intentForUseType,
  isOvernightIntent,
  isStayIntent,
  usesForIntent,
} from "./stay";

test("a home oferece três intenções, com estadia antes de lazer", () => {
  expect(STAY_INTENTS).toEqual(["hospedagem", "pernoite", "lazer"]);
  for (const intent of STAY_INTENTS) {
    expect(STAY_INTENT_LABELS[intent], `rótulo ausente: ${intent}`).toBeTruthy();
    expect(STAY_INTENT_TAGLINES[intent], `apoio ausente: ${intent}`).toBeTruthy();
  }
});

test("hospedagem e pernoite viram um uso só; lazer agrupa as ocasiões de visita", () => {
  expect(usesForIntent("hospedagem")).toEqual(["hospedagem"]);
  expect(usesForIntent("pernoite")).toEqual(["pernoite"]);
  expect(usesForIntent("lazer")).toEqual(LEISURE_USES);
  expect(LEISURE_USES).not.toContain("hospedagem");
  expect(LEISURE_USES).not.toContain("pernoite");
  // Creche é cão sob cuidado de outra casa, não é lazer junto com o tutor.
  expect(LEISURE_USES).not.toContain("creche");
});

test("o uso da URL indica de volta a intenção que o tutor escolheu", () => {
  expect(intentForUseType("hospedagem")).toBe("hospedagem");
  expect(intentForUseType("pernoite")).toBe("pernoite");
  expect(intentForUseType("brincadeira")).toBe("lazer");
  expect(intentForUseType("passeio")).toBe("lazer");
  expect(intentForUseType("creche")).toBeUndefined();
  expect(intentForUseType(undefined)).toBeUndefined();
});

test("hospedagem e pernoite são as intenções em que o cão dorme fora", () => {
  expect(isOvernightIntent("hospedagem")).toBe(true);
  expect(isOvernightIntent("pernoite")).toBe(true);
  expect(isOvernightIntent("lazer")).toBe(false);
  expect(isOvernightIntent(undefined)).toBe(false);
});

test("só valores conhecidos passam como intenção", () => {
  expect(isStayIntent("hospedagem")).toBe(true);
  expect(isStayIntent("festa")).toBe(false);
  expect(isStayIntent(null)).toBe(false);
  expect(isStayIntent(undefined)).toBe(false);
});

test("a ordem de apresentação das ocasiões começa pelas estadias", () => {
  expect(USE_TYPES_BY_STAY_PRIORITY.slice(0, 3)).toEqual(["hospedagem", "pernoite", "creche"]);
  expect([...USE_TYPES_BY_STAY_PRIORITY].sort()).toEqual([...USE_TYPES].sort());
});
