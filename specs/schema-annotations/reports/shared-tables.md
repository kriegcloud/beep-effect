# Schema Annotations Audit: @beep/shared-tables

## Summary
- Total Schemas Found: 1
- Annotated: 0
- Missing Annotations: 1

## Notes

This package primarily contains **Drizzle ORM table definitions**, which are database schema definitions, NOT Effect Schemas. The following are explicitly excluded from this audit:

- `user`, `session`, `organization`, `team`, `folder`, `file`, `uploadSession` - Drizzle table definitions created via `Table.make()` and `OrgTable.make()`
- `Table.make`, `OrgTable.make` - Generic factory functions for creating Drizzle tables
- `datetime`, `bytea`, `byteaBase64` - Drizzle custom column types (not Effect Schemas)
- `userRolePgEnum`, `organizationTypePgEnum`, `subscriptionTierPgEnum`, `subscriptionStatusPgEnum` - PostgreSQL enum definitions
- Type-only exports (`MergedColumns`, `Prettify`, `PgTableWithMergedColumns`, `DefaultColumns`, etc.)

## Annotationless Schemas Checklist

- [ ] `src/columns/custom-datetime.ts:17` - `DateTimeToIsoString` - S.transformOrFail (internal/non-exported)

## Recommendations

The single schema found (`DateTimeToIsoString`) is an internal implementation detail used for converting datetime values to ISO strings in the custom Drizzle column. Since it is:
1. Not exported
2. Purely for internal driver conversion logic
3. Not a domain entity or value object

Annotating it may provide minimal value. However, for consistency, adding a simple annotation describing its purpose would be reasonable:

```typescript
const DateTimeToIsoString = S.transformOrFail(
  S.Union(S.String, S.Number, S.DateFromSelf, S.DateTimeUtcFromSelf),
  S.String,
  { ... }
).annotations({
  identifier: "DateTimeToIsoString",
  title: "DateTime to ISO String",
  description: "Transforms various datetime inputs to ISO 8601 string format for database storage"
});
```
