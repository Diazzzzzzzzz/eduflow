import { describe, it, expect } from "vitest";
import { countOf, plural } from "./plural";

/**
 * Russian agreement after a numeral. The teens are the trap: 11–14 take the
 * "many" form even though they end in 1–4.
 */
describe("plural", () => {
  const форма = (n: number) => plural(n, "тест", "теста", "тестов");

  it("uses the singular for 1, 21, 101", () => {
    for (const n of [1, 21, 31, 101, 1001]) expect(форма(n), String(n)).toBe("тест");
  });

  it("uses the few-form for 2–4, 22–24", () => {
    for (const n of [2, 3, 4, 22, 33, 44, 102]) expect(форма(n), String(n)).toBe("теста");
  });

  it("uses the many-form for 0, 5–20 and the teens", () => {
    for (const n of [0, 5, 9, 10, 11, 12, 13, 14, 19, 20, 111, 112])
      expect(форма(n), String(n)).toBe("тестов");
  });

  it("agrees on negatives by magnitude", () => {
    expect(форма(-1)).toBe("тест");
    expect(форма(-3)).toBe("теста");
  });

  it("countOf puts the number in front", () => {
    expect(countOf(1, "группа", "группы", "групп")).toBe("1 группа");
    expect(countOf(3, "группа", "группы", "групп")).toBe("3 группы");
    expect(countOf(11, "группа", "группы", "групп")).toBe("11 групп");
  });
});
