"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ImageIcon } from "lucide-react";

import { BatchStepper } from "@/components/batches/stepper";
import { CertificatePlaceholder } from "@/components/certificate-placeholder";
import { TemplateEditor } from "@/components/template-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getUploadRows,
  getFieldMapping,
  getTemplateFieldConfig,
  getTemplateImage,
  setTemplateFieldConfig,
  setTemplateImage,
  addGeneratedBatch,
  clearSessionData,
  type UploadRow,
  type FieldMapping,
  type GeneratedBatch,
} from "@/lib/storage";

const FALLBACK_ROW: UploadRow = {
  name: "Binod",
  event: "Campus Hackathon",
  organization: "GDG Campus",
  date: new Date().toISOString(),
  certificate_id: "CERT-001",
  role: "Participant",
};

export default function BatchPreviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [rowData, setRowData] = useState<UploadRow>(FALLBACK_ROW);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([]);
  const [fieldMapping, setLocalFieldMapping] = useState<FieldMapping>({ name: "" });

  useEffect(() => {
    // Read all data from centralized storage
    const rows = getUploadRows();
    const mapping = getFieldMapping();

    if (rows.length === 0) {
      setError("No data found. Please start from upload page.");
      setLoading(false);
      return;
    }

    setUploadRows(rows);
    setRowCount(rows.length);
    setLocalFieldMapping(mapping);

    // Set first row as sample
    if (rows.length > 0) {
      setRowData(rows[0]);
    }

    // Set selected fields based on mapping
    const mappedFields = Object.keys(mapping).filter((k) => k !== "name" && mapping[k]);
    setSelectedFields(["name", ...mappedFields]);

    setLoading(false);
  }, []);

  const handleGenerate = async () => {
    console.log("[Preview] Generate batch clicked");

    if (uploadRows.length === 0) {
      setError("No upload data found. Please re-upload.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create batch entry
      const batchId = `batch_${Date.now()}`;
      const templateImage = getTemplateImage();
      const templateFieldConfig = getTemplateFieldConfig();

      // If no template config set yet, create a default one
      let finalConfig = templateFieldConfig;
      if (!finalConfig.fields || Object.keys(finalConfig.fields).length === 0) {
        finalConfig = {
          fields: {
            name: {
              x: 380,
              y: 300,
              width: 420,
              height: 50,
              fontSize: 40,
              fontFamily: "Georgia",
              color: "#111111",
              align: "center" as const,
              visible: true,
            },
          },
          templateImage,
        };
        setTemplateFieldConfig(finalConfig);
      }

      const batch: GeneratedBatch = {
        id: batchId,
        createdAtISO: new Date().toISOString(),
        templateImage,
        fieldConfig: finalConfig,
        mapping: fieldMapping,
        rowCount: uploadRows.length,
        sampleRow: rowData,
        recipients: uploadRows,
      };

      // Store batch to localStorage
      addGeneratedBatch(batch);

      // Clear session data
      clearSessionData();

      // Navigate to generate page
      router.push(`/batches/${batchId}/generate`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate batch";
      setError(message);
      console.error("[Preview] Error:", message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Preview & Edit Template</h1>
        <p className="text-sm text-muted-foreground">
          Customize field positions on the certificate template before generating the batch.
        </p>
      </div>

      <BatchStepper current="/batches/new/preview" />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Template Editor */}
          <TemplateEditor
            templateImage={getTemplateImage()}
            rowData={rowData}
            selectedFields={selectedFields}
          />

          {/* Batch Summary */}
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <Card>
              <CardHeader>
                <CardTitle>Field Summary</CardTitle>
                <CardDescription>Selected fields for certificate generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedFields.length > 0 ? (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {selectedFields.map((field) => (
                        <li key={field} className="flex items-center justify-between">
                          <span>{field}</span>
                          <span className="text-xs text-muted-foreground">
                            {rowData[field] || "[empty]"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No fields selected</p>
                  )}
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
                    {selectedFields.length > 0 ? (
                      selectedFields.map((field) => (
                        <li key={field} className="text-xs">
                          {field}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs">No fields mapped</li>
                    )}
                  </ul>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-4">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  Ready to generate {rowCount} certificate{rowCount !== 1 ? "s" : ""}.
                </div>
                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={rowCount === 0 || isGenerating || selectedFields.length === 0}
                >
                  {isGenerating ? "Generating..." : "Generate batch"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
