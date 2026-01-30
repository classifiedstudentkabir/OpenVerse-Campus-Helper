# CertifyNeo Architecture - After Fixes

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Upload CSV                                                    │
│     │                                                             │
│     ├─→ parseSampleData() → Extract columns + first row          │
│     │                                                             │
│  2. Field Mapping (FieldMapping.jsx)                             │
│     │                                                             │
│     ├─→ User selects: ☑ name ☑ event ☑ email ☐ department      │
│     ├─→ User maps:    name → "Name"                             │
│     │                 event → "Event"                            │
│     │                 email → "Email"                            │
│     │                                                             │
│     └─→ sessionStorage.setItem('selectedFields', {...})          │
│         sessionStorage.setItem('fieldMapping', {...})            │
│                                                                   │
│  3. Preview (CertificatePreview.jsx)                             │
│     │                                                             │
│     ├─→ Read from sessionStorage                                 │
│     ├─→ Show only mapped fields in preview                       │
│     └─→ Display sample data from first row                       │
│                                                                   │
│  4. Generate (generationService.js)                              │
│     │                                                             │
│     ├─→ Read from sessionStorage                                 │
│     ├─→ Create FormData with:                                    │
│     │   • file (CSV)                                             │
│     │   • mappedFields: {"name":true,"event":true,"email":true}  │
│     │                                                             │
│     └─→ POST /api/batch/generate                                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                          BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  5. Batch Route (routes/batch.js)                                │
│     │                                                             │
│     ├─→ Receive file + mappedFields                              │
│     ├─→ Parse CSV/XLSX → rows[]                                  │
│     │                                                             │
│     └─→ Call generateBatchCertificates(rows, mappedFields, dir) │
│                                                                   │
│  6. PDF Generator (services/pdfGeneratorPuppeteer.js)            │
│     │                                                             │
│     ├─→ For each row:                                            │
│     │   │                                                         │
│     │   ├─→ generateCertificateHTML(data, mappedFields, ID)      │
│     │   │   │                                                     │
│     │   │   ├─→ Build HTML with only mapped fields:              │
│     │   │   │   if (mappedFields.name) → add name                │
│     │   │   │   if (mappedFields.event) → add event              │
│     │   │   │   if (mappedFields.email) → add email              │
│     │   │   │   Always add: title + certificate ID               │
│     │   │   │                                                     │
│     │   │   └─→ Return HTML string with:                         │
│     │   │       <style>                                           │
│     │   │         @page { size: 1056px 816px; margin: 0; }       │
│     │   │         body { overflow: hidden; }                     │
│     │   │       </style>                                          │
│     │   │                                                         │
│     │   ├─→ Launch Puppeteer browser                             │
│     │   ├─→ Create page, set viewport: 1056x816                  │
│     │   ├─→ setContent(html)                                     │
│     │   ├─→ page.pdf({                                           │
│     │   │     width: '1056px',                                   │
│     │   │     height: '816px',                                   │
│     │   │     printBackground: true,                             │
│     │   │     margin: 0                                          │
│     │   │   })                                                    │
│     │   │                                                         │
│     │   ├─→ Save PDF to outputs/batch_123/CERT-001.pdf           │
│     │   │                                                         │
│     │   └─→ Log: {"event":"pdf.pages","file":"...","pages":1}    │
│     │                                                             │
│     └─→ Return: [pdf1.pdf, pdf2.pdf, ...]                        │
│                                                                   │
│  7. Create ZIP                                                    │
│     │                                                             │
│     ├─→ archiver.create('zip')                                   │
│     ├─→ Add all PDFs                                             │
│     └─→ Save: outputs/batch_123/certificates.zip                 │
│                                                                   │
│  8. Return Response                                               │
│     │                                                             │
│     └─→ {                                                         │
│           success: true,                                          │
│           batchId: 123,                                           │
│           totalCertificates: 47,                                  │
│           downloadUrl: "/api/batch/download/123"                 │
│         }                                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JSON Response
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  9. Results Page                                                  │
│     │                                                             │
│     ├─→ Show: "Generated 47 certificates"                        │
│     ├─→ Show: Certificate list with preview links                │
│     └─→ Show: "Download ZIP" button                              │
│                                                                   │
│  10. Download                                                     │
│      │                                                            │
│      └─→ GET /api/batch/download/123 → certificates.zip          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: Field Mapping

```
USER INTERACTION          STORAGE                  RENDERING

┌──────────────┐         ┌──────────────┐        ┌──────────────┐
│ User checks: │         │              │        │   Preview    │
│ ☑ Name       │────────▶│ sessionStorage│───────▶│   Shows:     │
│ ☑ Event      │ Save    │              │ Read   │  • Name      │
│ ☑ Email      │         │ {            │        │  • Event     │
│ ☐ Dept       │         │   name: true,│        │  • Email     │
└──────────────┘         │   event: true│        └──────────────┘
                         │   email: true│
                         │ }            │
                         └──────────────┘
                                │
                                │ Persist across pages
                                │
                         ┌──────────────┐        ┌──────────────┐
                         │              │        │  Generated   │
                         │ sessionStorage│───────▶│  PDF Shows:  │
                         │              │ Send   │  • Name      │
                         │              │ to API │  • Event     │
                         │              │        │  • Email     │
                         └──────────────┘        └──────────────┘
```

---

## 🎨 PDF Generation: Old vs New

### OLD APPROACH (PDFKit - BROKEN)

```
Input Data
    │
    ↓
┌─────────────────────────────────────┐
│      PDFKit Document                │
│                                     │
│  doc.fontSize(48).text("CERTIFICATE")
│  doc.fontSize(36).text(name)        │    ← Text flows like
│  doc.fontSize(24).text(event)       │      a word processor
│  doc.fontSize(18).text(date)        │
│  doc.fontSize(14).text(certId)      │    ← If Y > page height,
│       ↓                              │      creates page 2!
│  Y coordinate: 750px                 │
│       ↓                              │
│  Page height: 792px                  │
│       ↓                              │
│  OVERFLOW! → Create page 2 ❌        │
│                                     │
└─────────────────────────────────────┘
    │
    ↓
Output: 2-page PDF (CERT-005 split: "5" on page 2)
```

### NEW APPROACH (Puppeteer - FIXED)

```
Input Data + Mapped Fields
    │
    ↓
┌─────────────────────────────────────┐
│   Generate HTML Template            │
│                                     │
│   <style>                           │
│     @page {                         │
│       size: 1056px 816px;           │    ← Exact dimensions
│       margin: 0;                    │      enforced
│     }                               │
│     body {                          │
│       overflow: hidden;             │    ← No overflow allowed
│     }                               │
│   </style>                          │
│   <body>                            │
│     <div class="certificate">       │
│       [Only mapped fields]          │    ← Dynamic content
│     </div>                          │
│   </body>                           │
└─────────────────────────────────────┘
    │
    ↓
┌─────────────────────────────────────┐
│   Puppeteer Browser                 │
│                                     │
│   page.setViewport(1056, 816)       │
│   page.setContent(html)             │
│   page.pdf({                        │
│     width: '1056px',                │    ← Same as HTML
│     height: '816px',                │
│     printBackground: true           │
│   })                                │
│                                     │
└─────────────────────────────────────┘
    │
    ↓
Output: 1-page PDF ✅ (physically impossible to create page 2)
```

---

## 🧩 Component Relationships

```
App.jsx
  │
  ├─→ Navigation.jsx
  │     └─→ Links: Home, Upload, Generate, Results, Settings
  │         (Team removed ✅)
  │
  ├─→ UploadPage.jsx
  │     │
  │     ├─→ FileUpload component
  │     │     └─→ Accepts: CSV, XLSX
  │     │
  │     └─→ parseSampleData(file)
  │           └─→ Extract: columns[], sampleRow{}
  │
  ├─→ MappingPage.jsx
  │     │
  │     └─→ FieldMapping.jsx
  │           ├─→ Props: columns, onMappingComplete
  │           ├─→ State: selectedFields, fieldMapping
  │           └─→ Output: sessionStorage
  │
  ├─→ PreviewPage.jsx
  │     │
  │     └─→ CertificatePreview.jsx
  │           ├─→ Reads: sessionStorage
  │           ├─→ Props: sampleData
  │           └─→ Renders: Only mapped fields
  │
  ├─→ GeneratePage.jsx
  │     │
  │     └─→ generationService.generateBatchCertificates()
  │           ├─→ Reads: sessionStorage
  │           ├─→ Sends: FormData with mappedFields
  │           └─→ Receives: { batchId, downloadUrl, ... }
  │
  └─→ ResultsPage.jsx
        │
        ├─→ Certificate list (with preview links)
        └─→ Download ZIP button
```

---

## 📊 Session Storage Schema

```javascript
// After user completes field mapping:

sessionStorage = {
  // Which fields user selected
  "selectedFields": {
    "name": true,
    "event_name": true,
    "issue_date": false,
    "email": true,
    "department": false
  },
  
  // Mapping from certificate field to CSV column
  "fieldMapping": {
    "name": "Participant Name",
    "event_name": "Event Title",
    "issue_date": "",
    "email": "Email Address",
    "department": ""
  },
  
  // Final mapping (only selected fields)
  "finalMapping": {
    "name": "Participant Name",
    "event_name": "Event Title",
    "email": "Email Address"
  }
}
```

---

## 🎯 Request/Response Flow

### Generate Request

```http
POST /api/batch/generate
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="participants.csv"
Content-Type: text/csv

Name,Email,Event
Alice,alice@example.com,Hackathon
Bob,bob@example.com,Workshop
------WebKitFormBoundary
Content-Disposition: form-data; name="mappedFields"

{"name":true,"event_name":true,"email":true}
------WebKitFormBoundary--
```

### Generate Response

```json
{
  "success": true,
  "batchId": 1738177200000,
  "totalCertificates": 2,
  "downloadUrl": "/api/batch/download/1738177200000",
  "certificates": [
    {
      "id": "CERT-001",
      "filename": "CERT-001.pdf",
      "url": "/api/batch/view/1738177200000/CERT-001.pdf"
    },
    {
      "id": "CERT-002",
      "filename": "CERT-002.pdf",
      "url": "/api/batch/view/1738177200000/CERT-002.pdf"
    }
  ]
}
```

### Download Request

```http
GET /api/batch/download/1738177200000
```

### Download Response

```http
HTTP/1.1 200 OK
Content-Type: application/zip
Content-Disposition: attachment; filename="certificates.zip"

[ZIP file binary data]
```

---

## 🔧 File System Structure

```
project-root/
├── backend/
│   ├── services/
│   │   ├── pdfGeneratorPuppeteer.js    ← New (Puppeteer-based)
│   │   └── pdfGenerator.js             ← Old (PDFKit-based, unused)
│   │
│   ├── routes/
│   │   └── batch.js                    ← Updated to use new generator
│   │
│   ├── uploads/
│   │   └── data/                       ← Temporary CSV uploads
│   │       └── upload_123.csv
│   │
│   └── outputs/
│       └── batch_1738177200000/        ← Generated certificates
│           ├── CERT-001.pdf            ← Single page! ✅
│           ├── CERT-002.pdf            ← Single page! ✅
│           └── certificates.zip
│
└── frontend/
    ├── components/
    │   ├── Navigation.jsx              ← Fixed (no Team)
    │   ├── FieldMapping.jsx            ← Fixed (all fields)
    │   └── CertificatePreview.jsx      ← Fixed (dynamic)
    │
    └── services/
        └── generationService.js        ← Fixed (sends mappedFields)
```

---

## 🎨 Visual: Certificate Layout

```
┌────────────────────────────────────────────────────┐
│                                                    │
│                                                    │
│           CERTIFICATE OF ACHIEVEMENT               │ ← Always shown
│                                                    │
│                                                    │
│                  Alice Johnson                     │ ← name (if mapped)
│                                                    │
│                                                    │
│             For participating in                   │
│                                                    │
│                   Hackathon 2026                   │ ← event_name (if mapped)
│                                                    │
│                                                    │
│                Date: Jan 29, 2026                  │ ← issue_date (if mapped)
│                                                    │
│              alice@example.com                     │ ← email (if mapped)
│                                                    │
│           Department: Engineering                  │ ← department (if mapped)
│                                                    │
│                                                    │
│                                        CERT-001 ◄──┼─ Certificate ID
└────────────────────────────────────────────────────┘   (always shown,
  1056px × 816px (single page, no overflow)              bottom-right)
```

---

## 🔒 Key Guarantees

### Single-Page PDF
```
HTML size = PDF size → No pagination possible
@page { size: 1056px 816px } + overflow: hidden
→ Content physically cannot exceed page bounds
→ Result: Always "1 of 1" ✅
```

### Dynamic Fields
```
sessionStorage → Preview → Backend → PDF
All components read from same source
→ What you see (preview) = What you get (PDF) ✅
```

### No Broken Links
```
Navigation array = ["Home", "Upload", "Generate", "Results", "Settings"]
Team removed from array
→ No 404 errors ✅
```

---

This architecture ensures:
1. ✅ Guaranteed single-page PDFs
2. ✅ Dynamic field rendering
3. ✅ Clean navigation
4. ✅ Hackathon-ready demo
