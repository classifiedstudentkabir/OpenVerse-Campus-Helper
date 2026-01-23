import type { ReactNode } from "react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <Link href="/templates" className="text-xl font-semibold">
            <span className="text-gradient">CertifyNeo</span>
          </Link>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center pb-16">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/80 p-8 shadow-lg backdrop-blur">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
