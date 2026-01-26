import Link from "next/link";
import { ArrowLeft, Download, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const templates = [
  { id: "cert-1", title: "Template 1", description: "Classic certificate layout.", image: "/templates/cert_1.png" },
  { id: "cert-2", title: "Template 2", description: "Clean border with badge style.", image: "/templates/cert_2.png" },
  { id: "cert-3", title: "Template 3", description: "Elegant typography and spacing.", image: "/templates/cert_3.png" },
  { id: "cert-4", title: "Template 4", description: "Modern vibrant styling.", image: "/templates/cert_4.webp" },
  { id: "cert-5", title: "Template 5", description: "Gold accent design.", image: "/templates/cert_5.jpg" },
  { id: "cert-6", title: "Template 6", description: "Minimal with strong heading.", image: "/templates/cert_6.png" },
  { id: "cert-7", title: "Template 7", description: "Formal academic theme.", image: "/templates/cert_7.png" },
  { id: "cert-8", title: "Template 8", description: "Professional with seal.", image: "/templates/cert_8.png" },
  { id: "cert-9", title: "Template 9", description: "Gradient award look.", image: "/templates/cert_9.png" },
  { id: "cert-10", title: "Template 10", description: "Wide modern certificate.", image: "/templates/cert_10.png" },
  { id: "cert-11", title: "Template 11", description: "Clean serif layout.", image: "/templates/cert_11.png" },
  { id: "cert-12", title: "Template 12", description: "Minimalist with emblem.", image: "/templates/cert_12.png" },
  { id: "cert-13", title: "Template 13", description: "Soft color palette.", image: "/templates/cert_13.png" },
  { id: "cert-14", title: "Template 14", description: "Bold header accent.", image: "/templates/cert_14.png" },
  { id: "cert-15", title: "Template 15", description: "Formal award certificate.", image: "/templates/cert_15.png" },
];

type PageProps = {
  params: { id: string };
};

export default function TemplatePreviewPage({ params }: PageProps) {
  const template = templates.find((item) => item.id === params.id) ?? templates[0];
  const recommended = templates.filter((item) => item.id !== template.id).slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/templates" className="text-sm text-muted-foreground">
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Back to templates
        </Link>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
          <img
            alt={template.title}
            src={template.image}
            className="w-full rounded-2xl border border-border/60 bg-muted/10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{template.title}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Bulk support</span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">Dynamic fields</span>
            </div>
            <Link href={`/editor?template=${template.id}`}>
              <Button className="w-full">
                <Pencil className="h-4 w-4" />
                Edit design
              </Button>
            </Link>
            <Button className="w-full" variant="outline" disabled>
              <Download className="h-4 w-4" />
              Sample download
            </Button>

            <div className="space-y-2 pt-4 text-xs text-muted-foreground">
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Template specifications</p>
              <div className="flex items-center justify-between">
                <span>Standard size</span>
                <span className="font-medium text-foreground">US Letter / A4</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Print quality</span>
                <span className="font-medium text-foreground">300 DPI</span>
              </div>
              <div className="flex items-center justify-between">
                <span>File format</span>
                <span className="font-medium text-foreground">PNG / PDF</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Recommended for you</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((item) => (
            <Link
              key={item.id}
              href={`/templates/${item.id}`}
              className="rounded-2xl border border-border/60 bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <img
                alt={item.title}
                src={item.image}
                className="w-full rounded-xl border border-border/60 bg-muted/10"
              />
              <p className="mt-2 text-xs font-medium text-muted-foreground">{item.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
