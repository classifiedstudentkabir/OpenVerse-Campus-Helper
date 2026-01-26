import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const templates = [
  {
    id: "cert-1",
    title: "Template 1",
    description: "Classic certificate layout.",
    image: "/templates/cert_1.png",
  },
  {
    id: "cert-2",
    title: "Template 2",
    description: "Clean border with badge style.",
    image: "/templates/cert_2.png",
  },
  {
    id: "cert-3",
    title: "Template 3",
    description: "Elegant typography and spacing.",
    image: "/templates/cert_3.png",
  },
  {
    id: "cert-4",
    title: "Template 4",
    description: "Modern vibrant styling.",
    image: "/templates/cert_4.webp",
  },
  {
    id: "cert-5",
    title: "Template 5",
    description: "Gold accent design.",
    image: "/templates/cert_5.jpg",
  },
  {
    id: "cert-6",
    title: "Template 6",
    description: "Minimal with strong heading.",
    image: "/templates/cert_6.png",
  },
  {
    id: "cert-7",
    title: "Template 7",
    description: "Formal academic theme.",
    image: "/templates/cert_7.png",
  },
  {
    id: "cert-8",
    title: "Template 8",
    description: "Professional with seal.",
    image: "/templates/cert_8.png",
  },
  {
    id: "cert-9",
    title: "Template 9",
    description: "Gradient award look.",
    image: "/templates/cert_9.png",
  },
  {
    id: "cert-10",
    title: "Template 10",
    description: "Wide modern certificate.",
    image: "/templates/cert_10.png",
  },
  {
    id: "cert-11",
    title: "Template 11",
    description: "Clean serif layout.",
    image: "/templates/cert_11.png",
  },
  {
    id: "cert-12",
    title: "Template 12",
    description: "Minimalist with emblem.",
    image: "/templates/cert_12.png",
  },
  {
    id: "cert-13",
    title: "Template 13",
    description: "Soft color palette.",
    image: "/templates/cert_13.png",
  },
  {
    id: "cert-14",
    title: "Template 14",
    description: "Bold header accent.",
    image: "/templates/cert_14.png",
  },
  {
    id: "cert-15",
    title: "Template 15",
    description: "Formal award certificate.",
    image: "/templates/cert_15.png",
  }
];

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Templates</h1>
          <p className="text-sm text-muted-foreground">
            Choose a base template to customize or start a new batch.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled>
            Import template
          </Button>
          <Button disabled>
            <PlusCircle className="h-4 w-4" />
            New template
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/10">
                <img
                  alt={`${template.title} preview`}
                  className="w-full"
                  src={template.image}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Link
                  className="text-sm text-primary hover:underline"
                  href={`/templates/${template.id}/edit`}
                >
                  Edit template
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
