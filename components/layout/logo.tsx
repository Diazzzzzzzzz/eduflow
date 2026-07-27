import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Product wordmark.
 *
 * The mark is the uploaded brand logo (transparent PNG), so it sits on any
 * header colour and reads the same in both themes. `priority` because it is
 * above the fold on every page.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/eduflow-logo.png"
        alt="EduFlow"
        width={36}
        height={36}
        priority
        className="h-9 w-9 shrink-0 object-contain"
      />
      <div className="hidden leading-tight min-[400px]:block">
        <p className="font-display text-sm font-bold tracking-tight">
          EduFlow
        </p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          IELTS Analytics
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
