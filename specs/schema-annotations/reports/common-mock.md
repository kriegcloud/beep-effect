# Schema Annotations Audit: @beep/mock

## Summary
- Total Schemas Found: 0
- Annotated: 0
- Missing Annotations: 0

## Annotationless Schemas Checklist

N/A - No Effect Schemas found in this package.

## Notes

This package is a mock data utility library that contains:
- Plain JavaScript/TypeScript constant arrays (using `as const`)
- Data generator functions producing mock objects for testing/development
- One usage of Effect's `A.makeBy` for array generation

**Files reviewed:**
- `src/_blog.ts` - Option constants
- `src/_order.ts` - Order mock data generator
- `src/_job.ts` - Job mock data generator
- `src/_files.ts` - File mock data generator
- `src/_invoice.ts` - Invoice mock data generator
- `src/_mock.ts` - Core mock utility object
- `src/_time.ts` - Date array generator
- `src/_others.ts` - Miscellaneous mock data generators
- `src/assets.ts` - String/number constant arrays
- `src/_overview.ts` - Dashboard overview mock data
- `src/index.ts` - Re-exports
- `src/_user.ts` - User mock data generator
- `src/_tour.ts` - Tour mock data generator
- `src/_product.ts` - Product option constants

No Effect Schema declarations (`S.Class`, `S.Struct`, `S.TaggedError`, `M.Class`, or named schema exports) were found in any of these files. This package serves purely as a runtime mock data provider without schema definitions.
