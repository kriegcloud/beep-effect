# Schema Annotations Audit: @beep/shared-ui

## Summary
- Total Schemas Found: 0
- Annotated: 0
- Missing Annotations: 0

## Notes

This package (`packages/shared/ui`) contains exclusively React UI components. No Effect Schema definitions were found.

### Files Reviewed

All 13 files in the `src/` directory were audited:

| File | Type |
|------|------|
| `src/index.ts` | Simple export (`beep` constant) |
| `src/files/CreateFolderDialog.tsx` | React component |
| `src/files/FilesLayout.tsx` | React component |
| `src/files/FilesEmptyState.tsx` | React component |
| `src/files/FilesPage.tsx` | React component |
| `src/files/RootFilesSection.tsx` | React component |
| `src/files/DeleteConfirmationDialog.tsx` | React component |
| `src/files/MoveFilesDialog.tsx` | React component |
| `src/files/file-item/FileItem.tsx` | React component |
| `src/files/file-item/PendingFileItem.tsx` | React component |
| `src/files/file-item/index.ts` | Re-export barrel |
| `src/files/folder/FolderSection.tsx` | React component |
| `src/files/folder/index.ts` | Re-export barrel |

### Schema Usage (Consumption Only)

Two files import schema utilities but only for consumption, not definition:

- `FileItem.tsx` imports `BS` from `@beep/schema` to use `BS.formatSize()`
- `PendingFileItem.tsx` imports `BS` from `@beep/schema` to use `BS.formatSize()`

These are utility function calls, not schema definitions.

## Annotationless Schemas Checklist

*No schemas to annotate - this package contains only React components.*
