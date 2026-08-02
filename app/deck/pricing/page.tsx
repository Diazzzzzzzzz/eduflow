import Image from "next/image";
import type { Metadata } from "next";
import {
  School,
  MonitorPlay,
  Building2,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Тарифные планы EduFlow — презентация",
};

/**
 * B2B pitch slide: EduFlow pricing plans (16:9).
 *
 * Standalone presentation route — not part of the app shell, so it renders on
 * the light "Modern" skin (brand violet #6158f1) regardless of user session.
 * Everything is a single self-contained slide: header, three plan cards, and a
 * full-width offer banner. Values are hardcoded on purpose — this is a pitch
 * artefact, not a data-driven pricing page.
 */

const BRAND = "#6158f1";

type Feature = { text: string; muted?: boolean };

type Price = { label: string; value: string };

type Plan = {
  eyebrow: string;
  icon: LucideIcon;
  who: string;
  features: Feature[];
  prices?: Price[];
  /** Enterprise-style: no fixed price, quoted per organization. */
  quote?: { title: string; note: string };
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    eyebrow: "Оффлайн и гибрид",
    icon: School,
    who: "Для занятий в аудиториях, контроля ДЗ и автопроверки",
    features: [
      { text: "База тестов Cambridge IELTS (все 4 раздела)" },
      { text: "Интерактивный класс & автопроверка" },
      { text: "Умный тренажёр слов и карточки" },
      { text: "Дашборд директора: аналитика и прогресс групп" },
      { text: "Генерация печати материалов и ДЗ" },
      { text: "Без встроенной видеосвязи", muted: true },
    ],
    prices: [
      { label: "Offline Light · до 50 уч.", value: "25 000 ₸ / мес" },
      { label: "Offline Pro · до 150 уч.", value: "45 000 ₸ / мес" },
    ],
  },
  {
    eyebrow: "Онлайн-экосистема",
    icon: MonitorPlay,
    who: "Полный цикл онлайн-обучения в одном окне",
    featured: true,
    features: [
      { text: "Все функции тарифа «Оффлайн»" },
      { text: "Встроенный Виртуальный класс (видеосвязь)" },
      { text: "Live Sync: синхронизация материалов учителя и ученика" },
      { text: "Интерактивная доска для уроков" },
    ],
    prices: [
      { label: "Online Starter · до 50 уч.", value: "49 000 ₸ / мес" },
      { label: "Online Pro · до 150 уч.", value: "79 000 ₸ / мес" },
    ],
  },
  {
    eyebrow: "Enterprise / Whitelabel",
    icon: Building2,
    who: "Собственная IT-платформа на вашем домене",
    features: [
      { text: "Ваш логотип, цвета и брендинг (скрыт EduFlow)" },
      { text: "Домен школы (напр., app.your-school.kz)" },
      { text: "Загрузка ваших авторских курсов и тестов" },
      { text: "Персональный менеджер и приоритетная поддержка" },
    ],
    quote: {
      title: "Стоимость — договорная",
      note: "Рассчитывается индивидуально под масштаб, требования и брендинг вашей организации",
    },
  },
];

export default function PricingSlidePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EEF0F8] p-6 font-sans text-[#0F172A]">
      <div className="aspect-[16/9] w-full max-w-[1280px] overflow-hidden rounded-[28px] bg-[#F8F9FD] shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)] ring-1 ring-slate-200">
        <div className="flex h-full flex-col px-12 py-7">
          {/* Header */}
          <header className="flex items-start justify-between gap-6">
            <div className="max-w-3xl">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: BRAND, backgroundColor: "rgba(97,88,241,0.1)" }}
              >
                Тарифные планы
              </span>
              <h1 className="mt-2.5 font-display text-[36px] font-extrabold leading-[1.05] tracking-tight text-[#0F172A]">
                Гибкие тарифные планы EduFlow
              </h1>
              <p className="mt-2 text-[16px] leading-snug text-slate-500">
                Выбирайте оптимальное решение под масштаб и формат вашего
                языкового центра
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5 pt-2">
              <Image
                src="/eduflow-logo.png"
                alt="EduFlow"
                width={40}
                height={40}
                priority
                className="h-10 w-10 object-contain"
              />
              <div className="leading-tight">
                <p className="font-display text-[15px] font-bold tracking-tight">
                  EduFlow
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  by Atlas EdTech
                </p>
              </div>
            </div>
          </header>

          {/* Plan cards */}
          <section className="mt-6 flex flex-1 items-center">
            <div className="grid w-full grid-cols-3 items-stretch gap-5">
              {PLANS.map((plan) => (
                <PlanCard key={plan.eyebrow} plan={plan} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const Icon = plan.icon;
  const featured = plan.featured;

  return (
    <article
      className={[
        "relative flex h-full flex-col rounded-2xl bg-white p-5 transition",
        featured
          ? "shadow-[0_20px_45px_-15px_rgba(97,88,241,0.35)]"
          : "border border-slate-200 shadow-sm",
      ].join(" ")}
      style={
        featured
          ? { border: `2px solid ${BRAND}`, transform: "translateY(-6px)" }
          : undefined
      }
    >
      {featured && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-md"
          style={{ backgroundColor: BRAND }}
        >
          Популярный выбор
        </span>
      )}

      {/* Icon + eyebrow */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(97,88,241,0.1)" }}
        >
          <Icon className="h-6 w-6" style={{ color: BRAND }} strokeWidth={2.1} />
        </span>
        <p
          className="text-[12px] font-bold uppercase tracking-[0.13em]"
          style={{ color: BRAND }}
        >
          {plan.eyebrow}
        </p>
      </div>

      <p className="mt-3 min-h-[38px] text-[13.5px] leading-snug text-slate-500">
        {plan.who}
      </p>

      <div className="my-3.5 h-px w-full bg-slate-100" />

      {/* Features */}
      <ul className="flex flex-col gap-2">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5">
            <span
              className={[
                "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full",
                f.muted ? "bg-slate-100" : "",
              ].join(" ")}
              style={f.muted ? undefined : { backgroundColor: "rgba(97,88,241,0.12)" }}
            >
              {f.muted ? (
                <X className="h-3 w-3 text-slate-400" strokeWidth={2.6} />
              ) : (
                <Check className="h-3 w-3" style={{ color: BRAND }} strokeWidth={3} />
              )}
            </span>
            <span
              className={[
                "text-[13.5px] leading-snug",
                f.muted ? "text-slate-400" : "text-slate-700",
              ].join(" ")}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* Prices (or a per-organization quote) pinned to the bottom */}
      <div className="mt-auto space-y-2 pt-4">
        {plan.quote ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3.5">
            <p className="text-[15px] font-bold tracking-tight text-[#0F172A]">
              {plan.quote.title}
            </p>
            <p className="mt-1 text-[12.5px] leading-snug text-slate-500">
              {plan.quote.note}
            </p>
          </div>
        ) : (
          plan.prices?.map((p) => (
            <div
              key={p.label}
              className={[
                "flex items-center justify-between rounded-xl px-3.5 py-2.5",
                featured ? "" : "bg-slate-50",
              ].join(" ")}
              style={
                featured ? { backgroundColor: "rgba(97,88,241,0.07)" } : undefined
              }
            >
              <span className="text-[12px] font-medium text-slate-500">
                {p.label}
              </span>
              <span className="text-[14px] font-bold tracking-tight text-[#0F172A]">
                {p.value}
              </span>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
