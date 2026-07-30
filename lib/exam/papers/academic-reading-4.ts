/**
 * SERVER ONLY — holds answer keys.
 *
 * Original EduFlow material in the full Academic Reading format: three
 * passages of increasing difficulty, 40 marks, 60 minutes. Topics are chosen
 * to avoid overlap with the other bundled papers.
 * Not reproduced from any published test book.
 */

import type { ExamSectionFull } from "../types";

const PASSAGE_1_TEXT = `For most of the history of the lighthouse, the problem was never the light. It was that almost all of the light went the wrong way. A lamp burning oil at the top of a tower throws its output in every direction at once, and the great majority of it disappears uselessly into the sky, into the ground, or back into the building. Engineers of the eighteenth century did what they could with polished metal reflectors placed behind each flame, gathering a portion of the beam and pushing it out to sea, but the mirrors tarnished, they had to be cleaned constantly, and even at their best they delivered only about a fifth of what the lamp produced. Ships went on running aground.

The man who solved the problem was not a lighthouse engineer. Augustin-Jean Fresnel was a French road inspector who had spent his spare hours on the physics of light, and who had done more than anyone alive to establish that light travels as a wave. In 1822 he turned that theoretical work to a practical end. His reasoning began with an obvious objection. A glass lens large enough to gather the light of a lighthouse lamp would need to be enormously thick at its centre, which meant it would be far too heavy to mount on a tower and, worse, would swallow much of the light inside its own bulk before it ever emerged.

Fresnel's answer was to notice that the thickness was doing nothing. Only the curved surface of a lens bends light; the solid glass behind that surface merely holds the curve in place. So he cut the lens apart. He divided its face into a series of concentric rings, each one a narrow annular prism ground to the angle that its position required, and threw away the material in between. What remained was a stepped disc a few centimetres thick that behaved optically like a lens a metre deep. For the light arriving at a steep angle near the edges of the assembly, where simple refraction would not be enough to bend the beam flat, he added prisms of a different design that caught the ray, turned it by total internal reflection, and sent it out parallel with the rest.

The gain was extraordinary. Where a reflector had returned perhaps twenty per cent of the lamp, a Fresnel assembly delivered something above eighty, and the beam it produced could be seen more than thirty kilometres away in clear air. The first was installed in 1822 at Cordouan, the old tower standing in the estuary of the Gironde, and sailors reported the difference immediately.

A second advantage followed from the design. Because the light now left the tower as a tight horizontal beam rather than a general glow, the whole assembly could be rotated, sweeping the beam across the horizon and producing a flash each time it passed a given ship. The rate and grouping of those flashes could be varied from one station to the next, so that a navigator who saw a light could consult a table and learn not merely that a coast was there but which point of it he was looking at. To turn several tonnes of glass and brass smoothly enough for that, the assemblies were floated in a circular trough of mercury, on which they rode with almost no friction — an elegant solution that would eventually poison a good many keepers.

Lenses were built in a series of standard sizes, graded by order. A first-order lens stood taller than a man and was reserved for major landfall lights; the smaller sixth-order units marked harbour entrances and river mouths. The system spread quickly through France and then across the Atlantic, though not everywhere at once. Trinity House, responsible for the lights of England and Wales, remained attached to its reflectors for some years and adopted the French design only after prolonged argument, a delay that cost more than it saved.

Fresnel himself saw very little of this. He died of tuberculosis in 1827, at thirty-nine, a few years after the first installation. His lenses outlasted him by a century and a half, and then were made redundant almost overnight by satellite navigation, which told a captain his position directly and removed the need to recognise a coastline at all. Hundreds of the great assemblies were dismantled and sold. The principle, however, is now everywhere: in car headlamps, in traffic signals, in the thin plastic sheets that focus the beam of a stage light. A design created to keep ships off rocks survives in objects that have nothing to do with the sea.`;

const PASSAGE_2_TEXT = `[A] Two miles below the surface of the Antarctic plateau there is snow that fell before our species existed. It has never melted. Each year's fall settled on the one before, was buried, compressed and buried again, and the whole accumulated column now holds a continuous record of the atmosphere reaching back some eight hundred thousand years. Nobody set out to keep this archive and nothing was done to preserve it. It exists because a place was cold enough for long enough, and reading it has become one of the most productive undertakings in the earth sciences.

[B] The mechanism is simple to describe. Fresh snow is mostly air. Under the weight of later falls it compacts into a granular intermediate layer called firn, in which the spaces between grains are still connected to the surface, and then, at a depth of fifty to a hundred metres, those spaces pinch shut. From that moment each pocket is sealed. What the ice holds at depth is therefore not a chemical proxy for ancient air but genuine samples of the atmosphere itself, trapped at a known moment and undisturbed since. A researcher who crushes a piece of that ice in a vacuum can measure directly how much carbon dioxide the air contained when a mammoth was breathing it.

[C] Establishing when that moment was is the harder half of the work. Near the surface it is straightforward, because summer and winter snow differ in texture and chemistry and the annual layers can be counted like the rings of a tree. Deeper down the layers thin under pressure until a single year occupies less than a millimetre, and counting gives way to flow models that calculate how much a given depth has been squeezed. Those models need checking, and the checks come from volcanoes. A large eruption scatters a chemical signature and sometimes visible ash across the whole hemisphere within months, and where the date of an eruption is known from historical records the corresponding layer supplies a fixed point that the model must match.

[D] Temperature comes from the water itself. Water molecules built from the heavier isotope of oxygen evaporate slightly less readily and condense slightly more readily than ordinary ones, and the size of that difference depends on how cold the air was along the route from the ocean to the ice sheet. The ratio between heavy and light oxygen locked into the ice therefore works as a thermometer, calibrated against modern snowfall, recording the temperature of the day each layer landed. The same reasoning applies to deuterium, and the two measurements are used to check one another.

[E] Putting the two records side by side produced the result that changed the public argument about climate. The long core drilled at Vostok, and the still longer ones that followed, showed carbon dioxide and temperature rising and falling together through eight successive ice ages, locked in step across hundreds of thousands of years. They also established where the natural range lies. Through the whole of that period the concentration of carbon dioxide moved between roughly one hundred and eighty and three hundred parts per million, and it never once left that band. The present figure is far above the top of it, and the ice makes clear that this has no precedent in the record.

[F] A second finding was less expected and is in some ways more alarming. Cores taken from Greenland, where snowfall is heavy enough to preserve fine detail, show that the climate has not always changed gradually. Layer by layer they record episodes in which regional temperature rose by several degrees within a single decade and then held at the new level — shifts as large as those between an ice age and an interglacial, arriving within a human lifetime. Whatever caused them, the lesson drawn from them is that the system has thresholds, and that a slow push on it does not guarantee a slow response.

[G] The archive has limits that its readers are careful to state. Ice flows, and within a few hundred metres of the bedrock it folds and shears, so that the oldest layers are disturbed or missing altogether. Because bubbles close only after the firn has sealed, the air in any layer is younger than the ice around it by a margin that has to be estimated. And eight hundred thousand years, long as it sounds, stops short of the transition about a million years ago when the rhythm of the ice ages changed from forty-thousand-year cycles to hundred-thousand-year ones, for reasons still unexplained. It is to settle that question that drilling has returned to Dome C, in search of ice a million and a half years old.`;

const PASSAGE_3_TEXT = `Ask a scientist what separates a finding from an opinion and the answer will usually be peer review. The phrase carries an authority that few other procedures in public life enjoy: a paper that has passed it is treated as knowledge, a paper that has not is treated as a claim. Given how much weight the process bears, it is worth asking how well it has been shown to work, and the honest answer is that the evidence is thin and mostly unflattering.

Begin with its age, because a good deal of the deference depends on an assumption of antiquity. Peer review is often imagined as the practice that made modern science, running unbroken from the seventeenth century. It did not. Editors of the great journals selected papers largely on their own judgement well into the twentieth century, sending a manuscript out for an opinion only when they felt uncertain, and the systematic external refereeing familiar today became standard only after the Second World War. Nature, of all titles, had no formal review procedure until 1973. Much of what is now regarded as foundational work — including papers that reshaped whole disciplines — was published without any of it.

Nor does the process perform well when it is tested directly. In the standard experiment, investigators take a manuscript, insert a number of deliberate errors, and send it to reviewers to see how many are found. The results have been consistent across several decades and several fields: reviewers catch a minority of the planted mistakes, often well under half, and they miss serious ones as readily as trivial ones. A related body of work examines whether reviewers agree with each other, and finds that agreement on whether a given paper should be published is only modestly better than chance. Two competent specialists reading the same manuscript frequently reach opposite conclusions, which is difficult to reconcile with the idea that they are applying a shared standard.

The process is also poorly built for the task the public most wants it to perform, which is catching fraud. A reviewer receives a manuscript. They do not receive the laboratory notebooks, the raw measurements, the discarded runs or the analysis code, and they are not paid, resourced or expected to audit any of it. Review can establish that an argument is coherent and that the statistics reported are appropriate to the data described. It cannot establish that the data exist. Nearly every large fabrication scandal of recent decades passed review without difficulty and was exposed afterwards, usually by readers who tried to build on the work and could not.

There is a further and subtler cost. Reviewers are selected from the specialists in a field, which is to say from the people whose training and published positions the new work may be challenging. The incentive to be sceptical of a result that would overturn one's own is not corrupt; it is human, and it operates without anyone noticing. The consequence is a mild but persistent conservatism, well documented in the histories of ideas that were rejected repeatedly before being accepted, and invisible in the aggregate because a paper that is never published leaves no trace to count.

None of which makes the alternatives simple, and the last few years have demonstrated as much. Preprint servers, which post a manuscript publicly the moment its authors are ready, have transformed the speed of physics and biology and are plainly a gain. During the pandemic they were also, for the first time, read by journalists and politicians, and the results were instructive: single unreviewed studies of small size were reported as settled fact, propagated for weeks, and quietly abandoned. Whatever peer review does badly, removing the filter entirely and putting the burden of appraisal on readers who lack the training to carry it turned out to be worse.

The way out is not to abolish the process but to notice that it has been asked to do several unrelated jobs at once, and to separate them. Screening out work that is incompetent, improving work that is sound, certifying work as reliable, and allocating prestige are four distinct functions, and there is no reason a single anonymous exchange of letters before publication should perform all four. Some can be done better after publication, by open commentary attached to the paper and by the replication attempts that actually settle matters. One can be done far better before the work begins: under the registered report format, a journal reviews the question and the method, commits to publishing the outcome whatever it turns out to be, and only then does the researcher gather the data. That single change removes at a stroke the incentive to torture a result into significance, because acceptance no longer depends on what the result is.

Peer review was never a machine for producing truth, and its practitioners have rarely claimed that it was. The difficulty is that everyone outside the laboratory has been encouraged to believe otherwise, and a filter that is trusted more than it deserves is more dangerous than no filter at all.`;

export const ACADEMIC_READING_4_SECTION: ExamSectionFull = {
  id: "eduflow-academic-reading-4",
  skill: "reading",
  title: "EduFlow Academic Reading — Practice Test 4",
  durationMinutes: 60,
  attribution:
    "Оригинальный материал EduFlow. Три текста, 40 вопросов, 60 минут — полный формат Academic Reading.",
  passages: [
    // -----------------------------------------------------------------------
    // Passage 1 — Questions 1–13
    // -----------------------------------------------------------------------
    {
      id: "ar4-p1",
      number: 1,
      title: "The lens that saved ships",
      subtitle: "How a French engineer rebuilt the lighthouse",
      text: PASSAGE_1_TEXT,
      groups: [
        {
          id: "ar4-g1",
          type: "true_false_not_given",
          from: 1,
          to: 6,
          instructions:
            "Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.",
          options: [
            { value: "TRUE", label: "TRUE" },
            { value: "FALSE", label: "FALSE" },
            { value: "NOT GIVEN", label: "NOT GIVEN" },
          ],
          questions: [
            {
              id: "ar4-q1",
              number: 1,
              prompt:
                "Before Fresnel's design, most of the light produced in a lighthouse never reached the sea.",
              answer: "TRUE",
              explanation:
                "Paragraph 1: reflectors «delivered only about a fifth of what the lamp produced», the rest going «uselessly into the sky».",
            },
            {
              id: "ar4-q2",
              number: 2,
              prompt: "Fresnel worked as a lighthouse engineer before 1822.",
              answer: "FALSE",
              explanation:
                "Paragraph 2: «The man who solved the problem was not a lighthouse engineer» — he was a road inspector.",
            },
            {
              id: "ar4-q3",
              number: 3,
              prompt:
                "An ordinary lens of the size required would have absorbed much of the light inside itself.",
              answer: "TRUE",
              explanation:
                "Paragraph 2: it «would swallow much of the light inside its own bulk before it ever emerged».",
            },
            {
              id: "ar4-q4",
              number: 4,
              prompt: "Fresnel became wealthy as a result of his invention.",
              answer: "NOT GIVEN",
              explanation:
                "The passage records his early death but says nothing about money earned from the design.",
            },
            {
              id: "ar4-q5",
              number: 5,
              prompt:
                "The authority responsible for English lighthouses adopted the new lens without delay.",
              answer: "FALSE",
              explanation:
                "Paragraph 6: Trinity House «remained attached to its reflectors for some years and adopted the French design only after prolonged argument».",
            },
            {
              id: "ar4-q6",
              number: 6,
              prompt:
                "Sailors could tell one lighthouse from another by the way its light flashed.",
              answer: "TRUE",
              explanation:
                "Paragraph 5: the rate and grouping of flashes «could be varied from one station to the next», so a navigator could identify the point of coast.",
            },
          ],
        },
        {
          id: "ar4-g2",
          type: "gap_fill",
          from: 7,
          to: 10,
          instructions:
            "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
          wordLimit: 1,
          intro: "How the Fresnel lens works",
          questions: [
            {
              id: "ar4-q7",
              number: 7,
              prompt:
                "The face of the lens was divided into a series of concentric ___.",
              answer: "rings",
              explanation:
                "Paragraph 3: «He divided its face into a series of concentric rings».",
            },
            {
              id: "ar4-q8",
              number: 8,
              prompt:
                "At the edges, prisms redirect the beam by total internal ___.",
              answer: "reflection",
              explanation:
                "Paragraph 3: prisms «turned it by total internal reflection».",
            },
            {
              id: "ar4-q9",
              number: 9,
              prompt:
                "To turn smoothly, the assembly floated in a trough of ___.",
              answer: "mercury",
              explanation:
                "Paragraph 5: «the assemblies were floated in a circular trough of mercury».",
            },
            {
              id: "ar4-q10",
              number: 10,
              prompt:
                "Lenses were made in standard sizes graded by ___, from the first to the sixth.",
              answer: "order",
              explanation:
                "Paragraph 6: «built in a series of standard sizes, graded by order».",
            },
          ],
        },
        {
          id: "ar4-g3",
          type: "short_answer",
          from: 11,
          to: 13,
          instructions:
            "Answer the questions below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          wordLimit: 2,
          questions: [
            {
              id: "ar4-q11",
              number: 11,
              prompt: "At which lighthouse was the first Fresnel lens installed?",
              answer: "Cordouan",
              explanation:
                "Paragraph 4: «The first was installed in 1822 at Cordouan».",
            },
            {
              id: "ar4-q12",
              number: 12,
              prompt:
                "What equipment did the English authority continue to prefer?",
              answer: "reflectors|metal reflectors|its reflectors",
              explanation:
                "Paragraph 6: Trinity House «remained attached to its reflectors»; paragraph 1 calls them polished metal reflectors.",
            },
            {
              id: "ar4-q13",
              number: 13,
              prompt:
                "What development eventually made the great lenses unnecessary?",
              answer: "satellite navigation",
              explanation:
                "Paragraph 7: they «were made redundant almost overnight by satellite navigation».",
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Passage 2 — Questions 14–27
    // -----------------------------------------------------------------------
    {
      id: "ar4-p2",
      number: 2,
      title: "Reading the ice",
      subtitle: "What a frozen column of snow can tell us about the past",
      text: PASSAGE_2_TEXT,
      groups: [
        {
          id: "ar4-g4",
          type: "matching_headings",
          from: 14,
          to: 20,
          instructions:
            "Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below.",
          optionsTitle: "List of Headings",
          options: [
            { value: "i", label: "i. Working out the age of each layer" },
            { value: "ii", label: "ii. An archive nobody set out to keep" },
            { value: "iii", label: "iii. Evidence that change can arrive very fast" },
            { value: "iv", label: "iv. Samples of ancient air, sealed and intact" },
            { value: "v", label: "v. What is missing, and where to look for it" },
            { value: "vi", label: "vi. Using the water itself as a thermometer" },
            { value: "vii", label: "vii. The comparison that settled a public argument" },
            { value: "viii", label: "viii. The cost of drilling in a remote place" },
            { value: "ix", label: "ix. Disagreement about who owns the samples" },
            { value: "x", label: "x. How the ice sheets first formed" },
          ],
          questions: [
            {
              id: "ar4-q14",
              number: 14,
              prompt: "Paragraph A",
              answer: "ii",
              explanation:
                "A: «Nobody set out to keep this archive and nothing was done to preserve it.»",
            },
            {
              id: "ar4-q15",
              number: 15,
              prompt: "Paragraph B",
              answer: "iv",
              explanation:
                "B explains how bubbles seal, giving «genuine samples of the atmosphere itself».",
            },
            {
              id: "ar4-q16",
              number: 16,
              prompt: "Paragraph C",
              answer: "i",
              explanation:
                "C is about dating: counting annual layers, flow models, and volcanic fixed points.",
            },
            {
              id: "ar4-q17",
              number: 17,
              prompt: "Paragraph D",
              answer: "vi",
              explanation:
                "D: the oxygen isotope ratio in the ice «works as a thermometer».",
            },
            {
              id: "ar4-q18",
              number: 18,
              prompt: "Paragraph E",
              answer: "vii",
              explanation:
                "E: putting the two records together «produced the result that changed the public argument about climate».",
            },
            {
              id: "ar4-q19",
              number: 19,
              prompt: "Paragraph F",
              answer: "iii",
              explanation:
                "F records regional warming «of several degrees within a single decade».",
            },
            {
              id: "ar4-q20",
              number: 20,
              prompt: "Paragraph G",
              answer: "v",
              explanation:
                "G lists the limits — disturbed basal ice, the gas-age offset, the missing million-year record — and the return to Dome C.",
            },
          ],
        },
        {
          id: "ar4-g5",
          type: "gap_fill",
          from: 21,
          to: 24,
          instructions:
            "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
          wordLimit: 1,
          intro: "How an ice core is read",
          questions: [
            {
              id: "ar4-q21",
              number: 21,
              prompt:
                "Snow is first compressed into a granular layer known as ___ before the pores close.",
              answer: "firn",
              explanation:
                "Paragraph B: «it compacts into a granular intermediate layer called firn».",
            },
            {
              id: "ar4-q22",
              number: 22,
              prompt:
                "Each sealed bubble holds a real sample of the ancient ___.",
              answer: "atmosphere",
              explanation:
                "Paragraph B: «genuine samples of the atmosphere itself, trapped at a known moment».",
            },
            {
              id: "ar4-q23",
              number: 23,
              prompt:
                "Layers of ___ from datable eruptions give fixed points that the flow model must match.",
              answer: "ash",
              explanation:
                "Paragraph C: an eruption scatters «a chemical signature and sometimes visible ash across the whole hemisphere».",
            },
            {
              id: "ar4-q24",
              number: 24,
              prompt:
                "Besides oxygen, the amount of ___ in the ice is measured as a second temperature check.",
              answer: "deuterium",
              explanation:
                "Paragraph D: «The same reasoning applies to deuterium, and the two measurements are used to check one another.»",
            },
          ],
        },
        {
          id: "ar4-g6",
          type: "matching",
          from: 25,
          to: 27,
          instructions:
            "Look at the following statements and the list of locations below. Match each statement with the correct location, A–D.",
          optionsTitle: "List of Locations",
          options: [
            { value: "A", label: "A. Vostok" },
            { value: "B", label: "B. Greenland" },
            { value: "C", label: "C. Dome C" },
            { value: "D", label: "D. the bedrock" },
          ],
          questions: [
            {
              id: "ar4-q25",
              number: 25,
              prompt:
                "produced the long record showing carbon dioxide and temperature moving together",
              answer: "A",
              explanation:
                "Paragraph E: «The long core drilled at Vostok … showed carbon dioxide and temperature rising and falling together».",
            },
            {
              id: "ar4-q26",
              number: 26,
              prompt:
                "supplied the evidence that large temperature shifts can happen within ten years",
              answer: "B",
              explanation:
                "Paragraph F: cores from Greenland record warming «of several degrees within a single decade».",
            },
            {
              id: "ar4-q27",
              number: 27,
              prompt:
                "is where drilling is now concentrated in the search for much older ice",
              answer: "C",
              explanation:
                "Paragraph G: «drilling has returned to Dome C, in search of ice a million and a half years old».",
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Passage 3 — Questions 28–40
    // -----------------------------------------------------------------------
    {
      id: "ar4-p3",
      number: 3,
      title: "The trouble with peer review",
      subtitle: "How science decides what counts as knowledge",
      text: PASSAGE_3_TEXT,
      groups: [
        {
          id: "ar4-g7",
          type: "yes_no_not_given",
          from: 28,
          to: 33,
          instructions:
            "Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.",
          options: [
            { value: "YES", label: "YES" },
            { value: "NO", label: "NO" },
            { value: "NOT GIVEN", label: "NOT GIVEN" },
          ],
          questions: [
            {
              id: "ar4-q28",
              number: 28,
              prompt:
                "Peer review in its present form is more recent than most people assume.",
              answer: "YES",
              explanation:
                "Paragraph 2: systematic refereeing «became standard only after the Second World War», and Nature had no formal procedure until 1973.",
            },
            {
              id: "ar4-q29",
              number: 29,
              prompt:
                "Reviewers reliably find errors that have been deliberately planted in a manuscript.",
              answer: "NO",
              explanation:
                "Paragraph 3: «reviewers catch a minority of the planted mistakes, often well under half».",
            },
            {
              id: "ar4-q30",
              number: 30,
              prompt:
                "Reviewers normally examine the raw measurements behind a paper.",
              answer: "NO",
              explanation:
                "Paragraph 4: «They do not receive the laboratory notebooks, the raw measurements, the discarded runs or the analysis code».",
            },
            {
              id: "ar4-q31",
              number: 31,
              prompt: "Journals ought to pay reviewers for the work they do.",
              answer: "NOT GIVEN",
              explanation:
                "The passage notes that reviewers are not paid but offers no view on whether they should be.",
            },
            {
              id: "ar4-q32",
              number: 32,
              prompt:
                "Removing the review filter altogether has been shown to carry real costs.",
              answer: "YES",
              explanation:
                "Paragraph 6: during the pandemic, «removing the filter entirely … turned out to be worse».",
            },
            {
              id: "ar4-q33",
              number: 33,
              prompt: "The writer argues that peer review should be abandoned.",
              answer: "NO",
              explanation:
                "Paragraph 7: «The way out is not to abolish the process but to notice that it has been asked to do several unrelated jobs at once».",
            },
          ],
        },
        {
          id: "ar4-g8",
          type: "mcq_single",
          from: 34,
          to: 36,
          instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              id: "ar4-q34",
              number: 34,
              prompt:
                "Why does the writer begin by discussing the history of peer review?",
              options: [
                {
                  value: "A",
                  label:
                    "A. because much of its authority rests on an assumption that it is very old",
                },
                {
                  value: "B",
                  label: "B. because the earliest reviewers were better qualified",
                },
                {
                  value: "C",
                  label: "C. because the procedure has changed very little since 1665",
                },
                {
                  value: "D",
                  label: "D. because historians disagree about when it was invented",
                },
              ],
              answer: "A",
              explanation:
                "Paragraph 2: «a good deal of the deference depends on an assumption of antiquity».",
            },
            {
              id: "ar4-q35",
              number: 35,
              prompt:
                "According to the writer, why is peer review unable to detect fabricated data?",
              options: [
                { value: "A", label: "A. Reviewers work too quickly to notice." },
                {
                  value: "B",
                  label: "B. Reviewers see the manuscript but not the evidence behind it.",
                },
                {
                  value: "C",
                  label: "C. Editors discourage reviewers from raising suspicions.",
                },
                {
                  value: "D",
                  label: "D. Statistical methods are too complex for most reviewers.",
                },
              ],
              answer: "B",
              explanation:
                "Paragraph 4: review «can establish that an argument is coherent … It cannot establish that the data exist.»",
            },
            {
              id: "ar4-q36",
              number: 36,
              prompt: "What does the registered report format involve?",
              options: [
                {
                  value: "A",
                  label: "A. publishing the manuscript before any review takes place",
                },
                {
                  value: "B",
                  label: "B. inviting readers to comment after publication",
                },
                {
                  value: "C",
                  label:
                    "C. accepting a study on the strength of its design, before the data are collected",
                },
                {
                  value: "D",
                  label: "D. requiring every result to be replicated by another team",
                },
              ],
              answer: "C",
              explanation:
                "Paragraph 7: the journal «reviews the question and the method, commits to publishing the outcome … and only then does the researcher gather the data».",
            },
          ],
        },
        {
          id: "ar4-g9",
          type: "sentence_endings",
          from: 37,
          to: 38,
          instructions:
            "Complete each sentence with the correct ending, A–E, below.",
          optionsTitle: "Sentence Endings",
          options: [
            {
              value: "A",
              label:
                "A. because the judges are drawn from the field whose position it threatens.",
            },
            {
              value: "B",
              label:
                "B. because acceptance no longer depends on how the results turn out.",
            },
            {
              value: "C",
              label: "C. because journals publish far more papers than they once did.",
            },
            {
              value: "D",
              label: "D. because most reviewers work outside their own discipline.",
            },
            {
              value: "E",
              label: "E. because the reviewers' names are printed with the article.",
            },
          ],
          questions: [
            {
              id: "ar4-q37",
              number: 37,
              prompt: "Work that challenges an accepted idea is at a disadvantage",
              answer: "A",
              explanation:
                "Paragraph 5: reviewers are «the people whose training and published positions the new work may be challenging».",
            },
            {
              id: "ar4-q38",
              number: 38,
              prompt:
                "Registered reports remove the temptation to overstate a finding",
              answer: "B",
              explanation:
                "Paragraph 7: the change removes the incentive «because acceptance no longer depends on what the result is».",
            },
          ],
        },
        {
          id: "ar4-g10",
          type: "mcq_multi",
          from: 39,
          to: 40,
          instructions:
            "Choose TWO letters, A–E. Which TWO weaknesses of peer review does the writer say have been demonstrated by research?",
          questions: [
            {
              id: "ar4-q39",
              number: 39,
              numberTo: 40,
              prompt:
                "Which TWO weaknesses of peer review does the writer say have been demonstrated by research?",
              selectCount: 2,
              options: [
                {
                  value: "A",
                  label: "A. Reviewers overlook most errors placed in a manuscript.",
                },
                {
                  value: "B",
                  label: "B. Reviewers are usually chosen from the wrong discipline.",
                },
                {
                  value: "C",
                  label:
                    "C. Reviewers reading the same paper often reach opposite verdicts.",
                },
                {
                  value: "D",
                  label: "D. Journals reject too small a proportion of submissions.",
                },
                {
                  value: "E",
                  label: "E. Reviewers are selected automatically rather than by editors.",
                },
              ],
              answer: ["A", "C"],
              explanation:
                "Paragraph 3 reports both the planted-error experiments («reviewers catch a minority») and the agreement studies («only modestly better than chance»).",
            },
          ],
        },
      ],
    },
  ],
};
