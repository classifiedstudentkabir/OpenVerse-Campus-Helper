"use client";

import * as React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { getGeneratedBatches, getGeneratedBatchById, type GeneratedBatch } from "@/lib/storage";

function BatchTimeDisplay({ iso }: { iso: string }) {
  const [time, setTime] = React.useState("");
  React.useEffect(() => {
    setTime(new Date(iso).toLocaleDateString());
  }, [iso]);
  return <>{time || "—"}</>;
}

export default function BatchResultsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const batchId = params?.id;

  const [batches, setBatches] = React.useState<GeneratedBatch[]>([]);
  const [selected, setSelected] = React.useState<GeneratedBatch | null>(null);

  React.useEffect(() => {
    const allBatches = getGeneratedBatches();
    setBatches(allBatches);

    // Find batch by ID or show first one
    if (batchId) {
      const found = getGeneratedBatchById(batchId);
      setSelected(found);
    } else if (allBatches.length > 0) {
      setSelected(allBatches[0]);
    }
  }, [batchId]);

  const previewName = selected?.sampleRow.name ?? "Sample Name";
  const bgSrc = selected?.templateImage ?? "/templates/openverse-purple.png";

  // Get name field config from template
  const nameCfg = selected?.fieldConfig.fields.name ?? {
    x: 380,
    y: 300,
    fontSize: 40,
    color: "#111111",
    width: 420,
    align: "center" as const,
  };

  const x = Number.isFinite(nameCfg.x) ? Number(nameCfg.x) : 380;
  const y = Number.isFinite(nameCfg.y) ? Number(nameCfg.y) : 300;
  const fontSize = Number.isFinite(nameCfg.fontSize) ? Number(nameCfg.fontSize) : 40;
  const color = typeof nameCfg.color === "string" ? nameCfg.color : "#111111";
  const width = Number.isFinite(nameCfg.width) ? Number(nameCfg.width) : 420;
  const align = nameCfg.align ?? "center";

  if (batches.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Batch results</h1>
            <p className="text-sm text-muted-foreground">View generated certificate batches.</p>
          </div>

          <button
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={() => router.push("/batches/new/upload")}
          >
            + New batch
          </button>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/10 p-12 text-center">
          <p className="text-muted-foreground">No batches generated yet.</p>
          <button
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={() => router.push("/batches/new/upload")}
          >
            Create first batch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Batch results</h1>
          <p className="text-sm text-muted-foreground">View generated certificate batches.</p>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          onClick={() => router.push("/batches/new/upload")}
        >
          + New batch
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        {/* Batch List */}
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="mb-3">
            <div className="text-sm font-medium">Generated batches</div>
            <div className="text-xs text-muted-foreground">{batches.length} batch(es)</div>
          </div>

          <div className="space-y-2">
            {batches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected(b)}
                className={[
                  "w-full rounded-lg border px-3 py-2 text-left text-sm",
                  selected?.id === b.id
                    ? "border-primary bg-primary/10"
                    : "border-border/60 hover:bg-muted/20",
                ].join(" ")}
              >
                <div className="font-medium truncate">{b.sampleRow.name ?? "Batch"}</div>
                <div className="text-xs text-muted-foreground">
                  {b.rowCount} recipient{b.rowCount !== 1 ? "s" : ""} • <BatchTimeDisplay iso={b.createdAtISO} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="mb-4">
            <div className="text-sm font-medium">Preview</div>
            <div className="text-xs text-muted-foreground">
              {selected?.rowCount} certificate{selected?.rowCount !== 1 ? "s" : ""}
            </div>
          </div>

          {selected ? (
            <div className="relative mx-auto w-full max-w-full overflow-hidden rounded-xl border border-border/60 bg-muted/10 aspect-[16/9]">
              <Image
                src={bgSrc}
                alt="Certificate background"
                fill
                className="object-contain"
                priority
              />

              <div
                className="absolute"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${width}px`,
                  fontSize: `${fontSize}px`,
                  color,
                  textAlign: align as any,
                  transform: "translate(-50%, -50%)",
                  fontWeight: 600,
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  fontFamily: nameCfg.fontFamily || "Georgia",
                }}
              >
                {previewName}
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-lg bg-muted/20 flex items-center justify-center text-muted-foreground">
              No batch selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
