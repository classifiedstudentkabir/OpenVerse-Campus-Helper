"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ImageIcon } from "lucide-react";

import { BatchStepper } from "@/components/batches/stepper";
import { CertificatePlaceholder } from "@/components/certificate-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FALLBACK_ROW = {
  name: "Binod",
  event: "Campus Hackathon",
  date: new Date().toISOString(),
  certificate_id: "CERT-001",
};

export default function BatchPreviewPage() {
  const router = useRouter();
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<{ rowCount: number; filename: string | null }>(
    { rowCount: 0, filename: null }
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem("certifyneo-upload");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { rowCount?: number; filename?: string };
          setSummary({ rowCount: parsed.rowCount ?? 0, filename: parsed.filename ?? null });
        } catch {
          setSummary({ rowCount: 0, filename: null });
        }
      }
    }

    const loadPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3000/api/render/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: "default-1",
            rowData: FALLBACK_ROW,
          }),
        });

        if (!response.ok) {
          throw new Error("Preview API failed. Is the backend running?");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        previewUrlRef.current = url;
        setPreviewSrc(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const handleGenerate = async () => {
    console.log("Generate batch clicked");
    if (!summary.filename) {
      setError("Missing upload filename. Please re-upload your CSV/XLSX.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const savedMapping = sessionStorage.getItem("certifyneo-mapping");
    const mapping = savedMapping ? JSON.parse(savedMapping) : {};

    try {
      let batchId = sessionStorage.getItem("certifyneo-batchId");

      if (!batchId) {
        const createResponse = await fetch("http://localhost:3000/api/batches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: summary.filename,
            templateId: "default-1",
            mapping,
          }),
        });

        if (!createResponse.ok) {
          const errorBody = await createResponse.json().catch(() => ({}));
          throw new Error(errorBody.error || "Failed to create batch.");
        }

        const created = (await createResponse.json()) as { batchId?: string };
        if (!created.batchId) {
          throw new Error("Batch ID missing from create response.");
        }
        batchId = created.batchId;
        sessionStorage.setItem("certifyneo-batchId", batchId);
      }

      const generateResponse = await fetch(
        `http://localhost:3000/api/batches/${batchId}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: summary.filename,
            templateId: "default-1",
            mapping,
          }),
        }
      );

      if (!generateResponse.ok) {
        const errorBody = await generateResponse.json().catch(() => ({}));
        throw new Error(errorBody.error || "Failed to generate batch.");
      }

      router.push(`/batches/${batchId}/results`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate batch");
    } finally {
      setIsGenerating(false);
    }
  };

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
            <CardDescription>
              {loading ? "Generating preview..." : "Preview from render API"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewSrc ? (
              <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/10">
                <img alt="Certificate preview" className="w-full" src={previewSrc} />
              </div>
            ) : (
              <CertificatePlaceholder title="Preview image placeholder" />
            )}
            {error ? (
              <p className="mt-4 text-xs text-destructive">{error}</p>
            ) : (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                Preview uses the default template and sample data.
              </div>
            )}
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
              Ready to generate {summary.rowCount || 0} certificates.
            </div>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={!summary.filename || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate batch"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
