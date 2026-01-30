# Template Editor - Quick Start Guide

## What Was Built

A fully functional **Template Editor with Drag & Resize** for certificate field positioning.

## Key Implementation Details

### Files Created/Modified
1. **NEW**: `apps/web/src/components/template-editor.tsx` - Main editor component
2. **MODIFIED**: `apps/web/src/app/(dashboard)/batches/new/preview/page.tsx` - Integrated editor

### Core Features
✅ **Drag & Resize**: Click and drag fields, resize from corner  
✅ **Properties Panel**: Edit X, Y, W, H, font size, color, alignment  
✅ **Live Preview**: See changes instantly with sample data  
✅ **Persistence**: Auto-saves to sessionStorage  
✅ **Export JSON**: Download or copy field layout configuration  
✅ **Multi-field Support**: All selected fields render (not just "name")  

### Bug Fixed
❌ **OLD**: Preview only showed "name" field  
✅ **NEW**: All selected fields render based on fieldConfigs + selectedFields

## Data Flow

```
Upload CSV → Map Fields → Preview (This Screen)
                            ├─ Load fieldConfigs from sessionStorage
                            ├─ Load selectedFields from mapping
                            ├─ Display TemplateEditor
                            ├─ Allow drag/resize/edit
                            ├─ Persist changes
                            └─ Generate batch with stored layout
```

## Field Configuration Structure

```typescript
type FieldConfig = {
  key: string;        // "name", "event", "date", etc.
  x: number;          // X position (pixels)
  y: number;          // Y position (pixels)
  width: number;      // Field width (pixels)
  height: number;     // Field height (pixels)
  fontSize: number;   // Font size (px)
  fontFamily: string; // "Georgia", "Arial", etc.
  color: string;      // Hex color "#000000"
  align: "left"|"center"|"right";
  visible: boolean;   // Show/hide field
}
```

## Default Field Positions

| Field | Position | Size | Font Size |
|-------|----------|------|-----------|
| name | (400, 250) | 400x50 | 48px |
| event | (200, 350) | 600x30 | 24px |
| organization | (200, 400) | 600x25 | 18px |
| date | (200, 480) | 250x20 | 14px |
| certificate_id | (550, 480) | 250x20 | 14px |
| role | (200, 440) | 600x25 | 16px (hidden by default) |

## How the Preview Bug Was Fixed

### Problem
```javascript
// OLD CODE - Only "name" rendered
renderField("name")  // Only this!
```

### Solution
```javascript
// NEW CODE - All selected fields render
Object.keys(fieldConfigs)
  .filter(k => fieldConfigs[k].visible && selectedFields.includes(k))
  .map(k => renderField(k))  // All fields!
```

## Storage & Persistence

### SessionStorage Keys
- `certifyneo-fieldConfigs` → Field layout configuration (JSON)
- `certifyneo-upload` → Upload file info (filename, row count)
- `certifyneo-mapping` → Field mapping (CSV column → field name)

### Data Flow
```
Page Load
  ↓
Check sessionStorage for fieldConfigs
  ↓
If exists → Load it
If not → Use DEFAULT_FIELD_CONFIGS
  ↓
User edits (drag/resize/manual input)
  ↓
Changes saved to sessionStorage automatically
  ↓
Page refresh → Data persists!
```

## User Interactions

### Selecting a Field
- Use the dropdown in the properties panel
- Only visible fields selected during upload appear

### Moving a Field
1. Click on the field text
2. Drag to new position
3. Watch X/Y coordinates update
4. Release to drop

### Resizing a Field
1. Position cursor on bottom-right corner (blue handle appears)
2. Click and drag outward to enlarge
3. Drag inward to shrink (min 50x30)
4. Watch W/H coordinates update

### Manual Adjustment
1. Select field
2. Edit X, Y, W, H values directly in input fields
3. Changes apply immediately
4. Canvas updates in real-time

### Exporting Layout
- **Copy JSON**: Paste to text editor / send to team
- **Download JSON**: Save as `field-layout.json` file
- Share with other users or load in future batch

## Responsive Behavior

- Template aspect ratio: **1200:600** (2:1)
- Coordinates scale with container width
- Maintains aspect ratio on responsive resize
- Mobile: Single column layout
- Desktop: Editor on left, properties on right

## Integration with Batch Generation

```javascript
// Before generation:
1. Editor persists layout to sessionStorage
2. Mapping already has selected fields
3. Handler loads both from sessionStorage
4. Batch created with final layout
5. PDF generation uses stored coordinates
```

## No Dependencies Added
✅ All features built with existing libraries:
- React (hooks)
- Next.js (framework)
- Tailwind CSS (styling)
- TypeScript (types)
- Lucide React (icons)

## Next Steps for You

1. **Test in browser**: Navigate to `/batches/new/preview`
2. **Try dragging**: Select a field and move it around
3. **Try resizing**: Grab bottom-right corner and resize
4. **Try manual edit**: Enter X/Y/W/H values directly
5. **Try export**: Copy or download the JSON
6. **Refresh page**: Verify data persists
7. **Check visibility**: Toggle fields on/off

## Notes for Developers

### Template Image Path
Currently: `/templates/cert_1.png`
Change: Modify `templateImage` prop in preview page to use different template

### Adding New Fields
1. Add to `DEFAULT_FIELD_CONFIGS` in template-editor.tsx
2. Update `FIELD_OPTIONS` in map/page.tsx for mapping UI
3. Field appears in dropdown automatically

### Adjusting Canvas Size
Base size: 1200x600
Change in: `template-editor.tsx` line with `aspectRatio: "1200 / 600"`

### Custom Default Positions
Edit: `DEFAULT_FIELD_CONFIGS` in template-editor.tsx
Coordinates in: Pixels (0-1200 width, 0-600 height)

---

**Status**: ✅ Ready for Testing  
**Last Updated**: January 30, 2026  
**Tested with**: Next.js 14.2.5, React 18.3.1, TypeScript 5.5.4
