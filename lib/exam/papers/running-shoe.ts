/**
 * SERVER ONLY — holds answer keys.
 *
 * Original EduFlow material, written in the Academic Reading format:
 * one passage, 13 questions (7 True/False/Not Given + 6 notes completion).
 * Not reproduced from any published test book.
 */

import type { ExamSectionFull } from "../types";

const PASSAGE_TEXT = `When a group of distance runners lined up at the United States Olympic marathon trials in 2016, a few of them were wearing an unreleased prototype with a thick, slightly clumsy-looking sole. The shoe went on sale the following year as the Vaporfly 4%, and the number in its name was not decoration. It referred to the improvement its manufacturer said the shoe delivered in running economy — the quantity of oxygen an athlete burns to hold a given pace. Four per cent, in a sport where a leading marathon runner might hope to improve by a fraction of that in a year of training, was an extraordinary claim to print on a box.

Two components produced the effect. The first was the midsole, built from a light, highly resilient foam derived from a polymer family that had not previously been used for this purpose. Where the conventional midsole material of the previous three decades returned roughly sixty-five per cent of the energy an athlete put into each step, the new material returned something closer to eighty-five per cent, and it did so while weighing less. The second component sat inside that cushioning: a stiff, curved plate of carbon fibre, running almost the full length of the shoe.

Precisely how the plate works has proved harder to establish than the fact that it does. An early and intuitive explanation held that it acted as a spring, storing energy on landing and releasing it at push-off. Later work suggested something less romantic — that the plate mainly stiffens the joints of the toes, so the foot wastes less energy bending, and that it redistributes the load across the ankle and knee. A third account describes the plate and the sole together as a kind of see-saw that tips the runner forward. What researchers do broadly agree on is that neither element accounts for the result alone: the plate performs poorly without the foam around it, and the foam alone gives a smaller benefit than the pair together.

The four per cent figure itself came from a laboratory at the University of Colorado in Boulder, where runners were tested on treadmills while their oxygen consumption was recorded, allowing the researchers to calculate each athlete's running economy in one model of shoe after another. The average saving across the group was close to the advertised figure. The spread behind that average received far less attention. Some runners improved by barely two per cent; others gained more than six; a small number showed almost no measurable benefit at all. The shoe, in other words, does not do the same thing for everybody who puts it on.

At the elite level the results arrived quickly. In Vienna in October 2019, Eliud Kipchoge covered the marathon distance in under two hours. The run was never ratified as a record, because it used a rotating team of pacemakers and drinks were handed to him from a bicycle, but it was watched by an enormous audience and he ran it in a version of the shoe. Days later, Brigid Kosgei broke the women's world record in Chicago wearing the same technology. Within a season, the podium at almost every major marathon belonged to athletes in shoes of this type.

The reaction was not universally admiring. Critics argued that a gain of this size, available for the price of a shoe, amounted to technological doping, and that spectators could no longer tell how much of a performance belonged to the runner. Comparisons were drawn with competitive swimming, which had allowed full-body polyurethane suits, watched dozens of world records fall in a single season, and then banned them outright in 2010.

World Athletics, the sport's governing body, chose regulation rather than prohibition. Rules published at the start of 2020 capped the sole of a road-racing shoe at forty millimetres in thickness, permitted no more than one rigid plate within it, and required that any shoe worn in competition must have been on open sale to the public for at least four months. That last provision was aimed less at the technology than at access: it ended the practice of supplying unreleased prototypes to sponsored athletes alone.

The same principles soon reached the track, where spikes built around slimmer plates and the new foam preceded a run of fast times over distances from 1500 metres upwards. The rules that now exist set a ceiling rather than reversing anything, and every significant manufacturer sells a shoe designed to sit just beneath it. What has not been settled is the older question underneath the engineering: how much of what happens in a race should be credited to the athlete, and how much to the equipment they were given.`;

export const RUNNING_SHOE_SECTION: ExamSectionFull = {
  id: "eduflow-academic-reading-2",
  skill: "reading",
  title: "EduFlow Academic Reading — Practice Test 2",
  durationMinutes: 20,
  attribution:
    "Оригинальный материал EduFlow. Один текст, 13 вопросов — формат Passage 1 (Academic Reading).",
  passages: [
    {
      id: "rs-p1",
      number: 1,
      title: "The shoe that rewrote the record books",
      subtitle: "How carbon plates and new foams changed distance running",
      text: PASSAGE_TEXT,
      groups: [
        {
          id: "rs-g1",
          type: "true_false_not_given",
          from: 1,
          to: 7,
          instructions:
            "Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.",
          options: [
            { value: "TRUE", label: "TRUE" },
            { value: "FALSE", label: "FALSE" },
            { value: "NOT GIVEN", label: "NOT GIVEN" },
          ],
          questions: [
            {
              id: "rs-q1",
              number: 1,
              prompt:
                "The shoe was named after the size of the improvement its manufacturer claimed for it.",
              answer: "TRUE",
              explanation:
                "Paragraph 1: «the number in its name was not decoration» — it referred to the four per cent gain in running economy.",
            },
            {
              id: "rs-q2",
              number: 2,
              prompt:
                "Kipchoge's run in Vienna was accepted as an official world record.",
              answer: "FALSE",
              explanation:
                "Paragraph 5: «The run was never ratified as a record», because of the rotating pacemakers and the drinks delivery.",
            },
            {
              id: "rs-q3",
              number: 3,
              prompt:
                "The manufacturer sold more shoes than its competitors in the year the shoe was released.",
              answer: "NOT GIVEN",
              explanation:
                "The passage discusses the shoe's performance and regulation, but never compares sales between companies.",
            },
            {
              id: "rs-q4",
              number: 4,
              prompt:
                "World Athletics banned the use of carbon-fibre plates in road-racing shoes.",
              answer: "FALSE",
              explanation:
                "Paragraph 7: the rules «permitted no more than one rigid plate» — a limit, not a ban.",
            },
            {
              id: "rs-q5",
              number: 5,
              prompt:
                "Under the 2020 rules, a shoe must be available to the public before it can be worn in competition.",
              answer: "TRUE",
              explanation:
                "Paragraph 7: any competition shoe «must have been on open sale to the public for at least four months».",
            },
            {
              id: "rs-q6",
              number: 6,
              prompt:
                "Researchers have agreed on exactly how the plate produces its effect.",
              answer: "FALSE",
              explanation:
                "Paragraph 3 sets out three competing explanations; the mechanism «has proved harder to establish than the fact that it does».",
            },
            {
              id: "rs-q7",
              number: 7,
              prompt:
                "Athletes are required to tell officials which shoes they plan to race in.",
              answer: "NOT GIVEN",
              explanation:
                "The rules described concern the shoe's construction and availability, not any declaration by the athlete.",
            },
          ],
        },
        {
          id: "rs-g2",
          type: "gap_fill",
          from: 8,
          to: 13,
          instructions:
            "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
          wordLimit: 1,
          intro: "The carbon-plate running shoe",
          questions: [
            {
              id: "rs-q8",
              number: 8,
              prompt:
                "The midsole is made from a resilient ___ that returns about 85% of the energy of each step.",
              answer: "foam",
              explanation:
                "Paragraph 2 describes the midsole as «a light, highly resilient foam».",
            },
            {
              id: "rs-q9",
              number: 9,
              prompt: "Inside the sole sits a curved plate of carbon ___.",
              answer: "fibre|fiber",
              explanation:
                "Paragraph 2: «a stiff, curved plate of carbon fibre».",
            },
            {
              id: "rs-q10",
              number: 10,
              prompt:
                "Since 2020 the sole of a road-racing shoe may be no more than forty ___ thick.",
              answer: "millimetres|millimeters",
              explanation:
                "Paragraph 7: the rules «capped the sole … at forty millimetres in thickness».",
            },
            {
              id: "rs-q11",
              number: 11,
              prompt:
                "Critics claimed that the advantage amounted to technological ___.",
              answer: "doping",
              explanation:
                "Paragraph 6: critics argued the gain «amounted to technological doping».",
            },
            {
              id: "rs-q12",
              number: 12,
              prompt:
                "In the Colorado laboratory, oxygen readings were used to calculate each runner's ___.",
              answer: "economy",
              explanation:
                "Paragraph 4: the researchers calculated «each athlete's running economy».",
            },
            {
              id: "rs-q13",
              number: 13,
              prompt:
                "The same technology was later built into track ___ used by distance runners.",
              answer: "spikes",
              explanation:
                "Paragraph 8: «spikes built around slimmer plates and the new foam».",
            },
          ],
        },
      ],
    },
  ],
};
