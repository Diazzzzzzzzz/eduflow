/**
 * SERVER ONLY — this module holds answer keys.
 *
 * Never import it from a `"use client"` component. The browser receives the
 * stripped version produced by `toPublicSection` in `./service`.
 *
 * Content note: every passage and question below is original material written
 * for EduFlow, in the Academic IELTS format. It is not reproduced from any
 * published test book. Replace this module (or read from the database) when
 * licensed material becomes available — the engine does not care where an
 * `ExamSectionFull` comes from.
 */

import type { ExamSectionFull } from "./types";

// ---------------------------------------------------------------------------
// Passage 1
// ---------------------------------------------------------------------------

const PASSAGE_1_TEXT = `In 1960 the Aral Sea was the fourth-largest lake on Earth. Straddling the border between what are now Kazakhstan and Uzbekistan, it covered roughly 68,000 square kilometres and supported a fishing industry that landed more than 40,000 tonnes of fish a year. The sea had no outlet; it survived on the water delivered by two great rivers, the Amu Darya from the south and the Syr Darya from the north-east. Whatever those rivers carried, the sea kept, and for centuries the balance between river inflow and evaporation held the shoreline more or less steady.

That balance was deliberately broken. From the early 1960s, Soviet planners expanded irrigation across the desert plains of Central Asia in order to grow cotton, a crop that demands enormous quantities of water in a climate that offers very little. Canals drew off an ever-larger share of both rivers, and much of that water never reached a field at all: the largest canals were unlined, and a substantial fraction soaked away into the sand before it arrived. By the 1980s there were years in which almost no river water reached the sea.

The consequences were among the most severe environmental failures of the twentieth century. As the sea shrank it also grew saltier, because the salt that the rivers had delivered over millennia remained behind while the water evaporated. Salinity climbed from about ten grams per litre to more than one hundred in the southern basin, far beyond what the native fish could tolerate, and the fishery collapsed entirely. Ports were stranded. Aralsk, once a busy harbour town, found itself roughly a hundred kilometres from the water it had been built to serve, its rusting trawlers sitting on sand. The exposed seabed, now known as the Aralkum, became a new desert of salt and agricultural residues, and the wind lifted this material into dust storms that carried it across the surrounding farmland and settlements.

By the year 2000 the sea had broken into separate bodies of water. This fragmentation, though a symptom of disaster, created an unexpected opportunity. The northern remnant, usually called the Small Aral, was fed by the Syr Darya, and that river still reached it. The northern basin was also comparatively shallow and compact. Unlike the vast southern basin, which would have required a volume of water that simply no longer existed, the Small Aral was a problem of a size that engineering could plausibly address. If the water arriving from the Syr Darya could be prevented from draining south into the deeper basin, where it would only evaporate, the northern sea might be stabilised.

Local communities understood this before any government did. During the 1990s fishermen and villagers built an earthen barrier across the channel at Kok-Aral, largely by hand and with whatever machinery could be borrowed. The level of the Small Aral rose noticeably each time. Each time, however, the improvised dyke was overtopped and washed away, and the water it had gathered drained south again.

The permanent solution came in 2001, when the government of Kazakhstan secured financing from the World Bank for a project costing in the region of eighty-six million dollars. Its central component was a properly engineered barrier at Kok-Aral: a dam some thirteen kilometres long, built with a rock and clay core rather than bare earth, and fitted with a spillway so that surplus water could be released southwards under control instead of destroying the structure. The project also rebuilt sections of the Syr Darya channel upstream, deepening and straightening the river so that a greater volume could be delivered without flooding the villages along its banks. The dam was completed in 2005.

Engineers had estimated that the northern sea would take about a decade to reach its design level. It took roughly seven months. The surface rose from around forty metres above sea level to forty-two, the area of water expanded by nearly a fifth, and the shoreline advanced to within about twenty-five kilometres of Aralsk. Salinity fell from more than twenty grams per litre to under ten — low enough for freshwater species to survive. Stocks of carp, bream and pike-perch were reintroduced, the catch climbed from a few hundred tonnes to several thousand, and processing plants that had stood empty for two decades reopened.

The recovery has firm limits. The Kok-Aral Dam protects the north precisely because it withholds water from the south, and the large southern basin, which lies mostly in Uzbekistan and depends on the far more heavily used Amu Darya, has continued to disappear. Proposals to raise the dam and lift the northern sea by several further metres, bringing the water back to Aralsk itself, have been studied for years. They remain contested, since every additional metre held in the north is water that does not flow onward, and any decision depends on agreements about river sharing between the five states through whose territory these rivers run.`;

// ---------------------------------------------------------------------------
// Passage 2
// ---------------------------------------------------------------------------

const PASSAGE_2_TEXT = `[A] Anyone who has walked out of a city centre on a summer evening knows the sensation: the air on the edge of town is noticeably cooler than the air among the buildings. Meteorologists call this the urban heat island, and it is one of the best-documented effects that human settlements have on their local climate. A large city may sit several degrees warmer than the countryside around it, and occasionally the gap approaches ten. What surprises people who encounter the measurements for the first time is the timing. The effect is usually modest at midday, when the sun falls on city and field alike, and reaches its maximum a few hours after sunset, when the countryside has cooled rapidly and the city has not. The urban heat island is therefore less a story about how cities absorb heat than about how slowly they let it go.

[B] Part of the explanation lies in what cities are made of. Concrete, brick, stone and asphalt have a high thermal mass, meaning they store a great deal of energy for each degree of temperature they gain. Through the day these materials absorb solar radiation and warm through; through the night they release that heat slowly back into the air. Their colour matters as much as their density. Albedo — the proportion of incoming sunlight a surface reflects — is low for the dark materials that cities favour, and fresh asphalt may reflect as little as five per cent of what falls on it, converting the rest into heat. A field of pale dry grass, by contrast, returns perhaps a quarter.

[C] The shape of a city compounds the effect of its materials. A street lined with tall buildings forms what climatologists call an urban canyon, and a canyon behaves quite differently from an open surface. Sunlight entering it does not simply strike the ground and reflect back to the sky; it bounces between the facing walls, and at each reflection a further portion is absorbed. Radiation that would have escaped from flat ground is thus progressively trapped. At night the same geometry works in reverse. Surfaces shed heat by radiating it towards the cold sky, but a street at the bottom of a canyon can see only a narrow strip of sky directly overhead — a quantity measured as the sky view factor — so much of the radiation it emits is intercepted by the buildings opposite and returned. Dense arrangements of tall blocks also slow the wind, removing the ventilation that would otherwise carry warm air away.

[D] A third factor is the one that is missing rather than present. In vegetated ground, a large share of incoming solar energy does no heating at all: it is consumed in evaporating water from soil and from the leaves of plants, a combined process known as evapotranspiration. Evaporation is a powerful coolant, which is why a park can be several degrees cooler than the street beside it on the same afternoon. Cities are largely sealed. Rain that falls on a roof or a road does not linger to evaporate; it is captured by drains and removed within minutes, by design. In engineering away the puddle, the modern city also engineered away its own air conditioning, and the energy that would have gone into evaporating that water goes into heating the air instead.

[E] Cities also manufacture heat directly. Every vehicle engine, every factory, every water heater and every air-conditioning unit discharges waste heat into the surrounding air, and in dense districts this anthropogenic contribution is far from trivial. Air conditioning is the most awkward case, because it creates a feedback loop: a building is cooled by moving heat from inside to outside, so the machinery that makes one room comfortable makes the street warmer, which raises the demand for cooling in the buildings nearby. In the densest business districts of hot cities, waste heat alone can account for a measurable share of the temperature difference on a summer night.

[F] None of these mechanisms is beyond influence, and the remedies follow directly from the causes. Raising albedo is the cheapest intervention available: coating a dark roof with a reflective surface costs little and can lower the temperature of that roof dramatically on a sunny day, with the useful side effect of reducing the building's own cooling bill. Restoring evaporation is more powerful but slower and more expensive, and it means planting street trees, which shade surfaces before they ever warm and transpire steadily through the afternoon, and replacing sealed ground with permeable paving that holds rainwater long enough for it to evaporate. Cities that have pursued these measures systematically report meaningful reductions in peak street-level temperature. What no city has yet managed is to eliminate the heat island altogether, and the reason is straightforward: the buildings themselves, their mass and their geometry, are the largest single cause, and they are not going to be removed.`;

// ---------------------------------------------------------------------------
// Passage 3
// ---------------------------------------------------------------------------

const PASSAGE_3_TEXT = `Ask a student how they intend to prepare for an examination and the answer is remarkably consistent across countries and generations: they will read the material through, and then read it through again, concentrating their effort into the days immediately before the test. Ask a cognitive psychologist what that method achieves and the answer is equally consistent. It produces a strong feeling of preparedness and a poor durability of memory. The gap between those two outcomes is one of the most robust findings in the study of learning, and one of the least acted upon.

The foundations were laid in the 1880s by Hermann Ebbinghaus, who conducted his experiments on a single subject — himself. Memorising long lists of invented syllables and then testing his recall at intervals, he plotted what became known as the forgetting curve, showing how sharply retention drops in the hours after learning. Less famously, he also compared the effect of massing his repetitions together against spreading the same number of repetitions across several days. The distributed schedule won decisively. Ebbinghaus had identified what is now called the spacing effect: for an identical quantity of study, material reviewed at intervals is retained far better than material reviewed in one block.

A century of replication has confirmed this across ages, subjects and formats, and has added a second finding of similar power. Retrieving information from memory is a more effective way of consolidating it than encountering it again. Henry Roediger and his colleagues demonstrated the point in a series of studies in which students who read a passage once and were then tested on it repeatedly outperformed students who read the same passage repeatedly and were never tested, when both groups were assessed a week later. The tested group had, by any conventional measure, spent less time in contact with the material. The act of pulling a fact out of memory strengthens the path back to it in a way that reading the fact never does. This is the testing effect, and it recasts assessment as something that produces learning rather than merely measuring it.

Why, then, do students persist with rereading? The explanation offered by Robert Bjork is that they are misreading their own experience. Rereading is fluent and comfortable; the text feels familiar, and that familiarity is easily mistaken for knowledge. Bjork calls this the illusion of competence. Retrieval, by contrast, is effortful and error-prone, and the difficulty feels like failure at precisely the moment it is doing the most good. Bjork's term for such conditions — desirable difficulties — captures the paradox: methods that slow learning down and make it feel harder in the short term are frequently the ones that make it last. Learners judge a method by how it feels while they are using it, which is exactly the wrong criterion.

A related principle governs how practice should be arranged within a subject. The intuitive approach is to work through one type of problem until it is mastered before moving to the next, a pattern known as blocking. Doug Rohrer's work with mathematics students indicates that interleaving — mixing problem types so that consecutive questions require different procedures — produces markedly better performance on later tests, even though students find it more frustrating and perform worse during practice itself. Blocked practice allows a learner to apply the same procedure repeatedly without deciding which procedure is required; interleaved practice forces that decision every time, and on an examination paper the questions do not arrive sorted by method.

The practical implications for schools are less radical than they sound, since they concern the arrangement of existing study time rather than an increase in it. The first is to make low-stakes testing routine: brief, frequent, ungraded quizzes that oblige students to retrieve rather than review. The second is to revisit material deliberately after it has been taught, rather than moving forward and returning only before an examination — a modest amount of spaced review folded into later lessons outperforms a great deal of concentrated revision at the end. Both changes are cheap. Neither requires new technology.

What they do require is a tolerance for the appearance of inefficiency. A lesson containing a quiz on last month's topic looks, to an observer, like a lesson that has covered less ground. Students given interleaved problem sets will report that they are struggling and will produce more errors in class than their blocked counterparts. Teachers evaluated on the smoothness of a lesson, and students judging themselves by how confident they feel at the end of an evening, are both being measured on precisely the signals that the research identifies as misleading. That, rather than any dispute about the evidence, is why a finding first reported in the 1880s is still waiting to be widely adopted.`;

// ---------------------------------------------------------------------------
// The section
// ---------------------------------------------------------------------------

export const DEMO_READING_SECTION: ExamSectionFull = {
  id: "eduflow-academic-reading-1",
  skill: "reading",
  title: "EduFlow Academic Reading — Practice Test 1",
  durationMinutes: 60,
  attribution:
    "Оригинальный материал EduFlow. Формат Academic Reading: 3 текста, 40 вопросов, 60 минут.",
  passages: [
    {
      id: "p1",
      number: 1,
      title: "The Return of the North Aral",
      subtitle: "How one dam reversed part of an environmental catastrophe",
      text: PASSAGE_1_TEXT,
      groups: [
        {
          id: "g1",
          type: "gap_fill",
          from: 1,
          to: 6,
          instructions:
            "Complete the notes below. Choose ONE WORD ONLY OR A NUMBER from the passage for each answer.",
          wordLimit: 1,
          intro: "The decline of the Aral Sea",
          questions: [
            {
              id: "q1",
              number: 1,
              prompt:
                "From the 1960s, river water was diverted to irrigate ___, a crop needing large amounts of water.",
              answer: "cotton",
              explanation:
                "Paragraph 2: irrigation was expanded «in order to grow cotton».",
            },
            {
              id: "q2",
              number: 2,
              prompt:
                "The harbour town of ___ ended up about 100 kilometres from the water.",
              answer: "Aralsk",
              explanation:
                "Paragraph 3 names Aralsk as the stranded port town.",
            },
            {
              id: "q3",
              number: 3,
              prompt:
                "The dried seabed, known as the ___, became a source of dust storms.",
              answer: "Aralkum",
              explanation: "Paragraph 3: «now known as the Aralkum».",
            },
            {
              id: "q4",
              number: 4,
              prompt: "The dam built at Kok-Aral is ___ kilometres long.",
              answer: "13|thirteen",
              explanation:
                "Paragraph 6: «a dam some thirteen kilometres long».",
            },
            {
              id: "q5",
              number: 5,
              prompt:
                "The dam includes a ___ so that extra water can be released safely.",
              answer: "spillway",
              explanation:
                "Paragraph 6: «fitted with a spillway so that surplus water could be released».",
            },
            {
              id: "q6",
              number: 6,
              prompt:
                "After completion, the water level rose to ___ metres above sea level.",
              answer: "42|forty-two",
              explanation:
                "Paragraph 7: the surface rose «to forty-two» metres.",
            },
          ],
        },
        {
          id: "g2",
          type: "true_false_not_given",
          from: 7,
          to: 13,
          instructions:
            "Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.",
          options: [
            { value: "TRUE", label: "TRUE" },
            { value: "FALSE", label: "FALSE" },
            { value: "NOT GIVEN", label: "NOT GIVEN" },
          ],
          questions: [
            {
              id: "q7",
              number: 7,
              prompt:
                "In 1960 the Aral Sea was the largest lake in the world by area.",
              answer: "FALSE",
              explanation:
                "It was the fourth-largest, not the largest (paragraph 1).",
            },
            {
              id: "q8",
              number: 8,
              prompt:
                "Some of the water taken by the canals was lost before reaching farmland.",
              answer: "TRUE",
              explanation:
                "Paragraph 2: the canals were unlined and water «soaked away into the sand».",
            },
            {
              id: "q9",
              number: 9,
              prompt:
                "Residents built barriers across the Kok-Aral channel before the World Bank project began.",
              answer: "TRUE",
              explanation:
                "Paragraph 5 describes the earthen barrier built during the 1990s.",
            },
            {
              id: "q10",
              number: 10,
              prompt:
                "The Kok-Aral project cost more than had originally been budgeted.",
              answer: "NOT GIVEN",
              explanation:
                "A cost is given, but the passage never compares it with an earlier budget.",
            },
            {
              id: "q11",
              number: 11,
              prompt:
                "The North Aral reached its intended level sooner than engineers had expected.",
              answer: "TRUE",
              explanation:
                "Paragraph 7: a decade was estimated; it took about seven months.",
            },
            {
              id: "q12",
              number: 12,
              prompt:
                "Fish caught in the North Aral are now sold to other countries.",
              answer: "NOT GIVEN",
              explanation:
                "The catch and the reopened plants are mentioned, but not where the fish are sold.",
            },
            {
              id: "q13",
              number: 13,
              prompt:
                "The southern basin has recovered more slowly than the northern basin.",
              answer: "TRUE",
              explanation:
                "The final paragraph states the southern basin «has continued to disappear».",
            },
          ],
        },
      ],
    },
    {
      id: "p2",
      number: 2,
      title: "Why Cities Overheat",
      subtitle: "The mechanisms behind the urban heat island",
      text: PASSAGE_2_TEXT,
      groups: [
        {
          id: "g3",
          type: "matching_headings",
          from: 14,
          to: 19,
          instructions:
            "The passage has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings below.",
          optionsTitle: "List of Headings",
          options: [
            { value: "i", label: "i. A cooling process that cities have removed" },
            { value: "ii", label: "ii. Heat produced by the city itself" },
            { value: "iii", label: "iii. How the shape of streets traps warmth" },
            { value: "iv", label: "iv. Measures that bring temperatures down" },
            { value: "v", label: "v. Why the gap is widest after dark" },
            { value: "vi", label: "vi. The role of ordinary building materials" },
            { value: "vii", label: "vii. Disagreement about how the effect is measured" },
            { value: "viii", label: "viii. The economic cost of hotter summers" },
          ],
          questions: [
            {
              id: "q14",
              number: 14,
              prompt: "Paragraph A",
              answer: "v",
              explanation:
                "A introduces the effect and stresses that it peaks a few hours after sunset.",
            },
            {
              id: "q15",
              number: 15,
              prompt: "Paragraph B",
              answer: "vi",
              explanation:
                "B is about thermal mass and albedo of concrete, brick and asphalt.",
            },
            {
              id: "q16",
              number: 16,
              prompt: "Paragraph C",
              answer: "iii",
              explanation:
                "C explains urban canyons, multiple reflection and sky view factor.",
            },
            {
              id: "q17",
              number: 17,
              prompt: "Paragraph D",
              answer: "i",
              explanation:
                "D is about evapotranspiration, the cooling that sealed cities have lost.",
            },
            {
              id: "q18",
              number: 18,
              prompt: "Paragraph E",
              answer: "ii",
              explanation:
                "E covers anthropogenic waste heat from engines and air conditioning.",
            },
            {
              id: "q19",
              number: 19,
              prompt: "Paragraph F",
              answer: "iv",
              explanation: "F sets out remedies: cool roofs, trees, permeable paving.",
            },
          ],
        },
        {
          id: "g4",
          type: "labelling",
          from: 20,
          to: 23,
          instructions:
            "Label the diagram below. Choose FOUR answers from the list A–F and write the correct letter next to questions 20–23.",
          optionsTitle: "List of Labels",
          diagram: {
            id: "street-canyon",
            title: "Heat in an urban canyon",
            caption:
              "Cross-section of a street between two tall buildings, by day and after sunset.",
          },
          options: [
            { value: "A", label: "A. reduced sky view" },
            { value: "B", label: "B. multiple reflection" },
            { value: "C", label: "C. low-albedo surface" },
            { value: "D", label: "D. night-time release" },
            { value: "E", label: "E. evaporative cooling" },
            { value: "F", label: "F. waste heat from vehicles" },
          ],
          questions: [
            {
              id: "q20",
              number: 20,
              prompt: "Label 20 — the narrow strip of sky above the street",
              answer: "A",
              explanation:
                "Paragraph C: a street in a canyon «can see only a narrow strip of sky», the sky view factor.",
            },
            {
              id: "q21",
              number: 21,
              prompt: "Label 21 — sunlight bouncing between the facing walls",
              answer: "B",
              explanation:
                "Paragraph C: light «bounces between the facing walls», absorbed a little more each time.",
            },
            {
              id: "q22",
              number: 22,
              prompt: "Label 22 — the dark road surface",
              answer: "C",
              explanation:
                "Paragraph B: fresh asphalt reflects as little as five per cent — a low albedo.",
            },
            {
              id: "q23",
              number: 23,
              prompt: "Label 23 — heat leaving the walls after sunset",
              answer: "D",
              explanation:
                "Paragraph B: materials «release that heat slowly back into the air» at night.",
            },
          ],
        },
        {
          id: "g5",
          type: "mcq_single",
          from: 24,
          to: 26,
          instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              id: "q24",
              number: 24,
              prompt:
                "What point does the writer make about the timing of the urban heat island?",
              options: [
                { value: "A", label: "A. It is strongest in the middle of the day." },
                { value: "B", label: "B. It is largest some hours after sunset." },
                { value: "C", label: "C. It only appears during the summer." },
                { value: "D", label: "D. It has become harder to detect over time." },
              ],
              answer: "B",
              explanation:
                "Paragraph A: modest at midday, maximum «a few hours after sunset».",
            },
            {
              id: "q25",
              number: 25,
              prompt:
                "According to paragraph D, sealed urban surfaces raise temperatures mainly because",
              options: [
                { value: "A", label: "A. they are darker than natural ground." },
                { value: "B", label: "B. they prevent rainwater from evaporating." },
                { value: "C", label: "C. they store more heat than soil does." },
                { value: "D", label: "D. they block wind at street level." },
              ],
              answer: "B",
              explanation:
                "Rain is removed by drains within minutes, so its cooling evaporation never happens.",
            },
            {
              id: "q26",
              number: 26,
              prompt: "What does the writer conclude in paragraph F?",
              options: [
                { value: "A", label: "A. Cool roofs are too expensive for most cities." },
                { value: "B", label: "B. Street trees are less effective than expected." },
                { value: "C", label: "C. The effect cannot be removed entirely." },
                { value: "D", label: "D. Existing measures have not been tested." },
              ],
              answer: "C",
              explanation:
                "The closing lines: no city has eliminated the heat island, because the buildings themselves are the largest cause.",
            },
          ],
        },
      ],
    },
    {
      id: "p3",
      number: 3,
      title: "Learning That Lasts",
      subtitle: "Why the best study methods feel like the worst",
      text: PASSAGE_3_TEXT,
      groups: [
        {
          id: "g6",
          type: "yes_no_not_given",
          from: 27,
          to: 31,
          instructions:
            "Do the following statements agree with the claims of the writer? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.",
          options: [
            { value: "YES", label: "YES" },
            { value: "NO", label: "NO" },
            { value: "NOT GIVEN", label: "NOT GIVEN" },
          ],
          questions: [
            {
              id: "q27",
              number: 27,
              prompt:
                "Students generally choose study methods that suit them well.",
              answer: "NO",
              explanation:
                "The writer argues students judge methods by how they feel, «exactly the wrong criterion».",
            },
            {
              id: "q28",
              number: 28,
              prompt:
                "Testing should be understood as part of learning, not only as measurement.",
              answer: "YES",
              explanation:
                "Paragraph 3: the testing effect «recasts assessment as something that produces learning».",
            },
            {
              id: "q29",
              number: 29,
              prompt:
                "Ebbinghaus's methods would be considered unacceptable by researchers today.",
              answer: "NOT GIVEN",
              explanation:
                "His single-subject method is described, but never judged against modern standards.",
            },
            {
              id: "q30",
              number: 30,
              prompt:
                "Adopting these findings would require significant extra study time.",
              answer: "NO",
              explanation:
                "Paragraph 6: the changes concern «the arrangement of existing study time rather than an increase in it».",
            },
            {
              id: "q31",
              number: 31,
              prompt:
                "The slow uptake of the research is mainly caused by doubts about the evidence.",
              answer: "NO",
              explanation:
                "The final sentence says the obstacle is misleading signals, «rather than any dispute about the evidence».",
            },
          ],
        },
        {
          id: "g7",
          type: "matching",
          from: 32,
          to: 35,
          instructions:
            "Look at the following statements and the list of researchers below. Match each statement with the correct researcher, A–D. NB You may use any letter more than once.",
          optionsTitle: "List of Researchers",
          options: [
            { value: "A", label: "A. Hermann Ebbinghaus" },
            { value: "B", label: "B. Henry Roediger" },
            { value: "C", label: "C. Robert Bjork" },
            { value: "D", label: "D. Doug Rohrer" },
          ],
          questions: [
            {
              id: "q32",
              number: 32,
              prompt:
                "showed that learners can mistake familiarity with a text for knowledge of it",
              answer: "C",
              explanation: "Bjork's «illusion of competence» (paragraph 4).",
            },
            {
              id: "q33",
              number: 33,
              prompt:
                "found that students who were tested outperformed students who reread the material",
              answer: "B",
              explanation: "Roediger's studies in paragraph 3.",
            },
            {
              id: "q34",
              number: 34,
              prompt:
                "carried out experiments using himself as the only participant",
              answer: "A",
              explanation:
                "Paragraph 2: Ebbinghaus «conducted his experiments on a single subject — himself».",
            },
            {
              id: "q35",
              number: 35,
              prompt:
                "studied the effect of mixing different problem types together",
              answer: "D",
              explanation: "Rohrer's work on interleaving in mathematics (paragraph 5).",
            },
          ],
        },
        {
          id: "g8",
          type: "sentence_endings",
          from: 36,
          to: 38,
          instructions:
            "Complete each sentence with the correct ending, A–E, below.",
          optionsTitle: "Sentence Endings",
          options: [
            { value: "A", label: "A. because the questions on a real exam are not sorted by method." },
            { value: "B", label: "B. because it strengthens the route back to the information." },
            { value: "C", label: "C. because the same total amount of study is spread out over time." },
            { value: "D", label: "D. because it requires expensive new equipment." },
            { value: "E", label: "E. because teachers prefer lessons that appear to run smoothly." },
          ],
          questions: [
            {
              id: "q36",
              number: 36,
              prompt: "Spaced review produces better retention than cramming",
              answer: "C",
              explanation:
                "The spacing effect concerns «an identical quantity of study» distributed over time.",
            },
            {
              id: "q37",
              number: 37,
              prompt: "Retrieving a fact helps more than reading it again",
              answer: "B",
              explanation:
                "Paragraph 3: retrieval «strengthens the path back to it».",
            },
            {
              id: "q38",
              number: 38,
              prompt: "Interleaved practice prepares students better for examinations",
              answer: "A",
              explanation:
                "Paragraph 5: «on an examination paper the questions do not arrive sorted by method».",
            },
          ],
        },
        {
          id: "g9",
          type: "mcq_multi",
          from: 39,
          to: 40,
          instructions:
            "Choose TWO letters, A–E. Which TWO changes does the writer recommend for schools?",
          questions: [
            {
              id: "q39",
              number: 39,
              numberTo: 40,
              prompt:
                "Which TWO changes does the writer recommend for schools?",
              selectCount: 2,
              options: [
                { value: "A", label: "A. regular low-stakes quizzes that require recall" },
                { value: "B", label: "B. longer revision periods before examinations" },
                { value: "C", label: "C. planned review of topics in later lessons" },
                { value: "D", label: "D. investment in new classroom technology" },
                { value: "E", label: "E. grouping problems of the same type together" },
              ],
              answer: ["A", "C"],
              explanation:
                "Paragraph 6 names two changes: routine low-stakes testing, and deliberate spaced review folded into later lessons.",
            },
          ],
        },
      ],
    },
  ],
};

/** Every section the engine can serve. Keyed by id for lookup. */
export const EXAM_SECTIONS: Record<string, ExamSectionFull> = {
  [DEMO_READING_SECTION.id]: DEMO_READING_SECTION,
};

export function findSectionBySkill(skill: string): ExamSectionFull | null {
  return (
    Object.values(EXAM_SECTIONS).find((s) => s.skill === skill) ?? null
  );
}
