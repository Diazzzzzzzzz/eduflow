import { describe, it, expect } from "vitest";
import {
  lookupTerm,
  normalizeTerm,
  QUICK_GLOSSARY,
  sentenceAround,
} from "./vocabulary-data";

/**
 * The reader looks a selection up the moment it is made, so this has to cope
 * with text as it appears in a passage — capitalised, punctuated and inflected
 * — not just tidy headwords.
 */
describe("lookupTerm", () => {
  it("finds a headword directly", () => {
    expect(lookupTerm("cohesion")?.translation).toBe("связность, сцепление");
  });

  it("ignores case and surrounding punctuation", () => {
    for (const raw of ["Cohesion", "cohesion,", '"cohesion"', " cohesion. "]) {
      expect(lookupTerm(raw)?.lemma, raw).toBe("cohesion");
    }
  });

  it("resolves regular plurals to their headword", () => {
    expect(lookupTerm("constraints")?.lemma).toBe("constraint");
    expect(lookupTerm("incentives")?.lemma).toBe("incentive");
  });

  it("misses irregular plurals rather than guessing wrongly", () => {
    // "criteria"/"hypotheses" need a real lemmatiser; returning null lets the
    // student type the translation instead of being shown someone else's word.
    expect(lookupTerm("criteria")).toBeNull();
    expect(lookupTerm("hypotheses")).toBeNull();
  });

  it("resolves -y plurals", () => {
    expect(lookupTerm("discrepancies")?.lemma).toBe("discrepancy");
    expect(lookupTerm("hierarchies")?.lemma).toBe("hierarchy");
  });

  it("resolves past and continuous forms", () => {
    expect(lookupTerm("sustained")?.lemma).toBe("sustain");
    expect(lookupTerm("diminishing")?.lemma).toBe("diminish");
    expect(lookupTerm("emerged")?.lemma).toBe("emerge");
    expect(lookupTerm("facilitating")?.lemma).toBe("facilitate");
  });

  it("resolves adverbs to their adjective", () => {
    expect(lookupTerm("notably")?.lemma).toBe("notable");
    expect(lookupTerm("empirically")?.lemma).toBe("empirical");
  });

  it("returns null rather than guessing at an unknown word", () => {
    for (const raw of ["zxcvbn", "elephantine", ""]) {
      expect(lookupTerm(raw), raw).toBeNull();
    }
  });

  it("never invents a translation for a word the glossary lacks", () => {
    // Every hit must correspond to a real glossary entry.
    for (const raw of ["constraints", "sustained", "notably", "cohesion"]) {
      const hit = lookupTerm(raw)!;
      expect(QUICK_GLOSSARY[hit.lemma], raw).toBeDefined();
      expect(hit.translation).toBe(QUICK_GLOSSARY[hit.lemma].translation);
    }
  });

  it("does not strip a stem down to nonsense", () => {
    // "is" must not become "i"; short stems are rejected.
    expect(lookupTerm("is")).toBeNull();
    expect(lookupTerm("as")).toBeNull();
  });
});

describe("glossary integrity", () => {
  const entries = Object.entries(QUICK_GLOSSARY);

  it("has enough coverage to be worth an automatic lookup", () => {
    expect(entries.length).toBeGreaterThan(100);
  });

  it("keys are lowercase headwords, matching what normalizeTerm produces", () => {
    for (const [key] of entries) {
      expect(normalizeTerm(key), key).toBe(key);
    }
  });

  it("every entry has a non-empty translation", () => {
    for (const [key, value] of entries) {
      expect(value.translation.trim(), key).not.toBe("");
    }
  });

  it("phonetics, where given, are slash-delimited", () => {
    for (const [key, value] of entries) {
      if (value.phonetic) {
        expect(value.phonetic.startsWith("/"), key).toBe(true);
        expect(value.phonetic.endsWith("/"), key).toBe(true);
      }
    }
  });
});

describe("sentenceAround", () => {
  it("returns the sentence holding the term, for the saved example", () => {
    const text =
      "Cities grew fast. The constraint on growth was water supply. Later this eased.";
    expect(sentenceAround(text, "constraint")).toContain("water supply");
  });

  it("copes with a term that is not present", () => {
    expect(sentenceAround("Some passage text.", "absent")).toBeTruthy();
  });

  it("returns empty for empty context", () => {
    expect(sentenceAround("", "word")).toBe("");
  });
});
