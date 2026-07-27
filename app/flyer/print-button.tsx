"use client";

import { Printer } from "lucide-react";

/** Opens the browser print dialog; hidden on the printed sheet itself. */
export function PrintButton({ color }: { color: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
      style={{ background: color }}
    >
      <Printer className="h-3.5 w-3.5" />
      Печать / Сохранить в PDF
    </button>
  );
}
