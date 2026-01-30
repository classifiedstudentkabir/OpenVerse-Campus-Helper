"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

import { BatchStepper } from "@/components/batches/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getParsedHeaders, setFieldMapping } from "@/lib/storage";

const FIELD_OPTIONS = [
  { key: "name", label: "Recipient name", required: true },
  { key: "event", label: "Event name", required: false },
  { key: "organization", label: "Organization", required: false },
  { key: "date", label: "Date issued", required: false },
  { key: "certificate_id", label: "Certificate ID", required: false },
  { key: "email", label: "Recipient email", required: false }
];

export default function BatchMapPage() {
  const router = useRouter();
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    // Read headers from centralized storage
    const parsedHeaders = getParsedHeaders();
    setHeaders(parsedHeaders);
    setTimeout(() => setLoading(false), 400);
  }, []);

  const headerOptions = useMemo(
    () => (headers.length ? headers : ["name", "email", "event", "date", "grade"]),
    [headers]
  );

  const readyToContinue = FIELD_OPTIONS.every(
    (field) => !field.required || Boolean(mapping[field.key])
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Map fields</h1>
        <p className="text-sm text-muted-foreground">
          Match CSV headers to certificate fields for accurate personalization.
        </p>
      </div>

      <BatchStepper current="/batches/new/map" />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader>
            <CardTitle>Field mapping</CardTitle>
            <CardDescription>Required fields are marked with an asterisk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                {FIELD_OPTIONS.map((field) => (
                  <div
                    key={field.key}
                    className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {field.label} {field.required && "*"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Map to a column from the upload.
                      </p>
                    </div>
                    <Select
                      value={mapping[field.key] ?? ""}
                      onChange={(event) =>
                        setMapping((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select header</option>
                      {headerOptions.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guidance</CardTitle>
            <CardDescription>Tips for clean mapping.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-4">
              <Info className="mt-1 h-4 w-4 text-primary" />
              <p>
                Required fields must be mapped before continuing to preview. Optional
                fields can be left blank.
              </p>
            </div>
            <Button
              className="w-full"
              disabled={!readyToContinue}
              onClick={() => {
                setFieldMapping(mapping as any);
                router.push("/batches/new/preview");
              }}
            >
              Continue to preview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
