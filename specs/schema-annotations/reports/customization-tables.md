# Schema Annotations Audit: @beep/customization-tables

## Summary
- Total Schemas Found: 0
- Annotated: 0
- Missing Annotations: 0

## Notes

This package contains **Drizzle ORM definitions only** - no Effect Schemas were found.

### Contents Analyzed (Excluded per audit rules):

1. **Drizzle Table Definitions**:
   - `tables/user-hotkey.table.ts:6` - `userHotkey` table using `Table.make()`

2. **Drizzle Relations**:
   - `relations.ts:4` - `userHotkeyRelations`
   - `relations.ts:11` - `userRelations`

3. **Re-exports** from `@beep/shared-tables`:
   - `organization.table`
   - `team.table`
   - `user.table`

All of the above are Drizzle ORM constructs, not Effect Schemas, and are correctly excluded from this audit.

## Annotationless Schemas Checklist

*No Effect Schemas found in this package.*
