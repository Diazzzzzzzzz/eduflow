import { cn } from "@/lib/utils";
import { bandTone, formatBand, type BandTone } from "@/lib/band";

const TONE_CLASSES: Record<BandTone, string> = {
  success: "bg-success/15 text-success ring-success/30",
  primary: "bg-primary/15 text-primary ring-primary/30",
  warning: "bg-warning/15 text-warning ring-warning/30",
  muted: "bg-secondary text-muted-foreground ring-border",
};

interface BandChipProps {
  band: number;
  target?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * The signature score unit of EduFlow: a tabular-numeral band chip
 * whose tone encodes distance from the student's target band.
 */
export function BandChip({ band, target, size = "md", className }: BandChipProps) {
  return (
    <span
      className={cn(
        "tabular inline-flex items-center justify-center rounded-md font-display font-semibold ring-1 ring-inset",
        size === "sm" && "h-6 min-w-9 px-1.5 text-xs",
        size === "md" && "h-7 min-w-11 px-2 text-sm",
        // Serif numerals give the hero chip its diploma-like accent
        size === "lg" && "h-10 min-w-16 px-3 font-serif text-2xl font-medium",
        TONE_CLASSES[bandTone(band, target)],
        className
      )}
    >
      {formatBand(band)}
    </span>
  );
}
