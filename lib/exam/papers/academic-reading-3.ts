/**
 * SERVER ONLY — holds answer keys.
 *
 * Original EduFlow material in the Academic Reading format: three passages of
 * increasing difficulty, 40 marks, 60 minutes. Written from general public
 * knowledge; not reproduced from any published test book.
 *
 * Every gap-fill and short-answer key below appears verbatim in its own
 * passage, and every letter key refers to an option defined on its group.
 */

import type { ExamSectionFull } from "../types";

const PASSAGE_1_TEXT = `Anyone walking through the foothills of the Tien Shan in south-eastern Kazakhstan in September will find fruit underfoot. The slopes there carry a wild forest in which the dominant tree is an apple, Malus sieversii, and what it drops is not the small sour thing most people expect of a wild plant. Some of it is bitter and hard, but some is large, sweet and red, and would not look out of place in a supermarket. The largest city of the region is called Almaty, a name usually explained as "rich in apples", and for once the folk etymology points at something real. This is where the apple began.

The case was first argued seriously by the Russian botanist Nikolai Vavilov, who travelled through the region in 1929 collecting plants. Vavilov worked from a rule of thumb that has held up remarkably well: the place where a crop displays the greatest variety of forms is likely to be the place it came from, because a species accumulates differences slowly, and in one location, over a very long period. In the apple forests above Almaty he found exactly that — trees differing in the size, colour, sweetness, keeping quality and disease resistance of their fruit, all growing side by side on the same slope. He concluded that the cultivated apple of Europe had been carried out of these mountains, and he said so long before any technique existed that could test the claim.

Eight decades later the test arrived. When the apple genome was sequenced and wild populations across Eurasia were compared, Vavilov's conclusion held: the domestic apple descends principally from Malus sieversii. The picture that emerged was more tangled than he had imagined, however. On its long journey west the tree had interbred repeatedly with other wild apples it met along the way, and above all with the European crab apple, so that the fruit in the shops today is a mixture rather than a straight line of descent.

What carried it west was trade. The mountain forests sit beside the corridor of routes later known as the Silk Road, and merchants and their animals moved through them for centuries. Horses are efficient distributors of apple seed: they eat the fruit whole and deposit the seed some distance along the road, undamaged and conveniently fertilised. Bears do the same, and appear to have been shaping the fruit long before people took an interest in it. An animal that works its way along a slope choosing the largest and sweetest apples will, over enough generations, leave behind a forest of trees that bear larger and sweeter apples.

Yet the apple has a peculiarity that made deliberate cultivation awkward. Its offspring do not resemble their parents. The species is what botanists call highly heterozygous, which means that seeds taken from a single outstanding tree will produce a crop of seedlings almost all of which are worthless, differing from the parent and from one another in every respect that matters. An orchard cannot be founded on seed. The solution, worked out in antiquity and unchanged in principle ever since, is grafting: a shoot is cut from a desirable tree and joined to the rootstock of another, so that the new growth is not a descendant of the original but a physical continuation of it. Every Golden Delicious on earth is a piece of one tree found in West Virginia in the 1890s.

That dependence on copies carries a cost. A commercial orchard is a monoculture of genetically identical individuals, and whatever defeats one tree defeats all of them. The reservoir of resistance to disease lies where it has always lain, in the wild forests of Central Asia, and it is there that breeders now go looking for the traits that a century of selecting for appearance and shelf life has quietly bred out of the commercial fruit.

Those forests are shrinking. Something like eighty per cent of the wild apple woodland that stood in the region a century ago has been cleared for grazing, for timber and for the expansion of Almaty itself, and much of what survives is broken into patches too small to hold their variation for long. Seed banks and protected reserves now exist, and living collections of wild trees have been established in several countries. The argument for them is not sentimental. The orchards of the world are unusually fragile, and their insurance policy is a forest on a mountainside in Kazakhstan.`;

const PASSAGE_2_TEXT = `[A] For almost the whole of human history a clear night meant a sky full of stars, and the band of the Milky Way was as ordinary a sight as a hill on the horizon. It is no longer. Surveys of night-sky brightness suggest that around eighty per cent of the world's population now lives under skies bright enough to interfere with astronomical observation, and that roughly a third of humanity cannot see the Milky Way at all from home. What makes the loss unusual is how little resistance it met. Nobody decided to remove the stars. They went out one street lamp at a time, across three or four generations, and each individual lamp seemed far too small a thing to argue about.

[B] The brightness that hides the stars is not the light that lands on the ground but the light that misses it. A proportion of the output of every outdoor lamp travels upwards or sideways, either straight from a badly aimed fixture or after bouncing off a pavement, and once in the air it is scattered by gas molecules, dust and water droplets into a diffuse haze known as sky glow. Short wavelengths scatter far more readily than long ones — the same physics that makes the daytime sky blue — and it is here that a well-intentioned technology has caused trouble. Replacing orange sodium lamps with white light-emitting diodes cut the electricity used for street lighting sharply, but the early diodes emitted a great deal of blue light, and a blue-rich lamp produces considerably more sky glow than a sodium lamp of the same apparent brightness. Cheaper light also encouraged more of it, so that the saving per lamp was partly cancelled by an increase in the number and the power of the lamps installed.

[C] The consequences for other species begin with insects. A lamp does not merely attract them; it holds them. Moths and beetles circle a bright fixture until they are taken by a predator or simply exhaust themselves. This matters more than it sounds, because a substantial share of pollination happens after dark. Field experiments in which patches of meadow were artificially lit have recorded sharp falls in the number of nocturnal visits paid to flowers, and correspondingly poorer fruit set. The insects that fly at night have declined faster in lit landscapes than in dark ones, and lighting is now counted among the plausible contributors alongside pesticides and the loss of habitat.

[D] Birds are affected on a larger scale. Most migrating songbirds travel at night and steer partly by the stars, and a brightly lit tower or office block draws them off course, sometimes holding them circling in the beam until they drop from exhaustion or strike the glass. Collisions with buildings kill birds in enormous numbers across North America each year. The remedy has proved unusually simple. Cities including Chicago and Toronto persuaded the owners of tall buildings to switch off or shade their upper-floor lighting during the migration seasons, and the recorded death toll at the participating buildings fell by a striking margin, at no cost beyond the trouble of flicking a switch.

[E] A different mechanism operates on beaches. A sea turtle hatchling emerging from the sand at night finds the water by crawling towards the brightest part of the horizon, which for the whole evolutionary history of the animal has been the open sea reflecting the sky. Where a road or a hotel stands behind the beach, the brightest horizon is inland, and the hatchlings crawl the wrong way, to be killed by traffic, by dehydration or by gulls at dawn. Coastal authorities in Florida and elsewhere responded with ordinances requiring beachfront lighting to be shielded, lowered and shifted to long-wavelength amber during the nesting season — a wavelength the hatchlings respond to far less strongly.

[F] The evidence concerning our own species is real but harder to read. The human body runs on an internal clock that is set each day by light, and the hormone melatonin, which rises in the evening and prepares the body for sleep, is suppressed by light in the blue part of the spectrum. That much is measured and uncontested. Beyond it the ground is softer. Studies of nurses and other long-term night-shift workers have reported raised rates of certain illnesses, and some researchers connect these findings to disrupted circadian rhythm, but shift workers differ from the rest of the population in diet, income and sleep as well as in light exposure, and separating one cause from the others has proved stubbornly difficult. The mechanism is agreed on; the size of the effect on public health is not.

[G] What sets this pollutant apart is that it leaves no residue. Carbon dioxide stays in the atmosphere for centuries and a spilled chemical must be removed from the soil, but light simply stops: switch off the lamp and the darkness returns the same night, complete and unharmed. Almost everything that needs doing is cheap. Shielding a fixture so that it throws light downwards rather than sideways costs little and improves the illumination of the ground. Dimming lamps after midnight, when the streets are empty, saves money outright, and France now requires most commercial lighting to be switched off overnight. Dozens of regions have been designated dark-sky reserves, and several report that visitors will travel a long way to see a sky their grandparents took for granted.`;

const PASSAGE_3_TEXT = `No number shapes the decisions of governments as thoroughly as gross domestic product. It determines whether a country is described as booming or in crisis, whether a state qualifies for cheap credit, and, in more than one constitution, how much a government is permitted to borrow. For a statistic that occupies so much authority, it has an oddly modest origin, and its inventor warned against precisely the use to which it has been put.

The modern framework was assembled in the 1930s by the economist Simon Kuznets, who was asked by the United States Congress to produce a coherent estimate of national income in the depths of the Depression. Kuznets delivered the accounts, and delivered with them a caution: a measurement of national income, he wrote in effect, tells you very little about the welfare of the people who produced it. He spent much of his later career repeating the point. It was ignored, and the reason was practical rather than intellectual. Within a decade the industrial economies were at war, and a single aggregate figure that told a planning ministry how much a country could divert to armaments without starving its civilians was exactly the instrument the moment required. What was built for wartime planning was carried into the post-war settlement, standardised across the allied economies, and never seriously dislodged.

Its defenders make a case that deserves more respect than it usually receives from critics. GDP is narrow, they point out, and that narrowness is the source of its strength: it counts the market value of the goods and services a country produces in a period, it says nothing about whether that production was worthwhile, and it was never meant to. Because the definition is tight and agreed, the figure can be compared meaningfully between Chile and Poland, and between this year and 1975 — something no richer and more ambitious measure has yet managed. And the correlation with things people genuinely care about is not weak. As a poor country's output per head rises, life expectancy, literacy and child survival rise with it, steeply and reliably.

That correlation, however, flattens. Past a certain level of income the relationship between additional output and almost any measure of how well a population is actually living becomes faint, and it is at that point that the quirks of the accounting start to matter. Three are serious. The first is that GDP records only what passes through a market. A parent who raises a child, nurses a relative or cooks the family's meals contributes nothing to the figure; pay a stranger to do the identical work and national output rises. The second is that the accounts make no distinction between production that repairs damage and production that creates value. An oil spill is unambiguously good for GDP, because the salvage vessels, the lawyers, the clean-up crews and the replacement fuel are all paid for in the market, and the destroyed coastline was never on the books to be written off. The third is depletion. A company that sells its machinery to pay its staff is not thought to be prospering, but a country that liquidates a forest, a fishery or an aquifer records the proceeds as income and never subtracts the loss of the asset. It is entirely possible for a nation to grow richer on paper while becoming poorer in every sense that will matter to it in twenty years.

The response has been half a century of proposed replacements. The Human Development Index blends income with life expectancy and schooling. The Genuine Progress Indicator adds a value for unpaid housework and deducts the costs of crime, commuting and pollution. Bhutan has built a national index around Gross National Happiness. In 2019 New Zealand required its departments to justify spending against a set of wellbeing objectives rather than growth alone. Each of these is more honest about what it is trying to capture than GDP, and none has displaced it.

The reason is worth stating plainly, because it is usually treated as mere inertia. Any composite index must decide how much a year of schooling is worth against a year of life, and those weights are political judgements. GDP's weights are political too — market prices are not handed down by nature — but they are at least visible and externally set, whereas a wellbeing index buries the value judgements of its designers inside an arithmetic that looks objective. A number that hides its assumptions is not obviously an improvement on one that admits its narrowness.

Which suggests that the search for a single replacement has been the wrong project from the start. The fault is not really in GDP, which does a precise job on a narrow question; it is in the monopoly GDP holds over public argument, the habit of allowing one quarterly figure to stand in for the condition of a society. No physician judges a patient by temperature alone, and none proposes a composite Health Number to replace the chart. The workable reform is duller than a new index and likelier to survive contact with a treasury. Publish GDP, and publish beside it, with equal prominence and on the same day, a short and fixed set of measures — the distribution of income, the condition of the natural assets, and something serious about health. What that would end is the pretence that one number was ever enough.`;

export const ACADEMIC_READING_3_SECTION: ExamSectionFull = {
  id: "eduflow-academic-reading-3",
  skill: "reading",
  title: "EduFlow Academic Reading — Practice Test 3",
  durationMinutes: 60,
  attribution:
    "Оригинальный материал EduFlow. Три текста, 40 вопросов, 60 минут — полный формат Academic Reading.",
  passages: [
    // -----------------------------------------------------------------------
    // Passage 1 — Questions 1–13
    // -----------------------------------------------------------------------
    {
      id: "ar3-p1",
      number: 1,
      title: "The orchard in the mountains",
      subtitle: "How a wild tree from Central Asia became the world's apple",
      text: PASSAGE_1_TEXT,
      groups: [
        {
          id: "ar3-g1",
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
              id: "ar3-q1",
              number: 1,
              prompt:
                "Some of the apples growing wild in the Tien Shan are of a quality comparable to cultivated fruit.",
              answer: "TRUE",
              explanation:
                "Paragraph 1: some of the fallen fruit is «large, sweet and red, and would not look out of place in a supermarket».",
            },
            {
              id: "ar3-q2",
              number: 2,
              prompt:
                "Vavilov was able to confirm his theory about the apple's origin using genetic evidence.",
              answer: "FALSE",
              explanation:
                "Paragraph 2: he made the claim «long before any technique existed that could test the claim»; the genetic test came «eight decades later».",
            },
            {
              id: "ar3-q3",
              number: 3,
              prompt:
                "Vavilov gathered more plant specimens in Central Asia than anywhere else he travelled.",
              answer: "NOT GIVEN",
              explanation:
                "The passage says he was «collecting plants» in the region but never compares the size of his collections from different places.",
            },
            {
              id: "ar3-q4",
              number: 4,
              prompt:
                "The apple sold in shops today descends from more than one wild species.",
              answer: "TRUE",
              explanation:
                "Paragraph 3: the tree «interbred repeatedly with other wild apples», above all the European crab apple, so the fruit «is a mixture».",
            },
            {
              id: "ar3-q5",
              number: 5,
              prompt:
                "Bears prefer apples to the other foods available to them in the forest.",
              answer: "NOT GIVEN",
              explanation:
                "Paragraph 4 says bears choose the largest and sweetest apples, but never compares apples with their other food.",
            },
            {
              id: "ar3-q6",
              number: 6,
              prompt:
                "Seeds from an exceptional apple tree grow into trees bearing the same fruit.",
              answer: "FALSE",
              explanation:
                "Paragraph 5: «Its offspring do not resemble their parents» — the seedlings are «almost all worthless».",
            },
          ],
        },
        {
          id: "ar3-g2",
          type: "gap_fill",
          from: 7,
          to: 10,
          instructions:
            "Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
          wordLimit: 1,
          intro: "The origins of the cultivated apple",
          questions: [
            {
              id: "ar3-q7",
              number: 7,
              prompt:
                "Vavilov's rule was that a crop originates where it shows the greatest ___ of forms.",
              answer: "variety",
              explanation:
                "Paragraph 2: «the place where a crop displays the greatest variety of forms is likely to be the place it came from».",
            },
            {
              id: "ar3-q8",
              number: 8,
              prompt:
                "Apple seed was carried westwards along the trade routes by horses and by ___.",
              answer: "bears",
              explanation: "Paragraph 4: «Bears do the same».",
            },
            {
              id: "ar3-q9",
              number: 9,
              prompt:
                "Growers reproduce a chosen tree exactly by ___, which joins a shoot to another rootstock.",
              answer: "grafting",
              explanation:
                "Paragraph 5: «The solution … is grafting: a shoot is cut from a desirable tree and joined to the rootstock of another».",
            },
            {
              id: "ar3-q10",
              number: 10,
              prompt:
                "Because its trees are genetically identical, a commercial orchard is a ___.",
              answer: "monoculture",
              explanation:
                "Paragraph 6: «A commercial orchard is a monoculture of genetically identical individuals».",
            },
          ],
        },
        {
          id: "ar3-g3",
          type: "short_answer",
          from: 11,
          to: 13,
          instructions:
            "Answer the questions below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          wordLimit: 2,
          questions: [
            {
              id: "ar3-q11",
              number: 11,
              prompt:
                "Which wild species is the principal ancestor of the domestic apple?",
              answer: "Malus sieversii",
              explanation:
                "Paragraph 3: «the domestic apple descends principally from Malus sieversii».",
            },
            {
              id: "ar3-q12",
              number: 12,
              prompt:
                "Which European wild apple did the tree interbreed with as it spread west?",
              answer: "crab apple|crab-apple",
              explanation:
                "Paragraph 3: «above all with the European crab apple».",
            },
            {
              id: "ar3-q13",
              number: 13,
              prompt:
                "What kind of collections of wild trees have been set up in several countries?",
              answer: "living collections|living",
              explanation:
                "Final paragraph: «living collections of wild trees have been established in several countries».",
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Passage 2 — Questions 14–26
    // -----------------------------------------------------------------------
    {
      id: "ar3-p2",
      number: 2,
      title: "The disappearance of night",
      subtitle: "What artificial light is doing to the living world",
      text: PASSAGE_2_TEXT,
      groups: [
        {
          id: "ar3-g4",
          type: "matching_headings",
          from: 14,
          to: 20,
          instructions:
            "Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below.",
          optionsTitle: "List of Headings",
          options: [
            { value: "i", label: "i. Journeys that end at a lighted window" },
            {
              value: "ii",
              label: "ii. A problem that ends the moment it is addressed",
            },
            {
              value: "iii",
              label: "iii. Newly hatched animals sent in the wrong direction",
            },
            {
              value: "iv",
              label: "iv. How a more efficient technology made the glow worse",
            },
            {
              value: "v",
              label: "v. Findings about people that are still disputed",
            },
            { value: "vi", label: "vi. A loss that nobody ever voted for" },
            {
              value: "vii",
              label: "vii. The cost to the creatures that fly after dark",
            },
            {
              value: "viii",
              label: "viii. Why observatories are being moved to remote sites",
            },
            {
              value: "ix",
              label: "ix. The rising expense of lighting a modern city",
            },
            {
              value: "x",
              label: "x. Regulations that failed to change behaviour",
            },
          ],
          questions: [
            {
              id: "ar3-q14",
              number: 14,
              prompt: "Paragraph A",
              answer: "vi",
              explanation:
                "A stresses that «Nobody decided to remove the stars» — the loss met almost no resistance.",
            },
            {
              id: "ar3-q15",
              number: 15,
              prompt: "Paragraph B",
              answer: "iv",
              explanation:
                "B explains that energy-saving white LEDs are blue-rich and therefore produce more sky glow than the sodium lamps they replaced.",
            },
            {
              id: "ar3-q16",
              number: 16,
              prompt: "Paragraph C",
              answer: "vii",
              explanation:
                "C is about insects held at lamps until they are eaten or exhausted, and the resulting loss of night-time pollination.",
            },
            {
              id: "ar3-q17",
              number: 17,
              prompt: "Paragraph D",
              answer: "i",
              explanation:
                "D covers migrating birds drawn off course by lit buildings and killed in collisions with the glass.",
            },
            {
              id: "ar3-q18",
              number: 18,
              prompt: "Paragraph E",
              answer: "iii",
              explanation:
                "E describes turtle hatchlings crawling inland because the brightest horizon is no longer the sea.",
            },
            {
              id: "ar3-q19",
              number: 19,
              prompt: "Paragraph F",
              answer: "v",
              explanation:
                "F: the melatonin mechanism is «measured and uncontested», but the size of the effect on public health «is not».",
            },
            {
              id: "ar3-q20",
              number: 20,
              prompt: "Paragraph G",
              answer: "ii",
              explanation:
                "G: light «leaves no residue» — «switch off the lamp and the darkness returns the same night».",
            },
          ],
        },
        {
          id: "ar3-g5",
          type: "matching",
          from: 21,
          to: 23,
          instructions:
            "Look at the following statements and the list of groups below. Match each statement with the correct group, A–D.",
          optionsTitle: "List of Groups",
          options: [
            { value: "A", label: "A. night-flying insects" },
            { value: "B", label: "B. migrating birds" },
            { value: "C", label: "C. sea turtle hatchlings" },
            { value: "D", label: "D. human beings" },
          ],
          questions: [
            {
              id: "ar3-q21",
              number: 21,
              prompt:
                "move towards artificial light because they mistake it for a natural feature of the landscape",
              answer: "C",
              explanation:
                "Paragraph E: hatchlings head for the brightest horizon, which has always been the open sea.",
            },
            {
              id: "ar3-q22",
              number: 22,
              prompt:
                "have been helped by an arrangement with the owners of tall buildings",
              answer: "B",
              explanation:
                "Paragraph D: Chicago and Toronto persuaded building owners to switch off upper-floor lighting in the migration seasons.",
            },
            {
              id: "ar3-q23",
              number: 23,
              prompt:
                "are affected in a way whose scale researchers have not yet agreed on",
              answer: "D",
              explanation:
                "Paragraph F: «The mechanism is agreed on; the size of the effect on public health is not.»",
            },
          ],
        },
        {
          id: "ar3-g6",
          type: "gap_fill",
          from: 24,
          to: 26,
          instructions:
            "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
          wordLimit: 1,
          intro: "How light pollution works — and why it can be undone",
          questions: [
            {
              id: "ar3-q24",
              number: 24,
              prompt:
                "Light that misses the ground is scattered in the air into a haze called sky ___.",
              answer: "glow",
              explanation:
                "Paragraph B: it is scattered «into a diffuse haze known as sky glow».",
            },
            {
              id: "ar3-q25",
              number: 25,
              prompt:
                "Because short wavelengths scatter most, lamps rich in ___ light create more of this haze.",
              answer: "blue",
              explanation:
                "Paragraph B: «a blue-rich lamp produces considerably more sky glow than a sodium lamp».",
            },
            {
              id: "ar3-q26",
              number: 26,
              prompt:
                "Unlike other pollutants light leaves no residue, so darkness returns the same ___.",
              answer: "night",
              explanation:
                "Paragraph G: «switch off the lamp and the darkness returns the same night».",
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Passage 3 — Questions 27–40
    // -----------------------------------------------------------------------
    {
      id: "ar3-p3",
      number: 3,
      title: "The number that runs the world",
      subtitle: "Why the argument about how to measure a country is not over",
      text: PASSAGE_3_TEXT,
      groups: [
        {
          id: "ar3-g7",
          type: "yes_no_not_given",
          from: 27,
          to: 32,
          instructions:
            "Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.",
          options: [
            { value: "YES", label: "YES" },
            { value: "NO", label: "NO" },
            { value: "NOT GIVEN", label: "NOT GIVEN" },
          ],
          questions: [
            {
              id: "ar3-q27",
              number: 27,
              prompt:
                "Kuznets intended his accounts to be used as an indicator of national wellbeing.",
              answer: "NO",
              explanation:
                "Paragraph 2: he delivered the accounts «with a caution» that national income says little about welfare, and repeated the point for years.",
            },
            {
              id: "ar3-q28",
              number: 28,
              prompt:
                "GDP became an international standard partly because of the needs of wartime government.",
              answer: "YES",
              explanation:
                "Paragraph 2: a single aggregate was «exactly the instrument the moment required», and «what was built for wartime planning was carried into the post-war settlement».",
            },
            {
              id: "ar3-q29",
              number: 29,
              prompt: "There are questions that GDP answers accurately.",
              answer: "YES",
              explanation:
                "Final paragraph: GDP «does a precise job on a narrow question»; paragraph 3 concedes the defenders' case.",
            },
            {
              id: "ar3-q30",
              number: 30,
              prompt:
                "Composite wellbeing indices are free of the political judgements that affect GDP.",
              answer: "NO",
              explanation:
                "Paragraph 6: an index «buries the value judgements of its designers inside an arithmetic that looks objective»; its weights «are political judgements».",
            },
            {
              id: "ar3-q31",
              number: 31,
              prompt:
                "Bhutan's index has been taken up by other countries in the region.",
              answer: "NOT GIVEN",
              explanation:
                "Paragraph 5 mentions Gross National Happiness but says nothing about its adoption elsewhere.",
            },
            {
              id: "ar3-q32",
              number: 32,
              prompt:
                "No single figure can serve as a satisfactory replacement for GDP.",
              answer: "YES",
              explanation:
                "Final paragraph: «the search for a single replacement has been the wrong project from the start».",
            },
          ],
        },
        {
          id: "ar3-g8",
          type: "mcq_single",
          from: 33,
          to: 35,
          instructions:
            "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              id: "ar3-q33",
              number: 33,
              prompt: "What does the writer identify as the central problem?",
              options: [
                { value: "A", label: "A. GDP is calculated from unreliable data." },
                {
                  value: "B",
                  label: "B. GDP is allowed to dominate public argument.",
                },
                {
                  value: "C",
                  label: "C. GDP is too technical for the public to follow.",
                },
                {
                  value: "D",
                  label: "D. GDP is published too rarely to be useful.",
                },
              ],
              answer: "B",
              explanation:
                "Final paragraph: «the fault … is in the monopoly GDP holds over public argument».",
            },
            {
              id: "ar3-q34",
              number: 34,
              prompt:
                "According to the passage, why does an oil spill raise GDP?",
              options: [
                {
                  value: "A",
                  label: "A. because the damage it causes is valued by insurers",
                },
                {
                  value: "B",
                  label:
                    "B. because the work of dealing with it is paid for in the market",
                },
                {
                  value: "C",
                  label: "C. because governments borrow money to fund the response",
                },
                {
                  value: "D",
                  label: "D. because the price of fuel rises after the accident",
                },
              ],
              answer: "B",
              explanation:
                "Paragraph 4: the salvage vessels, lawyers, clean-up crews and replacement fuel «are all paid for in the market», while the coastline «was never on the books».",
            },
            {
              id: "ar3-q35",
              number: 35,
              prompt: "What reform does the writer finally recommend?",
              options: [
                {
                  value: "A",
                  label: "A. replacing GDP with a single wellbeing index",
                },
                {
                  value: "B",
                  label:
                    "B. publishing GDP together with a small fixed set of other measures",
                },
                {
                  value: "C",
                  label: "C. adjusting GDP to take account of unpaid work",
                },
                {
                  value: "D",
                  label: "D. leaving the choice of measures to each department",
                },
              ],
              answer: "B",
              explanation:
                "Final paragraph: publish GDP «and publish beside it … a short and fixed set of measures».",
            },
          ],
        },
        {
          id: "ar3-g9",
          type: "sentence_endings",
          from: 36,
          to: 38,
          instructions:
            "Complete each sentence with the correct ending, A–E, below.",
          optionsTitle: "Sentence Endings",
          options: [
            {
              value: "A",
              label:
                "A. because the figure records only what passes through a market.",
            },
            {
              value: "B",
              label: "B. once a country has passed a certain level of income.",
            },
            {
              value: "C",
              label:
                "C. because the loss of the asset is never subtracted from the proceeds.",
            },
            {
              value: "D",
              label:
                "D. because statistical agencies lack the staff to collect the data.",
            },
            {
              value: "E",
              label:
                "E. because the weights used are set by international agreement.",
            },
          ],
          questions: [
            {
              id: "ar3-q36",
              number: 36,
              prompt: "Caring for a relative adds nothing to national output",
              answer: "A",
              explanation:
                "Paragraph 4: «GDP records only what passes through a market» — pay a stranger for the same work and output rises.",
            },
            {
              id: "ar3-q37",
              number: 37,
              prompt:
                "The link between output per head and life expectancy weakens",
              answer: "B",
              explanation:
                "Paragraph 4 opens: «Past a certain level of income the relationship … becomes faint».",
            },
            {
              id: "ar3-q38",
              number: 38,
              prompt:
                "A country can appear to grow while running down its forests and fisheries",
              answer: "C",
              explanation:
                "Paragraph 4: a country that liquidates an asset «records the proceeds as income and never subtracts the loss of the asset».",
            },
          ],
        },
        {
          id: "ar3-g10",
          type: "mcq_multi",
          from: 39,
          to: 40,
          instructions:
            "Choose TWO letters, A–E. Which TWO qualities of GDP does the writer accept as genuine strengths?",
          questions: [
            {
              id: "ar3-q39",
              number: 39,
              numberTo: 40,
              prompt:
                "Which TWO qualities of GDP does the writer accept as genuine strengths?",
              selectCount: 2,
              options: [
                {
                  value: "A",
                  label: "A. its definition is narrow and clearly agreed",
                },
                { value: "B", label: "B. it captures work done without payment" },
                {
                  value: "C",
                  label:
                    "C. it can be compared between countries and across decades",
                },
                {
                  value: "D",
                  label: "D. it accounts for the damage done to natural assets",
                },
                {
                  value: "E",
                  label: "E. it is compiled by an independent commission",
                },
              ],
              answer: ["A", "C"],
              explanation:
                "Paragraph 3: narrowness «is the source of its strength», and because the definition is «tight and agreed» the figure «can be compared meaningfully between Chile and Poland, and between this year and 1975».",
            },
          ],
        },
      ],
    },
  ],
};
