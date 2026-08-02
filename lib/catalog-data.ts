import type { Skill } from "./types";

export type SectionId = "all" | Skill;

export interface CatalogSection {
  id: SectionId;
  /** English section name (kept recognizable). */
  en: string;
  /** Russian label. */
  label: string;
  duration: string;
  questions: string;
}

/**
 * The practice catalogue's sections.
 *
 * This used to also export a hard-coded Cambridge IELTS 20–12 shelf: nine
 * books × four tests, each card showing an invented status ("Пройдено (Score:
 * 7.5)"), and every one of them linking to the same default paper regardless
 * of which book or test was clicked. None of it was backed by content, so it
 * has been removed. What the catalogue lists now comes from
 * `listAvailablePapers()` — papers the engine can actually open and score.
 */
export const CATALOG_SECTIONS: CatalogSection[] = [
  { id: "all", label: "Все тесты", en: "All tests", duration: "60 мин", questions: "до 40 вопросов" },
  { id: "listening", label: "Аудирование", en: "Listening", duration: "30 мин", questions: "40 вопросов" },
  { id: "reading", label: "Чтение", en: "Reading", duration: "60 мин", questions: "40 вопросов" },
  { id: "writing", label: "Письмо", en: "Writing", duration: "60 мин", questions: "2 задания" },
  { id: "speaking", label: "Говорение", en: "Speaking", duration: "11–14 мин", questions: "3 части" },
];
