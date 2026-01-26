"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Monitor, Search, Smartphone } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const [forceDesktop, setForceDesktop] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const viewportContent = forceDesktop
      ? "width=1024, initial-scale=1"
      : "width=device-width, initial-scale=1";

    if (forceDesktop) {
      root.classList.add("force-desktop");
    } else {
      root.classList.remove("force-desktop");
    }

    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", viewportContent);
  }, [forceDesktop]);

  return (
    <header className="flex flex-col gap-4 border-b border-border/60 bg-background/80 px-6 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Link href="/templates" className="text-lg font-semibold lg:hidden">
          <span className="text-gradient">CertifyNeo</span>
        </Link>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="w-72 pl-9" placeholder="Search templates or batches" disabled />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border/60 bg-card px-3 text-xs font-medium text-foreground"
          onClick={() => setForceDesktop((prev) => !prev)}
        >
          {forceDesktop ? (
            <Smartphone className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
          {forceDesktop ? "Mobile view" : "Desktop view"}
        </button>
        <ThemeToggle />
        <div className="hidden items-center gap-3 rounded-full border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground md:flex">
          <span className="font-medium text-foreground">Kabir</span>
          <span>Owner</span>
        </div>
      </div>
    </header>
  );
}
