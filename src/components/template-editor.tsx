"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export interface FieldConfig {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: "left" | "center" | "right";
  visible: boolean;
}

interface TemplateEditorProps {
  templateImage?: string;
  rowData?: Record<string, string>;
  selectedFields?: string[];
  onFieldsUpdate?: (fieldConfigs: Record<string, FieldConfig>) => void;
}

const DEFAULT_ROW_DATA = {
  name: "Kabir Vishwakarma",
  event: "OpenVerse Hackathon",
  organization: "GDG On Campus - BVDU DMS",
  date: "2026-02-01",
  certificate_id: "OVH-001",
  role: "Participant",
};

const DEFAULT_FIELD_CONFIGS: Record<string, FieldConfig> = {
  name: {
    key: "name",
    x: 400,
    y: 250,
    width: 400,
    height: 50,
    fontSize: 48,
    fontFamily: "Georgia",
    color: "#000000",
    align: "center",
    visible: true,
  },
  event: {
    key: "event",
    x: 200,
    y: 350,
    width: 600,
    height: 30,
    fontSize: 24,
    fontFamily: "Arial",
    color: "#333333",
    align: "center",
    visible: true,
  },
  organization: {
    key: "organization",
    x: 200,
    y: 400,
    width: 600,
    height: 25,
    fontSize: 18,
    fontFamily: "Arial",
    color: "#666666",
    align: "center",
    visible: true,
  },
  date: {
    key: "date",
    x: 200,
    y: 480,
    width: 250,
    height: 20,
    fontSize: 14,
    fontFamily: "Arial",
    color: "#333333",
    align: "center",
    visible: true,
  },
  certificate_id: {
    key: "certificate_id",
    x: 550,
    y: 480,
    width: 250,
    height: 20,
    fontSize: 14,
    fontFamily: "Arial",
    color: "#333333",
    align: "center",
    visible: true,
  },
  role: {
    key: "role",
    x: 200,
    y: 440,
    width: 600,
    height: 25,
    fontSize: 16,
    fontFamily: "Arial",
    color: "#555555",
    align: "center",
    visible: false,
  },
};

export function TemplateEditor({
  templateImage = "/templates/openverse-purple.png",
  rowData = DEFAULT_ROW_DATA,
  selectedFields = ["name", "event", "organization", "date", "certificate_id"],
  onFieldsUpdate,
}: TemplateEditorProps) {
  const [fieldConfigs, setFieldConfigs] = useState<Record<string, FieldConfig>>(
    DEFAULT_FIELD_CONFIGS
  );
  const [selectedKey, setSelectedKey] = useState<string>("name");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load persisted field configs on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("certifyneo-fieldConfigs");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFieldConfigs(parsed);
        } catch (e) {
          console.error("Failed to load field configs", e);
        }
      }
    }
  }, []);

  // Persist field configs on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("certifyneo-fieldConfigs", JSON.stringify(fieldConfigs));
        onFieldsUpdate?.(fieldConfigs);
      }
    }, 200); // Debounce by 200ms

    return () => clearTimeout(timer);
  }, [fieldConfigs, onFieldsUpdate]);

  const updateFieldConfig = (key: string, updates: Partial<FieldConfig>) => {
    setFieldConfigs((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, key: string) => {
    if (e.button !== 0) return; // Only left mouse button
    setSelectedKey(key);

    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const offsetX = e.clientX - canvasRect.left;
    const offsetY = e.clientY - canvasRect.top;

    const field = fieldConfigs[key];

    // Check if clicking on resize handle (bottom-right corner)
    const resizeHandleSize = 20;
    const isOnResizeHandle =
      offsetX >= field.x + field.width - resizeHandleSize &&
      offsetX <= field.x + field.width &&
      offsetY >= field.y + field.height - resizeHandleSize &&
      offsetY <= field.y + field.height;

    if (isOnResizeHandle) {
      setIsResizing(true);
      setResizeStart({
        x: offsetX,
        y: offsetY,
        w: field.width,
        h: field.height,
      });
    } else {
      setIsDragging(true);
      setDragOffset({
        x: offsetX - field.x,
        y: offsetY - field.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - canvasRect.left;
    const offsetY = e.clientY - canvasRect.top;

    const field = fieldConfigs[selectedKey];

    if (isDragging) {
      const newX = Math.max(0, Math.min(offsetX - dragOffset.x, canvasRect.width - field.width));
      const newY = Math.max(0, Math.min(offsetY - dragOffset.y, canvasRect.height - field.height));
      updateFieldConfig(selectedKey, { x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = offsetX - resizeStart.x;
      const deltaY = offsetY - resizeStart.y;
      const newWidth = Math.max(50, resizeStart.w + deltaX);
      const newHeight = Math.max(30, resizeStart.h + deltaY);
      updateFieldConfig(selectedKey, { width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, selectedKey, fieldConfigs, dragOffset, resizeStart]);

  const visibleFields = Object.keys(fieldConfigs)
    .filter((k) => fieldConfigs[k].visible && selectedFields.includes(k))
    .sort();

  const selectedField = fieldConfigs[selectedKey];

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Canvas area */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Template Editor</CardTitle>
            <CardDescription>Drag fields to reposition, drag corners to resize</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <div
                ref={canvasRef}
                className="relative mx-auto w-full overflow-hidden rounded-lg border border-border/60 bg-gray-50"
                style={{
                  aspectRatio: "1200 / 600",
                  cursor: isDragging || isResizing ? "grabbing" : "grab",
                  minHeight: "400px",
                  maxWidth: "900px",
                }}
              >
                {/* Background image */}
                <img
                  ref={imageRef}
                  src={templateImage}
                  alt="Certificate template"
                  className="h-full w-full object-contain"
                />

                {/* Field overlays */}
                {visibleFields.map((key) => {
                  const field = fieldConfigs[key];
                  const displayValue = (rowData as Record<string, string>)?.[key] || `[${key}]`;
                  const isSelected = key === selectedKey;

                  return (
                    <div
                      key={key}
                      onMouseDown={(e) => handleMouseDown(e, key)}
                      className={`absolute cursor-grab transition-all ${
                        isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
                      }`}
                      style={{
                        left: `${(field.x / 1200) * 100}%`,
                        top: `${(field.y / 600) * 100}%`,
                        width: `${(field.width / 1200) * 100}%`,
                        height: `${(field.height / 600) * 100}%`,
                      }}
                    >
                      {/* Text content */}
                      <div
                        className="h-full w-full overflow-hidden text-ellipsis"
                        style={{
                          fontSize: `${(field.fontSize / 48) * 1.2}rem`,
                          fontFamily: field.fontFamily,
                          color: field.color,
                          textAlign: field.align,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: field.align === "center" ? "center" : "flex-start",
                          padding: "4px",
                        }}
                      >
                        {displayValue}
                      </div>

                      {/* Resize handle */}
                      {isSelected && (
                        <div
                          className="absolute bottom-0 right-0 h-5 w-5 bg-blue-500 cursor-nwse-resize"
                          style={{
                            cursor: "se-resize",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties panel */}
        <div className="space-y-4">
          {/* Field selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Field</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
              >
                {visibleFields.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {/* Field properties */}
          {selectedField && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Position and Size */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">X Position</label>
                  <Input
                    type="number"
                    value={Math.round(selectedField.x)}
                    onChange={(e) =>
                      updateFieldConfig(selectedKey, { x: Number(e.target.value) || 0 })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Y Position</label>
                  <Input
                    type="number"
                    value={Math.round(selectedField.y)}
                    onChange={(e) =>
                      updateFieldConfig(selectedKey, { y: Number(e.target.value) || 0 })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Width</label>
                  <Input
                    type="number"
                    value={Math.round(selectedField.width)}
                    onChange={(e) =>
                      updateFieldConfig(selectedKey, { width: Math.max(50, Number(e.target.value)) })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Height</label>
                  <Input
                    type="number"
                    value={Math.round(selectedField.height)}
                    onChange={(e) =>
                      updateFieldConfig(selectedKey, { height: Math.max(30, Number(e.target.value)) })
                    }
                    className="text-xs"
                  />
                </div>

                {/* Font properties */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">Font Size</label>
                  <Input
                    type="number"
                    value={selectedField.fontSize}
                    onChange={(e) =>
                      updateFieldConfig(selectedKey, { fontSize: Number(e.target.value) || 14 })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Font Family</label>
                  <Select
                    value={selectedField.fontFamily}
                    onChange={(e) =>
                      updateFieldConfig(selectedKey, { fontFamily: e.target.value })
                    }
                  >
                    <option>Georgia</option>
                    <option>Arial</option>
                    <option>Times New Roman</option>
                    <option>Courier New</option>
                    <option>Verdana</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedField.color}
                      onChange={(e) =>
                        updateFieldConfig(selectedKey, { color: e.target.value })
                      }
                      className="h-9 w-9 rounded-md border border-border/60 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={selectedField.color}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        if (/^#[0-9A-F]{6}$/.test(val) || /^#[0-9A-F]{3}$/.test(val)) {
                          updateFieldConfig(selectedKey, { color: val });
                        }
                      }}
                      placeholder="#FF0000"
                      className="flex-1 px-2 py-1 rounded-md border border-border/60 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Alignment</label>
                  <Select
                    value={selectedField.align}
                    onChange={(e) =>
                      updateFieldConfig(selectedKey, {
                        align: e.target.value as "left" | "center" | "right",
                      })
                    }
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </Select>
                </div>

                {/* Visibility toggle */}
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2">
                  <span className="text-xs font-medium">Visible</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateFieldConfig(selectedKey, {
                        visible: !selectedField.visible,
                      })
                    }
                  >
                    {selectedField.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
