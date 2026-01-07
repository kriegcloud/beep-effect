# Schema Annotations Audit: @beep/constants

## Summary
- Total Schemas Found: 12
- Annotated: 11
- Missing Annotations: 1

## Details

### Annotated Schemas (11)

All of the following schemas properly use the `$I.annotations()` pattern from `@beep/identity`:

| File | Schema | Type | Status |
|------|--------|------|--------|
| `src/AuthProviders.ts:10` | `AuthProviderNameValue` | BS.StringLiteralKit | Annotated |
| `src/EnvValue.ts:5` | `EnvValue` | BS.StringLiteralKit | Annotated |
| `src/AllowedHttpMethods.ts:8` | `AllowedHttpMethods` | BS.HttpMethod.derive | Annotated |
| `src/LogLevel.ts:6` | `LogLevel` | BS.StringLiteralKit | Annotated |
| `src/NodeEnvValue.ts:5` | `NodeEnvValue` | BS.StringLiteralKit | Annotated |
| `src/AllowedHeaders.ts:6` | `AllowedHeaders` | BS.StringLiteralKit | Annotated |
| `src/LogFormat.ts:6` | `LogFormat` | BS.StringLiteralKit | Annotated |
| `src/LogFormat.ts:17` | `LogFormatTagged` | LogFormat.toTagged().Union | Annotated |
| `src/Pagination.ts:6` | `PAGINATION_LIMIT` | S.Literal | Annotated |
| `src/SubscriptionPlanValue.ts:6` | `SubscriptionPlanValue` | StringLiteralKit | Annotated |

## Annotationless Schemas Checklist

- [ ] `src/AuthProviders.ts:82` - `TaggedAuthProviderNameValue` - Union (derived from AuthProviderNameValue.toTagged)

## Notes

1. **TaggedAuthProviderNameValue**: This is derived from `AuthProviderNameValue.toTagged("name").Union` but does not have its own `.annotations()` call. Unlike `LogFormatTagged` which properly chains `.annotations()` after the Union, this one does not.

2. **Excluded from audit**:
   - `src/Csp.ts` - Contains only plain object constants (`CSP_DIRECTIVES`, `CSP_HEADER`), no Effect Schemas
   - `src/_generated/asset-paths.ts` - Auto-generated path array, no Effect Schemas
   - `src/paths/**/*.ts` - Utility functions and type-only exports, no Effect Schemas
   - `src/AllowedHttpMethods.ts:6` - `AllowedHttpMethodsKit` is an intermediate variable, the final class `AllowedHttpMethods` is properly annotated

## Recommendation

Add annotations to `TaggedAuthProviderNameValue` following the pattern used in `LogFormat.ts`:

```typescript
// Current (missing annotations):
export class TaggedAuthProviderNameValue extends AuthProviderNameValue.toTagged("name").Union {}

// Should be:
export class TaggedAuthProviderNameValue extends AuthProviderNameValue.toTagged("name").Union.annotations(
  $I.annotations("TaggedAuthProviderNameValue", {
    title: "Tagged Auth Provider Name Value",
    description: "Tagged variant of auth provider name for discriminated unions.",
  })
) {}
```
