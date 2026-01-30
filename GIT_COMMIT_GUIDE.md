# 🚀 Next Steps for Git Commit & Push

## Manual Step Required (ONE TIME ONLY):

Copy the purple certificate template image:

```bash
# PowerShell (Windows):
Copy-Item "D:\Projects on github\Certificate-generator-web\design\Purple Professional Certificate Of Participation.png" `
  -Destination "D:\Projects on github\Certificate-generator-web\apps\web\public\templates\openverse-purple.png"

# Or manually:
1. Open: D:\Projects on github\Certificate-generator-web\design\
2. Copy "Purple Professional Certificate Of Participation.png"
3. Paste into: D:\Projects on github\Certificate-generator-web\apps\web\public\templates\
4. Rename to: openverse-purple.png
```

## After Copying Template:

```bash
cd "D:\Projects on github\Certificate-generator-web"

# Stage all changes
git add -A

# Create commits in logical chunks:
git commit -m "fix: upload parsing with fallback client-side parser + dynamic field mapping

- Add file-parser utility for CSV parsing when API unavailable
- Make field mapping flexible: only 'name' required, others optional
- Update upload UI to show 'Bulk Certificate Generator'
- Show dynamic headers from actual file parse result
- Improve error messaging"

git commit -m "feat: template editor improvements + preview page fixes

- Remove JSON export buttons (not needed for demo)
- Optimize performance with debounced storage saves (200ms)
- Fix batch summary to show only selected/mapped fields
- Fix generate button to store batch results in localStorage
- Change default template to openverse-purple.png
- Add automatic navigation to results page after generation"

git commit -m "ui: results page + settings + dashboard improvements

- Completely redesign results page to read from localStorage
- Show list of generated batches with batch details
- Add responsive layout for mobile/desktop
- Implement functional settings/profile page with editing
- Add avatar upload with preview to settings
- Update dashboard quick actions with correct routing
- Remove Team nav link (no dead 404s)"

# Push to GitHub
git push origin main

# Verify push
git log --oneline -5  # Should show your 3 new commits
```

## Verify Everything Works:

1. ✅ Run `npm run dev` in apps/web
2. ✅ Test upload flow: Dashboard → New batch → Upload CSV
3. ✅ Test mapping: Map fields (only name required)
4. ✅ Test preview: See template editor with purple background
5. ✅ Test generation: Click "Generate batch" → navigate to results
6. ✅ Test results: See generated batch in list
7. ✅ Test settings: Edit name/email, upload avatar
8. ✅ Test navigation: All links work, no 404s

## Files Changed (8 files + 1 new):

1. `apps/web/src/lib/file-parser.ts` (NEW)
2. `apps/web/src/components/template-editor.tsx`
3. `apps/web/src/components/layout/sidebar.tsx`
4. `apps/web/src/app/(dashboard)/dashboard/page.tsx`
5. `apps/web/src/app/(dashboard)/settings/page.tsx`
6. `apps/web/src/app/(dashboard)/batches/new/upload/page.tsx`
7. `apps/web/src/app/(dashboard)/batches/new/map/page.tsx`
8. `apps/web/src/app/(dashboard)/batches/new/preview/page.tsx`
9. `apps/web/src/app/(dashboard)/batches/[id]/results/page.tsx`

Also created:
- `apps/web/public/templates/` (directory for templates)

## GitHub Repository:

Push to: https://github.com/classifiedstudentkabir/OpenVerse-Campus-Helper.git

---

**Status**: ✅ Ready for commit and push!
