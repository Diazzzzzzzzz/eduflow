import type { Metadata } from "next";
import { Inter, Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { AppProvider } from "@/components/app-provider";
import { Topbar } from "@/components/layout/topbar";
import { SiteFooter } from "@/components/layout/site-footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

// Serif accent reserved for band-score numerals and headline flourishes
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "EduFlow — Аналитика для языковых центров",
  description:
    "Отслеживайте прогресс студентов по mock-экзаменам, визуализируйте динамику баллов и держите родителей в курсе. Создано для центров подготовки к IELTS.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${jakarta.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans">
        <AppProvider>
          <div className="canvas-grid flex min-h-screen flex-col">
            <Topbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
              {children}
            </main>
            <SiteFooter />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
