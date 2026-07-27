"use client";

import * as React from "react";

const STORAGE_KEY = "ielts-pulse:v1";

/**
 * Applies the saved visual theme on pages that live outside `AppProvider`.
 *
 * Sign-in and registration render before the app shell exists, so without this
 * they would always show the classic look regardless of the user's choice.
 * Read-only: the switcher inside the app remains the only place that writes.
 */
export function UiThemeBoot() {
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        theme?: "dark" | "light";
        uiTheme?: "classic" | "modern";
      };
      document.documentElement.classList.toggle(
        "theme-modern",
        saved.uiTheme === "modern"
      );
      document.documentElement.classList.toggle("dark", saved.theme === "dark");
    } catch {
      // Corrupt storage — fall back to the classic default.
    }
  }, []);

  return null;
}
