/**
 * Centralized storage contract for CertifyNeo batch flow
 * Ensures consistent key names and types across all pages
 */

// sessionStorage keys (temporary, within same session)
export const STORAGE_KEYS = {
  SESSION: {
    UPLOAD_ROWS: "uploadRows", // JSON.stringify(Array<object>)
    PARSED_HEADERS: "parsedHeaders", // JSON.stringify(Array<string>)
    FIELD_MAPPING: "fieldMapping", // JSON.stringify({ name: "full_name", ... })
    TEMPLATE_FIELD_CONFIG: "templateFieldConfig", // JSON.stringify({ fields: { name: { x, y, fontSize, ... } } })
    TEMPLATE_IMAGE: "templateImage", // string (URL)
  },
  LOCAL: {
    GENERATED_BATCHES: "generatedBatches", // JSON.stringify(Array<GeneratedBatch>)
  },
};

export interface UploadRow {
  [key: string]: string;
}

export interface FieldMapping {
  name: string; // required: maps to a column header
  [key: string]: string; // other optional field mappings
}

export interface TemplateFieldPosition {
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

export interface TemplateFieldConfig {
  fields: {
    [fieldName: string]: TemplateFieldPosition;
  };
  templateImage: string; // URL to template background
}

export interface GeneratedBatch {
  id: string;
  createdAtISO: string;
  templateImage: string;
  fieldConfig: TemplateFieldConfig;
  mapping: FieldMapping;
  rowCount: number;
  sampleRow: UploadRow;
  recipients: UploadRow[]; // All rows from upload
}

/**
 * Session Storage: Upload data
 */
export function setUploadRows(rows: UploadRow[]): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEYS.SESSION.UPLOAD_ROWS, JSON.stringify(rows));
  }
}

export function getUploadRows(): UploadRow[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION.UPLOAD_ROWS);
  if (!raw || raw === "undefined") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setParsedHeaders(headers: string[]): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEYS.SESSION.PARSED_HEADERS, JSON.stringify(headers));
  }
}

export function getParsedHeaders(): string[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION.PARSED_HEADERS);
  if (!raw || raw === "undefined") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Session Storage: Field mapping
 */
export function setFieldMapping(mapping: FieldMapping): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEYS.SESSION.FIELD_MAPPING, JSON.stringify(mapping));
  }
}

export function getFieldMapping(): FieldMapping {
  if (typeof window === "undefined") return { name: "" };
  const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION.FIELD_MAPPING);
  if (!raw || raw === "undefined") return { name: "" };
  try {
    return JSON.parse(raw);
  } catch {
    return { name: "" };
  }
}

/**
 * Session Storage: Template configuration
 */
export function setTemplateFieldConfig(config: TemplateFieldConfig): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEYS.SESSION.TEMPLATE_FIELD_CONFIG, JSON.stringify(config));
  }
}

export function getTemplateFieldConfig(): TemplateFieldConfig {
  if (typeof window === "undefined") return { fields: {}, templateImage: "" };
  const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION.TEMPLATE_FIELD_CONFIG);
  if (!raw || raw === "undefined") return { fields: {}, templateImage: "" };
  try {
    return JSON.parse(raw);
  } catch {
    return { fields: {}, templateImage: "" };
  }
}

export function setTemplateImage(url: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEYS.SESSION.TEMPLATE_IMAGE, url);
  }
}

export function getTemplateImage(): string {
  if (typeof window === "undefined") return "/templates/openverse-purple.png";
  return sessionStorage.getItem(STORAGE_KEYS.SESSION.TEMPLATE_IMAGE) || "/templates/openverse-purple.png";
}

/**
 * Local Storage: Generated batches
 */
export function addGeneratedBatch(batch: GeneratedBatch): void {
  if (typeof window !== "undefined") {
    const existing = getGeneratedBatches();
    existing.unshift(batch);
    localStorage.setItem(STORAGE_KEYS.LOCAL.GENERATED_BATCHES, JSON.stringify(existing));
  }
}

export function getGeneratedBatches(): GeneratedBatch[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEYS.LOCAL.GENERATED_BATCHES);
  if (!raw || raw === "undefined") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getGeneratedBatchById(id: string): GeneratedBatch | null {
  const batches = getGeneratedBatches();
  return batches.find((b) => b.id === id) || null;
}

/**
 * Clear session data after batch is generated
 */
export function clearSessionData(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION.UPLOAD_ROWS);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION.PARSED_HEADERS);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION.FIELD_MAPPING);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION.TEMPLATE_FIELD_CONFIG);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION.TEMPLATE_IMAGE);
  }
}
