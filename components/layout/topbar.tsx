"use client";

import { Bell, Moon, Sun } from "lucide-react";
import { useApp } from "@/components/app-provider";
import { CenterBadge, Logo } from "@/components/layout/logo";
import { UiThemeSwitch } from "@/components/layout/ui-theme-switch";
import { UserMenu, type MenuUser } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";

export function Topbar({ user }: { user: MenuUser }) {
  const { theme, toggleTheme } = useApp();
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
          <CenterBadge className="hidden sm:flex" />
        </div>
        <div className="flex items-center gap-1.5">
          <UiThemeSwitch className="mr-1" />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Уведомления"
            className="relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Переключить на светлую тему"
                : "Переключить на тёмную тему"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
