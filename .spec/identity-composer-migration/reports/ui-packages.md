# Identity Composer Migration Report: UI Packages

## Composer Status
All UI composers exist in packages.ts: **YES**
- `$UiId` - ui
- `$UiCoreId` - ui-core

## Files Requiring Migration

### packages/ui/ui/src/services/toaster.service.ts
- **Line 17**: `Effect.Service` - Current: `"app/Toaster"` → Should be: `$I`ToasterService``

### packages/ui/ui/src/services/zip.service.ts
- **Line 6**: `Effect.Service` - Current: `"ZipService"` → Should be: `$I`ZipService``

### packages/ui/ui/test/form/makeFormOptions.test.ts
- **Line 343**: `S.Class` - Current: `"FilterBrandSchema"` → Should be: `$I`FilterBrandSchema``
- **Note**: Test file - may need separate handling

### packages/ui/ui/src/data-display/markdown/markdown.tsx
- **Line 167**: `Data.TaggedError` - Current: `"BlobToDataUrlError"` → Should be: `$I`BlobToDataUrlError``

## Summary
- **Total Files**: 4
- **Effect.Service violations**: 2
- **S.Class violations**: 1
- **Data.TaggedError violations**: 1
- All violations are in `packages/ui/ui` (no violations in `packages/ui/core`)
