/**
 * Deterministic date formatting for fixed ISO (YYYY-MM-DD) strings.
 *
 * We deliberately avoid `Date.prototype.toLocaleDateString` for rendered
 * dates: its output depends on the runtime's ICU/CLDR version, so the server
 * (Node ICU) and the browser can disagree on the month abbreviation
 * ("Sep" vs "Sept") or the separator (ASCII space vs narrow no-break space),
 * which triggers React hydration mismatches. Parsing the string components
 * directly keeps output byte-identical everywhere.
 */

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Split a `YYYY-MM-DD` (or ISO datetime) string into calendar parts, no timezone math. */
function parts(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

/** e.g. "19 Sept" */
export function formatDayMonth(iso: string): string {
  const { m, d } = parts(iso);
  return `${d} ${MONTHS_SHORT[m - 1]}`;
}

/** e.g. "19 Sept 2026" */
export function formatDayMonthYear(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
}

/** e.g. "19 September 2026" */
export function formatLongDate(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS_LONG[m - 1]} ${y}`;
}

/** e.g. "Sept" — short month only, for chart axes. */
export function formatMonthShort(iso: string): string {
  const { m } = parts(iso);
  return MONTHS_SHORT[m - 1];
}
