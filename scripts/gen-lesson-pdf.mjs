/**
 * Generates the demo handout for lesson 11 so the material viewer has a real
 * file to render.
 *
 *   node scripts/gen-lesson-pdf.mjs
 *
 * Writes a minimal single-page PDF by hand rather than pulling in a PDF
 * library for one static asset. Text is English because the built-in Helvetica
 * font has no Cyrillic glyphs — a Russian handout would need an embedded font.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const OUT = new URL("../public/materials/lesson-11-cause-and-effect.pdf", import.meta.url);

/** Escape the characters that are structural inside a PDF string literal. */
const esc = (s) => s.replace(/([\\()])/g, "\\$1");

/** [text, fontSize, leadingBefore] */
const LINES = [
  ["EduFlow - IELTS Preparation", 10, 0],
  ["Lesson 11 of 24", 10, 14],
  ["", 10, 6],
  ["IELTS Writing Task 2: Cause & Effect Essays", 17, 26],
  ["", 10, 10],
  ["What the question asks", 12, 22],
  ["A cause-and-effect prompt asks you to explain why something", 10.5, 16],
  ["happens and what follows from it. Both halves must appear:", 10.5, 14],
  ["an essay that lists causes but never reaches consequences", 10.5, 14],
  ["answers only part of the task.", 10.5, 14],
  ["", 10, 8],
  ["Structure", 12, 20],
  ["1. Introduction - paraphrase the prompt, state the scope.", 10.5, 16],
  ["2. Body 1 - the main causes, each explained, not just named.", 10.5, 14],
  ["3. Body 2 - the effects that follow, linked back to the causes.", 10.5, 14],
  ["4. Conclusion - restate the relationship in one sentence.", 10.5, 14],
  ["", 10, 8],
  ["Language of causation", 12, 20],
  ["Cause: stems from, is driven by, arises from, is triggered by", 10.5, 16],
  ["Effect: leads to, results in, gives rise to, contributes to", 10.5, 14],
  ["Hedging: is likely to, tends to, may in part explain", 10.5, 14],
  ["", 10, 8],
  ["Common mistakes", 12, 20],
  ["- Naming a symptom as if it were a cause.", 10.5, 16],
  ["- Listing four causes with one line each instead of two", 10.5, 14],
  ["  developed with an example.", 10.5, 12],
  ["- Claiming certainty where the evidence supports a tendency.", 10.5, 14],
  ["", 10, 8],
  ["Practice prompt", 12, 20],
  ["In many countries the number of people living alone is rising.", 10.5, 16],
  ["What are the causes of this trend, and what effects does it have", 10.5, 14],
  ["on society? Write at least 250 words.", 10.5, 14],
];

// Build the page content stream: start near the top and step down per line.
let y = 792;
const parts = ["BT", "/F1 10 Tf", "1 0 0 1 64 792 Tm"];
for (const [text, size, lead] of LINES) {
  y -= lead;
  parts.push(`/F1 ${size} Tf`);
  parts.push(`1 0 0 1 64 ${y} Tm`);
  if (text) parts.push(`(${esc(text)}) Tj`);
}
parts.push("ET");
const content = parts.join("\n");

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] " +
    "/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
];

// Assemble, recording each object's byte offset for the xref table.
let pdf = "%PDF-1.4\n";
const offsets = [];
objects.forEach((body, i) => {
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});

const xrefStart = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";
for (const off of offsets) pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
pdf += `startxref\n${xrefStart}\n%%EOF\n`;

mkdirSync(dirname(OUT.pathname), { recursive: true });
writeFileSync(OUT, Buffer.from(pdf, "latin1"));
console.log(
  `✓ ${OUT.pathname.split("/").slice(-2).join("/")} (${Buffer.byteLength(pdf, "latin1")} bytes)`
);
