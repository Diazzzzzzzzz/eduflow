import type { Metadata } from "next";
import { Inter, Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { AppProvider } from "@/components/app-provider";
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
  title: "IELTS Pulse — Аналитика для языковых центров",
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
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
