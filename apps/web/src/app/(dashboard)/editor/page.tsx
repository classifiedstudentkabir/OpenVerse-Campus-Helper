import Link from "next/link";
import { ArrowLeft, Download, Layers, Monitor, Smartphone, Tablet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditorPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/templates" className="text-sm text-muted-foreground">
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Premium Certificate Builder</h1>
            <p className="text-xs text-muted-foreground">Batch 2023 • Saved</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground">
            <Monitor className="h-4 w-4" />
            <Tablet className="h-4 w-4" />
            <Smartphone className="h-4 w-4" />
          </div>
          <Button>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr_280px]">
        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Layout presets</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <button className="rounded-lg border border-border/60 bg-muted/40 px-2 py-3">Winner</button>
              <button className="rounded-lg border border-border/60 bg-muted/40 px-2 py-3">Complete</button>
              <button className="rounded-lg border border-border/60 bg-muted/40 px-2 py-3">Participate</button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Elements</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="rounded-lg border border-border/60 bg-muted/40 px-2 py-3 text-center">Badges</div>
              <div className="rounded-lg border border-border/60 bg-muted/40 px-2 py-3 text-center">Ribbons</div>
              <div className="rounded-lg border border-border/60 bg-muted/40 px-2 py-3 text-center">Frames</div>
              <div className="rounded-lg border border-border/60 bg-muted/40 px-2 py-3 text-center">Patterns</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2">Font family</div>
              <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2">Size</div>
              <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2">Color</div>
            </CardContent>
          </Card>
        </aside>

        <main className="flex items-center justify-center rounded-3xl border border-border/60 bg-gradient-to-br from-violet-200/40 via-indigo-200/40 to-purple-200/40 p-8">
          <div className="flex h-[420px] w-full max-w-[680px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-white/70 text-sm text-muted-foreground">
            Certificate canvas preview
          </div>
        </main>

        <aside>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Layers</CardTitle>
              <button className="rounded-full border border-border/60 p-1 text-muted-foreground">
                <Layers className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {[
                "Recipient name",
                "Certificate title",
                "Body text",
                "Gold seal",
                "Background",
              ].map((layer) => (
                <div key={layer} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
                  <span>{layer}</span>
                  <span className="text-[10px]">•••</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
