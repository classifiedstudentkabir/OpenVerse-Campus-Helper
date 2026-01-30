"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, UploadCloud } from "lucide-react";

import { BatchStepper } from "@/components/batches/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { parseAndStoreFile } from "@/lib/file-parser";
import { setUploadRows, setParsedHeaders } from "@/lib/storage";

export default function BatchUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectedHeaders = headers;

  const canContinue = headers.length > 0 && rowCount !== null && rowCount > 0;

  const helperCopy = useMemo(() => {
    if (loading) return "Analyzing your file...";
    if (error) return "Upload failed. Please try again or use CSV format.";
    if (headers.length) return `Detected ${headers.length} columns and ${rowCount || 0} rows.`;
    return "Upload CSV or XLSX file to detect headers and row count.";
  }, [headers.length, loading, error, rowCount]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      // Parse file on client-side
      const parseResult = await parseAndStoreFile(file);

      // Validate result
      if (!parseResult.rows || parseResult.rows.length === 0) {
        throw new Error("CSV file is empty or has no valid rows. Please check your file format.");
      }
      if (!parseResult.headers || parseResult.headers.length === 0) {
        throw new Error("CSV file has no headers. First row must contain column names.");
      }

      // Store using centralized storage contract
      setUploadRows(parseResult.rows);
      setParsedHeaders(parseResult.headers);

      // Update UI
      setHeaders(parseResult.headers);
      setRowCount(parseResult.rows.length);

      console.log("[Upload] Saved uploadRows:", parseResult.rows);
      console.log("[Upload] Row count:", parseResult.rows.length);
      console.log("[Upload] Headers:", parseResult.headers);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed";
      setError(message);
      console.error("[Upload] Error:", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Bulk Certificate Generator</h1>
        <p className="text-sm text-muted-foreground">
          Upload participant data (CSV or Excel) to generate certificates for multiple recipients at once.
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
                Drag & drop your CSV or Excel file here (or browse)
              </div>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleUpload} disabled={!file || loading}>
                  {loading ? "Uploading..." : "Upload file"}
                </Button>
              </div>
            </div>
            {error ? (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm text-destructive">{error}</div>
              </div>
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
                  ) : headers.length > 0 ? (
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {headers.map((header) => (
                        <span
                          key={header}
                          className="rounded-full border border-border/60 bg-background px-2.5 py-1"
                        >
                          {header}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No file uploaded yet</p>
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
              <p className="font-medium text-foreground">Format requirements</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>First column must contain recipient names.</li>
                <li>Include event title or organization name.</li>
                <li>Optional fields: date, certificate ID, grade.</li>
                <li>Each row should be unique.</li>
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
