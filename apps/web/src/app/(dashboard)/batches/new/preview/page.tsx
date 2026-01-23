import { BadgeCheck, ImageIcon } from "lucide-react";

import { BatchStepper } from "@/components/batches/stepper";
import { CertificatePlaceholder } from "@/components/certificate-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BatchPreviewPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Preview certificates</h1>
        <p className="text-sm text-muted-foreground">
          Confirm your mapping before generating the full batch.
        </p>
      </div>

      <BatchStepper current="/batches/new/preview" />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Preview image</CardTitle>
            <CardDescription>Awaiting Phase 2 preview endpoint.</CardDescription>
          </CardHeader>
          <CardContent>
            <CertificatePlaceholder title="Preview image placeholder" />
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              This box will render a preview image from the backend API.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batch summary</CardTitle>
            <CardDescription>Review before generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="font-medium text-foreground">Mapped fields</p>
              <ul className="mt-2 space-y-1">
                <li>Name → name</li>
                <li>Event → event</li>
                <li>Date → date</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-4">
              <BadgeCheck className="h-4 w-4 text-primary" />
              Ready to generate 120 certificates.
            </div>
            <Button className="w-full" disabled>
              Generate batch
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
