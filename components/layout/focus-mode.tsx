"use client";

import * as React from "react";

/**
 * Focus mode — a distraction-free, full-viewport surface for timed work.
 *
 * A test taken inside the normal workspace chrome loses roughly a third of the
 * screen to the top bar, the student header, the tab strip and the footer, and
 * every one of those is a link out of a running exam. While focus mode is on
 * the chrome is unmounted (not merely hidden), so it cannot be reached by
 * keyboard or a screen reader mid-attempt, and the content area is handed the
 * whole viewport with no padding or max-width of its own.
 *
 * Provided at the authenticated layout so both the app chrome and the student
 * workspace chrome can respond to the same signal.
 */
interface FocusModeState {
  focused: boolean;
  setFocused: (on: boolean) => void;
}

const FocusModeContext = React.createContext<FocusModeState | null>(null);

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [focused, setFocused] = React.useState(false);
  const value = React.useMemo(() => ({ focused, setFocused }), [focused]);
  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
}

/**
 * Stable identity on purpose: a fresh object here would change `setFocused`
 * every render and re-fire the effect in `useFocusModeWhile`.
 */
const INERT: FocusModeState = { focused: false, setFocused: () => {} };

/**
 * Read the current state. Returns a safe default outside the provider so a
 * component can be rendered in isolation (tests, storybook) without blowing up.
 */
export function useFocusMode(): FocusModeState {
  return React.useContext(FocusModeContext) ?? INERT;
}

/**
 * Hold focus mode for as long as `active` is true and this component is
 * mounted. Releasing on unmount matters: navigating away mid-exam (or the
 * results screen replacing the runner) must give the chrome back.
 */
export function useFocusModeWhile(active: boolean): void {
  const { setFocused } = useFocusMode();
  React.useEffect(() => {
    if (!active) return;
    setFocused(true);
    return () => setFocused(false);
  }, [active, setFocused]);
}
