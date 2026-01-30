# CertifyNeo Fixes - Quick Reference

## 🔥 Fast Track (if you're in a hurry)

### 1. Install Puppeteer (Backend)
```bash
cd backend
npm install puppeteer@21.6.1
```

### 2. Replace PDF Generator (Backend)
- **Old:** `services/pdfGenerator.js` (uses PDFKit - broken)
- **New:** `services/pdfGeneratorPuppeteer.js` (uses Puppeteer - guaranteed 1 page)
- Copy from: `certifyneo-fixes/backend/pdfGeneratorPuppeteer.js`

### 3. Update Batch Route (Backend)
- **File:** `routes/batch.js`
- **Change:** Import new generator, receive `mappedFields` from request
- Reference: `certifyneo-fixes/backend/batchRoutes.js`

### 4. Fix Field Mapping (Frontend)
- **File:** `components/FieldMapping.jsx`
- **Change:** Add email/department fields, save to sessionStorage
- Copy from: `certifyneo-fixes/frontend/FieldMapping.jsx`

### 5. Fix Preview (Frontend)
- **File:** `components/CertificatePreview.jsx`
- **Change:** Read from sessionStorage, show only mapped fields
- Copy from: `certifyneo-fixes/frontend/CertificatePreview.jsx`

### 6. Fix Generation Service (Frontend)
- **File:** `services/generationService.js`
- **Change:** Send mappedFields to backend
- Copy from: `certifyneo-fixes/frontend/generationService.js`

### 7. Remove Team Link (Frontend)
- **File:** `components/Navigation.jsx`
- **Change:** Delete Team nav item
- Copy from: `certifyneo-fixes/frontend/Navigation.jsx`

---

## 📝 Commit Messages

```bash
git commit -m "fix: force single-page PDFs by rendering certificate as image/HTML"
git commit -m "fix: preview + generation respects selected mapping (including email)"
git commit -m "chore: remove Team nav (404)"
```

---

## 🧪 Testing Checklist

### PDF Test
```bash
# Generate batch
# Open any PDF in Acrobat
# Should show: "1 of 1" (not "1 of 2")
```

### Mapping Test
```bash
# Map only name → preview shows only name
# Map name + email → preview shows both
# Map all fields → preview shows all
# Generate → PDFs match preview
```

### Navigation Test
```bash
# Team link should be gone
# All other links work (no 404)
```

---

## 🚨 Common Errors & Fixes

### Error: "Cannot find module 'puppeteer'"
```bash
cd backend
npm install puppeteer@21.6.1
```

### Error: "mappedFields is undefined"
```javascript
// Frontend: Make sure you're sending it
formData.append('mappedFields', JSON.stringify(mappedFields));

// Backend: Make sure you're parsing it
const mappedFields = JSON.parse(req.body.mappedFields);
```

### Error: "sessionStorage is not defined"
```javascript
// Make sure you're in browser context, not Node.js
// sessionStorage only works in frontend components
```

### Error: Still getting 2-page PDFs
```javascript
// Make sure you imported the NEW generator:
const { generateBatchCertificates } = require('../services/pdfGeneratorPuppeteer');

// NOT the old one:
// const { generateBatchCertificates } = require('../services/pdfGenerator'); ❌
```

---

## 📊 Architecture Diagram

```
BEFORE (BROKEN):
Frontend → Backend → PDFKit → 2-page PDF ❌

AFTER (FIXED):
Frontend → Backend → Puppeteer → 1-page PDF ✅
    ↓
sessionStorage
(mappedFields)
```

---

## 🎯 Key Differences

### Old (PDFKit) vs New (Puppeteer)

| Feature | PDFKit | Puppeteer |
|---------|--------|-----------|
| Pages | 1 or 2 (unpredictable) | Always 1 |
| Layout | Text flows, can overflow | Fixed dimensions |
| Centering | Manual calculation | Automatic (CSS) |
| Debugging | Hard (binary PDF) | Easy (HTML) |
| Speed | Fast | Slightly slower |
| Reliability | ⚠️ Breaks with long text | ✅ Always works |

**Verdict:** Puppeteer is slower but GUARANTEED to work. Perfect for hackathon demo.

---

## 🔧 File Mapping Reference

| Purpose | Frontend File | Backend File |
|---------|--------------|--------------|
| PDF generation | - | `services/pdfGeneratorPuppeteer.js` |
| Batch endpoint | - | `routes/batch.js` |
| Field mapping | `components/FieldMapping.jsx` | - |
| Preview | `components/CertificatePreview.jsx` | - |
| Generation API | `services/generationService.js` | - |
| Navigation | `components/Navigation.jsx` | - |

---

## 💡 Pro Tips

1. **Test with small batch first** (5 certificates) to debug faster
2. **Check backend logs** for `{"event":"pdf.pages","pages":1}` - should always be 1
3. **Use browser DevTools** to inspect sessionStorage: `Application → Storage → Session Storage`
4. **Keep old PDFKit file** as backup (just rename it to `pdfGenerator.old.js`)
5. **Test on Chrome/Brave** - known to work well with ZIP downloads

---

## ⏱️ Time Estimates

- Install Puppeteer: **2 min**
- Copy backend files: **5 min**
- Copy frontend files: **10 min**
- Test & debug: **15-30 min**
- **Total: 30-45 minutes**

---

## 🎬 Demo Script (2 minutes)

1. **Open website** → "CertifyNeo - Bulk Certificate Generation"
2. **Upload CSV** → "Here's my participant data with names, emails, events"
3. **Map fields** → "I'll include name, event, and email on certificates"
4. **Show preview** → "This is exactly how it will look"
5. **Click generate** → "Generating 47 certificates... done!"
6. **Download ZIP** → "Here's the ZIP with all PDFs"
7. **Open a PDF** → "Notice: every certificate is exactly 1 page, professionally formatted"
8. **Show another PDF** → "All fields I mapped are here: name, event, email"
9. **Pitch** → "Perfect for events, courses, competitions - custom templates, bulk generation, instant results"

**Time:** 1:45 - 2:00 minutes

---

## 🏆 Success Criteria

Your demo is ready when:

- [ ] Generate 10+ certificates successfully
- [ ] Every PDF shows "1 of 1" in Acrobat
- [ ] Preview exactly matches generated PDFs
- [ ] Can map different field combinations
- [ ] ZIP download works in Chrome/Brave
- [ ] No 404 errors in navigation
- [ ] No console errors in browser
- [ ] Backend runs cleanly (no crashes)

---

## 📱 Contact

If you run into issues during implementation, check:
1. Implementation guide (full details)
2. Code comments (inline documentation)
3. Browser console (frontend errors)
4. Backend logs (server errors)

**Remember:** This is a hackathon demo. If something minor breaks, you can:
- Pre-generate sample certificates
- Record a backup demo video
- Use demo mode with hardcoded data

**Prioritize:** Working demo > Perfect code

---

Good luck! 🚀
