import { cn } from "@/lib/utils";

/** Wordmark with the pulse-line motif — a band trajectory as an EKG. */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          aria-hidden
        >
          <path
            d="M2 14h4l2.5-7 3.5 10 3-6.5 1.5 3.5H22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="hidden leading-tight min-[400px]:block">
        <p className="font-display text-sm font-bold tracking-tight">
          IELTS Pulse
        </p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          от EduFlow
        </p>
      </div>
    </div>
  );
}

/**
 * White-label slot: the language center's own identity in the header.
 * Swap monogram + name per tenant once real branding uploads exist.
 */
export function CenterBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-border/80 bg-card py-1 pl-1 pr-3 shadow-sm",
        className
      )}
      title="Astana English Academy — партнёрский центр"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
        AE
      </span>
      <span className="hidden text-xs font-medium text-secondary-foreground lg:inline">
        Astana English Academy
      </span>
    </div>
  );
}
