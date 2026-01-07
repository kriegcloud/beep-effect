# Schema Annotations Audit: @beep/iam-tables

## Summary
- Total Schemas Found: 0
- Annotated: 0
- Missing Annotations: 0

## Analysis

This package contains **no Effect Schemas**. The `@beep/iam-tables` package exclusively contains:

1. **Drizzle ORM table definitions** - Using `Table.make()` and `OrgTable.make()` from `@beep/shared-tables`
2. **Drizzle ORM relations** - Using `d.relations()` from `drizzle-orm`
3. **PostgreSQL enums** - Created via domain entity helpers (e.g., `DeviceCode.makeDeviceCodeStatusPgEnum()`)
4. **Type check utilities** - Runtime type assertions in `_check.ts`
5. **Re-exports** - From `@beep/shared-tables` and local modules

The actual Effect Schemas for IAM entities (using `S.Class`, `S.Struct`, `M.Class`, `S.TaggedError`) are defined in `@beep/iam-domain`, not in this tables package.

## Files Reviewed

| File | Contents |
|------|----------|
| `src/index.ts` | Re-exports `IamDbSchema` |
| `src/schema.ts` | Re-exports relations and tables |
| `src/schema-object.ts` | Schema object aggregating tables and relations |
| `src/relations.ts` | Drizzle relation definitions |
| `src/_check.ts` | Type check assertions |
| `src/tables/index.ts` | Re-exports all table modules |
| `src/tables/*.table.ts` | Drizzle table definitions (19 files) |

## Annotationless Schemas Checklist

(none - no Effect Schemas found in this package)
