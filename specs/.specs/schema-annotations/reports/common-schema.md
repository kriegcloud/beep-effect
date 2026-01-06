# Schema Annotations Audit: @beep/schema

## Summary
- Total Schemas Found: 68
- Annotated: 59
- Missing Annotations: 9

## Annotationless Schemas Checklist

- [ ] `src/integrations/files/utils/formatSize.ts:39` - `InvalidFileSizeInput` - S.TaggedError (missing `$I.annotations()`)
- [ ] `src/integrations/files/utils/formatSize.ts:119` - `FormattedNumberStruct` - S.Struct (internal helper, but exported implicitly via schema)
- [ ] `src/primitives/number/formatted-number.ts:8` - `BigIntToSiSymbol` - MappedLiteralKit (missing annotations)
- [ ] `src/integrations/sql/dsl/errors.ts:78` - `AutoIncrementTypeError` - S.TaggedError (missing `$I.annotations()`)
- [ ] `src/integrations/sql/dsl/errors.ts:93` - `IdentifierTooLongError` - S.TaggedError (missing `$I.annotations()`)
- [ ] `src/integrations/sql/dsl/errors.ts:110` - `InvalidIdentifierCharsError` - S.TaggedError (missing `$I.annotations()`)
- [ ] `src/integrations/sql/dsl/errors.ts:128` - `NullablePrimaryKeyError` - S.TaggedError (missing `$I.annotations()`)
- [ ] `src/integrations/sql/dsl/errors.ts:149` - `MissingVariantSchemaError` - S.TaggedError (missing `$I.annotations()`)
- [ ] `src/integrations/sql/dsl/errors.ts:166` - `UnsupportedColumnTypeError` - S.TaggedError (missing `$I.annotations()`)
- [ ] `src/integrations/sql/dsl/errors.ts:190` - `EmptyModelIdentifierError` - S.TaggedError (missing `$I.annotations()`)
- [ ] `src/integrations/sql/dsl/errors.ts:204` - `MultipleAutoIncrementError` - S.TaggedError (missing `$I.annotations()`)
- [ ] `src/integrations/sql/dsl/errors.ts:225` - `ModelValidationAggregateError` - S.TaggedError (missing `$I.annotations()`)
- [ ] `src/primitives/json/json.ts:173` - `JsonArray` - S.Array(Json) (missing annotations)
- [ ] `src/primitives/json/json.ts:225` - `NonEmptyJsonArray` - S.NonEmptyArray(Json) (missing annotations)

## Notes

### Properly Annotated Schemas (Examples)

The following schemas correctly use `$I.annotations()` pattern:

- `src/integrations/files/FileAttributes.ts` - `FileAttributes` class
- `src/integrations/files/AspectRatio.ts` - `AspectRatio` class
- `src/integrations/files/File.ts` - `FileSchema`, `FileIntegrity` classes
- `src/integrations/files/SignedFile.ts` - `SignedFile` class
- `src/integrations/files/file-types/FileInfo.ts` - `FileInfo`, `DetectedFileInfo` classes
- `src/integrations/files/file-types/FileSignature.ts` - `FileSignature` class
- `src/integrations/files/file-types/detection.ts` - `InvalidChunkSizeError` class
- `src/integrations/files/file-types/utils.ts` - `IllegalChunkError`, `InvalidFileTypeError` classes
- `src/integrations/files/exif-metadata/errors.ts` - `ExifExtractionError` class
- `src/integrations/files/exif-metadata/ExifMetadata.ts` - `ExifMetadata` class
- `src/integrations/files/pdf-metadata/errors.ts` - `PdfMetadataExtractionError` class
- `src/integrations/files/pdf-metadata/PdfMetadata.ts` - `PdfMetadata` class
- `src/integrations/files/metadata/types.ts` - `DetectedMetadata` class
- `src/integrations/http/http-request-details.ts` - `HttpRequestDetails` class
- `src/integrations/config/csp.ts` - `CSPDirectivePart`, `CSPStruct`, `CSPString`, `Csp` classes
- `src/primitives/network/ip.ts` - `IPv4`, `IPv6`, `IP` schemas
- `src/primitives/bool/bool.ts` - `BoolTrue`, `BoolFalse`, `TrueLiteral`, `FalseLiteral` schemas
- `src/primitives/json/json.ts` - `JsonLiteral`, `Json`, `JsonObject`, `JsonPath`, `JsonProp`, `JsonStringToStringArray`, `JsonStringToArray`
- `src/primitives/number/number.ts` - `StringOrNumberToNumber` schema
- `src/primitives/string/slug.ts` - `SlugBase`, `Slug` schemas
- `src/primitives/string/email.ts` - `EmailEncoded`, `EmailBase`, `Email` schemas
- `src/primitives/temporal/dates/date-time.ts` - All date-time schemas
- `src/internal/regex/regex.ts` - `Regex`, `RegexFromString` schemas

### Exclusions

The following were excluded from the audit:

1. **Generic utility functions**: `Nullish`, `NullishString` in `src/core/generics/nullish.ts` are factory/utility functions, not standalone schemas
2. **Re-exports and barrel files**: Index files that re-export from other modules
3. **Internal non-exported helpers**: Local `const` declarations used only within transformations
4. **Type-only exports**: `declare namespace` blocks with type aliases

### Pattern Observed

The codebase consistently uses the `$SchemaId.create()` and `$I.annotations()` pattern for schema annotations. Most schemas are properly annotated. The exceptions are primarily in `src/integrations/sql/dsl/errors.ts` which contains many S.TaggedError classes without the `$I.annotations()` third argument.
