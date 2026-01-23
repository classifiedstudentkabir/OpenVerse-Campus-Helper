import Link from "next/link";

import { cn } from "@/lib/utils";

const steps = [
  { href: "/batches/new/upload", label: "Upload" },
  { href: "/batches/new/map", label: "Map fields" },
  { href: "/batches/new/preview", label: "Preview" },
  { href: "/batches/new/generate", label: "Generate" }
];

export function BatchStepper({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-sm">
      {steps.map((step, index) => (
        <Link
          key={step.href}
          href={step.href}
          className={cn(
            "rounded-full px-4 py-2 text-muted-foreground transition",
            current === step.href && "bg-primary text-primary-foreground shadow"
          )}
        >
          <span className="mr-2 text-xs opacity-70">0{index + 1}</span>
          {step.label}
        </Link>
      ))}
    </div>
  );
}
