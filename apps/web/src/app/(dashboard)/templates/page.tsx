import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { CertificatePlaceholder } from "@/components/certificate-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const templates = [
  {
    id: "neo-launch",
    title: "Neo Launch",
    description: "Premium gradient with holographic seal.",
  },
  {
    id: "campus-awards",
    title: "Campus Awards",
    description: "Clean geometry with bold serif headline.",
  },
  {
    id: "tech-summit",
    title: "Tech Summit",
    description: "Minimalist modern layout for events.",
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

      <div className="grid gap-6 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CertificatePlaceholder title="Template preview" />
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
