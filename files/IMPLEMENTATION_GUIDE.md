# CertifyNeo Hackathon Fixes - Implementation Guide

This guide contains three critical fixes to make your hackathon demo ready.

---

## 🚀 COMMIT 1: Force single-page PDFs by rendering certificate as HTML

### Problem
Every generated certificate opens in Acrobat as "1 of 2". Page 1 shows the certificate but it's not centered, and the certificate ID "CERT-00x" spills onto page 2 (sometimes only the last digit like "5" appears on page 2).

### Root Cause
PDFKit flows text like a document editor. When content exceeds page height, it automatically creates page 2. Multiple clamp attempts failed because the fundamental approach is wrong.

### Solution
Use Puppeteer to render HTML certificates as PDFs. This guarantees single-page output with exact dimensions.

### Files to Update

#### 1. Backend: Install Puppeteer

```bash
cd backend
npm install puppeteer@21.6.1
```

#### 2. Backend: Create new PDF generator

**File:** `backend/services/pdfGeneratorPuppeteer.js`

Copy the entire file from: `certifyneo-fixes/backend/pdfGeneratorPuppeteer.js`

This file contains:
- `generateCertificateHTML()` - Builds HTML template dynamically based on mapped fields
- `generateSingleCertificatePDF()` - Uses Puppeteer to render single-page PDF
- `generateBatchCertificates()` - Handles batch generation with logging

**Key features:**
- ✅ Exact page dimensions (no overflow possible)
- ✅ Logs `{"event":"pdf.pages","file":"...","pages":1}` for every PDF
- ✅ Certificate ID stays within safe zone
- ✅ Content is automatically centered

#### 3. Backend: Update batch generation route

**File:** `backend/routes/batch.js` (or wherever your batch endpoint is)

Replace your current batch generation logic with the code from:
`certifyneo-fixes/backend/batchRoutes.js`

**Important changes:**
- Imports `pdfGeneratorPuppeteer` instead of old PDFKit-based generator
- Receives `mappedFields` from frontend (JSON string in FormData)
- Passes mapped fields to generator
- Returns batch results with download URL

#### 4. Backend: Update your main server file

**File:** `backend/server.js` (or `app.js`)

Make sure the batch routes are properly registered:

```javascript
const batchRoutes = require('./routes/batch');
app.use('/api/batch', batchRoutes);
```

### Testing Commit 1

After implementing:

```bash
cd backend
npm install
node server.js
```

Test:
1. Upload a CSV with sample data
2. Generate certificates
3. Download ZIP
4. Open any PDF in Acrobat → should show "1 of 1" pages
5. Check backend logs → should see `{"event":"pdf.pages",...,"pages":1}`

### Commit Message

```
fix: force single-page PDFs by rendering certificate as image/HTML

- Replace PDFKit flowing text with Puppeteer HTML->PDF rendering
- Guarantees exactly 1 page per certificate ("1 of 1" in Acrobat)
- Certificate content centered on page with exact dimensions
- Footer (certificate ID) stays within safe zone, never spills
- Logs page count for every generated PDF (always 1)
- Batch ZIP generation flow unchanged

Technical approach:
- Generate HTML template with embedded styles
- Use @page CSS to force exact dimensions (no pagination)
- Puppeteer renders with printBackground:true and 0 margins
- Output PDF has same dimensions as HTML (1056x816px default)

Fixes #issue-number
```

---

## 🎯 COMMIT 2: Preview + generation respects selected mapping (including email)

### Problem
- Preview always shows only Name and hardcoded text ("CERTIFICATE OF ACHIEVEMENT", "For participating in HACKNOVA 2026")
- Mapping UI always shows only Name/Event/Date even if user maps Email
- Email and other fields never appear in preview or generated certificates
- Preview summary doesn't list all mapped fields dynamically

### Root Cause
- Preview component has hardcoded fields, doesn't read from sessionStorage
- Backend generator doesn't receive which fields are mapped
- Field mapping component doesn't properly save all selected fields

### Solution
- Update field mapping component to handle all fields (name, event, date, email, department)
- Save selected fields to sessionStorage
- Update preview to read from sessionStorage and only show mapped fields
- Update generation service to send mapped fields to backend

### Files to Update

#### 1. Frontend: Update Field Mapping Component

**File:** `frontend/components/FieldMapping.jsx` (or similar path)

Replace with code from: `certifyneo-fixes/frontend/FieldMapping.jsx`

**Key features:**
- Checkboxes for all certificate fields (name, event_name, issue_date, email, department)
- Name is required (always checked, disabled)
- Other fields are optional (can toggle on/off)
- Dropdown to map each selected field to CSV column
- Auto-mapping tries to match column names
- Saves to sessionStorage: `selectedFields` and `fieldMapping`
- Shows summary of mapped fields before continuing

#### 2. Frontend: Update Preview Component

**File:** `frontend/components/CertificatePreview.jsx` (or similar path)

Replace with code from: `certifyneo-fixes/frontend/CertificatePreview.jsx`

**Key features:**
- Reads `selectedFields` and `fieldMapping` from sessionStorage
- Only displays fields that user has mapped
- Shows sample data from first CSV row
- Preview summary lists all mapped fields dynamically
- Certificate layout adjusts based on which fields are included

#### 3. Frontend: Update Generation Service

**File:** `frontend/services/generationService.js` (or `api.js`)

Replace with code from: `certifyneo-fixes/frontend/generationService.js`

**Key features:**
- Retrieves mapping from sessionStorage
- Sends `mappedFields` as JSON string in FormData
- Example: `{"name": true, "event_name": true, "email": true}`
- Backend receives this and knows which fields to render

#### 4. Frontend: Update your upload/generation flow

Make sure your components are connected:

```javascript
// In your main upload/generation page component
import FieldMapping from './components/FieldMapping';
import CertificatePreview from './components/CertificatePreview';
import { generateBatchCertificates, parseSampleData } from './services/generationService';

// Flow:
// 1. User uploads CSV -> parseSampleData() -> get columns + sampleRow
// 2. Show FieldMapping with columns prop
// 3. User maps fields -> saves to sessionStorage
// 4. Show CertificatePreview with sampleData prop
// 5. User clicks generate -> generateBatchCertificates() reads sessionStorage and sends to backend
```

### Testing Commit 2

Test scenario 1: Map only name and event
1. Upload CSV with columns: name, event_name, email, date
2. In mapping UI: Check only "Name" and "Event Name"
3. Preview should show: Title, Name value, Event value, Certificate ID
4. Preview should NOT show: Email, Date
5. Preview summary should list: "Participant Name: [column]", "Event Name: [column]"

Test scenario 2: Map name, event, date, and email
1. In mapping UI: Check all fields
2. Preview should show: Title, Name, Event, Date, Email, Certificate ID
3. Preview summary should list all 4 fields
4. Generate → all PDFs should include all 4 fields

Test scenario 3: Map only name
1. In mapping UI: Check only "Name" (default)
2. Preview should show: Title, Name value, Certificate ID
3. Preview should NOT show: Event, Date, Email
4. Generate → PDFs should only show title + name

### Commit Message

```
fix: preview + generation respects selected mapping (including email)

- Field mapping component now supports all fields: name, event_name, 
  issue_date, email, department
- Users can select which fields to include via checkboxes
- Preview component reads selectedFields from sessionStorage and only 
  displays mapped fields
- Preview summary dynamically lists all mapped fields
- Generation service sends mappedFields to backend as JSON
- Backend renders only the fields user has selected
- Fixes issue where email and other fields never appeared

Before: Preview always showed hardcoded "HACKNOVA 2026" regardless 
of mapping
After: Preview shows actual mapped data from CSV (event_name, email, 
etc.)

Fixes #issue-number
```

---

## 🧹 COMMIT 3: Remove Team nav (404)

### Problem
"Team" page in navigation gives 404 error. This looks unprofessional in demo.

### Solution
Remove Team link from navigation component.

### Files to Update

#### 1. Frontend: Update Navigation Component

**File:** `frontend/components/Navigation.jsx` (or `Sidebar.jsx`, `Layout.jsx`)

Replace with code from: `certifyneo-fixes/frontend/Navigation.jsx`

**Changes:**
- Removed Team item from `navItems` array
- Kept: Home, Upload, Generate, Results, Settings
- Added comment: `// Team page removed - was giving 404`

### Alternative: If navigation is in a different file

If your navigation is hardcoded in a different file, find the line like:

```javascript
{ path: '/team', label: 'Team', icon: '👥' },
```

And delete it.

### Testing Commit 3

1. Run frontend
2. Check sidebar/navigation → "Team" should be gone
3. Click through all remaining nav items → all should work
4. No 404 errors

### Commit Message

```
chore: remove Team nav (404)

- Team page gives 404 error
- Removed from navigation for demo
- Clean navigation: Home, Upload, Generate, Results, Settings

Fixes #issue-number
```

---

## 📦 Complete Implementation Checklist

### Backend Setup

```bash
cd backend

# Install puppeteer
npm install puppeteer@21.6.1

# Copy new PDF generator
cp /path/to/pdfGeneratorPuppeteer.js services/

# Update batch routes
# (manually integrate batchRoutes.js changes into your routes/batch.js)

# Test
node server.js
# Should start without errors
```

### Frontend Setup

```bash
cd frontend

# Update components
# Copy FieldMapping.jsx, CertificatePreview.jsx, Navigation.jsx
# Update generationService.js

# Test
npm run dev
# Should compile without errors
```

### Integration Testing

1. **Single-page PDF test:**
   - Generate certificates
   - Open any PDF → should show "1 of 1"
   - Certificate ID should be visible, not cut off

2. **Field mapping test:**
   - Map only name → preview shows only name
   - Map name + email → preview shows both
   - Map all fields → preview shows all fields
   - Generate → PDFs should match preview

3. **Navigation test:**
   - Team link should be gone
   - All other links should work

### Git Commits

```bash
# Commit 1
git add backend/services/pdfGeneratorPuppeteer.js
git add backend/routes/batch.js
git add backend/package.json
git commit -m "fix: force single-page PDFs by rendering certificate as image/HTML"

# Commit 2
git add frontend/components/FieldMapping.jsx
git add frontend/components/CertificatePreview.jsx
git add frontend/services/generationService.js
git commit -m "fix: preview + generation respects selected mapping (including email)"

# Commit 3
git add frontend/components/Navigation.jsx
git commit -m "chore: remove Team nav (404)"

# Push
git push origin main
```

---

## 🎯 Expected Results After All Fixes

### PDF Quality
- ✅ Every certificate is exactly "1 of 1" pages
- ✅ Content is centered and professional
- ✅ Certificate ID never spills to page 2
- ✅ Consistent layout across all certificates

### Field Mapping
- ✅ Users can select which fields to include
- ✅ Preview shows only selected fields
- ✅ Generated PDFs match preview exactly
- ✅ Email, department, and other fields work

### Navigation
- ✅ No 404 errors
- ✅ Clean navigation for demo
- ✅ Professional appearance

---

## ⚠️ Troubleshooting

### Issue: Puppeteer install fails

```bash
# Install system dependencies (Ubuntu)
sudo apt-get update
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# Or use puppeteer-core with external Chrome
npm install puppeteer-core
```

### Issue: "puppeteer is not defined"

Make sure you require it at the top of the file:

```javascript
const puppeteer = require('puppeteer');
```

### Issue: sessionStorage is empty

Check browser console:
- Make sure FieldMapping component calls `sessionStorage.setItem()`
- Verify data is there: `console.log(sessionStorage.getItem('selectedFields'))`
- Check that you're not in incognito mode (sessionStorage might be restricted)

### Issue: Backend receives empty mappedFields

Add logging in backend:

```javascript
console.log('req.body:', req.body);
console.log('mappedFields:', req.body.mappedFields);
```

Make sure frontend sends it:

```javascript
formData.append('mappedFields', JSON.stringify(mappedFieldsForBackend));
```

---

## 🏁 Final Demo Checklist

Before showing to judges:

- [ ] Generate sample batch (10 certificates)
- [ ] Verify all PDFs are "1 of 1" pages
- [ ] Test mapping with different field combinations
- [ ] Preview matches generated PDFs
- [ ] ZIP download works
- [ ] Navigation has no broken links
- [ ] No console errors in browser
- [ ] Backend runs without errors

---

## 🎉 You're Ready!

With these three commits, your CertifyNeo demo is hackathon-ready:

1. **Professional PDFs** - No more 2-page bug, always "1 of 1"
2. **Flexible mapping** - Users can choose which fields to include
3. **Clean navigation** - No 404 errors

Good luck with your demo! 🚀
