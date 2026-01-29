"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Download, MailCheck } from "lucide-react";

import { CertificatePlaceholder } from "@/components/certificate-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type BatchStatus = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed" | string;
  generatedCount: number;
  totalCount: number;
  zipFile?: string | null;
  zipUrl?: string | null;
  items?: string[];
  error?: string | null;
  sample?: string | null;
};

export default function BatchResultsPage() {
  const params = useParams();
  const batchId = params?.id as string;
  const [batch, setBatch] = useState<BatchStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = batch?.status === "processing" || batch?.status === "pending";

  const recipients = useMemo(() => {
    if (!batch?.items?.length) return [];
    return batch.items.map((file) => ({ name: file, status: batch.status }));
  }, [batch?.items, batch?.status]);

  useEffect(() => {
    if (!batchId) return;
    let timer: NodeJS.Timeout | null = null;

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:3000/api/batches/${batchId}/status`);
        if (!response.ok) {
          throw new Error("Failed to load batch status.");
        }
        const data = (await response.json()) as BatchStatus;
        setBatch(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load batch status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    if (isProcessing) {
      timer = setInterval(fetchStatus, 2500);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [batchId, isProcessing]);

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
          <Button
            disabled={!batch?.zipUrl || batch.status !== "completed"}
            onClick={() => {
              if (batch?.zipUrl) {
                window.location.href = `http://localhost:3000${batch.zipUrl}`;
              }
            }}
          >
            <Download className="h-4 w-4" />
            {isProcessing ? "Preparing ZIP..." : "Download ZIP"}
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
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-5/6" />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <div className="space-y-3">
                {recipients.length ? (
                  recipients.map((recipient) => (
                    <div
                      key={recipient.name}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm"
                    >
                      <span>{recipient.name}</span>
                      <span className="text-muted-foreground">
                        {batch?.status === "completed" ? "Completed" : batch?.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {batch?.status === "failed"
                      ? batch.error || "Batch failed."
                      : "No recipients generated yet."}
                  </p>
                )}
                {batch ? (
                  <p className="text-xs text-muted-foreground">
                    Generated {batch.generatedCount}/{batch.totalCount}
                  </p>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Certificate snapshot</CardTitle>
            <CardDescription>Preview of generated output.</CardDescription>
          </CardHeader>
          <CardContent>
            {batch?.sample ? (
              <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/10">
                <img
                  alt="Generated certificate"
                  className="w-full"
                  src={`http://localhost:3000${batch.sample}`}
                />
              </div>
            ) : (
              <CertificatePlaceholder title="Generated certificate" />
            )}
            {isProcessing ? (
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
