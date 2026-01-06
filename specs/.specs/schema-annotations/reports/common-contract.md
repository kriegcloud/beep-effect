# Schema Annotations Audit: @beep/contract

## Summary
- Total Schemas Found: 14
- Annotated: 12
- Missing Annotations: 2

## Analysis

This package has excellent annotation coverage. Nearly all schemas use the `$I.annotations()` pattern provided by the `@beep/identity` package system, ensuring consistent identifiers, descriptions, and titles across the codebase.

### Well-Annotated Schemas

The following schemas are properly annotated:

| File | Line | Schema | Type | Status |
|------|------|--------|------|--------|
| `src/internal/contract-error/contract-error.ts` | 96 | `HttpRequestErrorReason` | BS.StringLiteralKit | Annotated |
| `src/internal/contract-error/contract-error.ts` | 142 | `HttpRequestError` | S.TaggedError | Annotated |
| `src/internal/contract-error/contract-error.ts` | 262 | `HttpResponseDetails` | S.Class | Annotated |
| `src/internal/contract-error/contract-error.ts` | 277 | `HttpResponseErrorReason` | BS.StringLiteralKit | Annotated |
| `src/internal/contract-error/contract-error.ts` | 325 | `HttpResponseError` | S.TaggedError | Annotated |
| `src/internal/contract-error/contract-error.ts` | 497 | `MalformedInput` | S.TaggedError | Annotated |
| `src/internal/contract-error/contract-error.ts` | 559 | `MalformedOutput` | S.TaggedError | Annotated |
| `src/internal/contract-error/contract-error.ts` | 664 | `UnknownError` | S.TaggedError | Annotated |
| `src/internal/contract-error/contract-error.ts` | 729 | `ContractError` | S.Union | Annotated |
| `src/internal/contract/types.ts` | 58 | `FailureMode` | BS.StringLiteralKit | Annotated |
| `src/internal/contract/annotations.ts` | 14 | `ContextAnnotationTag` | BS.StringLiteralKit | Annotated |

## Annotationless Schemas Checklist

- [ ] `src/internal/contract-kit/contract-kit.ts:191` - `LiftServiceMode` - BS.StringLiteralKit
  - **Issue**: No `.annotations()` call - missing schemaId, identifier, title, and description
  - **Suggested fix**: Add annotations like:
    ```typescript
    export class LiftServiceMode extends BS.StringLiteralKit("success", "result").annotations(
      $I.annotations("LiftServiceMode", {
        description: "Determines whether lifted service methods should expose only successes or the full HandleOutcome."
      })
    ) {}
    ```

- [ ] `src/internal/contract/annotations.ts:77` - `SupportsAbort` - Context.Reference
  - **Note**: This is a `Context.Reference` which may not require schema annotations in the same way, as it's a Context service tag rather than a data schema. However, for consistency with other Context tags in the file (Title, Domain, Method, etc.), it could benefit from documentation. The implementation uses `Context.Reference` rather than `Context.Tag`, which already accepts a default value configuration but not schema annotations.

## Notes

1. **Context Tags**: The annotation classes `Title`, `Domain`, `Method`, `Visibility`, `RateLimitKey`, and `Audience` are all `Context.Tag` instances. These don't use the same annotation pattern as Effect Schemas since they're service identifiers, not data schemas. They are correctly implemented.

2. **The `SupportsAbort` case**: Unlike the other annotation tags, `SupportsAbort` uses `Context.Reference` with a default value factory. This is semantically different but consistent with its purpose (providing a default boolean value). This is a borderline case - it's not a data schema that needs validation annotations.

3. **Contract.make and Contract.fromTaggedRequest**: These are generic factory functions that create dynamically-typed contracts. The contracts themselves carry annotations via the `annotations` field, but the factory functions don't define static schemas that need annotation.

4. **BS.StringLiteralKit**: This is a utility from `@beep/schema` that creates enum-like literal types. All instances properly use `.annotations()` except `LiftServiceMode`.

## Recommendation

Only **1 schema requires attention**: `LiftServiceMode` in `src/internal/contract-kit/contract-kit.ts:191`.

The `SupportsAbort` Context.Reference is technically correct as-is, but could optionally be converted to the same pattern as the other Context.Tag annotations for consistency.
