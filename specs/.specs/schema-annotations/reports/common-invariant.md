# Schema Annotations Audit: @beep/invariant

## Summary
- Total Schemas Found: 1
- Annotated: 0
- Missing Annotations: 1

## Annotationless Schemas Checklist

- [ ] `src/meta.ts:39` - `CallMetadata` - S.Struct

## Notes

### Excluded Items

1. **`error.ts:51` - `InvariantViolation`**: This is a plain JavaScript `Error` subclass, NOT an Effect Schema. It extends `Error` directly rather than using `S.Class` or `S.TaggedError`.

2. **`invariant.ts`**: Contains only runtime assertion functions and TypeScript types. No Effect Schema declarations present.

3. **`index.ts`**: Re-exports only; no schema definitions.
