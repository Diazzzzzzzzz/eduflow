/**
 * Personal vocabulary: the words a student collects while reading, plus the
 * lists a teacher assigns.
 *
 * A teacher list is materialised per student rather than shared, because the
 * learning status belongs to the learner — two students working the same topic
 * are at different points in it.
 */

export type VocabSource = "student" | "teacher";
export type VocabStatus = "new" | "learning" | "mastered";

export interface VocabEntry {
  id: string;
  term: string;
  /** IPA, shown under the term and on the flashcard. */
  phonetic: string | null;
  translation: string;
  /** The sentence the word was taken from, or a model sentence. */
  example: string | null;
  /** Where the word came from: saved while reading, or assigned. */
  source: VocabSource;
  /** Teacher lists carry a topic, e.g. "Environment". */
  topic: string | null;
  status: VocabStatus;
  createdAt: string;
}

export const STATUS_LABELS: Record<VocabStatus, string> = {
  new: "Новое",
  learning: "Учу",
  mastered: "Выучено",
};

export const STATUS_ORDER: VocabStatus[] = ["new", "learning", "mastered"];

export const SOURCE_LABELS: Record<VocabSource, string> = {
  student: "Сохранено мной",
  teacher: "От преподавателя",
};

/** Next status after a flashcard answer. */
export function advanceStatus(
  current: VocabStatus,
  knew: boolean
): VocabStatus {
  if (knew) return current === "new" ? "learning" : "mastered";
  // A miss always drops back to active practice, never below it.
  return "learning";
}

/* -------------------------------------------------------------------------- */
/* Demo content                                                               */
/* -------------------------------------------------------------------------- */

type SeedWord = Omit<VocabEntry, "id" | "createdAt" | "status"> & {
  status?: VocabStatus;
};

/** Academic words that recur across IELTS Reading and Writing. */
export const DEMO_VOCABULARY: SeedWord[] = [
  {
    term: "cohesion",
    phonetic: "/kəʊˈhiːʒən/",
    translation: "связность, сцепление (текста)",
    example:
      "Examiners mark cohesion separately: ideas must connect, not just follow one another.",
    source: "teacher",
    topic: "Writing assessment",
  },
  {
    term: "ambiguity",
    phonetic: "/ˌæmbɪˈɡjuːəti/",
    translation: "двусмысленность, неоднозначность",
    example:
      "The ambiguity of the question meant two very different answers were defensible.",
    source: "teacher",
    topic: "Writing assessment",
  },
  {
    term: "plausible",
    phonetic: "/ˈplɔːzəbəl/",
    translation: "правдоподобный, убедительный",
    example:
      "The explanation is plausible, though the study stops short of proving it.",
    source: "teacher",
    topic: "Academic argument",
  },
  {
    term: "substantial",
    phonetic: "/səbˈstænʃəl/",
    translation: "значительный, существенный",
    example:
      "A substantial share of the water soaked away before it ever reached a field.",
    source: "student",
    topic: null,
  },
  {
    term: "detrimental",
    phonetic: "/ˌdetrɪˈmentəl/",
    translation: "вредный, пагубный",
    example:
      "Long commutes are detrimental to both health and family life.",
    source: "teacher",
    topic: "Environment",
  },
  {
    term: "mitigate",
    phonetic: "/ˈmɪtɪɡeɪt/",
    translation: "смягчать, уменьшать (последствия)",
    example:
      "Planting street trees mitigates the worst of the summer heat.",
    source: "teacher",
    topic: "Environment",
  },
  {
    term: "resilient",
    phonetic: "/rɪˈzɪliənt/",
    translation: "устойчивый, быстро восстанавливающийся",
    example:
      "The midsole is built from a light, highly resilient foam.",
    source: "student",
    topic: null,
  },
  {
    term: "deterioration",
    phonetic: "/dɪˌtɪəriəˈreɪʃən/",
    translation: "ухудшение, разрушение",
    example:
      "Rising salinity caused a rapid deterioration in water quality.",
    source: "teacher",
    topic: "Environment",
  },
  {
    term: "advocate",
    phonetic: "/ˈædvəkeɪt/",
    translation: "выступать за, отстаивать",
    example:
      "Some economists advocate free tuition; others argue it shifts the cost elsewhere.",
    source: "teacher",
    topic: "Academic argument",
    status: "learning",
  },
  {
    term: "inevitable",
    phonetic: "/ɪnˈevɪtəbəl/",
    translation: "неизбежный",
    example:
      "Some deterioration of the shoreline was inevitable once the rivers were diverted.",
    source: "student",
    topic: null,
    status: "mastered",
  },
];

/**
 * Offline glossary powering the quick-translate popover.
 *
 * Deliberately small and local: it keeps the feature working without shipping
 * selected text to a third-party service. `POST /api/vocabulary/translate` is
 * the single place to swap in a real provider later.
 */
export const QUICK_GLOSSARY: Record<string, { translation: string; phonetic?: string }> = {
  cohesion: { translation: "связность, сцепление", phonetic: "/kəʊˈhiːʒən/" },
  ambiguity: { translation: "двусмысленность", phonetic: "/ˌæmbɪˈɡjuːəti/" },
  plausible: { translation: "правдоподобный", phonetic: "/ˈplɔːzəbəl/" },
  substantial: { translation: "значительный", phonetic: "/səbˈstænʃəl/" },
  detrimental: { translation: "вредный, пагубный", phonetic: "/ˌdetrɪˈmentəl/" },
  mitigate: { translation: "смягчать", phonetic: "/ˈmɪtɪɡeɪt/" },
  resilient: { translation: "устойчивый", phonetic: "/rɪˈzɪliənt/" },
  deterioration: { translation: "ухудшение", phonetic: "/dɪˌtɪəriəˈreɪʃən/" },
  advocate: { translation: "выступать за, отстаивать", phonetic: "/ˈædvəkeɪt/" },
  inevitable: { translation: "неизбежный", phonetic: "/ɪnˈevɪtəbəl/" },
  salinity: { translation: "солёность", phonetic: "/səˈlɪnəti/" },
  evaporation: { translation: "испарение", phonetic: "/ɪˌvæpəˈreɪʃən/" },
  irrigation: { translation: "орошение", phonetic: "/ˌɪrɪˈɡeɪʃən/" },
  albedo: { translation: "альбедо, отражательная способность" },
  canopy: { translation: "полог, крона", phonetic: "/ˈkænəpi/" },
  retention: { translation: "удержание, сохранение", phonetic: "/rɪˈtenʃən/" },
  distributed: { translation: "распределённый", phonetic: "/dɪˈstrɪbjuːtɪd/" },
  retrieval: { translation: "извлечение (из памяти)", phonetic: "/rɪˈtriːvəl/" },
  interleaving: { translation: "чередование", phonetic: "/ˌɪntəˈliːvɪŋ/" },
  threshold: { translation: "порог", phonetic: "/ˈθreʃhəʊld/" },
  compound: { translation: "усугублять; составной", phonetic: "/kəmˈpaʊnd/" },
  ventilation: { translation: "вентиляция", phonetic: "/ˌventɪˈleɪʃən/" },
  permeable: { translation: "проницаемый", phonetic: "/ˈpɜːmiəbəl/" },
  consensus: { translation: "согласие, консенсус", phonetic: "/kənˈsensəs/" },
  ratify: { translation: "ратифицировать, утверждать", phonetic: "/ˈrætɪfaɪ/" },

  // --- academic verbs -------------------------------------------------------
  accumulate: { translation: "накапливать", phonetic: "/əˈkjuːmjəleɪt/" },
  acquire: { translation: "приобретать, овладевать", phonetic: "/əˈkwaɪə/" },
  allocate: { translation: "распределять, выделять", phonetic: "/ˈæləkeɪt/" },
  alleviate: { translation: "облегчать, смягчать", phonetic: "/əˈliːvieɪt/" },
  anticipate: { translation: "предвидеть, ожидать", phonetic: "/ænˈtɪsɪpeɪt/" },
  assert: { translation: "утверждать", phonetic: "/əˈsɜːt/" },
  attribute: { translation: "приписывать; признак", phonetic: "/əˈtrɪbjuːt/" },
  compile: { translation: "составлять, собирать", phonetic: "/kəmˈpaɪl/" },
  comprise: { translation: "включать, состоять из", phonetic: "/kəmˈpraɪz/" },
  conceive: { translation: "задумать, представить", phonetic: "/kənˈsiːv/" },
  constitute: { translation: "составлять, образовывать", phonetic: "/ˈkɒnstɪtjuːt/" },
  correlate: { translation: "соотноситься, коррелировать", phonetic: "/ˈkɒrəleɪt/" },
  cultivate: { translation: "выращивать, развивать", phonetic: "/ˈkʌltɪveɪt/" },
  deduce: { translation: "выводить, заключать", phonetic: "/dɪˈdjuːs/" },
  depict: { translation: "изображать, описывать", phonetic: "/dɪˈpɪkt/" },
  derive: { translation: "получать, происходить от", phonetic: "/dɪˈraɪv/" },
  diminish: { translation: "уменьшать(ся)", phonetic: "/dɪˈmɪnɪʃ/" },
  discern: { translation: "различать, распознавать", phonetic: "/dɪˈsɜːn/" },
  displace: { translation: "вытеснять, перемещать", phonetic: "/dɪsˈpleɪs/" },
  emerge: { translation: "появляться, возникать", phonetic: "/ɪˈmɜːdʒ/" },
  encompass: { translation: "охватывать", phonetic: "/ɪnˈkʌmpəs/" },
  enhance: { translation: "усиливать, улучшать", phonetic: "/ɪnˈhɑːns/" },
  exacerbate: { translation: "обострять, усугублять", phonetic: "/ɪɡˈzæsəbeɪt/" },
  exceed: { translation: "превышать", phonetic: "/ɪkˈsiːd/" },
  facilitate: { translation: "облегчать, способствовать", phonetic: "/fəˈsɪlɪteɪt/" },
  fluctuate: { translation: "колебаться", phonetic: "/ˈflʌktʃueɪt/" },
  hinder: { translation: "препятствовать, мешать", phonetic: "/ˈhɪndə/" },
  impose: { translation: "навязывать, вводить", phonetic: "/ɪmˈpəʊz/" },
  induce: { translation: "вызывать, побуждать", phonetic: "/ɪnˈdjuːs/" },
  infer: { translation: "делать вывод", phonetic: "/ɪnˈfɜː/" },
  inhibit: { translation: "сдерживать, подавлять", phonetic: "/ɪnˈhɪbɪt/" },
  integrate: { translation: "объединять, интегрировать", phonetic: "/ˈɪntɪɡreɪt/" },
  outweigh: { translation: "перевешивать", phonetic: "/ˌaʊtˈweɪ/" },
  perceive: { translation: "воспринимать", phonetic: "/pəˈsiːv/" },
  postulate: { translation: "постулировать, предполагать", phonetic: "/ˈpɒstjʊleɪt/" },
  precede: { translation: "предшествовать", phonetic: "/prɪˈsiːd/" },
  presume: { translation: "предполагать", phonetic: "/prɪˈzjuːm/" },
  prohibit: { translation: "запрещать", phonetic: "/prəˈhɪbɪt/" },
  refute: { translation: "опровергать", phonetic: "/rɪˈfjuːt/" },
  reinforce: { translation: "укреплять, подкреплять", phonetic: "/ˌriːɪnˈfɔːs/" },
  replicate: { translation: "воспроизводить, повторять", phonetic: "/ˈreplɪkeɪt/" },
  reveal: { translation: "выявлять, раскрывать", phonetic: "/rɪˈviːl/" },
  speculate: { translation: "предполагать, рассуждать", phonetic: "/ˈspekjəleɪt/" },
  sustain: { translation: "поддерживать, выдерживать", phonetic: "/səˈsteɪn/" },
  undermine: { translation: "подрывать", phonetic: "/ˌʌndəˈmaɪn/" },
  undertake: { translation: "предпринимать", phonetic: "/ˌʌndəˈteɪk/" },
  utilise: { translation: "использовать", phonetic: "/ˈjuːtɪlaɪz/" },
  utilize: { translation: "использовать", phonetic: "/ˈjuːtɪlaɪz/" },

  // --- academic nouns -------------------------------------------------------
  adversity: { translation: "трудности, невзгоды", phonetic: "/ədˈvɜːsəti/" },
  aftermath: { translation: "последствия", phonetic: "/ˈɑːftəmæθ/" },
  aptitude: { translation: "способность, склонность", phonetic: "/ˈæptɪtjuːd/" },
  bias: { translation: "предвзятость, смещение", phonetic: "/ˈbaɪəs/" },
  breakthrough: { translation: "прорыв", phonetic: "/ˈbreɪkθruː/" },
  catalyst: { translation: "катализатор", phonetic: "/ˈkætəlɪst/" },
  constraint: { translation: "ограничение", phonetic: "/kənˈstreɪnt/" },
  criterion: { translation: "критерий", phonetic: "/kraɪˈtɪəriən/" },
  demise: { translation: "гибель, упадок", phonetic: "/dɪˈmaɪz/" },
  depletion: { translation: "истощение", phonetic: "/dɪˈpliːʃən/" },
  discrepancy: { translation: "расхождение, несоответствие", phonetic: "/dɪsˈkrepənsi/" },
  drought: { translation: "засуха", phonetic: "/draʊt/" },
  epidemic: { translation: "эпидемия", phonetic: "/ˌepɪˈdemɪk/" },
  equilibrium: { translation: "равновесие", phonetic: "/ˌiːkwɪˈlɪbriəm/" },
  fatigue: { translation: "усталость", phonetic: "/fəˈtiːɡ/" },
  habitat: { translation: "среда обитания", phonetic: "/ˈhæbɪtæt/" },
  hierarchy: { translation: "иерархия", phonetic: "/ˈhaɪərɑːki/" },
  hypothesis: { translation: "гипотеза", phonetic: "/haɪˈpɒθəsɪs/" },
  incentive: { translation: "стимул", phonetic: "/ɪnˈsentɪv/" },
  infrastructure: { translation: "инфраструктура", phonetic: "/ˈɪnfrəstrʌktʃə/" },
  initiative: { translation: "инициатива", phonetic: "/ɪˈnɪʃətɪv/" },
  intervention: { translation: "вмешательство", phonetic: "/ˌɪntəˈvenʃən/" },
  legacy: { translation: "наследие", phonetic: "/ˈleɡəsi/" },
  livelihood: { translation: "средства к существованию", phonetic: "/ˈlaɪvlihʊd/" },
  momentum: { translation: "импульс, инерция", phonetic: "/məˈmentəm/" },
  paradigm: { translation: "парадигма", phonetic: "/ˈpærədaɪm/" },
  phenomenon: { translation: "явление, феномен", phonetic: "/fəˈnɒmɪnən/" },
  precedent: { translation: "прецедент", phonetic: "/ˈpresɪdənt/" },
  premise: { translation: "предпосылка", phonetic: "/ˈpremɪs/" },
  prevalence: { translation: "распространённость", phonetic: "/ˈprevələns/" },
  proximity: { translation: "близость", phonetic: "/prɒkˈsɪməti/" },
  rationale: { translation: "обоснование", phonetic: "/ˌræʃəˈnɑːl/" },
  scarcity: { translation: "нехватка, дефицит", phonetic: "/ˈskeəsəti/" },
  scrutiny: { translation: "тщательное изучение", phonetic: "/ˈskruːtɪni/" },
  sediment: { translation: "осадок, отложения", phonetic: "/ˈsedɪmənt/" },
  spectrum: { translation: "спектр, диапазон", phonetic: "/ˈspektrəm/" },
  surplus: { translation: "излишек, профицит", phonetic: "/ˈsɜːpləs/" },
  turnover: { translation: "оборот; текучесть кадров", phonetic: "/ˈtɜːnəʊvə/" },
  vicinity: { translation: "окрестность, близость", phonetic: "/vɪˈsɪnəti/" },
  yield: { translation: "урожай, доход; приносить", phonetic: "/jiːld/" },

  // --- academic adjectives --------------------------------------------------
  abundant: { translation: "обильный, изобилующий", phonetic: "/əˈbʌndənt/" },
  adverse: { translation: "неблагоприятный", phonetic: "/ˈædvɜːs/" },
  ambiguous: { translation: "двусмысленный", phonetic: "/æmˈbɪɡjuəs/" },
  arbitrary: { translation: "произвольный", phonetic: "/ˈɑːbɪtrəri/" },
  coherent: { translation: "связный, последовательный", phonetic: "/kəʊˈhɪərənt/" },
  compelling: { translation: "убедительный", phonetic: "/kəmˈpelɪŋ/" },
  conclusive: { translation: "убедительный, окончательный", phonetic: "/kənˈkluːsɪv/" },
  contemporary: { translation: "современный", phonetic: "/kənˈtempərəri/" },
  controversial: { translation: "спорный", phonetic: "/ˌkɒntrəˈvɜːʃəl/" },
  crucial: { translation: "решающий, важнейший", phonetic: "/ˈkruːʃəl/" },
  cumulative: { translation: "накопительный, совокупный", phonetic: "/ˈkjuːmjələtɪv/" },
  diverse: { translation: "разнообразный", phonetic: "/daɪˈvɜːs/" },
  empirical: { translation: "эмпирический, опытный", phonetic: "/ɪmˈpɪrɪkəl/" },
  explicit: { translation: "явный, чёткий", phonetic: "/ɪkˈsplɪsɪt/" },
  feasible: { translation: "осуществимый", phonetic: "/ˈfiːzəbəl/" },
  implicit: { translation: "неявный, подразумеваемый", phonetic: "/ɪmˈplɪsɪt/" },
  indigenous: { translation: "коренной, местный", phonetic: "/ɪnˈdɪdʒənəs/" },
  intricate: { translation: "запутанный, сложный", phonetic: "/ˈɪntrɪkət/" },
  negligible: { translation: "незначительный", phonetic: "/ˈneɡlɪdʒəbəl/" },
  notable: { translation: "заметный, примечательный", phonetic: "/ˈnəʊtəbəl/" },
  novel: { translation: "новый, новаторский", phonetic: "/ˈnɒvəl/" },
  optimal: { translation: "оптимальный", phonetic: "/ˈɒptɪməl/" },
  paramount: { translation: "первостепенный", phonetic: "/ˈpærəmaʊnt/" },
  profound: { translation: "глубокий", phonetic: "/prəˈfaʊnd/" },
  prominent: { translation: "видный, заметный", phonetic: "/ˈprɒmɪnənt/" },
  redundant: { translation: "избыточный, лишний", phonetic: "/rɪˈdʌndənt/" },
  robust: { translation: "прочный, надёжный", phonetic: "/rəʊˈbʌst/" },
  scarce: { translation: "скудный, редкий", phonetic: "/skeəs/" },
  simultaneous: { translation: "одновременный", phonetic: "/ˌsɪməlˈteɪniəs/" },
  sophisticated: { translation: "сложный, изощрённый", phonetic: "/səˈfɪstɪkeɪtɪd/" },
  sceptical: { translation: "скептический", phonetic: "/ˈskeptɪkəl/" },
  skeptical: { translation: "скептический", phonetic: "/ˈskeptɪkəl/" },
  subsequent: { translation: "последующий", phonetic: "/ˈsʌbsɪkwənt/" },
  susceptible: { translation: "восприимчивый, подверженный", phonetic: "/səˈseptəbəl/" },
  unprecedented: { translation: "беспрецедентный", phonetic: "/ʌnˈpresɪdentɪd/" },
  viable: { translation: "жизнеспособный", phonetic: "/ˈvaɪəbəl/" },
  vulnerable: { translation: "уязвимый", phonetic: "/ˈvʌlnərəbəl/" },
  widespread: { translation: "широко распространённый", phonetic: "/ˈwaɪdspred/" },

  // --- linking / discourse --------------------------------------------------
  albeit: { translation: "хотя и", phonetic: "/ɔːlˈbiːɪt/" },
  conversely: { translation: "наоборот, напротив", phonetic: "/ˈkɒnvɜːsli/" },
  furthermore: { translation: "кроме того", phonetic: "/ˌfɜːðəˈmɔː/" },
  hence: { translation: "следовательно", phonetic: "/hens/" },
  nevertheless: { translation: "тем не менее", phonetic: "/ˌnevəðəˈles/" },
  notwithstanding: { translation: "несмотря на", phonetic: "/ˌnɒtwɪθˈstændɪŋ/" },
  thereby: { translation: "тем самым", phonetic: "/ˌðeəˈbaɪ/" },
  whereas: { translation: "тогда как", phonetic: "/weərˈæz/" },

  // --- Test 34, Passage 1 (LONGAEVA: Ancient Bristlecone Pine) --------------
  // Seeded so the whole opening reads with translations while the glossary is
  // still local; the general fix is a dictionary source.
  about: { translation: "о, около", phonetic: "/əˈbaʊt/" },
  any: { translation: "любой, какой-нибудь", phonetic: "/ˈeni/" },
  bristlecone: { translation: "остистая (сосна)", phonetic: "/ˈbrɪsəlkəʊn/" },
  california: { translation: "Калифорния", phonetic: "/ˌkælɪˈfɔːniə/" },
  earth: { translation: "Земля; земля, почва", phonetic: "/ɜːθ/" },
  environment: { translation: "окружающая среда", phonetic: "/ɪnˈvaɪrənmənt/" },
  free: { translation: "свободный; бесплатный", phonetic: "/friː/" },
  greater: { translation: "больший, более значительный", phonetic: "/ˈɡreɪtə/" },
  history: { translation: "история", phonetic: "/ˈhɪstəri/" },
  human: { translation: "человек; человеческий", phonetic: "/ˈhjuːmən/" },
  insight: { translation: "понимание, проникновение в суть", phonetic: "/ˈɪnsaɪt/" },
  longaeva: { translation: "лонгева (видовое название, «долгоживущая»)" },
  look: { translation: "смотреть, обращаться (к чему-л.)", phonetic: "/lʊk/" },
  mountain: { translation: "гора", phonetic: "/ˈmaʊntɪn/" },
  natural: { translation: "природный, естественный", phonetic: "/ˈnætʃərəl/" },
  often: { translation: "часто", phonetic: "/ˈɒfən/" },
  other: { translation: "другой", phonetic: "/ˈʌðə/" },
  past: { translation: "прошлое; прошлый", phonetic: "/pɑːst/" },
  pine: { translation: "сосна", phonetic: "/paɪn/" },
  pinus: { translation: "сосна (лат. род Pinus)" },
  planet: { translation: "планета", phonetic: "/ˈplænɪt/" },
  purpose: { translation: "цель, назначение", phonetic: "/ˈpɜːpəs/" },
  serve: { translation: "служить, выполнять (роль)", phonetic: "/sɜːv/" },
  species: { translation: "вид (биологический)", phonetic: "/ˈspiːʃiːz/" },
  understand: { translation: "понимать", phonetic: "/ˌʌndəˈstænd/" },
  white: { translation: "белый", phonetic: "/waɪt/" },

  // Function words, so nothing in the sentence comes back empty.
  than: { translation: "чем (при сравнении)", phonetic: "/ðæn/" },
  this: { translation: "этот, это", phonetic: "/ðɪs/" },
  into: { translation: "в, внутрь", phonetic: "/ˈɪntuː/" },
  more: { translation: "больше, более", phonetic: "/mɔː/" },
  have: { translation: "иметь; вспомогательный глагол", phonetic: "/hæv/" },
  has: { translation: "имеет (3-е л. ед. ч. от have)", phonetic: "/hæz/" },
  the: { translation: "определённый артикль", phonetic: "/ðə/" },
  and: { translation: "и", phonetic: "/ænd/" },
  for: { translation: "для, за, в течение", phonetic: "/fɔː/" },
  of: { translation: "предлог родительного падежа: из, от", phonetic: "/ɒv/" },
  on: { translation: "на", phonetic: "/ɒn/" },
  to: { translation: "к, в; частица инфинитива", phonetic: "/tuː/" },
  in: { translation: "в, внутри", phonetic: "/ɪn/" },
};

export interface GlossaryHit {
  translation: string;
  phonetic?: string;
  /** The headword matched, when it differs from what was selected. */
  lemma: string;
}

/**
 * Look a selection up, falling back to its likely dictionary form.
 *
 * Passages contain inflected words — "constraints", "diminishing", "sustained"
 * — while the glossary holds headwords. Without this, the automatic lookup
 * would miss most of what a student actually selects.
 *
 * Deliberately conservative: it only undoes regular English endings, and every
 * candidate must be present in the glossary, so a wrong guess yields nothing
 * rather than a wrong translation.
 */
export function lookupTerm(raw: string): GlossaryHit | null {
  const term = normalizeTerm(raw);
  if (!term) return null;

  const direct = QUICK_GLOSSARY[term];
  if (direct) return { ...direct, lemma: term };

  const candidates: string[] = [];
  const add = (w: string) => {
    if (w.length >= 3 && !candidates.includes(w)) candidates.push(w);
  };

  // possessive: "earth's" → "earth"
  if (/['\u2019]s$/.test(term)) add(term.replace(/['\u2019]s$/, ""));

  // plurals / third person
  if (term.endsWith("ies")) add(term.slice(0, -3) + "y");
  if (term.endsWith("es")) add(term.slice(0, -2));
  if (term.endsWith("s") && !term.endsWith("ss")) add(term.slice(0, -1));
  // past / participle
  if (term.endsWith("ied")) add(term.slice(0, -3) + "y");
  if (term.endsWith("ed")) {
    add(term.slice(0, -2));
    add(term.slice(0, -1));
    if (/([^aeiou])\1ed$/.test(term)) add(term.slice(0, -3));
  }
  // continuous
  if (term.endsWith("ing")) {
    add(term.slice(0, -3));
    add(term.slice(0, -3) + "e");
    if (/([^aeiou])\1ing$/.test(term)) add(term.slice(0, -4));
  }
  // adverbs
  if (term.endsWith("ally")) add(term.slice(0, -2));
  if (term.endsWith("ily")) add(term.slice(0, -3) + "y");
  if (term.endsWith("ly")) {
    add(term.slice(0, -2));
    // "notably" → "notable", "feasibly" → "feasible": the adjective keeps its
    // final -e, so only the "y" comes off.
    add(term.slice(0, -1) + "e");
  }

  for (const c of candidates) {
    const hit = QUICK_GLOSSARY[c];
    if (hit) return { ...hit, lemma: c };
  }
  return null;
}

/**
 * Strip surrounding punctuation and case so "Cohesion," matches the glossary.
 *
 * Uses an explicit letter class rather than `\p{L}`, which needs a newer
 * compile target than this project sets.
 */
export function normalizeTerm(raw: string): string {
  return raw
    .trim()
    .replace(/^[^A-Za-zА-Яа-яЁё]+|[^A-Za-zА-Яа-яЁё]+$/g, "")
    .toLowerCase();
}

/**
 * The sentence containing `term` within `context`.
 *
 * Falls back to the whole context when sentence boundaries can't be found,
 * which is better than saving a fragment with no meaning.
 */
export function sentenceAround(context: string, term: string): string {
  const flat = context.replace(/\s+/g, " ").trim();
  if (!flat) return "";
  const index = flat.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return flat.slice(0, 300);

  // Walk out to the nearest sentence terminator on each side.
  let start = 0;
  for (let i = index; i > 0; i--) {
    if (/[.!?]/.test(flat[i - 1]) && /\s/.test(flat[i])) {
      start = i;
      break;
    }
  }
  let end = flat.length;
  for (let i = index + term.length; i < flat.length; i++) {
    if (/[.!?]/.test(flat[i])) {
      end = i + 1;
      break;
    }
  }
  return flat.slice(start, end).trim().slice(0, 300);
}
