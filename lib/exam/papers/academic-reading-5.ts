/**
 * SERVER ONLY — holds answer keys.
 *
 * Original EduFlow material in the full Academic Reading format: three
 * passages of increasing difficulty, 40 marks, 60 minutes. Subject areas
 * (freight logistics, linguistics, criminal justice) are chosen so that no
 * other bundled paper covers the same ground.
 * Not reproduced from any published test book.
 */

import type { ExamSectionFull } from "../types";

const PASSAGE_1_TEXT = `For as long as ships had carried cargo, cargo had been carried loose. Sacks of coffee, barrels of oil, crates of machinery and bales of cotton were brought to the quay separately, and gangs of dock labourers moved each item aboard by hand and by winch, stacking it into the hold like a puzzle that had to be solved again on arrival. The work was skilled, dangerous and astonishingly slow. A ship of the early 1950s might spend more of its working life tied up at a wharf than at sea, and the cost of getting goods on and off it could account for a larger share of the total than the ocean voyage itself. Distance was not what made international trade expensive. The quayside was.

The man who changed this had never worked on a ship. Malcom McLean owned a road haulage business in North Carolina, and his interest in the docks was the interest of a frustrated customer: he had watched his drivers wait for a day and a half while their loads were unpacked and carried aboard piece by piece. His idea was to stop unpacking them at all. If the body of the trailer could be lifted off its wheels and set directly onto the deck, the cargo inside need not be touched between the factory and the shop.

In April 1956 a converted tanker called the Ideal-X sailed from Newark, in New Jersey, to Houston, in Texas, carrying fifty-eight of these boxes on a reinforced deck. The saving was not marginal. Loading break-bulk cargo by the old method cost something close to six dollars a ton; loading the same weight in McLean's boxes cost about sixteen cents. Almost nothing in the history of transport has produced a fall of that order in a single step.

Adoption was nonetheless slow, and the obstacles were not technical. Dock unions understood at once what mechanisation implied for a workforce of tens of thousands and fought it through a long series of disputes. Ports had no cranes capable of lifting the boxes and no yards in which to stack them. Worst of all, every operator that tried the idea built to its own dimensions, so that a box loaded in one company's ship could not be carried in another's, and a container that had to be emptied before it could be transferred defeated the entire purpose. Agreement came only in the late 1960s, when the International Organization for Standardization settled on a common family of sizes, together with the corner castings and twist locks by which every box in the world is still lifted and secured.

Standardisation turned a clever business into an infrastructure, and the war in Vietnam demonstrated what the infrastructure could do. Supplying a distant army through a handful of primitive harbours was exactly the problem the container solved, and the military became the system's largest early customer.

The consequences for the ports themselves were brutal. Handling containers requires deep water, enormous cranes and hundreds of hectares of flat land for stacking, none of which the historic docks of London or the finger piers of Manhattan could supply. Traffic moved to places that could build deep-water terminals from nothing, and the map of world shipping was redrawn within twenty years: Rotterdam, Felixstowe and Singapore rose as the old riverside docks emptied and were eventually sold for housing.

The deeper effect was on where things are made. When moving a manufactured object across an ocean costs a few cents, geography stops determining what can be produced where, and a factory may sensibly be placed eight thousand kilometres from its customers. The global supply chains of the last forty years, and the just-in-time methods that keep almost no stock in reserve, rest on the assumption that a box will arrive when it is expected. That assumption has recently looked less safe than it did. A single vessel wedged across a canal, or a run of congested berths, can now interrupt production on the other side of the planet — which is a fair measure of how completely an unglamorous steel box reorganised the world economy.`;

const PASSAGE_2_TEXT = `[A] There are somewhere near seven thousand languages spoken today, and the distribution is extraordinarily lopsided. A few dozen account for the great majority of speakers, while thousands are maintained by communities of a few hundred people or fewer. Linguists who study the rate at which these communities are shifting to larger languages arrive at similar and uncomfortable estimates: something approaching half of the current total is likely to have no remaining speakers by the end of this century. Nothing on that scale has happened to human language before, and it is happening within a period short enough to be measured against a single lifetime.

[B] It is worth being precise about what the loss consists of, because the popular image is misleading. A language does not end when its last elderly speaker dies; by then it has been over for decades. It ends at the much earlier and quieter moment when parents stop using it with their children, because from that point the number of speakers can only fall. Linguists therefore watch transmission rather than head counts, and a language spoken fluently by two thousand adults, none of whom is raising a child in it, is in a worse condition than one spoken by three hundred people of whom a quarter are under ten.

[C] The pressures that produce the switch are rarely mysterious and almost never a matter of preference. A dominant language is the language of the school, of paid employment, of the courts and of the market, and parents who withhold it from their children are withholding an economic future. Where persuasion has not been enough, states have applied force: children were punished for speaking their own language in schools across Britain, North America and Australia well into the twentieth century, and the humiliation attached to it was often carried into the next generation as a reluctance to pass it on. Shift is best understood not as a choice made by communities but as a rational response to the terms they were offered.

[D] What disappears alongside the words is harder to summarise but not vague. A language carries the accumulated classification of everything its speakers have needed to distinguish, and the categories differ from one to another in ways that cannot be recovered by translation. Communities that have lived in one place for many generations hold detailed vocabularies for local plants and their uses, for the behaviour of animals, for seasonal signs and for kinship relations that a national language collapses into a handful of terms. When such a vocabulary goes, the observations encoded in it usually go too, because they were never written anywhere else.

[E] The obvious response has been documentation, and a great deal of it has been done: grammars compiled, dictionaries assembled, thousands of hours of recordings deposited in archives. This work is valuable and it is not the same as survival. An archive is not a speaker. A recording preserves what was said on the day it was made but cannot answer a new question, cannot be argued with, cannot be used to conduct an argument about a subject that did not exist when it was recorded. A language kept only in a collection has been described rather than saved, and the distinction matters to the communities concerned far more than it does to the discipline.

[F] Reversal, however, is possible, and there are enough cases now to see what they have in common. Hebrew is the most complete example, though also the least typical: it had been in continuous liturgical and scholarly use, and its return to daily speech was carried by a state that adopted it for official business and by an immigrant population with no other shared language. Welsh recovered after decades of decline once it was given a secure place in the school system and a national broadcaster of its own, and the number of speakers recorded by the census turned upwards. Hawaiian was in the most desperate condition of the three: by the early 1980s fewer than fifty children spoke it. Its recovery began with a small network of immersion preschools in which no other language was permitted, and the first children through them are now adults raising families.

[G] The common factor in every successful case is children using the language every day for ordinary purposes, and the common requirement is institutional support that lasts longer than a political cycle: schooling, media, employment in which the language is an asset rather than a sentiment. Māori revival followed the same route through the preschools known as language nests, established at the beginning of the 1980s. What none of these cases shows is a method that can be applied from outside. Every revival that has worked was driven by the community whose language it was, and the role of the state was to remove obstacles and pay for schools rather than to supply the motive. Where that will is absent, no amount of documentation will substitute for it.`;

const PASSAGE_3_TEXT = `Rates of imprisonment differ between comparable countries by more than an order of magnitude. The United States confines well over five hundred people per hundred thousand of population; several western European states manage with fewer than eighty; Japan uses fewer still. These societies do not differ in their crime rates by anything approaching the same factor, which suggests that the size of a prison system is determined less by the amount of offending it faces than by decisions about how much punishment is appropriate. That is a political question, and it is worth separating it from the empirical ones, which are frequently confused with it.

Prison is asked to accomplish four distinct things, and they are supported by very different amounts of evidence. It should prevent offending during the sentence; it should discourage others from offending; it should return people less likely to offend than when they arrived; and it should express society's condemnation of what they did. Only the first of these is straightforward. A person in custody is not burgling houses, and for the small number of individuals who offend persistently and seriously, that fact alone can justify confinement.

The difficulty is that this benefit falls away sharply with time. Serious offending is overwhelmingly the activity of the young, and the great majority of those who commit crimes stop doing so in their late twenties and thirties without any intervention at all. A sentence that runs past that point is therefore incapacitating a person who had already ceased to be a risk, at a cost of tens of thousands a year, and each additional year purchases less safety than the one before it. The pattern is consistent enough that lengthening sentences is among the least efficient ways of buying a reduction in crime.

The deterrence argument fares worse. It is intuitively obvious that harsher penalties should discourage offending more effectively, and the research has repeatedly failed to find it. What does emerge, across jurisdictions and decades, is that the probability of being caught matters a great deal and the severity of what follows matters remarkably little. Offenders who are deterred at all are deterred by the expectation of detection, and most serious offences are committed by people who are not calculating consequences in the first place. A government that wants deterrence should be funding investigation, not lengthening tariffs — a conclusion that has been available for forty years and has had almost no effect on sentencing policy anywhere.

Rehabilitation is the claim that fails most visibly. In England and Wales, and in comparable systems, something close to half of those released are convicted of a further offence within a few years, and for those who served short sentences the proportion is higher still. This is not simply a matter of difficult people being difficult. Imprisonment removes the things that hold a life in place — a job, a tenancy, the routine contact that keeps a family together — and replaces them with a dense network of other offenders, so that a person leaves with worse prospects and better contacts than they had going in. The institution is, to a measurable degree, criminogenic.

Against this, Norway is regularly held up, with its open facilities, its emphasis on training and its reported reconviction rate of around a fifth. The comparison is instructive but has to be handled carefully. Norway imprisons a far smaller and differently composed group of people, counts reconvictions on a different basis, and operates within a welfare system that catches released prisoners in ways that others do not. Some of the gap is method and some of it is arithmetic, and treating the whole of it as evidence for a particular prison design is not honest.

Which leaves the fourth purpose, and here the argument changes character entirely. The demand that serious wrongdoing be met with something proportionate is not a claim about future crime rates, and no study can refute it. It is a moral position, widely held, and there is nothing disreputable about holding it. The trouble is that it is almost never argued for in those terms. Sentencing policy is made in a public conversation about what offenders deserve, and then defended to the electorate in the language of public safety, using deterrent claims that the evidence has not supported for decades. The two arguments are run together precisely because the honest one is harder to win applause with.

A more defensible arrangement would begin by pulling them apart. Reserve custody for the people who are genuinely dangerous and for the offences that a society judges cannot be answered any other way; use it for as short a period as those purposes require; and be candid that the remainder is punishment, chosen because it is deserved rather than because it works. That would be a smaller prison system than most countries now operate, and a more expensive one per prisoner. It would also have the advantage of describing itself accurately, which the present arrangement does not.`;

export const ACADEMIC_READING_5_SECTION: ExamSectionFull = {
  id: "eduflow-academic-reading-5",
  skill: "reading",
  title: "EduFlow Academic Reading — Practice Test 5",
  durationMinutes: 60,
  attribution:
    "Оригинальный материал EduFlow. Три текста, 40 вопросов, 60 минут — полный формат Academic Reading.",
  passages: [
    // -----------------------------------------------------------------------
    // Passage 1 — Questions 1–13
    // -----------------------------------------------------------------------
    {
      id: "ar5-p1",
      number: 1,
      title: "The box that shrank the world",
      subtitle: "How a steel container rearranged global trade",
      text: PASSAGE_1_TEXT,
      groups: [
        {
          id: "ar5-g1",
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
              id: "ar5-q1",
              number: 1,
              prompt:
                "In the early 1950s a cargo ship could spend more time in port than at sea.",
              answer: "TRUE",
              explanation:
                "Paragraph 1: such a ship «might spend more of its working life tied up at a wharf than at sea».",
            },
            {
              id: "ar5-q2",
              number: 2,
              prompt:
                "Malcom McLean had spent his career in the shipping industry before 1956.",
              answer: "FALSE",
              explanation:
                "Paragraph 2: «The man who changed this had never worked on a ship» — he owned a road haulage business.",
            },
            {
              id: "ar5-q3",
              number: 3,
              prompt:
                "The first voyage using the new system was between two ports in the United States.",
              answer: "TRUE",
              explanation:
                "Paragraph 3: the Ideal-X «sailed from Newark, in New Jersey, to Houston, in Texas».",
            },
            {
              id: "ar5-q4",
              number: 4,
              prompt:
                "Dock workers' organisations supported the introduction of containers.",
              answer: "FALSE",
              explanation:
                "Paragraph 4: the unions «fought it through a long series of disputes».",
            },
            {
              id: "ar5-q5",
              number: 5,
              prompt:
                "McLean's shipping venture earned him more than his road haulage business had.",
              answer: "NOT GIVEN",
              explanation:
                "The passage describes his reasoning and the first voyage but never compares the profits of the two businesses.",
            },
            {
              id: "ar5-q6",
              number: 6,
              prompt:
                "Standard container dimensions had been agreed before the first voyage took place.",
              answer: "FALSE",
              explanation:
                "Paragraph 4: «Agreement came only in the late 1960s», more than a decade after the 1956 sailing.",
            },
          ],
        },
        {
          id: "ar5-g2",
          type: "gap_fill",
          from: 7,
          to: 10,
          instructions:
            "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
          wordLimit: 1,
          intro: "The rise of the shipping container",
          questions: [
            {
              id: "ar5-q7",
              number: 7,
              prompt:
                "Cargo loaded loose, item by item, was known as ___ cargo.",
              answer: "break-bulk|breakbulk",
              explanation:
                "Paragraph 3: «Loading break-bulk cargo by the old method cost something close to six dollars a ton».",
            },
            {
              id: "ar5-q8",
              number: 8,
              prompt:
                "Every container in the world is still secured by corner castings and twist ___.",
              answer: "locks",
              explanation:
                "Paragraph 4: «the corner castings and twist locks by which every box in the world is still lifted and secured».",
            },
            {
              id: "ar5-q9",
              number: 9,
              prompt:
                "The military became the earliest large customer during the war in ___.",
              answer: "Vietnam",
              explanation:
                "Paragraph 5: «the war in Vietnam demonstrated what the infrastructure could do».",
            },
            {
              id: "ar5-q10",
              number: 10,
              prompt:
                "Trade moved to ports that could build deep-water ___ on open land.",
              answer: "terminals",
              explanation:
                "Paragraph 6: traffic moved to places «that could build deep-water terminals from nothing».",
            },
          ],
        },
        {
          id: "ar5-g3",
          type: "short_answer",
          from: 11,
          to: 13,
          instructions:
            "Answer the questions below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          wordLimit: 2,
          questions: [
            {
              id: "ar5-q11",
              number: 11,
              prompt:
                "What was the name of the converted tanker used for the first voyage?",
              answer: "Ideal-X",
              explanation:
                "Paragraph 3: «a converted tanker called the Ideal-X sailed from Newark».",
            },
            {
              id: "ar5-q12",
              number: 12,
              prompt:
                "What were the emptied riverside docks eventually sold for?",
              answer: "housing",
              explanation:
                "Paragraph 6: the old riverside docks «emptied and were eventually sold for housing».",
            },
            {
              id: "ar5-q13",
              number: 13,
              prompt:
                "What kind of chains does modern manufacturing depend on cheap shipping to maintain?",
              answer: "supply chains",
              explanation:
                "Final paragraph: «The global supply chains of the last forty years … rest on the assumption that a box will arrive when it is expected.»",
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Passage 2 — Questions 14–27
    // -----------------------------------------------------------------------
    {
      id: "ar5-p2",
      number: 2,
      title: "The last speakers",
      subtitle: "Why languages disappear, and what brings them back",
      text: PASSAGE_2_TEXT,
      groups: [
        {
          id: "ar5-g4",
          type: "matching_headings",
          from: 14,
          to: 20,
          instructions:
            "Reading Passage 2 has seven paragraphs, A–G. Choose the correct heading for each paragraph from the list of headings below.",
          optionsTitle: "List of Headings",
          options: [
            { value: "i", label: "i. The moment at which a language really ends" },
            { value: "ii", label: "ii. Knowledge that goes with the vocabulary" },
            { value: "iii", label: "iii. What the successful recoveries required" },
            { value: "iv", label: "iv. The scale of the losses expected" },
            { value: "v", label: "v. Why a recording is not a rescue" },
            { value: "vi", label: "vi. The pressures that make communities switch" },
            { value: "vii", label: "vii. Three languages brought back from decline" },
            { value: "viii", label: "viii. Disputes over how languages are counted" },
            { value: "ix", label: "ix. The origin of the world's language families" },
            { value: "x", label: "x. Technology that is replacing the dictionary" },
          ],
          questions: [
            {
              id: "ar5-q14",
              number: 14,
              prompt: "Paragraph A",
              answer: "iv",
              explanation:
                "A gives the estimate that «approaching half of the current total is likely to have no remaining speakers by the end of this century».",
            },
            {
              id: "ar5-q15",
              number: 15,
              prompt: "Paragraph B",
              answer: "i",
              explanation:
                "B: a language «ends at the much earlier and quieter moment when parents stop using it with their children».",
            },
            {
              id: "ar5-q16",
              number: 16,
              prompt: "Paragraph C",
              answer: "vi",
              explanation:
                "C sets out the economic pressure, the role of schooling and the punishment of children for speaking their language.",
            },
            {
              id: "ar5-q17",
              number: 17,
              prompt: "Paragraph D",
              answer: "ii",
              explanation:
                "D describes the vocabularies for plants, animals and kinship whose observations «were never written anywhere else».",
            },
            {
              id: "ar5-q18",
              number: 18,
              prompt: "Paragraph E",
              answer: "v",
              explanation:
                "E: «An archive is not a speaker» — documentation describes a language rather than saving it.",
            },
            {
              id: "ar5-q19",
              number: 19,
              prompt: "Paragraph F",
              answer: "vii",
              explanation:
                "F works through Hebrew, Welsh and Hawaiian as cases where decline was reversed.",
            },
            {
              id: "ar5-q20",
              number: 20,
              prompt: "Paragraph G",
              answer: "iii",
              explanation:
                "G names the common factor — children using it daily — and the need for lasting institutional support and community will.",
            },
          ],
        },
        {
          id: "ar5-g5",
          type: "gap_fill",
          from: 21,
          to: 24,
          instructions:
            "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
          wordLimit: 1,
          intro: "How a language is lost and recovered",
          questions: [
            {
              id: "ar5-q21",
              number: 21,
              prompt:
                "Rather than counting speakers, linguists watch the ___ of a language between generations.",
              answer: "transmission",
              explanation:
                "Paragraph B: «Linguists therefore watch transmission rather than head counts».",
            },
            {
              id: "ar5-q22",
              number: 22,
              prompt:
                "Communities settled in one place hold detailed vocabularies for local ___ and their uses.",
              answer: "plants",
              explanation:
                "Paragraph D: «detailed vocabularies for local plants and their uses».",
            },
            {
              id: "ar5-q23",
              number: 23,
              prompt:
                "Campaigners stress that an archive is not a ___, because a recording cannot answer a new question.",
              answer: "speaker",
              explanation: "Paragraph E: «An archive is not a speaker.»",
            },
            {
              id: "ar5-q24",
              number: 24,
              prompt:
                "The Māori revival worked through preschools called language ___.",
              answer: "nests",
              explanation:
                "Paragraph G: «the preschools known as language nests, established at the beginning of the 1980s».",
            },
          ],
        },
        {
          id: "ar5-g6",
          type: "matching",
          from: 25,
          to: 27,
          instructions:
            "Look at the following statements and the list of languages below. Match each statement with the correct language, A–D.",
          optionsTitle: "List of Languages",
          options: [
            { value: "A", label: "A. Hebrew" },
            { value: "B", label: "B. Welsh" },
            { value: "C", label: "C. Hawaiian" },
            { value: "D", label: "D. Māori" },
          ],
          questions: [
            {
              id: "ar5-q25",
              number: 25,
              prompt:
                "returned to daily use partly because a state adopted it for official business",
              answer: "A",
              explanation:
                "Paragraph F: its return «was carried by a state that adopted it for official business».",
            },
            {
              id: "ar5-q26",
              number: 26,
              prompt:
                "recovered once it was given a place in schools and a broadcaster of its own",
              answer: "B",
              explanation:
                "Paragraph F: Welsh recovered «once it was given a secure place in the school system and a national broadcaster of its own».",
            },
            {
              id: "ar5-q27",
              number: 27,
              prompt:
                "had fewer than fifty child speakers left when its recovery began",
              answer: "C",
              explanation:
                "Paragraph F: «by the early 1980s fewer than fifty children spoke it» — Hawaiian.",
            },
          ],
        },
      ],
    },

    // -----------------------------------------------------------------------
    // Passage 3 — Questions 28–40
    // -----------------------------------------------------------------------
    {
      id: "ar5-p3",
      number: 3,
      title: "What is prison for?",
      subtitle: "Four purposes, and the evidence for each of them",
      text: PASSAGE_3_TEXT,
      groups: [
        {
          id: "ar5-g7",
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
              id: "ar5-q28",
              number: 28,
              prompt:
                "Confinement does prevent an offender from committing crimes outside.",
              answer: "YES",
              explanation:
                "Paragraph 2: «A person in custody is not burgling houses» — the writer calls this the one straightforward purpose.",
            },
            {
              id: "ar5-q29",
              number: 29,
              prompt:
                "Each additional year of a sentence delivers as much public safety as the year before it.",
              answer: "NO",
              explanation:
                "Paragraph 3: «each additional year purchases less safety than the one before it».",
            },
            {
              id: "ar5-q30",
              number: 30,
              prompt:
                "How severe a punishment is matters more than how likely an offender is to be caught.",
              answer: "NO",
              explanation:
                "Paragraph 4: «the probability of being caught matters a great deal and the severity of what follows matters remarkably little».",
            },
            {
              id: "ar5-q31",
              number: 31,
              prompt:
                "A large proportion of released prisoners are convicted again within a few years.",
              answer: "YES",
              explanation:
                "Paragraph 5: «something close to half of those released are convicted of a further offence within a few years».",
            },
            {
              id: "ar5-q32",
              number: 32,
              prompt:
                "Norway's results could be reproduced elsewhere simply by copying its prison design.",
              answer: "NO",
              explanation:
                "Paragraph 6: «treating the whole of it as evidence for a particular prison design is not honest» — population and counting differ.",
            },
            {
              id: "ar5-q33",
              number: 33,
              prompt:
                "The public should be consulted directly before sentencing laws are changed.",
              answer: "NOT GIVEN",
              explanation:
                "The passage discusses how policy is defended to the electorate but never proposes consulting the public.",
            },
          ],
        },
        {
          id: "ar5-g8",
          type: "mcq_single",
          from: 34,
          to: 36,
          instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            {
              id: "ar5-q34",
              number: 34,
              prompt:
                "Why does the writer say that long sentences give diminishing returns?",
              options: [
                {
                  value: "A",
                  label: "A. Prisons become overcrowded and harder to manage.",
                },
                {
                  value: "B",
                  label:
                    "B. Most offenders would have stopped offending anyway as they grew older.",
                },
                {
                  value: "C",
                  label: "C. Courts impose them inconsistently between regions.",
                },
                {
                  value: "D",
                  label: "D. Longer sentences are served in more expensive institutions.",
                },
              ],
              answer: "B",
              explanation:
                "Paragraph 3: the majority «stop doing so in their late twenties and thirties without any intervention at all».",
            },
            {
              id: "ar5-q35",
              number: 35,
              prompt: "What does the writer say about the fourth purpose?",
              options: [
                {
                  value: "A",
                  label: "A. It is a moral position that research cannot settle.",
                },
                {
                  value: "B",
                  label: "B. It has been abandoned by most modern legal systems.",
                },
                {
                  value: "C",
                  label: "C. It is the purpose with the strongest empirical support.",
                },
                {
                  value: "D",
                  label: "D. It applies only to the most serious categories of crime.",
                },
              ],
              answer: "A",
              explanation:
                "Paragraph 7: it «is not a claim about future crime rates, and no study can refute it. It is a moral position».",
            },
            {
              id: "ar5-q36",
              number: 36,
              prompt:
                "What is the writer's main criticism of how sentencing policy is presented?",
              options: [
                {
                  value: "A",
                  label: "A. It is decided by officials rather than by elected politicians.",
                },
                {
                  value: "B",
                  label: "B. It changes too often for its effects to be measured.",
                },
                {
                  value: "C",
                  label:
                    "C. Punishment chosen on moral grounds is justified using safety claims the evidence does not support.",
                },
                {
                  value: "D",
                  label: "D. It relies on comparisons with countries that are too different.",
                },
              ],
              answer: "C",
              explanation:
                "Paragraph 7: policy is made in a conversation «about what offenders deserve, and then defended … in the language of public safety».",
            },
          ],
        },
        {
          id: "ar5-g9",
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
                "A. because it strips away the job, the housing and the family contact that steady a life.",
            },
            {
              value: "B",
              label:
                "B. because the people it imprisons are not comparable to those held elsewhere.",
            },
            {
              value: "C",
              label: "C. because its prisons are funded far more generously.",
            },
            {
              value: "D",
              label: "D. because sentences there are decided by panels rather than judges.",
            },
            {
              value: "E",
              label: "E. because offenders are released before completing their terms.",
            },
          ],
          questions: [
            {
              id: "ar5-q37",
              number: 37,
              prompt: "Imprisonment can leave a person more likely to reoffend",
              answer: "A",
              explanation:
                "Paragraph 5: it «removes the things that hold a life in place — a job, a tenancy, the routine contact that keeps a family together».",
            },
            {
              id: "ar5-q38",
              number: 38,
              prompt: "The Norwegian figures have to be treated with caution",
              answer: "B",
              explanation:
                "Paragraph 6: Norway «imprisons a far smaller and differently composed group of people».",
            },
          ],
        },
        {
          id: "ar5-g10",
          type: "mcq_multi",
          from: 39,
          to: 40,
          instructions:
            "Choose TWO letters, A–E. Which TWO claims about prison does the writer say the evidence fails to support?",
          questions: [
            {
              id: "ar5-q39",
              number: 39,
              numberTo: 40,
              prompt:
                "Which TWO claims about prison does the writer say the evidence fails to support?",
              selectCount: 2,
              options: [
                {
                  value: "A",
                  label: "A. that it stops offending while the sentence is being served",
                },
                {
                  value: "B",
                  label: "B. that harsher penalties discourage other people from offending",
                },
                {
                  value: "C",
                  label:
                    "C. that those released are less likely to offend than when they arrived",
                },
                {
                  value: "D",
                  label: "D. that reconviction rates are high after short sentences",
                },
                {
                  value: "E",
                  label: "E. that imprisonment is expensive to provide",
                },
              ],
              answer: ["B", "C"],
              explanation:
                "Paragraph 4: research «has repeatedly failed to find» a deterrent effect of severity. Paragraph 5: rehabilitation «is the claim that fails most visibly». A, D and E are points the writer accepts.",
            },
          ],
        },
      ],
    },
  ],
};
