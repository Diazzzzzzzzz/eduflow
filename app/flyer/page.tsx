import Image from "next/image";
import {
  BarChart3,
  BookMarked,
  CheckCircle2,
  Gift,
  Mail,
  MonitorPlay,
  Phone,
  Target,
  Zap,
} from "lucide-react";
import { PrintButton } from "./print-button";

export const metadata = {
  title: "EduFlow — флаер A5 | Atlas EdTech",
  description:
    "Печатный B2B-флаер EduFlow: единая цифровая экосистема для языковых центров и подготовки к IELTS.",
};

const BRAND = "#6158f1";

const FEATURES = [
  {
    icon: Target,
    title: "База IELTS-тестов",
    text: "Все 4 раздела в формате реального компьютерного экзамена (CD-IELTS).",
  },
  {
    icon: Zap,
    title: "Автопроверка и аналитика",
    text: "Мгновенный подсчёт баллов, трекинг ошибок и прогресса каждой группы.",
  },
  {
    icon: MonitorPlay,
    title: "Виртуальный класс & Live Sync",
    text: "Встроенная видеосвязь, синхронизация материалов учителя и ученика, интерактивная доска.",
  },
  {
    icon: BarChart3,
    title: "Дашборд руководителя",
    text: "Прозрачный контроль посещаемости, успеваемости студентов и работы преподавателей.",
  },
  {
    icon: BookMarked,
    title: "Умный тренажёр слов",
    text: "Автоматическое формирование личных словарей для каждого студента.",
  },
];

/**
 * Print-ready A5 flyer.
 *
 * Sized in millimetres rather than pixels so "Print → Save as PDF" produces a
 * true 148×210 mm page a printer can use directly. Colours are forced with
 * print-color-adjust, otherwise browsers drop the filled blocks when printing.
 */
export default function FlyerPage() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page { size: A5 portrait; margin: 0; }

            .flyer-stage {
              min-height: 100vh;
              background: #e9ecf5;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 16px;
              padding: 28px 16px 48px;
            }
            .flyer {
              width: 148mm;
              height: 210mm;
              background: #F8F9FD;
              color: #1a1c2b;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              box-shadow: 0 18px 50px -12px rgba(31, 34, 68, 0.28);
            }

            @media print {
              html, body { background: #fff !important; margin: 0; padding: 0; }
              .flyer-stage { padding: 0; gap: 0; background: #fff; min-height: 0; }
              .no-print { display: none !important; }
              .flyer { box-shadow: none; }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `,
        }}
      />

      <div className="flyer-stage">
        <div className="no-print flex w-full max-w-[148mm] items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            A5 · 148 × 210 мм · печать без полей
          </p>
          <PrintButton color={BRAND} />
        </div>

        <article className="flyer font-sans">
          {/* ── Header ─────────────────────────────────────────────── */}
          <header className="px-[11mm] pb-[3mm] pt-[6mm]">
            <div className="flex items-center gap-[2mm]">
              <span
                className="flex h-[6mm] w-[6mm] items-center justify-center rounded-[1.7mm]"
                style={{ background: BRAND }}
                aria-hidden
              >
                <span className="text-[3mm] font-extrabold leading-none text-white">
                  A
                </span>
              </span>
              <span className="text-[2.8mm] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Atlas EdTech
              </span>
            </div>

            <h1
              className="mt-[3mm] font-display text-[11.5mm] font-extrabold leading-[0.92] tracking-[-0.03em]"
              style={{ color: BRAND }}
            >
              EduFlow
            </h1>
            <p className="mt-[1.5mm] max-w-[112mm] text-[3.4mm] font-medium leading-[1.3] text-slate-600">
              Единая цифровая экосистема для языковых центров и подготовки
              к&nbsp;IELTS
            </p>
          </header>

          {/* ── Hero value ─────────────────────────────────────────── */}
          <section className="px-[11mm]">
            <div className="relative overflow-hidden rounded-[3.4mm] border border-slate-200 bg-white px-[5mm] py-[3.6mm]">
              <span
                className="absolute inset-y-0 left-0 w-[1.2mm]"
                style={{ background: BRAND }}
                aria-hidden
              />
              <p className="text-[3.2mm] font-semibold leading-[1.4] text-slate-800">
                Забудьте про 10 WhatsApp-чатов, Excel-таблицы и ручную проверку
                тестов.
                <span style={{ color: BRAND }}>
                  {" "}
                  Переведите вашу школу в один клик.
                </span>
              </p>
            </div>
          </section>

          {/* ── Features ───────────────────────────────────────────── */}
          <section className="mt-[3mm] flex-1 px-[11mm]">
            <h2 className="mb-[2.4mm] text-[2.6mm] font-bold uppercase tracking-[0.2em] text-slate-400">
              Что входит в платформу
            </h2>

            <ul className="space-y-[1.5mm]">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="flex items-start gap-[2.8mm] rounded-[2.6mm] border border-slate-200 bg-white px-[3.4mm] py-[2.2mm]"
                >
                  <span
                    className="mt-[0.3mm] flex h-[6.6mm] w-[6.6mm] shrink-0 items-center justify-center rounded-[1.9mm]"
                    style={{ background: "rgba(97, 88, 241, 0.10)" }}
                    aria-hidden
                  >
                    <Icon
                      style={{ color: BRAND, width: "3.6mm", height: "3.6mm" }}
                      strokeWidth={2.2}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[3.1mm] font-bold leading-tight text-slate-900">
                      {title}
                    </span>
                    <span className="mt-[0.6mm] block text-[2.7mm] leading-[1.32] text-slate-500">
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Call to action ─────────────────────────────────────── */}
          <section className="mt-[3mm] px-[11mm]">
            <div
              className="relative overflow-hidden rounded-[3.4mm] px-[5mm] py-[3.8mm] text-white"
              style={{
                background: `linear-gradient(135deg, ${BRAND} 0%, #4a3fd6 55%, #3b32b8 100%)`,
              }}
            >
              {/* Soft light bloom, kept subtle so it survives CMYK printing. */}
              <span
                className="pointer-events-none absolute -right-[10mm] -top-[14mm] h-[34mm] w-[34mm] rounded-full"
                style={{ background: "rgba(255,255,255,0.13)" }}
                aria-hidden
              />
              <div className="relative flex items-start gap-[2.8mm]">
                <span
                  className="flex h-[6.6mm] w-[6.6mm] shrink-0 items-center justify-center rounded-[1.9mm]"
                  style={{ background: "rgba(255,255,255,0.18)" }}
                  aria-hidden
                >
                  <Gift style={{ width: "3.8mm", height: "3.8mm" }} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[3.3mm] font-extrabold leading-tight">
                    Эксклюзивный запуск
                  </p>
                  <p className="mt-[1.2mm] text-[2.8mm] leading-[1.38] text-white/90">
                    Попробуйте EduFlow в действии. Проведём персональную
                    презентацию и выдадим тестовый доступ для вашего центра.
                  </p>
                  <p className="mt-[1.8mm] inline-flex items-center gap-[1.4mm] rounded-full bg-white/15 px-[2.8mm] py-[1.1mm] text-[2.6mm] font-semibold">
                    <CheckCircle2 style={{ width: "3mm", height: "3mm" }} />
                    Бесплатно · без обязательств
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <footer className="mt-[4mm] border-t border-slate-200 bg-white px-[11mm] pb-[5mm] pt-[4mm]">
            <div className="flex items-end justify-between gap-[5mm]">
              <div className="min-w-0 space-y-[1.6mm]">
                <a
                  href="tel:+77766333446"
                  className="flex items-center gap-[2.2mm] no-underline"
                >
                  <Phone
                    style={{ color: BRAND, width: "3.6mm", height: "3.6mm" }}
                    strokeWidth={2.4}
                  />
                  <span className="text-[3.8mm] font-extrabold tracking-tight text-slate-900">
                    +7 776 633 3446
                  </span>
                </a>
                <a
                  href="mailto:pernebekd75@gmail.com"
                  className="flex items-center gap-[2.2mm] no-underline"
                >
                  <Mail
                    style={{ color: BRAND, width: "3.6mm", height: "3.6mm" }}
                    strokeWidth={2.4}
                  />
                  <span className="text-[3.1mm] font-semibold text-slate-700">
                    pernebekd75@gmail.com
                  </span>
                </a>
                <p className="pt-[0.5mm] text-[2.7mm] leading-tight text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Пернебек Диас
                  </span>{" "}
                  — Основатель &amp; Product Lead
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-[1.2mm]">
                <Image
                  src="/eduflow-logo.png"
                  alt=""
                  width={120}
                  height={120}
                  className="h-[11mm] w-[11mm] object-contain"
                  aria-hidden
                />
                <span className="text-[2.2mm] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Telegram · WhatsApp
                </span>
              </div>
            </div>
          </footer>
        </article>

        <p className="no-print max-w-[148mm] text-center text-xs leading-relaxed text-slate-500">
          Для PDF: «Печать» → выберите «Сохранить как PDF», размер&nbsp;A5,
          поля&nbsp;— нет, включите «Фоновая графика».
        </p>
      </div>
    </>
  );
}

