import { SPACES } from "./catalog";

test("catálogo tem doze espaços e fotos únicas", () => {
  expect(SPACES).toHaveLength(12);
  expect(new Set(SPACES.map((space) => space.imageUrl)).size).toBe(12);
});
