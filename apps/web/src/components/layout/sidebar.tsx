import Link from "next/link";
import { LayoutGrid, Layers, UploadCloud, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/templates", label: "Templates", icon: Layers },
  { href: "/batches/new/upload", label: "New batch", icon: UploadCloud },
  { href: "/batches/alpha/results", label: "Results", icon: LayoutGrid },
  { href: "/team", label: "Team", icon: Users }
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-border/60 bg-card/80 px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/templates" className="text-lg font-semibold">
          <span className="text-gradient">CertifyNeo</span>
        </Link>
        <Badge variant="secondary">Beta</Badge>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-3 rounded-xl border border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Need a hand?</p>
        <p>Invite teammates and reuse templates for quick batch generation.</p>
        <button className="text-primary" disabled>
          Learn more
        </button>
      </div>
    </aside>
  );
}
