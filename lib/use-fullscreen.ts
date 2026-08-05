"use client";

import * as React from "react";

/**
 * The browser's real fullscreen, for a timed exam.
 *
 * Distinct from the app's own focus mode: focus mode removes EduFlow's chrome,
 * this removes the browser's — tabs, address bar, bookmarks. Together they
 * leave the paper alone on the screen, which is what an exam room looks like.
 *
 * Entering requires a user gesture, so this exposes a toggle rather than
 * entering on mount. Leaving can happen without one (Escape, F11, the browser's
 * own control), hence the `fullscreenchange` subscription — state read from a
 * local flag instead would drift out of sync the first time a candidate hits
 * Escape.
 */

/** Vendor-prefixed shapes, still needed for Safari. */
interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}
interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

function currentElement(): Element | null {
  if (typeof document === "undefined") return null;
  const d = document as FullscreenDocument;
  return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

export interface FullscreenState {
  /** True while the document is displayed fullscreen. */
  active: boolean;
  /** False when the browser or an embedding page forbids it. */
  supported: boolean;
  toggle: () => void;
}

/**
 * `document.fullscreenEnabled` is not trustworthy on its own: an embedded
 * context can report true and still reject the request ("Permissions check
 * failed"). The only reliable signal is the rejection itself, so a refused
 * request retires the control rather than leaving a button that does nothing.
 */

export function useFullscreen(): FullscreenState {
  const [active, setActive] = React.useState(false);
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    const d = document as FullscreenDocument;
    const el = document.documentElement as FullscreenElement;
    setSupported(
      // `fullscreenEnabled` is false inside an iframe without the allow
      // attribute, which is exactly when the button should not be offered.
      Boolean(d.fullscreenEnabled) &&
        Boolean(el.requestFullscreen || el.webkitRequestFullscreen)
    );
    const sync = () => setActive(!!currentElement());
    sync();
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const toggle = React.useCallback(() => {
    const d = document as FullscreenDocument;
    const el = document.documentElement as FullscreenElement;

    const fail = () => setSupported(false);

    try {
      if (currentElement()) {
        const exiting = d.exitFullscreen?.() ?? d.webkitExitFullscreen?.();
        if (exiting instanceof Promise) exiting.catch(() => {});
        return;
      }
      const entering =
        el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.();
      // Refusal arrives as a rejected promise, not a throw.
      if (entering instanceof Promise) entering.catch(fail);
    } catch {
      fail();
    }
  }, []);

  return { active, supported, toggle };
}
