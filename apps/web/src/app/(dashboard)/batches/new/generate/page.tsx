import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

import { BatchStepper } from "@/components/batches/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BatchGeneratePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Generate batch</h1>
        <p className="text-sm text-muted-foreground">
          Certificates are queued for rendering. Monitor progress below.
        </p>
      </div>

      <BatchStepper current="/batches/new/generate" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generation status</CardTitle>
            <CardDescription>Rendering pipeline will start in Phase 3.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Waiting for generation job to start.
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
            <Button disabled>Download ZIP</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
            <CardDescription>Distribution is automated after render.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-4">
              <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
              <p>We will email recipients once certificates are generated.</p>
            </div>
            <Link className="text-primary hover:underline" href="/batches/new/preview">
              View batch results
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
