import type { CambridgeTestFull } from "./cambridge-types";

/**
 * ORIGINAL, IELTS-style practice content authored for IELTS Pulse. It mirrors
 * the structure of a Cambridge test (book 18 / test 1) so the engine can be
 * demonstrated end-to-end, but the passages, questions, and answer keys are our
 * own work — NOT reproductions of the copyrighted Cambridge IELTS materials.
 *
 * Used as the offline fallback and as the source for scripts/gen-cambridge-seed.ts.
 */

const READING_PASSAGE = `A. Over the past two decades, the practice of keeping honeybees in cities has grown from a fringe hobby into a widespread urban movement. Rooftops, community gardens and even balconies now host hives that would once have been found only in the countryside. Supporters argue that urban beekeeping reconnects city dwellers with the natural world and draws attention to the wider decline of pollinating insects.

B. The appeal is easy to understand. A single hive can be managed in a small space, and cities often provide a surprisingly rich diet for bees. Parks, street trees and private gardens bloom at different times, so urban bees frequently enjoy a longer and more varied foraging season than their rural cousins, who may face vast fields of a single crop followed by months with little to eat.

C. Not everyone is convinced that the trend is beneficial. Dr Helena Voss, an ecologist, warns that placing too many managed hives in one area can leave little food for wild bees and other pollinators. Because honeybees are efficient foragers kept in large numbers, they may outcompete solitary species that are already under pressure. In her view, the enthusiasm for hives has outpaced the evidence that they help biodiversity.

D. Other researchers take a more measured position. Professor Adam Reilly accepts that competition is possible but argues that the true problem is a shortage of flowers, not a surplus of bees. If cities planted more diverse, nectar-rich vegetation, he suggests, both managed and wild pollinators could thrive together. His team has shown that neighbourhoods with abundant flowering plants support far larger insect populations regardless of how many hives are present.

E. What most experts agree on is the educational value of the movement. Even critics concede that a visible hive can transform how a community thinks about food, farming and the fragility of ecosystems. Schools that adopt hives report that pupils become noticeably more curious about where their food comes from and more willing to protect green spaces.`;

const CAMBRIDGE_READING: CambridgeTestFull = {
  id: "cam18-t1-reading",
  bookNumber: 18,
  testNumber: 1,
  title: "Academic Reading — Practice Set 1 (Cambridge-style, original)",
  sectionType: "reading",
  passages: [
    {
      id: "cam18-t1-reading-p1",
      passageNumber: 1,
      title: "The rise of urban beekeeping",
      textContent: READING_PASSAGE,
      audioUrl: null,
      questions: [
        {
          id: "r-q1",
          questionNumber: 1,
          type: "true_false_not_given",
          prompt: "Urban beekeeping was once mainly a rural activity.",
          options: ["TRUE", "FALSE", "NOT GIVEN"],
          correctAnswer: "TRUE",
          explanation:
            "Paragraph A says hives 'would once have been found only in the countryside'.",
        },
        {
          id: "r-q2",
          questionNumber: 2,
          type: "true_false_not_given",
          prompt: "City bees usually have a shorter foraging season than rural bees.",
          options: ["TRUE", "FALSE", "NOT GIVEN"],
          correctAnswer: "FALSE",
          explanation:
            "Paragraph B states urban bees often enjoy a 'longer and more varied foraging season'.",
        },
        {
          id: "r-q3",
          questionNumber: 3,
          type: "true_false_not_given",
          prompt: "Dr Voss has measured the exact number of wild bees lost to hives.",
          options: ["TRUE", "FALSE", "NOT GIVEN"],
          correctAnswer: "NOT GIVEN",
          explanation:
            "The passage reports her concern but gives no measurement of wild-bee losses.",
        },
        {
          id: "r-q4",
          questionNumber: 4,
          type: "true_false_not_given",
          prompt: "Schools with hives report increased pupil interest in food origins.",
          options: ["TRUE", "FALSE", "NOT GIVEN"],
          correctAnswer: "TRUE",
          explanation:
            "Paragraph E: pupils become 'more curious about where their food comes from'.",
        },
        {
          id: "r-q5",
          questionNumber: 5,
          type: "mcq",
          prompt: "According to Dr Voss, the main risk of many hives in one area is that",
          options: [
            "honeybees spread disease to wild bees",
            "honeybees outcompete solitary species for food",
            "hives are too expensive for cities to maintain",
            "urban flowers are poisonous to bees",
          ],
          correctAnswer: "honeybees outcompete solitary species for food",
          explanation:
            "Paragraph C: honeybees 'may outcompete solitary species that are already under pressure'.",
        },
        {
          id: "r-q6",
          questionNumber: 6,
          type: "mcq",
          prompt: "Professor Reilly believes the real problem is",
          options: [
            "a shortage of flowers",
            "a surplus of hives",
            "poor beekeeping skills",
            "climate change",
          ],
          correctAnswer: "a shortage of flowers",
          explanation:
            "Paragraph D: 'the true problem is a shortage of flowers, not a surplus of bees'.",
        },
        {
          id: "r-q7",
          questionNumber: 7,
          type: "matching",
          prompt:
            "Managed hives can crowd out wild pollinators when concentrated.",
          options: ["Dr Helena Voss", "Professor Adam Reilly"],
          correctAnswer: "Dr Helena Voss",
          explanation: "This competition concern is attributed to Dr Voss in paragraph C.",
        },
        {
          id: "r-q8",
          questionNumber: 8,
          type: "matching",
          prompt:
            "Planting more varied vegetation lets managed and wild bees coexist.",
          options: ["Dr Helena Voss", "Professor Adam Reilly"],
          correctAnswer: "Professor Adam Reilly",
          explanation: "Reilly's position in paragraph D.",
        },
        {
          id: "r-q9",
          questionNumber: 9,
          type: "matching",
          prompt: "Enthusiasm for hives has moved ahead of the supporting evidence.",
          options: ["Dr Helena Voss", "Professor Adam Reilly"],
          correctAnswer: "Dr Helena Voss",
          explanation:
            "Paragraph C: 'the enthusiasm for hives has outpaced the evidence'.",
        },
        {
          id: "r-q10",
          questionNumber: 10,
          type: "fill_blanks",
          prompt:
            "Complete the summary. A single hive needs only a small ________ to manage.",
          options: null,
          correctAnswer: "space",
          explanation: "Paragraph B: 'can be managed in a small space'.",
        },
        {
          id: "r-q11",
          questionNumber: 11,
          type: "fill_blanks",
          prompt:
            "Reilly's team found that areas with many flowering plants support larger ________ populations.",
          options: null,
          correctAnswer: "insect",
          explanation: "Paragraph D: 'support far larger insect populations'.",
        },
        {
          id: "r-q12",
          questionNumber: 12,
          type: "fill_blanks",
          prompt:
            "Most experts agree the movement has strong ________ value for communities.",
          options: null,
          correctAnswer: "educational",
          explanation: "Paragraph E: 'the educational value of the movement'.",
        },
      ],
    },
  ],
};

const CAMBRIDGE_LISTENING: CambridgeTestFull = {
  id: "cam18-t1-listening",
  bookNumber: 18,
  testNumber: 1,
  title: "Listening — Practice Set 1 (Cambridge-style, original)",
  sectionType: "listening",
  passages: [
    {
      id: "cam18-t1-listening-s1",
      passageNumber: 1,
      title: "Section 1 — Riverside Sports Centre membership",
      textContent:
        "Заполните форму записи в спортивный центр. Прослушайте разговор администратора и клиента и впишите пропущенные слова или числа. Аудио демонстрационное.",
      audioUrl: null,
      questions: [
        {
          id: "l-q1",
          questionNumber: 1,
          type: "fill_blanks",
          prompt: "Membership type: ________ (individual / family / student)",
          options: null,
          correctAnswer: "family",
          explanation: "The caller signs up the whole household.",
        },
        {
          id: "l-q2",
          questionNumber: 2,
          type: "fill_blanks",
          prompt: "Start date: 1st ________",
          options: null,
          correctAnswer: "March|march",
          explanation: "Membership begins on 1 March.",
        },
        {
          id: "l-q3",
          questionNumber: 3,
          type: "fill_blanks",
          prompt: "Monthly fee: £ ________",
          options: null,
          correctAnswer: "45|45.00",
          explanation: "The stated family rate is £45 per month.",
        },
        {
          id: "l-q4",
          questionNumber: 4,
          type: "fill_blanks",
          prompt: "Free induction session included: ________ (yes / no)",
          options: null,
          correctAnswer: "yes",
          explanation: "A complimentary induction is offered.",
        },
        {
          id: "l-q5",
          questionNumber: 5,
          type: "fill_blanks",
          prompt: "Locker deposit required: £ ________",
          options: null,
          correctAnswer: "10|10.00",
          explanation: "A refundable £10 locker deposit is mentioned.",
        },
        {
          id: "l-q6",
          questionNumber: 6,
          type: "mcq",
          prompt: "Which facility is currently closed for repairs?",
          options: ["the swimming pool", "the sauna", "the tennis courts", "the gym"],
          correctAnswer: "the sauna",
          explanation: "The sauna is temporarily unavailable.",
        },
        {
          id: "l-q7",
          questionNumber: 7,
          type: "mcq",
          prompt: "How can members book a class?",
          options: [
            "by phone only",
            "through the mobile app",
            "in person at reception",
            "by email",
          ],
          correctAnswer: "through the mobile app",
          explanation: "Class booking is done via the app.",
        },
        {
          id: "l-q8",
          questionNumber: 8,
          type: "mcq",
          prompt: "What must new members bring to their first visit?",
          options: [
            "a passport",
            "photo ID and the confirmation email",
            "cash for the full year",
            "a doctor's note",
          ],
          correctAnswer: "photo ID and the confirmation email",
          explanation: "Reception asks for photo ID plus the confirmation email.",
        },
      ],
    },
  ],
};

const CAMBRIDGE_WRITING: CambridgeTestFull = {
  id: "cam18-t1-writing",
  bookNumber: 18,
  testNumber: 1,
  title: "Writing — Practice Set 1 (original)",
  sectionType: "writing",
  passages: [
    {
      id: "cam18-t1-writing-task1",
      passageNumber: 1,
      title: "Task 1",
      textContent:
        "The chart below shows the number of visitors to three city museums between 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
      audioUrl: null,
      questions: [],
    },
    {
      id: "cam18-t1-writing-task2",
      passageNumber: 2,
      title: "Task 2",
      textContent:
        "Some people believe that online learning will soon completely replace traditional classrooms. To what extent do you agree or disagree? Give reasons for your answer and include relevant examples. Write at least 250 words.",
      audioUrl: null,
      questions: [],
    },
  ],
};

const CAMBRIDGE_SPEAKING: CambridgeTestFull = {
  id: "cam18-t1-speaking",
  bookNumber: 18,
  testNumber: 1,
  title: "Speaking — Practice Set 1 (original)",
  sectionType: "speaking",
  passages: [
    {
      id: "cam18-t1-speaking-p1",
      passageNumber: 1,
      title: "Part 1 — Interview",
      textContent:
        "Where do you live? · Do you prefer mornings or evenings? · How often do you read? · What kind of music do you enjoy?",
      audioUrl: null,
      questions: [],
    },
    {
      id: "cam18-t1-speaking-p2",
      passageNumber: 2,
      title: "Part 2 — Cue card",
      textContent:
        "Describe a book that made an impression on you. You should say: what the book was; what it was about; when you read it; and explain why it stayed with you. You have 1 minute to prepare and up to 2 minutes to speak.",
      audioUrl: null,
      questions: [],
    },
    {
      id: "cam18-t1-speaking-p3",
      passageNumber: 3,
      title: "Part 3 — Discussion",
      textContent:
        "Do you think people read less than they used to? · How might reading habits change in the future? · Should schools encourage reading for pleasure?",
      audioUrl: null,
      questions: [],
    },
  ],
};

export const CAMBRIDGE_SAMPLE: CambridgeTestFull[] = [
  CAMBRIDGE_READING,
  CAMBRIDGE_LISTENING,
  CAMBRIDGE_WRITING,
  CAMBRIDGE_SPEAKING,
];

/** Look up the sample test for a section. */
export function sampleTestForSection(section: string): CambridgeTestFull | null {
  return CAMBRIDGE_SAMPLE.find((t) => t.sectionType === section) ?? null;
}
