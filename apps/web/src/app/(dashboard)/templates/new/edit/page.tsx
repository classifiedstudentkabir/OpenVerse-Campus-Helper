import Link from "next/link";
import { ArrowLeft, Palette, SlidersHorizontal } from "lucide-react";

import { CertificatePlaceholder } from "@/components/certificate-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TemplateCreatePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/templates" className="text-sm text-muted-foreground">
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back to templates
          </Link>
          <h1 className="text-2xl font-semibold">Create new template</h1>
          <p className="text-sm text-muted-foreground">
            Start a fresh certificate design and save it for batches.
          </p>
        </div>
        <Button disabled>Create template</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
            <CardDescription>Interactive editor coming soon.</CardDescription>
          </CardHeader>
          <CardContent>
            <CertificatePlaceholder title="Template canvas" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template settings</CardTitle>
            <CardDescription>Set defaults for certificate generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template name</label>
              <Input placeholder="New certificate template" disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Add a short description" disabled />
            </div>
            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Brand colors
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary" />
                <div className="h-8 w-8 rounded-full bg-accent" />
                <div className="h-8 w-8 rounded-full bg-secondary" />
              </div>
            </div>
            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Layout controls
              </div>
              <p className="text-muted-foreground">
                Adjust margins, seals, and signature placement in Phase 3.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
