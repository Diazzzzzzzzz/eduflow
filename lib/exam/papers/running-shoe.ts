/**
 * SERVER ONLY — holds answer keys.
 *
 * Original EduFlow material in the full Academic Reading format: three
 * passages of increasing difficulty, 40 marks, 60 minutes. Passage 1 is the
 * original single-passage paper this file started as, kept unchanged.
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

const PASSAGE_2_TEXT = `[A] A beaver does not merely live on a river; it decides what the river is going to be. Working at night with teeth that never stop growing, a pair of animals will fell willow and aspen along a bank, drag the wood into the current, build a dam across the channel, and go on repairing that dam for as long as they can hear water running through a gap in it. Behind the dam a pond forms. Behind the pond the ground softens into marsh, dead trees stand in the shallows, and what was a straight, fast channel becomes a slow and complicated one. Ecologists call such species ecosystem engineers — organisms whose ordinary daily behaviour rebuilds the physical habitat that everything else has to live in — and outside our own species the beaver is the most thorough engineer in the northern hemisphere.

[B] For most of the past four centuries it was also among the most hunted. Beaver fur carries a dense underlayer that felts better than any other material available to a European hatter, and a fashion for felt hats that ran from the sixteenth century to the nineteenth emptied one river system after another. The North American population, once tens of millions, had been reduced by the early twentieth century to perhaps a hundred thousand animals in scattered refuges. The Eurasian beaver came closer still: by 1900 it survived in eight small relict groups between France and Mongolia, amounting to something like a thousand individuals altogether. Both species were saved less by sentiment than by the collapse of the market that had been pursuing them.

[C] What the recovery revealed was how much the rivers had been missing. A dam raises the water table in the ground on either side of it, so that a strip of land which had been draining quickly holds its moisture into the summer. The pond itself stores water, and the chain of ponds a colony builds along a stream stores a great deal more. During heavy rain that storage matters: water arrives at the dams faster than it can leave them, so the flood peak that reaches settlements downstream is both lower and later than it would otherwise have been. In drought the same structures release their water slowly, keeping a channel alive that would have run dry, and in wildfire the wet corridor along a beaver stream has repeatedly been found unburnt in a landscape of ash.

[D] Water quality improves as well. A pond works as a settling tank: silt washed off ploughed fields drops out of the slow water instead of travelling downstream, and bacteria in the saturated sediment strip out much of the nitrate that runs off fertilised ground. The biological effect is larger still. Standing dead wood, warm shallow margins and open water within the same few hectares suit species that a straightened river cannot support at all — amphibians above all, but also dragonflies, water voles, wading birds and the bats that hunt above the pond at dusk. Whether the dams obstruct migrating fish has been argued over for decades; the weight of evidence is that most fish pass them at high flows, and that the nursery habitat behind a dam more than repays the delay.

[E] None of this impresses a farmer whose field has become a pond. The costs of the beaver's return are real and they fall unevenly: flooded pasture, waterlogged forestry, blocked culverts, undermined tracks and orchard trees felled overnight. Because a colony responds to the sound of running water, a culvert beneath a road is an almost irresistible target, and a blocked one can wash away the road above it. The landowners who carry these costs are rarely the people who enjoy the flood protection delivered thirty kilometres downstream, and a programme that ignores that asymmetry earns the opposition it gets.

[F] Most of the conflicts, though, have cheap engineering answers. A pipe laid through the dam, with its intake screened and set well upstream of the structure, drains the pond to a chosen height without the animals ever detecting the leak they would otherwise repair; the device, known as a pond leveller, costs a fraction of the annual bill for removing dams that are simply rebuilt. Culverts can be protected with cages the animals will not enter. Valued trees can be wrapped in wire mesh or painted with a gritty paint they dislike. Bavaria, which has lived alongside a large beaver population for longer than anywhere else in western Europe, maintains a network of trained volunteers who advise landowners, install the devices, and authorise removal where nothing else has worked.

[G] The argument for bringing the animal back now rests increasingly on that arithmetic. Britain licensed its first official release at Knapdale in Scotland, and later regularised a population in Devon that had appeared on a river without anyone's permission and was then studied where it stood. Where flood damage is expensive, a wetland maintained without wages, planning permission or concrete compares well with an engineered defence, and it improves the surrounding land rather than degrading it. The honest qualification is that beavers cannot be aimed. They build where it suits them and not where a catchment model would prefer, and any policy promising precise outcomes from an animal with intentions of its own is promising more than it can deliver.`;

const PASSAGE_3_TEXT = `The great museums of Europe and North America hold objects from almost every society that has ever made them, and they hold most of those objects because they were once in a position to take them. That sentence contains the whole of the argument about repatriation, and the reason the argument will not go away is that both halves of it are true.

The case for keeping such collections intact was set out formally in 2002, when a group of the largest museums declared themselves universal institutions serving not one nation but the world. Their claim was that an object seen beside its equivalents from other continents teaches something it cannot teach in the place it came from: that a visitor who walks in an afternoon from an Assyrian relief to a Benin plaque to a Greek marble acquires a sense of the human record that no national collection can supply. This is not a trivial argument and it is not made in bad faith. Comparison is how a great deal of scholarship proceeds, and the concentration of material in a handful of cities has produced real knowledge.

Its weakness is what it leaves out. The declaration treats the present distribution of the world's objects as a fact of nature to be worked with rather than an outcome to be examined — as though the reason the plaques are in London rather than in Benin City were an accident of history, and not a punitive expedition in 1897 that burned a capital and sold its royal bronzes at auction to cover the cost of the campaign. A principle that would justify keeping anything at all, however it arrived, is not a principle. It is a description of the status quo with a philosophy attached to it.

Three further defences are usually offered, and time has not been kind to any of them. The first is legal: the museums hold good title under the law. This is generally accurate and almost entirely beside the point, because the laws in question were written by the powers doing the acquiring, and a transaction conducted under military occupation does not become voluntary by being written down. The second is conservation — that the objects are safer where they are. That was always a difficult thing to say politely, and it is now simply out of date, since Nigeria, Greece, Egypt and others have built museums to a standard that makes the objection embarrassing to repeat. The third is the floodgate: return one thing, the argument runs, and the halls will stand empty. The evidence does not support it. Formal claims are few, specific and heavily documented, no government has asked for everything, and the institutions that have handed objects back have not been stripped.

The ground has shifted accordingly. A report commissioned by the French government in 2018 recommended returning objects taken by force or presumed to have been acquired under duress, and a succession of German, Dutch and British institutions have since transferred ownership of Benin material to Nigeria. What is striking about these decisions is how little the sky has fallen, and how quickly an argument that was treated as unanswerable for a century came to look like a habit.

None of which settles the harder cases, and it is here that the public debate is at its least useful. The choice is persistently framed as one between keeping everything and returning everything, when almost nobody defends either position. An object bought at a fair price from a willing seller, an object excavated under a legal partition agreement, an object given as a diplomatic gift and an object seized during the sacking of a palace are not the same kind of thing, and a rule that treats them alike will be wrong about most of them. The Benin bronzes are an unusually clear case precisely because the circumstances of their removal were documented in detail by the people who removed them; a great many objects arrived with no record at all, and for those the honest answer is that nobody now knows.

A workable standard follows from that. Where an object was removed by force or under obvious coercion, the presumption should run towards return, and the museum rather than the claimant should carry the burden of showing otherwise. Where it was acquired by negotiation, the presumption should run the other way unless new evidence reopens the question. And in the wide space between, long loans deserve far more effort than they have received, because they separate the question of custody from the question of title and allow both parties to act before the harder issue is resolved.

The objects themselves have outlived the empires that moved them and will outlive the arguments about them. What is actually being decided is narrower and more urgent than the ownership of the past. It is who is entitled to answer the question.`;

export const RUNNING_SHOE_SECTION: ExamSectionFull = {
  id: "eduflow-academic-reading-2",
  skill: "reading",
  title: "EduFlow Academic Reading — Practice Test 2",
  durationMinutes: 60,
  attribution:
    "Оригинальный материал EduFlow. Три текста, 40 вопросов, 60 минут — полный формат Academic Reading.",
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

    // -----------------------------------------------------------------------
    // Passage 2 — Questions 14–27
    // -----------------------------------------------------------------------
    {
      id: "rs-p2",
      number: 2,
      title: "The animal that builds its own wetland",
      subtitle: "Why the beaver's return divides the countryside",
      text: PASSAGE_2_TEXT,
      groups: [
        {
          id: "rs-g3",
          type: "matching_headings",
          from: 14,
          to: 20,
          instructions:
            "Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below.",
          optionsTitle: "List of Headings",
          options: [
            { value: "i", label: "i. Water held back and let go slowly" },
            { value: "ii", label: "ii. How close the species came to vanishing" },
            { value: "iii", label: "iii. Cheap fixes that allow coexistence" },
            { value: "iv", label: "iv. An engineer that remakes the landscape" },
            { value: "v", label: "v. Cleaner water and a greater variety of life" },
            { value: "vi", label: "vi. Weighing the animal against a built defence" },
            { value: "vii", label: "vii. Why the return is not welcomed by everyone" },
            { value: "viii", label: "viii. The value of the fur on the world market" },
            {
              value: "ix",
              label: "ix. Differences between the European and American animals",
            },
            { value: "x", label: "x. Attempts to breed the species in captivity" },
          ],
          questions: [
            {
              id: "rs-q14",
              number: 14,
              prompt: "Paragraph A",
              answer: "iv",
              explanation:
                "A introduces the beaver as an «ecosystem engineer» whose daily behaviour rebuilds the habitat around it.",
            },
            {
              id: "rs-q15",
              number: 15,
              prompt: "Paragraph B",
              answer: "ii",
              explanation:
                "B gives the collapse to about a hundred thousand animals in North America and roughly a thousand in Eurasia.",
            },
            {
              id: "rs-q16",
              number: 16,
              prompt: "Paragraph C",
              answer: "i",
              explanation:
                "C is about storage: a lower and later flood peak in rain, and slow release in drought.",
            },
            {
              id: "rs-q17",
              number: 17,
              prompt: "Paragraph D",
              answer: "v",
              explanation:
                "D covers silt and nitrate removal followed by the gain in species the pond supports.",
            },
            {
              id: "rs-q18",
              number: 18,
              prompt: "Paragraph E",
              answer: "vii",
              explanation:
                "E sets out the costs to landowners — flooded pasture, blocked culverts, felled trees.",
            },
            {
              id: "rs-q19",
              number: 19,
              prompt: "Paragraph F",
              answer: "iii",
              explanation:
                "F describes pond levellers, culvert cages and tree protection, and Bavaria's volunteer network.",
            },
            {
              id: "rs-q20",
              number: 20,
              prompt: "Paragraph G",
              answer: "vi",
              explanation:
                "G compares the wetland with «an engineered defence» and adds the caution that beavers «cannot be aimed».",
            },
          ],
        },
        {
          id: "rs-g4",
          type: "gap_fill",
          from: 21,
          to: 24,
          instructions:
            "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
          wordLimit: 1,
          intro: "What a beaver dam does to a river",
          questions: [
            {
              id: "rs-q21",
              number: 21,
              prompt:
                "A dam raises the water ___ in the ground on both sides of the stream.",
              answer: "table",
              explanation:
                "Paragraph C: «A dam raises the water table in the ground on either side of it».",
            },
            {
              id: "rs-q22",
              number: 22,
              prompt:
                "Because the ponds hold water back, the flood ___ downstream is lower and later.",
              answer: "peak",
              explanation:
                "Paragraph C: «the flood peak that reaches settlements downstream is both lower and later».",
            },
            {
              id: "rs-q23",
              number: 23,
              prompt:
                "Bacteria in the sediment remove much of the ___ that washes off fertilised fields.",
              answer: "nitrate",
              explanation:
                "Paragraph D: bacteria «strip out much of the nitrate that runs off fertilised ground».",
            },
            {
              id: "rs-q24",
              number: 24,
              prompt:
                "A pipe through the dam, called a pond ___, lowers the water without alerting the animals.",
              answer: "leveller|leveler",
              explanation:
                "Paragraph F: «the device, known as a pond leveller».",
            },
          ],
        },
        {
          id: "rs-g5",
          type: "matching",
          from: 25,
          to: 27,
          instructions:
            "Look at the following statements and the list of places below. Match each statement with the correct place, A–D.",
          optionsTitle: "List of Places",
          options: [
            { value: "A", label: "A. Bavaria" },
            { value: "B", label: "B. Scotland" },
            { value: "C", label: "C. Devon" },
            { value: "D", label: "D. Mongolia" },
          ],
          questions: [
            {
              id: "rs-q25",
              number: 25,
              prompt:
                "has trained volunteers who advise landowners and fit mitigation devices",
              answer: "A",
              explanation:
                "Paragraph F: Bavaria «maintains a network of trained volunteers who advise landowners, install the devices».",
            },
            {
              id: "rs-q26",
              number: 26,
              prompt: "was the site of the first officially licensed release",
              answer: "B",
              explanation:
                "Paragraph G: «Britain licensed its first official release at Knapdale in Scotland».",
            },
            {
              id: "rs-q27",
              number: 27,
              prompt:
                "held a population that had established itself before it was authorised",
              answer: "C",
              explanation:
                "Paragraph G: the Devon population «had appeared on a river without anyone's permission and was then studied where it stood».",
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Passage 3 — Questions 28–40
    // -----------------------------------------------------------------------
    {
      id: "rs-p3",
      number: 3,
      title: "Who owns the past?",
      subtitle: "The argument about museum collections has changed shape",
      text: PASSAGE_3_TEXT,
      groups: [
        {
          id: "rs-g6",
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
              id: "rs-q28",
              number: 28,
              prompt:
                "Bringing objects from many cultures together has produced genuine scholarship.",
              answer: "YES",
              explanation:
                "Paragraph 2: «Comparison is how a great deal of scholarship proceeds», and the concentration of material «has produced real knowledge».",
            },
            {
              id: "rs-q29",
              number: 29,
              prompt:
                "Holding legal title to an object settles the question of where it belongs.",
              answer: "NO",
              explanation:
                "Paragraph 4: good title is «almost entirely beside the point», since the laws were written by the powers doing the acquiring.",
            },
            {
              id: "rs-q30",
              number: 30,
              prompt:
                "Meeting the current claims would leave the major museums with little to display.",
              answer: "NO",
              explanation:
                "Paragraph 4: «The evidence does not support it» — claims are few and specific, and returning institutions «have not been stripped».",
            },
            {
              id: "rs-q31",
              number: 31,
              prompt:
                "Digital copies of objects have reduced the number of people visiting museums.",
              answer: "NOT GIVEN",
              explanation:
                "The passage never discusses digital reproduction or visitor numbers.",
            },
            {
              id: "rs-q32",
              number: 32,
              prompt:
                "Objects that arrived in different ways should be judged by different standards.",
              answer: "YES",
              explanation:
                "Paragraph 7: a purchase, a partition agreement, a gift and a seizure «are not the same kind of thing, and a rule that treats them alike will be wrong about most of them».",
            },
            {
              id: "rs-q33",
              number: 33,
              prompt:
                "Countries requesting objects are unable to look after them properly.",
              answer: "NO",
              explanation:
                "Paragraph 4: the conservation argument «is now simply out of date», since several countries have built museums to an international standard.",
            },
          ],
        },
        {
          id: "rs-g7",
          type: "mcq_single",
          from: 34,
          to: 36,
          instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              id: "rs-q34",
              number: 34,
              prompt:
                "What does the writer identify as the flaw in the 2002 declaration?",
              options: [
                {
                  value: "A",
                  label:
                    "A. It assumes the current location of objects needs no explanation.",
                },
                {
                  value: "B",
                  label: "B. It was signed by too few institutions to carry weight.",
                },
                {
                  value: "C",
                  label: "C. It overstates the educational value of comparison.",
                },
                {
                  value: "D",
                  label: "D. It ignores the cost of transporting fragile objects.",
                },
              ],
              answer: "A",
              explanation:
                "Paragraph 3: it treats the present distribution «as a fact of nature to be worked with rather than an outcome to be examined».",
            },
            {
              id: "rs-q35",
              number: 35,
              prompt:
                "Why does the writer consider the conservation argument outdated?",
              options: [
                {
                  value: "A",
                  label: "A. Modern packing methods have made transport safe.",
                },
                {
                  value: "B",
                  label:
                    "B. Requesting countries have built museums of an international standard.",
                },
                {
                  value: "C",
                  label: "C. Most disputed objects are robust enough to travel.",
                },
                {
                  value: "D",
                  label: "D. Conservation is now funded by international agreement.",
                },
              ],
              answer: "B",
              explanation:
                "Paragraph 4: «Nigeria, Greece, Egypt and others have built museums to a standard that makes the objection embarrassing to repeat».",
            },
            {
              id: "rs-q36",
              number: 36,
              prompt: "What rule does the writer finally propose?",
              options: [
                {
                  value: "A",
                  label: "A. Every disputed object should eventually be returned.",
                },
                {
                  value: "B",
                  label: "B. No object should move until its history is fully known.",
                },
                {
                  value: "C",
                  label:
                    "C. Objects taken by force should be returned unless the museum can show otherwise.",
                },
                {
                  value: "D",
                  label:
                    "D. Decisions should be taken by an international body rather than by museums.",
                },
              ],
              answer: "C",
              explanation:
                "Paragraph 8: where an object was removed by force, «the presumption should run towards return, and the museum rather than the claimant should carry the burden».",
            },
          ],
        },
        {
          id: "rs-g8",
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
                "A. because the people who removed them recorded how it was done.",
            },
            {
              value: "B",
              label:
                "B. because they separate the question of custody from the question of ownership.",
            },
            {
              value: "C",
              label: "C. because no museum has ever refused a formal request.",
            },
            {
              value: "D",
              label: "D. because they are the oldest objects in the collection.",
            },
            {
              value: "E",
              label: "E. because national law now requires them in most countries.",
            },
          ],
          questions: [
            {
              id: "rs-q37",
              number: 37,
              prompt: "The Benin bronzes are a straightforward case",
              answer: "A",
              explanation:
                "Paragraph 7: «the circumstances of their removal were documented in detail by the people who removed them».",
            },
            {
              id: "rs-q38",
              number: 38,
              prompt: "Long loans deserve more attention than they get",
              answer: "B",
              explanation:
                "Paragraph 8: they «separate the question of custody from the question of title».",
            },
          ],
        },
        {
          id: "rs-g9",
          type: "mcq_multi",
          from: 39,
          to: 40,
          instructions:
            "Choose TWO letters, A–E. Which TWO defences of the museums does the writer regard as no longer credible?",
          questions: [
            {
              id: "rs-q39",
              number: 39,
              numberTo: 40,
              prompt:
                "Which TWO defences of the museums does the writer regard as no longer credible?",
              selectCount: 2,
              options: [
                {
                  value: "A",
                  label: "A. that claimant countries cannot care for the objects",
                },
                {
                  value: "B",
                  label: "B. that comparing cultures has scholarly value",
                },
                {
                  value: "C",
                  label: "C. that returning objects would empty the galleries",
                },
                {
                  value: "D",
                  label: "D. that some objects were bought from willing sellers",
                },
                {
                  value: "E",
                  label: "E. that the provenance of many objects is unknown",
                },
              ],
              answer: ["A", "C"],
              explanation:
                "Paragraph 4 dismisses the conservation objection as «out of date» and the floodgate argument as unsupported by evidence. B, D and E are points the writer accepts.",
            },
          ],
        },
      ],
    },
  ],
};
