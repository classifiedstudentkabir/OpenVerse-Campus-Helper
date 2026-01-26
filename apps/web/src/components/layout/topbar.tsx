"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Monitor, Search, Smartphone, X } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/templates", label: "Templates" },
  { href: "/batches/new/upload", label: "New batch" },
  { href: "/batches/alpha/results", label: "Results" },
  { href: "/team", label: "Team" }
];

export function Topbar() {
  const [forceDesktop, setForceDesktop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground lg:hidden"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="relative hidden md:block">
          <button
            className="flex items-center gap-3 rounded-full border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <img
              src="/avatars/user.svg"
              alt="User avatar"
              className="h-8 w-8 rounded-full border border-border/60"
            />
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-semibold text-foreground">Kabir</span>
              <span className="text-[10px]">Owner</span>
            </div>
          </button>
          {profileOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-border/60 bg-card p-2 text-xs text-muted-foreground shadow-lg">
              <div className="flex items-center gap-2 rounded-lg px-2 py-2">
                <img
                  src="/avatars/user.svg"
                  alt="User avatar"
                  className="h-9 w-9 rounded-full border border-border/60"
                />
                <div>
                  <p className="text-[11px] font-semibold text-foreground">Kabir</p>
                  <p className="text-[10px] text-muted-foreground">kabir@example.com</p>
                </div>
              </div>
              <div className="mt-2 space-y-1">
                <Link
                  href="/settings"
                  className="block w-full rounded-lg px-2 py-1 text-left hover:bg-muted"
                  onClick={() => setProfileOpen(false)}
                >
                  Account settings
                </Link>
                <button className="w-full rounded-lg px-2 py-1 text-left hover:bg-muted" disabled>
                  Billing & plans
                </button>
                <button className="w-full rounded-lg px-2 py-1 text-left hover:bg-muted" disabled>
                  Teams
                </button>
                <button className="w-full rounded-lg px-2 py-1 text-left hover:bg-muted" disabled>
                  Help & resources
                </button>
                <button className="w-full rounded-lg px-2 py-1 text-left hover:bg-muted" disabled>
                  Log out
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {menuOpen ? (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur">
          <div className="absolute right-4 top-4">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground"
              onClick={() => setMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mx-auto mt-20 w-11/12 max-w-xs rounded-2xl border border-border/60 bg-card p-4 shadow-lg">
            <p className="text-sm font-semibold text-foreground">Menu</p>
            <nav className="mt-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
