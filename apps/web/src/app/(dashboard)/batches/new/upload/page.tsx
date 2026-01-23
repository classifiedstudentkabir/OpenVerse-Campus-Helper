"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

import { BatchStepper } from "@/components/batches/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const SAMPLE_HEADERS = ["name", "email", "event", "date", "grade"];

export default function BatchUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectedHeaders = headers.length ? headers : SAMPLE_HEADERS;

  const canContinue = headers.length > 0 && rowCount !== null;

  const helperCopy = useMemo(() => {
    if (loading) return "Analyzing your file...";
    if (headers.length) return `Detected ${headers.length} columns.`;
    return "Upload CSV/XLSX to detect headers and row count.";
  }, [headers.length, loading]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:3000/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed. Please check the API server.");
      }

      const data = (await response.json()) as {
        headers: string[];
        rowCount: number;
      };

      setHeaders(data.headers ?? []);
      setRowCount(data.rowCount ?? 0);
      sessionStorage.setItem(
        "certifyneo-upload",
        JSON.stringify({ headers: data.headers, rowCount: data.rowCount })
      );
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">New batch</h1>
        <p className="text-sm text-muted-foreground">
          Upload participant data to auto-detect fields and prepare certificate mapping.
        </p>
      </div>

      <BatchStepper current="/batches/new/upload" />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upload recipients</CardTitle>
            <CardDescription>{helperCopy}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border/70 bg-muted/30 p-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <UploadCloud className="h-5 w-5 text-primary" />
                Drag & drop your CSV here (or browse)
              </div>
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleUpload} disabled={!file || loading}>
                  {loading ? "Uploading..." : "Upload file"}
                </Button>
                <Button variant="outline" disabled>
                  Use sample data
                </Button>
              </div>
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-border/60 bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-base">Detected headers</CardTitle>
                  <CardDescription>Preview of the available columns.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {detectedHeaders.map((header) => (
                        <span
                          key={header}
                          className="rounded-full border border-border/60 bg-background px-2.5 py-1"
                        >
                          {header}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-base">Rows found</CardTitle>
                  <CardDescription>Total recipients detected.</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-24" />
                  ) : (
                    <p className="text-3xl font-semibold">
                      {rowCount ?? 0}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next steps</CardTitle>
            <CardDescription>Ensure your data is ready.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="font-medium text-foreground">Checklist</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>CSV contains recipient names and event titles.</li>
                <li>Optional fields include grade, date, and signature.</li>
                <li>Ensure each row is unique.</li>
              </ul>
            </div>
            <Button
              className="w-full"
              disabled={!canContinue}
              onClick={() => router.push("/batches/new/map")}
            >
              Continue to mapping
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
