import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function CertificatePlaceholder({
  className,
  title = "Certificate Preview",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/70 bg-muted/40",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_55%)]" />
      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <BadgeCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">
            Placeholder image will be replaced with live preview.
          </p>
        </div>
      </div>
    </div>
  );
}
