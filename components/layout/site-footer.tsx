/** White-label footer with the "Powered by EduFlow" attribution badge. */
export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-8 pt-4 sm:px-6">
      <p className="text-xs text-muted-foreground" suppressHydrationWarning>
        © {new Date().getFullYear()} Astana English Academy
      </p>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-gradient-to-b from-card to-secondary px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-primary" aria-hidden>
          <path
            d="M2 14h4l2.5-7 3.5 10 3-6.5 1.5 3.5H22"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Работает на EduFlow
      </span>
    </footer>
  );
}
