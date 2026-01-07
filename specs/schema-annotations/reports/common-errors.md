# Schema Annotations Audit: @beep/errors

## Summary
- Total Schemas Found: 11
- Annotated: 10
- Missing Annotations: 1

## Annotationless Schemas Checklist

- [ ] `src/errors.ts:27` - `Es5Error` - Data.Error

## Notes

### Fully Annotated Schemas

The following `S.TaggedError` schemas in `src/errors.ts` all have proper annotations via `HttpApiSchema.annotations` combined with the package identity system (`$I.annotations`):

| Schema | Line | HTTP Status |
|--------|------|-------------|
| `UnrecoverableError` | 39 | 500 |
| `NotFoundError` | 68 | 404 |
| `UniqueViolationError` | 96 | 409 |
| `DatabaseError` | 125 | 500 |
| `TransactionError` | 153 | 500 |
| `ConnectionError` | 181 | 500 |
| `ParseError` | 209 | 400 |
| `Unauthorized` | 237 | 401 |
| `Forbidden` | 268 | 403 |
| `UnknownError` | 298 | (identity only) |

### About Es5Error

`Es5Error` at line 27 extends `Data.Error` rather than using `S.TaggedError`. It serves as an ES5-compatible error wrapper and is not a typical Effect Schema entity. Consider whether this should:

1. Remain as `Data.Error` (no annotations needed for this pattern)
2. Be migrated to `S.TaggedError` with proper annotations if it needs schema capabilities

This is a minor concern since `Data.Error` classes are not typically annotated in the same way as Effect Schemas.
