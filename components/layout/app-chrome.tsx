"use client";

import { RosterGate } from "@/components/layout/roster-gate";
import { useFocusMode } from "@/components/layout/focus-mode";
import { Topbar } from "@/components/layout/topbar";
import { SiteFooter } from "@/components/layout/site-footer";
import type { MenuUser } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

/**
 * The persistent workspace frame: top bar, content column, footer.
 *
 * Client-side because it has to react to focus mode. In focus mode the frame
 * collapses to the bare viewport — the bar and footer are unmounted and the
 * content area drops its gutters and max-width, so a full-screen surface can
 * size itself with `h-full` all the way down. `overflow-hidden` on the shell
 * keeps the page itself from scrolling; panes scroll internally instead.
 */
export function AppChrome({
  user,
  children,
}: {
  user: MenuUser;
  children: React.ReactNode;
}) {
  const { focused } = useFocusMode();

  return (
    <div
      className={cn(
        "canvas-grid flex flex-col",
        focused ? "h-screen overflow-hidden" : "min-h-screen"
      )}
    >
      {!focused && <Topbar user={user} />}
      <main
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col",
          !focused && "mx-auto max-w-7xl px-4 py-8 sm:px-6"
        )}
      >
        <RosterGate>{children}</RosterGate>
      </main>
      {!focused && <SiteFooter />}
    </div>
  );
}
