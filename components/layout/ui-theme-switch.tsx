"use client";

import { Palette, Sparkles } from "lucide-react";
import { useApp, type UiTheme } from "@/components/app-provider";
import { cn } from "@/lib/utils";

const OPTIONS: { id: UiTheme; label: string; hint: string; icon: typeof Palette }[] =
  [
    {
      id: "classic",
      label: "Classic",
      hint: "Классический строгий интерфейс",
      icon: Palette,
    },
    {
      id: "modern",
      label: "Modern",
      hint: "Скруглённый игровой интерфейс",
      icon: Sparkles,
    },
  ];

/**
 * Switches the visual language of the whole app.
 *
 * Only sets a class on <html>; every restyled surface reads design tokens, so
 * the change is instant and nothing remounts.
 */
export function UiThemeSwitch({ className }: { className?: string }) {
  const { uiTheme, setUiTheme } = useApp();

  return (
    <div
      role="radiogroup"
      aria-label="Стиль интерфейса"
      className={cn(
        "flex items-center gap-0.5 rounded-lg border bg-secondary/60 p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ id, label, hint, icon: Icon }) => {
        const active = uiTheme === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            title={hint}
            onClick={() => setUiTheme(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
