"use client";

import * as React from "react";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Embedded PDF viewer.
 *
 * Uses the browser's built-in PDF plugin through an <object>, which keeps the
 * bundle free of a PDF rendering library. Browsers that decline to render it
 * inline (notably iOS Safari) fall through to the child content, so the
 * download and open-in-tab actions are always reachable.
 */
export function PdfViewer({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [loading, setLoading] = React.useState(true);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative overflow-hidden rounded-lg border bg-secondary/30">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Загружаем документ…
          </div>
        )}
        <object
          data={`${url}#view=FitH`}
          type="application/pdf"
          title={title}
          onLoad={() => setLoading(false)}
          className="h-[58vh] min-h-[360px] w-full"
        >
          {/* Shown when the browser won't display PDFs inline. */}
          <div className="flex h-[58vh] min-h-[360px] flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium">Просмотр недоступен в этом браузере</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Откройте документ в новой вкладке или скачайте его.
              </p>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Открыть {title}
            </a>
          </div>
        </object>
      </div>

      {/* Button has no `asChild`, so links carry the variant classes directly. */}
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ExternalLink /> Открыть в новой вкладке
        </a>
        <a
          href={url}
          download
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <Download /> Скачать
        </a>
      </div>
    </div>
  );
}
