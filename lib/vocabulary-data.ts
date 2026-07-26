/**
 * Personal vocabulary: the words a student collects while reading, plus the
 * lists a teacher assigns.
 *
 * A teacher list is materialised per student rather than shared, because the
 * learning status belongs to the learner — two students working the same topic
 * are at different points in it.
 */

export type VocabSource = "student" | "teacher";
export type VocabStatus = "new" | "learning" | "mastered";

export interface VocabEntry {
  id: string;
  term: string;
  /** IPA, shown under the term and on the flashcard. */
  phonetic: string | null;
  translation: string;
  /** The sentence the word was taken from, or a model sentence. */
  example: string | null;
  /** Where the word came from: saved while reading, or assigned. */
  source: VocabSource;
  /** Teacher lists carry a topic, e.g. "Environment". */
  topic: string | null;
  status: VocabStatus;
  createdAt: string;
}

export const STATUS_LABELS: Record<VocabStatus, string> = {
  new: "Новое",
  learning: "Учу",
  mastered: "Выучено",
};

export const STATUS_ORDER: VocabStatus[] = ["new", "learning", "mastered"];

export const SOURCE_LABELS: Record<VocabSource, string> = {
  student: "Сохранено мной",
  teacher: "От преподавателя",
};

/** Next status after a flashcard answer. */
export function advanceStatus(
  current: VocabStatus,
  knew: boolean
): VocabStatus {
  if (knew) return current === "new" ? "learning" : "mastered";
  // A miss always drops back to active practice, never below it.
  return "learning";
}

/* -------------------------------------------------------------------------- */
/* Demo content                                                               */
/* -------------------------------------------------------------------------- */

type SeedWord = Omit<VocabEntry, "id" | "createdAt" | "status"> & {
  status?: VocabStatus;
};

/** Academic words that recur across IELTS Reading and Writing. */
export const DEMO_VOCABULARY: SeedWord[] = [
  {
    term: "cohesion",
    phonetic: "/kəʊˈhiːʒən/",
    translation: "связность, сцепление (текста)",
    example:
      "Examiners mark cohesion separately: ideas must connect, not just follow one another.",
    source: "teacher",
    topic: "Writing assessment",
  },
  {
    term: "ambiguity",
    phonetic: "/ˌæmbɪˈɡjuːəti/",
    translation: "двусмысленность, неоднозначность",
    example:
      "The ambiguity of the question meant two very different answers were defensible.",
    source: "teacher",
    topic: "Writing assessment",
  },
  {
    term: "plausible",
    phonetic: "/ˈplɔːzəbəl/",
    translation: "правдоподобный, убедительный",
    example:
      "The explanation is plausible, though the study stops short of proving it.",
    source: "teacher",
    topic: "Academic argument",
  },
  {
    term: "substantial",
    phonetic: "/səbˈstænʃəl/",
    translation: "значительный, существенный",
    example:
      "A substantial share of the water soaked away before it ever reached a field.",
    source: "student",
    topic: null,
  },
  {
    term: "detrimental",
    phonetic: "/ˌdetrɪˈmentəl/",
    translation: "вредный, пагубный",
    example:
      "Long commutes are detrimental to both health and family life.",
    source: "teacher",
    topic: "Environment",
  },
  {
    term: "mitigate",
    phonetic: "/ˈmɪtɪɡeɪt/",
    translation: "смягчать, уменьшать (последствия)",
    example:
      "Planting street trees mitigates the worst of the summer heat.",
    source: "teacher",
    topic: "Environment",
  },
  {
    term: "resilient",
    phonetic: "/rɪˈzɪliənt/",
    translation: "устойчивый, быстро восстанавливающийся",
    example:
      "The midsole is built from a light, highly resilient foam.",
    source: "student",
    topic: null,
  },
  {
    term: "deterioration",
    phonetic: "/dɪˌtɪəriəˈreɪʃən/",
    translation: "ухудшение, разрушение",
    example:
      "Rising salinity caused a rapid deterioration in water quality.",
    source: "teacher",
    topic: "Environment",
  },
  {
    term: "advocate",
    phonetic: "/ˈædvəkeɪt/",
    translation: "выступать за, отстаивать",
    example:
      "Some economists advocate free tuition; others argue it shifts the cost elsewhere.",
    source: "teacher",
    topic: "Academic argument",
    status: "learning",
  },
  {
    term: "inevitable",
    phonetic: "/ɪnˈevɪtəbəl/",
    translation: "неизбежный",
    example:
      "Some deterioration of the shoreline was inevitable once the rivers were diverted.",
    source: "student",
    topic: null,
    status: "mastered",
  },
];

/**
 * Offline glossary powering the quick-translate popover.
 *
 * Deliberately small and local: it keeps the feature working without shipping
 * selected text to a third-party service. `POST /api/vocabulary/translate` is
 * the single place to swap in a real provider later.
 */
export const QUICK_GLOSSARY: Record<string, { translation: string; phonetic?: string }> = {
  cohesion: { translation: "связность, сцепление", phonetic: "/kəʊˈhiːʒən/" },
  ambiguity: { translation: "двусмысленность", phonetic: "/ˌæmbɪˈɡjuːəti/" },
  plausible: { translation: "правдоподобный", phonetic: "/ˈplɔːzəbəl/" },
  substantial: { translation: "значительный", phonetic: "/səbˈstænʃəl/" },
  detrimental: { translation: "вредный, пагубный", phonetic: "/ˌdetrɪˈmentəl/" },
  mitigate: { translation: "смягчать", phonetic: "/ˈmɪtɪɡeɪt/" },
  resilient: { translation: "устойчивый", phonetic: "/rɪˈzɪliənt/" },
  deterioration: { translation: "ухудшение", phonetic: "/dɪˌtɪəriəˈreɪʃən/" },
  advocate: { translation: "выступать за, отстаивать", phonetic: "/ˈædvəkeɪt/" },
  inevitable: { translation: "неизбежный", phonetic: "/ɪnˈevɪtəbəl/" },
  salinity: { translation: "солёность", phonetic: "/səˈlɪnəti/" },
  evaporation: { translation: "испарение", phonetic: "/ɪˌvæpəˈreɪʃən/" },
  irrigation: { translation: "орошение", phonetic: "/ˌɪrɪˈɡeɪʃən/" },
  albedo: { translation: "альбедо, отражательная способность" },
  canopy: { translation: "полог, крона", phonetic: "/ˈkænəpi/" },
  retention: { translation: "удержание, сохранение", phonetic: "/rɪˈtenʃən/" },
  distributed: { translation: "распределённый", phonetic: "/dɪˈstrɪbjuːtɪd/" },
  retrieval: { translation: "извлечение (из памяти)", phonetic: "/rɪˈtriːvəl/" },
  interleaving: { translation: "чередование", phonetic: "/ˌɪntəˈliːvɪŋ/" },
  threshold: { translation: "порог", phonetic: "/ˈθreʃhəʊld/" },
  compound: { translation: "усугублять; составной", phonetic: "/kəmˈpaʊnd/" },
  ventilation: { translation: "вентиляция", phonetic: "/ˌventɪˈleɪʃən/" },
  permeable: { translation: "проницаемый", phonetic: "/ˈpɜːmiəbəl/" },
  consensus: { translation: "согласие, консенсус", phonetic: "/kənˈsensəs/" },
  ratify: { translation: "ратифицировать, утверждать", phonetic: "/ˈrætɪfaɪ/" },
};

/**
 * Strip surrounding punctuation and case so "Cohesion," matches the glossary.
 *
 * Uses an explicit letter class rather than `\p{L}`, which needs a newer
 * compile target than this project sets.
 */
export function normalizeTerm(raw: string): string {
  return raw
    .trim()
    .replace(/^[^A-Za-zА-Яа-яЁё]+|[^A-Za-zА-Яа-яЁё]+$/g, "")
    .toLowerCase();
}

/**
 * The sentence containing `term` within `context`.
 *
 * Falls back to the whole context when sentence boundaries can't be found,
 * which is better than saving a fragment with no meaning.
 */
export function sentenceAround(context: string, term: string): string {
  const flat = context.replace(/\s+/g, " ").trim();
  if (!flat) return "";
  const index = flat.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return flat.slice(0, 300);

  // Walk out to the nearest sentence terminator on each side.
  let start = 0;
  for (let i = index; i > 0; i--) {
    if (/[.!?]/.test(flat[i - 1]) && /\s/.test(flat[i])) {
      start = i;
      break;
    }
  }
  let end = flat.length;
  for (let i = index + term.length; i < flat.length; i++) {
    if (/[.!?]/.test(flat[i])) {
      end = i + 1;
      break;
    }
  }
  return flat.slice(start, end).trim().slice(0, 300);
}
