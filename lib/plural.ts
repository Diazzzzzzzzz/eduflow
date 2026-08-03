/**
 * Russian noun agreement after a numeral.
 *
 * Russian picks one of three forms by the last digits, so "1 тест / 2 теста /
 * 5 тестов" cannot be done with the English one-or-many rule. Written out
 * rather than using Intl.PluralRules so the caller supplies the three forms
 * explicitly — the stems change, not just the ending.
 */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = Math.abs(n) % 10;
  const mod100 = Math.abs(n) % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** `plural` with the number in front: "3 группы". */
export function countOf(
  n: number,
  one: string,
  few: string,
  many: string
): string {
  return `${n} ${plural(n, one, few, many)}`;
}
