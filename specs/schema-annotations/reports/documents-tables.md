# Schema Annotations Audit: @beep/documents-tables

## Summary
- Total Schemas Found: 0
- Annotated: 0
- Missing Annotations: 0

## Notes

This package contains **Drizzle ORM table definitions only**. There are no Effect Schemas to audit.

### Files Reviewed

| File | Contents |
|------|----------|
| `src/_check.ts` | Type compatibility checks (not schemas) |
| `src/relations.ts` | Drizzle relations definitions |
| `src/schema.ts` | Re-export barrel file |
| `src/tables/index.ts` | Re-export barrel file |
| `src/tables/comment.table.ts` | Drizzle table via `OrgTable.make` |
| `src/tables/discussion.table.ts` | Drizzle table via `OrgTable.make` |
| `src/tables/document.table.ts` | Drizzle table via `OrgTable.make` + `textStylePgEnum` (Drizzle enum, not Effect Schema) |
| `src/tables/documentFile.table.ts` | Drizzle table via `OrgTable.make` |
| `src/tables/documentVersion.table.ts` | Drizzle table via `OrgTable.make` |

## Annotationless Schemas Checklist

*None - no Effect Schemas exist in this package*
