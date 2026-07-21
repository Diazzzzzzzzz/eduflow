import type { MockTest, Recommendation, SkillScores, Student } from "./types";
import { calcOverall } from "./band";

export const GROUPS = [
  "IELTS Intensive — Morning",
  "IELTS Intensive — Evening",
  "IELTS Foundation",
  "IELTS Weekend Sprint",
] as const;

const MOCK_LABELS = [
  "Mock #1 — Diagnostic",
  "Mock #2 — Cambridge 17",
  "Mock #3 — Cambridge 18",
  "Mock #4 — Midterm Mock",
  "Mock #5 — Cambridge 19",
  "Mock #6 — Full Simulation",
];

// One mock per month, Feb → Jul 2026
const MOCK_DATES = [
  "2026-02-14",
  "2026-03-14",
  "2026-04-11",
  "2026-05-09",
  "2026-06-13",
  "2026-07-11",
];

function tests(rows: [number, number, number, number][]): MockTest[] {
  return rows.map((r, i) => {
    const scores: SkillScores = {
      listening: r[0],
      reading: r[1],
      writing: r[2],
      speaking: r[3],
    };
    return {
      id: `mt-${MOCK_DATES[i]}`,
      date: MOCK_DATES[i],
      label: MOCK_LABELS[i],
      ...scores,
      overall: calcOverall(scores),
    };
  });
}

function rec(
  id: string,
  skill: Recommendation["skill"],
  priority: Recommendation["priority"],
  title: string,
  detail: string
): Recommendation {
  return { id, skill, priority, title, detail };
}

export const STUDENTS: Student[] = [
  {
    id: "st-01",
    name: "Arman Kalibekov",
    initials: "AK",
    group: "IELTS Intensive — Morning",
    targetBand: 7.5,
    examDate: "2026-09-19",
    attendance: 96,
    teacherNote:
      "Arman is showing great progress in Listening. Needs to practice Writing Task 2 vocabulary and linking devices.",
    mockTests: tests([
      [6.0, 5.5, 5.0, 5.5],
      [6.5, 6.0, 5.5, 6.0],
      [6.5, 6.5, 5.5, 6.0],
      [7.0, 6.5, 6.0, 6.5],
      [7.5, 6.5, 6.0, 6.5],
      [7.5, 7.0, 6.0, 7.0],
    ]),
    recommendations: [
      rec(
        "r-01a",
        "writing",
        "high",
        "Task 2 coherence needs linking words",
        "Essays lose marks on progression. Drill 'however / consequently / in contrast' and paragraph topic sentences — 3 timed intros this week."
      ),
      rec(
        "r-01b",
        "reading",
        "medium",
        "True / False / Not Given accuracy",
        "Currently 6/13 on TFNG sets. Practise locating the exact sentence before judging — Cambridge 18, Tests 2–4."
      ),
      rec(
        "r-01c",
        "speaking",
        "low",
        "Part 3 answer depth",
        "Answers are fluent but short. Use the 'opinion → reason → example' frame to stretch responses past 30 seconds."
      ),
    ],
  },
  {
    id: "st-02",
    name: "Aruzhan Mukasheva",
    initials: "AM",
    group: "IELTS Intensive — Morning",
    targetBand: 8.0,
    examDate: "2026-08-22",
    attendance: 100,
    teacherNote:
      "Aruzhan is our strongest reader. Speaking fluency is excellent; push pronunciation of consonant clusters for 8.0.",
    mockTests: tests([
      [7.0, 7.5, 6.0, 6.5],
      [7.0, 7.5, 6.5, 7.0],
      [7.5, 8.0, 6.5, 7.0],
      [7.5, 8.0, 6.5, 7.5],
      [8.0, 8.5, 7.0, 7.5],
      [8.0, 8.5, 7.0, 7.5],
    ]),
    recommendations: [
      rec(
        "r-02a",
        "writing",
        "high",
        "Task 1 overview statements",
        "Reports jump straight into data. Open body with a two-sentence overview of main trends before any figures."
      ),
      rec(
        "r-02b",
        "speaking",
        "medium",
        "Consonant cluster pronunciation",
        "'Sixth', 'strengths', 'crisps' — shadow BBC 6-Minute English daily for 10 minutes."
      ),
    ],
  },
  {
    id: "st-03",
    name: "Dias Serikbay",
    initials: "DS",
    group: "IELTS Intensive — Evening",
    targetBand: 7.0,
    examDate: "2026-10-03",
    attendance: 88,
    teacherNote:
      "Dias improved two half-bands in Listening this term. Reading speed is the main blocker — needs timed section practice.",
    mockTests: tests([
      [5.5, 5.0, 5.0, 5.5],
      [6.0, 5.5, 5.5, 5.5],
      [6.0, 5.5, 5.5, 6.0],
      [6.5, 6.0, 5.5, 6.0],
      [6.5, 6.0, 6.0, 6.5],
      [7.0, 6.0, 6.0, 6.5],
    ]),
    recommendations: [
      rec(
        "r-03a",
        "reading",
        "high",
        "Section 3 time management",
        "Regularly leaves 6+ questions blank. Cap Section 1 at 15 minutes and practise skimming for paragraph gist first."
      ),
      rec(
        "r-03b",
        "writing",
        "medium",
        "Complex sentence variety",
        "Over-relies on simple sentences. Target one conditional and one relative clause per paragraph."
      ),
    ],
  },
  {
    id: "st-04",
    name: "Aigerim Nurlanova",
    initials: "AN",
    group: "IELTS Foundation",
    targetBand: 7.0,
    examDate: "2026-11-14",
    attendance: 92,
    teacherNote:
      "Aigerim participates actively and her vocabulary range is growing fast. Listening Section 4 remains the weak spot.",
    mockTests: tests([
      [4.5, 5.0, 4.5, 5.0],
      [5.0, 5.0, 5.0, 5.0],
      [5.0, 5.5, 5.0, 5.5],
      [5.5, 5.5, 5.0, 5.5],
      [5.5, 6.0, 5.5, 6.0],
      [6.0, 6.0, 5.5, 6.0],
    ]),
    recommendations: [
      rec(
        "r-04a",
        "listening",
        "high",
        "Section 4 academic monologues",
        "Loses focus after minute 3. Practise note-completion with one TED-Ed talk per day, transcribing key nouns."
      ),
      rec(
        "r-04b",
        "writing",
        "medium",
        "Task 2 paragraph structure",
        "Ideas are good but unordered. Use the PEEL frame (Point, Explain, Example, Link) for every body paragraph."
      ),
    ],
  },
  {
    id: "st-05",
    name: "Alikhan Tulegenov",
    initials: "AT",
    group: "IELTS Intensive — Evening",
    targetBand: 7.5,
    examDate: "2026-09-05",
    attendance: 94,
    teacherNote:
      "Alikhan's speaking is near-native in fluency. Writing grammar accuracy under time pressure is the last gap to 7.5.",
    mockTests: tests([
      [6.5, 6.0, 5.5, 7.0],
      [6.5, 6.5, 6.0, 7.0],
      [7.0, 6.5, 6.0, 7.5],
      [7.0, 7.0, 6.0, 7.5],
      [7.5, 7.0, 6.5, 7.5],
      [7.5, 7.0, 6.5, 8.0],
    ]),
    recommendations: [
      rec(
        "r-05a",
        "writing",
        "high",
        "Article and preposition accuracy",
        "Recurring 'the/a' omissions cost GRA marks. Self-edit checklist pass in the last 3 minutes of every task."
      ),
      rec(
        "r-05b",
        "reading",
        "low",
        "Matching headings strategy",
        "Read the headings first and predict paragraph function before scanning."
      ),
    ],
  },
  {
    id: "st-06",
    name: "Madina Yessenova",
    initials: "MY",
    group: "IELTS Weekend Sprint",
    targetBand: 7.0,
    examDate: "2026-08-29",
    attendance: 85,
    teacherNote:
      "Madina made a strong jump this month after switching to daily listening drills. Keep momentum on Writing Task 1.",
    mockTests: tests([
      [5.5, 6.0, 5.0, 5.5],
      [6.0, 6.0, 5.5, 6.0],
      [6.5, 6.5, 5.5, 6.0],
      [6.5, 6.5, 6.0, 6.5],
      [7.0, 6.5, 6.0, 6.5],
      [7.0, 7.0, 6.5, 6.5],
    ]),
    recommendations: [
      rec(
        "r-06a",
        "writing",
        "high",
        "Task 1 data selection",
        "Describes every data point equally. Pick the 2–3 most significant trends and group the rest."
      ),
      rec(
        "r-06b",
        "speaking",
        "medium",
        "Part 2 long-turn stamina",
        "Runs out of ideas at 60 seconds. Practise the 5W1H expansion on cue cards daily."
      ),
    ],
  },
  {
    id: "st-07",
    name: "Nurislam Bekzhanov",
    initials: "NB",
    group: "IELTS Foundation",
    targetBand: 6.5,
    examDate: "2026-12-05",
    attendance: 78,
    teacherNote:
      "Nurislam's attendance dipped in June — flagged for a parent check-in. Scores hold steady when he attends consistently.",
    mockTests: tests([
      [4.5, 4.5, 4.0, 4.5],
      [5.0, 4.5, 4.5, 5.0],
      [5.0, 5.0, 4.5, 5.0],
      [5.0, 5.0, 4.5, 5.0],
      [5.5, 5.0, 5.0, 5.5],
      [5.5, 5.5, 5.0, 5.5],
    ]),
    recommendations: [
      rec(
        "r-07a",
        "listening",
        "high",
        "Spelling in answer transfer",
        "Loses 3–4 correct answers per test to spelling. Drill the top-100 IELTS listening nouns weekly."
      ),
      rec(
        "r-07b",
        "reading",
        "medium",
        "Vocabulary for paraphrase spotting",
        "Build 10 synonym pairs per unit from Cambridge Vocabulary for IELTS."
      ),
    ],
  },
  {
    id: "st-08",
    name: "Tomiris Aitbayeva",
    initials: "TA",
    group: "IELTS Intensive — Morning",
    targetBand: 7.0,
    examDate: "2026-09-26",
    attendance: 98,
    teacherNote:
      "Tomiris is exceptionally consistent — never misses homework. Ready to push speaking beyond memorised structures.",
    mockTests: tests([
      [6.0, 6.0, 5.5, 5.5],
      [6.0, 6.5, 5.5, 6.0],
      [6.5, 6.5, 6.0, 6.0],
      [6.5, 7.0, 6.0, 6.0],
      [7.0, 7.0, 6.0, 6.5],
      [7.0, 7.0, 6.5, 6.5],
    ]),
    recommendations: [
      rec(
        "r-08a",
        "speaking",
        "high",
        "Natural responses over templates",
        "Examiner will spot memorised chunks. Practise reacting to unexpected Part 3 questions with 'It depends…' pivots."
      ),
      rec(
        "r-08b",
        "writing",
        "low",
        "Lexical range in Task 2",
        "Upgrade high-frequency verbs: 'get → obtain / acquire', 'big → substantial'."
      ),
    ],
  },
  {
    id: "st-09",
    name: "Bekarys Zhumagulov",
    initials: "BZ",
    group: "IELTS Weekend Sprint",
    targetBand: 6.5,
    examDate: "2026-10-17",
    attendance: 90,
    teacherNote:
      "Bekarys thinks deeply but hesitates in Speaking. Confidence drills are working — fluency is up a half-band.",
    mockTests: tests([
      [5.5, 6.0, 5.0, 4.5],
      [5.5, 6.0, 5.0, 5.0],
      [6.0, 6.0, 5.5, 5.0],
      [6.0, 6.5, 5.5, 5.5],
      [6.0, 6.5, 5.5, 5.5],
      [6.5, 6.5, 6.0, 6.0],
    ]),
    recommendations: [
      rec(
        "r-09a",
        "speaking",
        "high",
        "Reduce hesitation fillers",
        "Long pauses before answers. Practise 3-second response starts: rephrase the question aloud while thinking."
      ),
      rec(
        "r-09b",
        "listening",
        "medium",
        "Map / plan labelling tasks",
        "Confuses left/right orientation under pressure. Do 2 map tasks weekly with the audio at 1.25x."
      ),
    ],
  },
  {
    id: "st-10",
    name: "Zere Amangeldina",
    initials: "ZA",
    group: "IELTS Intensive — Evening",
    targetBand: 8.0,
    examDate: "2026-08-15",
    attendance: 97,
    teacherNote:
      "Zere is two weeks from exam day and trending at 7.5. Final focus: Writing Task 2 position clarity for the 8.0 push.",
    mockTests: tests([
      [7.0, 7.0, 6.0, 6.5],
      [7.5, 7.0, 6.5, 7.0],
      [7.5, 7.5, 6.5, 7.0],
      [8.0, 7.5, 6.5, 7.5],
      [8.0, 8.0, 7.0, 7.5],
      [8.5, 8.0, 7.0, 7.5],
    ]),
    recommendations: [
      rec(
        "r-10a",
        "writing",
        "high",
        "Thesis position in Task 2",
        "Position appears only in the conclusion. State a clear opinion in the introduction and echo it in every paragraph."
      ),
      rec(
        "r-10b",
        "speaking",
        "low",
        "Intonation variety",
        "Delivery is accurate but flat. Mark stress words in practice answers and exaggerate on record-and-review."
      ),
    ],
  },
  {
    id: "st-11",
    name: "Sanzhar Orazbekov",
    initials: "SO",
    group: "IELTS Foundation",
    targetBand: 6.5,
    examDate: "2026-11-28",
    attendance: 91,
    teacherNote:
      "Sanzhar joined mid-term and is catching up quickly. Grammar foundations are solid; vocabulary breadth is the priority.",
    mockTests: tests([
      [5.0, 4.5, 4.5, 5.0],
      [5.0, 5.0, 5.0, 5.0],
      [5.5, 5.0, 5.0, 5.5],
      [5.5, 5.5, 5.0, 5.5],
      [6.0, 5.5, 5.5, 6.0],
      [6.0, 6.0, 5.5, 6.0],
    ]),
    recommendations: [
      rec(
        "r-11a",
        "reading",
        "high",
        "Academic word list coverage",
        "Unknown vocabulary blocks comprehension. Work through AWL sublists 1–3 with spaced repetition."
      ),
      rec(
        "r-11b",
        "writing",
        "medium",
        "Task response completeness",
        "Often answers only half of two-part questions. Underline both parts of the prompt before planning."
      ),
    ],
  },
  {
    id: "st-12",
    name: "Kamila Dauletova",
    initials: "KD",
    group: "IELTS Weekend Sprint",
    targetBand: 7.5,
    examDate: "2026-10-10",
    attendance: 95,
    teacherNote:
      "Kamila balances school olympiads with IELTS prep impressively. Reading is already at target — hold and polish Writing.",
    mockTests: tests([
      [6.0, 6.5, 5.5, 6.0],
      [6.5, 7.0, 6.0, 6.0],
      [6.5, 7.0, 6.0, 6.5],
      [7.0, 7.5, 6.0, 6.5],
      [7.0, 7.5, 6.5, 7.0],
      [7.5, 7.5, 6.5, 7.0],
    ]),
    recommendations: [
      rec(
        "r-12a",
        "writing",
        "high",
        "Cohesion without mechanical linkers",
        "Overuses 'Firstly / Secondly / In conclusion'. Vary with referencing ('this trend', 'such measures')."
      ),
      rec(
        "r-12b",
        "listening",
        "low",
        "Multiple-choice distractor traps",
        "Watch for corrections mid-audio ('actually, on second thought…') in Section 2."
      ),
    ],
  },
];

/** Center-level aggregates for the director overview. */
export function centerStats(students: Student[]) {
  const latest = students.map(
    (s) => s.mockTests[s.mockTests.length - 1]?.overall ?? 0
  );
  const avgBand =
    Math.round(
      (latest.reduce((a, b) => a + b, 0) / Math.max(latest.length, 1)) * 10
    ) / 10;
  const targetMet = students.filter((s) => {
    const last = s.mockTests[s.mockTests.length - 1];
    return last && last.overall >= s.targetBand - 0.5;
  }).length;
  const attendance = Math.round(
    students.reduce((a, s) => a + s.attendance, 0) / Math.max(students.length, 1)
  );
  return {
    totalStudents: 142, // center-wide; this workspace shows one cohort
    cohortSize: students.length,
    avgBand,
    targetMetRate: Math.round((targetMet / Math.max(students.length, 1)) * 100),
    attendance,
  };
}
