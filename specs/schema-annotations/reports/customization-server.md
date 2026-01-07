# Schema Annotations Audit: @beep/customization-server

## Summary
- Total Schemas Found: 0
- Annotated: 0
- Missing Annotations: 0

## Annotationless Schemas Checklist

(none)

## Notes

This package contains infrastructure code (database client, repositories) rather than schema definitions:

- `src/db/Db/Db.ts` - Contains a `Context.Tag` service definition for database access, not an Effect Schema
- `src/db/repos/UserHotkey.repo.ts` - Contains an `Effect.Service` repository class, not an Effect Schema
- `src/db/repositories.ts` - Layer composition, no schemas
- `src/db/repos/_common.ts` - Common dependencies, no schemas

The actual schema and model definitions for this slice reside in:
- `@beep/customization-domain` - Entity models (e.g., `Entities.UserHotkey.Model`)
- `@beep/customization-tables` - Drizzle table schemas

No `S.Class`, `S.Struct`, `S.TaggedError`, or `M.Class` declarations were found in this package's source files.
