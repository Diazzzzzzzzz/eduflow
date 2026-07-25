import type { MockTest, Recommendation, SkillScores, Student } from "./types";
import { calcOverall } from "./band";

export const GROUPS = [
  "IELTS 62",
  "IELTS 63 (Weekend)",
  "Intermediate 45",
  "Pre-Intermediate 12",
  "Advanced 34",
] as const;

const MOCK_LABELS = [
  "Mock #1 — Диагностика",
  "Mock #2 — Cambridge 17",
  "Mock #3 — Cambridge 18",
  "Mock #4 — Промежуточный",
  "Mock #5 — Cambridge 19",
  "Mock #6 — Полная симуляция",
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
    name: "Арман Калибеков",
    initials: "АК",
    group: "IELTS 62",
    targetBand: 7.5,
    examDate: "2026-09-19",
    attendance: 96,
    teacherNote:
      "Арман показывает отличный прогресс в Listening. Нужно поработать над лексикой и связками в Writing Task 2.",
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
        "Связность в Task 2 требует связок",
        "Эссе теряют баллы за логику изложения. Отработайте «however / consequently / in contrast» и тематические предложения абзацев — 3 вступления на время за эту неделю."
      ),
      rec(
        "r-01b",
        "reading",
        "medium",
        "Точность в True / False / Not Given",
        "Сейчас 6/13 в заданиях TFNG. Тренируйтесь находить точное предложение перед выбором ответа — Cambridge 18, тесты 2–4."
      ),
      rec(
        "r-01c",
        "speaking",
        "low",
        "Глубина ответов в Part 3",
        "Ответы беглые, но короткие. Используйте схему «мнение → причина → пример», чтобы ответы длились дольше 30 секунд."
      ),
    ],
  },
  {
    id: "st-02",
    name: "Аружан Мукашева",
    initials: "АМ",
    group: "Advanced 34",
    targetBand: 8.0,
    examDate: "2026-08-22",
    attendance: 100,
    teacherNote:
      "Аружан — наш сильнейший читатель. Беглость речи отличная; отточите произношение сочетаний согласных для 8.0.",
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
        "Обзорное предложение в Task 1",
        "Отчёты сразу переходят к данным. Начинайте с двух предложений об основных тенденциях до любых цифр."
      ),
      rec(
        "r-02b",
        "speaking",
        "medium",
        "Произношение сочетаний согласных",
        "«Sixth», «strengths», «crisps» — по 10 минут в день повторяйте за BBC 6-Minute English."
      ),
    ],
  },
  {
    id: "st-03",
    name: "Диас Серикбай",
    initials: "ДС",
    group: "Intermediate 45",
    targetBand: 7.0,
    examDate: "2026-10-03",
    attendance: 88,
    teacherNote:
      "Диас поднял Listening на полбалла за семестр. Главный барьер — скорость чтения; нужна работа с секциями на время.",
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
        "Тайм-менеджмент в Section 3",
        "Регулярно оставляет 6+ вопросов без ответа. Ограничьте Section 1 15 минутами и тренируйте беглый просмотр для понимания сути абзаца."
      ),
      rec(
        "r-03b",
        "writing",
        "medium",
        "Разнообразие сложных предложений",
        "Слишком много простых предложений. Цель — одно условное и одно определительное придаточное в каждом абзаце."
      ),
    ],
  },
  {
    id: "st-04",
    name: "Айгерим Нурланова",
    initials: "АН",
    group: "Intermediate 45",
    targetBand: 7.0,
    examDate: "2026-11-14",
    attendance: 92,
    teacherNote:
      "Айгерим активно участвует, её словарный запас быстро растёт. Слабое место — Listening Section 4.",
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
        "Академические монологи в Section 4",
        "Теряет концентрацию после 3-й минуты. Тренируйте заполнение пропусков по одному ролику TED-Ed в день, выписывая ключевые существительные."
      ),
      rec(
        "r-04b",
        "writing",
        "medium",
        "Структура абзацев в Task 2",
        "Идеи хорошие, но не упорядочены. Используйте схему PEEL (Point, Explain, Example, Link) для каждого абзаца."
      ),
    ],
  },
  {
    id: "st-05",
    name: "Алихан Тулегенов",
    initials: "АТ",
    group: "IELTS 62",
    targetBand: 7.5,
    examDate: "2026-09-05",
    attendance: 94,
    teacherNote:
      "Речь Алихана почти как у носителя по беглости. Последний барьер к 7.5 — грамматическая точность в Writing под давлением времени.",
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
        "Точность артиклей и предлогов",
        "Повторяющиеся пропуски «the/a» стоят баллов по GRA. Делайте проверку по чек-листу в последние 3 минуты каждого задания."
      ),
      rec(
        "r-05b",
        "reading",
        "low",
        "Стратегия matching headings",
        "Сначала читайте заголовки и предполагайте функцию абзаца до сканирования текста."
      ),
    ],
  },
  {
    id: "st-06",
    name: "Мадина Есенова",
    initials: "МЕ",
    group: "IELTS 63 (Weekend)",
    targetBand: 7.0,
    examDate: "2026-08-29",
    attendance: 85,
    teacherNote:
      "Мадина заметно продвинулась за месяц после перехода на ежедневные упражнения по Listening. Держите темп в Writing Task 1.",
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
        "Выбор данных в Task 1",
        "Описывает все данные одинаково. Выберите 2–3 самые важные тенденции, остальное сгруппируйте."
      ),
      rec(
        "r-06b",
        "speaking",
        "medium",
        "Выносливость в длинном ответе Part 2",
        "Идеи заканчиваются на 60-й секунде. Ежедневно тренируйте расширение по схеме 5W1H на карточках."
      ),
    ],
  },
  {
    id: "st-07",
    name: "Нурислам Бекжанов",
    initials: "НБ",
    group: "Pre-Intermediate 12",
    targetBand: 6.5,
    examDate: "2026-12-05",
    attendance: 78,
    teacherNote:
      "Посещаемость Нурислама снизилась в июне — отмечен для беседы с родителями. При регулярном посещении баллы держатся стабильно.",
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
        "Орфография при переносе ответов",
        "Теряет 3–4 верных ответа за тест из-за орфографии. Еженедельно отрабатывайте топ-100 существительных IELTS Listening."
      ),
      rec(
        "r-07b",
        "reading",
        "medium",
        "Лексика для распознавания перефраза",
        "Составляйте по 10 пар синонимов на юнит из Cambridge Vocabulary for IELTS."
      ),
    ],
  },
  {
    id: "st-08",
    name: "Томирис Айтбаева",
    initials: "ТА",
    group: "Intermediate 45",
    targetBand: 7.0,
    examDate: "2026-09-26",
    attendance: 98,
    teacherNote:
      "Томирис исключительно стабильна — никогда не пропускает домашние задания. Готова выйти за рамки заученных структур в Speaking.",
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
        "Естественные ответы вместо шаблонов",
        "Экзаменатор заметит заученные фразы. Тренируйте реакцию на неожиданные вопросы Part 3 через связки «It depends…»."
      ),
      rec(
        "r-08b",
        "writing",
        "low",
        "Разнообразие лексики в Task 2",
        "Заменяйте частотные глаголы: «get → obtain / acquire», «big → substantial»."
      ),
    ],
  },
  {
    id: "st-09",
    name: "Бекарыс Жумагулов",
    initials: "БЖ",
    group: "Pre-Intermediate 12",
    targetBand: 6.5,
    examDate: "2026-10-17",
    attendance: 90,
    teacherNote:
      "Бекарыс мыслит глубоко, но неуверен в Speaking. Упражнения на уверенность работают — беглость выросла на полбалла.",
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
        "Сократить слова-паузы",
        "Долгие паузы перед ответами. Тренируйте старт ответа за 3 секунды: переформулируйте вопрос вслух, пока думаете."
      ),
      rec(
        "r-09b",
        "listening",
        "medium",
        "Задания на карты и планы",
        "Путает лево/право под давлением. Делайте по 2 задания с картами в неделю с аудио на скорости 1.25x."
      ),
    ],
  },
  {
    id: "st-10",
    name: "Зере Амангельдина",
    initials: "ЗА",
    group: "Advanced 34",
    targetBand: 8.0,
    examDate: "2026-08-15",
    attendance: 97,
    teacherNote:
      "До экзамена Зере две недели, тренд — 7.5. Финальный фокус: чёткость позиции в Writing Task 2 для рывка к 8.0.",
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
        "Позиция-тезис в Task 2",
        "Позиция появляется только в заключении. Заявите чёткое мнение во вступлении и повторяйте его в каждом абзаце."
      ),
      rec(
        "r-10b",
        "speaking",
        "low",
        "Разнообразие интонации",
        "Речь точная, но монотонная. Отмечайте ударные слова в тренировочных ответах и утрируйте их при записи и разборе."
      ),
    ],
  },
  {
    id: "st-11",
    name: "Санжар Оразбеков",
    initials: "СО",
    group: "Pre-Intermediate 12",
    targetBand: 6.5,
    examDate: "2026-11-28",
    attendance: 91,
    teacherNote:
      "Санжар присоединился в середине семестра и быстро догоняет. Грамматическая база крепкая; приоритет — расширение словарного запаса.",
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
        "Охват Academic Word List",
        "Незнакомая лексика мешает пониманию. Прорабатывайте подсписки AWL 1–3 с интервальным повторением."
      ),
      rec(
        "r-11b",
        "writing",
        "medium",
        "Полнота ответа на задание",
        "Часто отвечает лишь на половину вопросов из двух частей. Подчёркивайте обе части задания перед планированием."
      ),
    ],
  },
  {
    id: "st-12",
    name: "Камила Даулетова",
    initials: "КД",
    group: "IELTS 63 (Weekend)",
    targetBand: 7.5,
    examDate: "2026-10-10",
    attendance: 95,
    teacherNote:
      "Камила впечатляюще совмещает школьные олимпиады с подготовкой к IELTS. Reading уже на целевом уровне — держите и полируйте Writing.",
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
        "Связность без механических связок",
        "Злоупотребляет «Firstly / Secondly / In conclusion». Разнообразьте отсылками («this trend», «such measures»)."
      ),
      rec(
        "r-12b",
        "listening",
        "low",
        "Ловушки-дистракторы в multiple-choice",
        "Следите за исправлениями по ходу аудио («actually, on second thought…») в Section 2."
      ),
    ],
  },
  {
    id: "st-13",
    name: "Аружан Ержан",
    initials: "АЕ",
    email: "aruzhan.yerzhan@example.com",
    group: "IELTS 62",
    targetBand: 7.0,
    examDate: "2026-10-24",
    attendance: 93,
    teacherNote:
      "Аружан быстро набрала темп после диагностики. Reading уже на целевом уровне, Writing требует работы над развёрнутостью аргументов.",
    mockTests: tests([
      [5.5, 6.0, 5.0, 5.5],
      [6.0, 6.0, 5.5, 6.0],
      [6.0, 6.5, 5.5, 6.0],
      [6.5, 7.0, 6.0, 6.5],
      [6.5, 7.0, 6.0, 6.5],
      [7.0, 7.0, 6.5, 6.5],
    ]),
    recommendations: [
      rec(
        "r-13a",
        "writing",
        "high",
        "Развитие аргумента в Task 2",
        "Идеи заявлены, но не раскрыты. На каждый аргумент добавляйте объяснение и конкретный пример — схема PEEL."
      ),
      rec(
        "r-13b",
        "speaking",
        "medium",
        "Разнообразие лексики в Part 1",
        "Ответы точные, но словарь бытовой. Подготовьте по три синонима к частотным темам: работа, учёба, город."
      ),
    ],
  },
  {
    id: "st-14",
    name: "Данияр Султанов",
    initials: "ДС",
    email: "daniyar.sultanov@example.com",
    group: "IELTS 62",
    targetBand: 6.5,
    examDate: "2026-11-07",
    attendance: 87,
    teacherNote:
      "Данияр пропустил две недели в июне, что видно по динамике. При регулярном посещении прогресс устойчивый.",
    mockTests: tests([
      [5.0, 5.0, 4.5, 5.0],
      [5.5, 5.0, 5.0, 5.5],
      [5.5, 5.5, 5.0, 5.5],
      [5.5, 5.5, 5.0, 5.5],
      [6.0, 5.5, 5.5, 6.0],
      [6.0, 6.0, 5.5, 6.0],
    ]),
    recommendations: [
      rec(
        "r-14a",
        "listening",
        "high",
        "Section 4: длинные монологи",
        "Теряет нить после третьей минуты. Ежедневно одна лекция TED-Ed с конспектом ключевых существительных."
      ),
      rec(
        "r-14b",
        "reading",
        "medium",
        "Скорость чтения",
        "Не успевает третий текст. Ограничьте первый текст 15 минутами и тренируйте просмотровое чтение абзацев."
      ),
    ],
  },
  {
    id: "st-15",
    name: "Мадина Оспанова",
    initials: "МО",
    email: "madina.ospanova@example.com",
    group: "IELTS 62",
    targetBand: 7.5,
    examDate: "2026-09-26",
    attendance: 98,
    teacherNote:
      "Мадина — самый дисциплинированный студент группы, не пропускает домашние задания. Осталось добрать полбалла в Writing.",
    mockTests: tests([
      [6.0, 6.5, 5.5, 6.0],
      [6.5, 6.5, 6.0, 6.5],
      [7.0, 7.0, 6.0, 6.5],
      [7.0, 7.0, 6.0, 7.0],
      [7.5, 7.5, 6.5, 7.0],
      [7.5, 7.5, 6.5, 7.5],
    ]),
    recommendations: [
      rec(
        "r-15a",
        "writing",
        "high",
        "Чёткая позиция в Task 2",
        "Позиция появляется только в заключении. Формулируйте мнение во введении и возвращайтесь к нему в каждом абзаце."
      ),
      rec(
        "r-15b",
        "reading",
        "low",
        "Matching headings",
        "Сначала читайте заголовки и прогнозируйте функцию абзаца, только потом сканируйте текст."
      ),
    ],
  },
  {
    id: "st-16",
    name: "Санжар Ахметов",
    initials: "СА",
    email: "sanzhar.akhmetov@example.com",
    group: "IELTS 62",
    targetBand: 6.5,
    examDate: "2026-12-12",
    attendance: 82,
    teacherNote:
      "Санжар присоединился к группе в мае и догоняет программу. Посещаемость требует внимания — стоит связаться с родителями.",
    mockTests: tests([
      [4.5, 4.5, 4.5, 5.0],
      [5.0, 5.0, 4.5, 5.0],
      [5.0, 5.0, 5.0, 5.5],
      [5.5, 5.5, 5.0, 5.5],
      [5.5, 5.5, 5.0, 5.5],
      [6.0, 5.5, 5.5, 6.0],
    ]),
    recommendations: [
      rec(
        "r-16a",
        "reading",
        "high",
        "Академический словарь",
        "Незнакомая лексика блокирует понимание. Проходите списки AWL 1–3 с интервальным повторением."
      ),
      rec(
        "r-16b",
        "writing",
        "medium",
        "Полнота ответа на вопрос",
        "Часто отвечает только на половину задания. Подчёркивайте обе части вопроса перед планированием."
      ),
    ],
  },
  {
    id: "st-17",
    name: "Алина Нургалиева",
    initials: "АН",
    email: "alina.nurgalieva@example.com",
    group: "IELTS 62",
    targetBand: 7.0,
    examDate: "2026-10-10",
    attendance: 95,
    teacherNote:
      "Алина сильна в Speaking — беглая и уверенная речь. Основной резерв роста в Listening на картах и схемах.",
    mockTests: tests([
      [5.5, 5.5, 5.5, 6.5],
      [5.5, 6.0, 5.5, 6.5],
      [6.0, 6.0, 6.0, 7.0],
      [6.0, 6.5, 6.0, 7.0],
      [6.5, 6.5, 6.0, 7.5],
      [6.5, 7.0, 6.5, 7.5],
    ]),
    recommendations: [
      rec(
        "r-17a",
        "listening",
        "high",
        "Задания с картами и планами",
        "Путается в ориентации «влево/вправо» под давлением. Две карты в неделю на скорости 1.25x."
      ),
      rec(
        "r-17b",
        "writing",
        "medium",
        "Грамматическая точность",
        "Повторяющиеся ошибки в артиклях. Последние три минуты каждого задания — проверка по чек-листу."
      ),
    ],
  },
  {
    id: "st-18",
    name: "Темирлан Бексултан",
    initials: "ТБ",
    email: "temirlan.bexultan@example.com",
    group: "IELTS 62",
    targetBand: 8.0,
    examDate: "2026-09-12",
    attendance: 91,
    teacherNote:
      "Темирлан идёт на 8.0 и уже близок по трём секциям. Writing — единственное, что удерживает итоговый балл.",
    mockTests: tests([
      [6.5, 7.0, 6.0, 6.5],
      [7.0, 7.0, 6.0, 7.0],
      [7.5, 7.5, 6.5, 7.0],
      [7.5, 8.0, 6.5, 7.5],
      [8.0, 8.0, 6.5, 7.5],
      [8.0, 8.5, 7.0, 8.0],
    ]),
    recommendations: [
      rec(
        "r-18a",
        "writing",
        "high",
        "Связность без механических связок",
        "Опирается на «Firstly / Secondly». Переходите к отсылкам: «this approach», «such measures»."
      ),
      rec(
        "r-18b",
        "speaking",
        "low",
        "Интонационное разнообразие",
        "Речь точная, но ровная. Отмечайте ударные слова в ответах и слушайте себя в записи."
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
