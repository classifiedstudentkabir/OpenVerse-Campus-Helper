"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Layers, Monitor, Smartphone, Tablet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const templates = [
  { id: "cert-1", title: "Template 1", image: "/templates/cert_1.png" },
  { id: "cert-2", title: "Template 2", image: "/templates/cert_2.png" },
  { id: "cert-3", title: "Template 3", image: "/templates/cert_3.png" },
  { id: "cert-4", title: "Template 4", image: "/templates/cert_4.webp" },
  { id: "cert-5", title: "Template 5", image: "/templates/cert_5.jpg" },
  { id: "cert-6", title: "Template 6", image: "/templates/cert_6.png" },
  { id: "cert-7", title: "Template 7", image: "/templates/cert_7.png" },
  { id: "cert-8", title: "Template 8", image: "/templates/cert_8.png" },
];

export default function EditorPage() {
  const [activeTemplateId, setActiveTemplateId] = useState(templates[0].id);
  const [forceDesktop, setForceDesktop] = useState(false);

  const activeTemplate = useMemo(
    () => templates.find((item) => item.id === activeTemplateId) ?? templates[0],
    [activeTemplateId]
  );

  useEffect(() => {
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

  const handleExport = () => {
    const name = window.prompt("Save as (PDF name):", activeTemplate.title) || "certificate";
    if (!name) return;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>${name}</title></head>
        <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff;">
          <img src="${activeTemplate.image}" style="max-width:95%;max-height:95%;" />
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6 px-6 py-6">
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
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground">
            <Monitor className="h-4 w-4" />
            <Tablet className="h-4 w-4" />
            <Smartphone className="h-4 w-4" />
          </div>
          <Button onClick={handleExport}>
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
              <CardTitle className="text-sm">Templates</CardTitle>
            </CardHeader>
            <CardContent className="max-h-56 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                {templates.map((item) => (
                  <button
                    key={item.id}
                    className={`rounded-lg border border-border/60 p-1 ${
                      activeTemplateId === item.id ? "bg-muted" : "bg-muted/30"
                    }`}
                    onClick={() => setActiveTemplateId(item.id)}
                  >
                    <img src={item.image} alt={item.title} className="h-12 w-full rounded-md object-cover" />
                  </button>
                ))}
              </div>
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
          <div className="flex h-[420px] w-full max-w-[680px] items-center justify-center rounded-2xl border border-dashed border-border/60 bg-white/70 p-4 text-sm text-muted-foreground">
            <img src={activeTemplate.image} alt={activeTemplate.title} className="max-h-full w-full object-contain" />
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
                <div
                  key={layer}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2"
                >
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
