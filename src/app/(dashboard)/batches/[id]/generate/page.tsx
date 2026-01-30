
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGeneratedBatchById, type GeneratedBatch } from "@/lib/storage";

type PageProps = {
  params: { id: string };
};

function TimeClientOnly({ iso }: { iso: string }) {
  const [clientTime, setClientTime] = useState("");
  useEffect(() => {
    setClientTime(new Date(iso).toLocaleString());
  }, [iso]);
  return <>{clientTime || "—"}</>;
}

export default function GeneratePage({ params }: PageProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [batchData, setBatchData] = useState<GeneratedBatch | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    // Read batch data from localStorage using centralized storage
    if (typeof window !== "undefined") {
      const batch = getGeneratedBatchById(params.id);
      setBatchData(batch);

      if (!batch) {
        console.error("[Generate] Batch not found:", params.id);
      }
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return prev;
        }
        return Math.min(100, prev + Math.random() * 30);
      });
    }, 300);

    // Complete generation after 2-3 seconds
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setIsComplete(true);
      clearInterval(progressInterval);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [params.id]);

  const handleDownloadZip = async () => {
    setDownloadError(null);

    if (!batchData) {
      setDownloadError("Batch data not found.");
      return;
    }

    if (!batchData.recipients || batchData.recipients.length === 0) {
      setDownloadError("No recipients found in this batch.");
      return;
    }

    try {
      const JSZip = (await import("jszip")).default;
      const { jsPDF } = await import("jspdf");

      // Get background image as base64
      async function getImageBase64(url: string): Promise<string> {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const bgBase64 = await getImageBase64(batchData.templateImage);
      const zip = new JSZip();

      // Get name field mapping key
      const nameColumnKey = batchData.mapping.name;
      const nameFieldConfig = batchData.fieldConfig.fields.name || {
        x: 380,
        y: 300,
        fontSize: 40,
        color: "#111111",
        align: "center" as const,
      };

      // Generate PDF for each recipient
      let pdfCount = 0;
      for (let i = 0; i < batchData.recipients.length; i++) {
        const recipient = batchData.recipients[i];
        const recipientName = recipient[nameColumnKey] || `Recipient ${i + 1}`;

        try {
          // Create PDF (landscape A4)
          const doc = new jsPDF({
            orientation: "landscape",
            unit: "pt",
            format: "a4",
          });
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();

          // Add background image
          doc.addImage(bgBase64, "PNG", 0, 0, pageWidth, pageHeight);

          // Add recipient name
          doc.setFontSize(nameFieldConfig.fontSize || 40);
          doc.setTextColor(nameFieldConfig.color || "#111111");
          doc.setFont("Georgia");

          const x = nameFieldConfig.x || 380;
          const y = nameFieldConfig.y || 300;
          const align = (nameFieldConfig.align || "center") as "left" | "center" | "right";

          doc.text(recipientName, x, y, { align });

          // Add PDF to ZIP
          const pdfBlob = doc.output("blob");
          const sanitizedName = recipientName.replace(/[^a-zA-Z0-9_-]/g, "_");
          const fileName = `${sanitizedName}_cert_${i + 1}.pdf`;
          zip.file(fileName, pdfBlob);
          pdfCount++;

          console.log(`[Generate] Added PDF ${i + 1}/${batchData.recipients.length}: ${fileName}`);
        } catch (err) {
          console.error(`[Generate] Error creating PDF for recipient ${i}:`, err);
        }
      }

      // Check ZIP is not empty
      if (pdfCount === 0) {
        setDownloadError("Failed to generate any PDFs. Please try again.");
        return;
      }

      console.log(`[Generate] ZIP contains ${pdfCount} PDFs`);

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Use file-saver
      try {
        const { saveAs } = await import("file-saver");
        saveAs(zipBlob, `batch_${params.id}_certificates.zip`);
        console.log("[Generate] ZIP downloaded successfully");
      } catch (err) {
        // Fallback: native download
        console.warn("[Generate] file-saver failed, using native download:", err);
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `batch_${params.id}_certificates.zip`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to download ZIP";
      setDownloadError(message);
      console.error("[Generate] Download error:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Generating certificates</h1>
        <p className="text-sm text-muted-foreground">
          Please wait while we generate certificates for your batch
        </p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Progress</CardTitle>
          <CardDescription>Processing your batch</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Generating {batchData?.rowCount || 0} certificate{batchData?.rowCount !== 1 ? "s" : ""}…
              </span>
              <span className="font-medium">{Math.min(100, Math.max(0, Math.round(progress)))}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>

          {/* Completion Message */}
          {isComplete && (
            <div className="rounded-lg border border-green-200/50 bg-green-50 p-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-green-900">Generation complete!</p>
                  <p className="text-sm text-green-700">
                    {batchData?.rowCount || 0} certificate{batchData?.rowCount !== 1 ? "s" : ""} ready for download
                  </p>
                </div>
              </div>
            </div>
          )}

          {downloadError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{downloadError}</p>
            </div>
          )}

          {/* Action Buttons */}
          {isComplete && (
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                onClick={() => router.push(`/batches/${params.id}/results`)}
              >
                View results
              </Button>
              <Button
                className="flex-1"
                variant="outline"
                onClick={handleDownloadZip}
              >
                Download ZIP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Details */}
      {batchData && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batch ID</span>
              <span className="font-medium">{batchData.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Certificate count</span>
              <span className="font-medium">{batchData.rowCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created at</span>
              <span className="font-medium text-xs">
                <TimeClientOnly iso={batchData.createdAtISO} />
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
