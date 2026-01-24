import { Download, MailCheck } from "lucide-react";

import { CertificatePlaceholder } from "@/components/certificate-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const recipients = [
  { name: "Taylor Swift", status: "Sent" },
  { name: "Jordan Lee", status: "Queued" },
  { name: "Priya Sharma", status: "Delivered" },
  { name: "Miguel Torres", status: "Processing" }
];

export default function BatchResultsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Batch results</h1>
          <p className="text-sm text-muted-foreground">
            Track delivery status and download final assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled>
            <MailCheck className="h-4 w-4" />
            Resend emails
          </Button>
          <Button disabled>
            <Download className="h-4 w-4" />
            Download ZIP
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recipient status</CardTitle>
            <CardDescription>Delivery summary for this batch.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recipients.map((recipient) => (
                <div
                  key={recipient.name}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm"
                >
                  <span>{recipient.name}</span>
                  <span className="text-muted-foreground">{recipient.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Certificate snapshot</CardTitle>
            <CardDescription>Preview of generated output.</CardDescription>
          </CardHeader>
          <CardContent>
            <CertificatePlaceholder title="Generated certificate" />
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
