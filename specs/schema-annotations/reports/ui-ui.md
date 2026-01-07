# Schema Annotations Audit: @beep/ui

## Summary
- Total Schemas Found: 1
- Annotated: 0
- Missing Annotations: 1

## Notes

This package (`packages/ui/ui`) is primarily a React component library. Most files contain UI components (React/JSX), not Effect schemas.

The package imports Effect Schema (`effect/Schema`) for validation utilities in forms and type guards, but defines only one schema class:

### Files Reviewed

1. **`src/inputs/upload/avatar/upload-avatar.tsx`** - Uses `S.is(BS.Url)` for type checking, no schema definitions
2. **`src/form/makeFormOptions.ts`** - Uses `S.Schema` as a type parameter in utility functions (generic validator), no schema definitions
3. **`src/form/form-options-with-defaults.ts`** - Uses `S.Schema` for form validation, no schema definitions
4. **`src/form/form-options-with-submit-effect.ts`** - Uses `S.Schema` for form submission, no schema definitions
5. **`src/form/form-options-with-submit.ts`** - Uses `S.Schema` for form submission, no schema definitions
6. **`src/data-display/markdown/markdown.tsx`** - Contains `Data.TaggedError` (runtime error, not schema)
7. **`src/components/editor/use-chat.ts`** - Contains `ToolName` schema class (missing annotations)

### Excluded Items

- **`BlobToDataUrlError`** in `src/data-display/markdown/markdown.tsx` - Uses `Data.TaggedError` from `effect/Data`, not `S.TaggedError` from `effect/Schema`. This is a runtime error class, not a schema class, so it does NOT require schema annotations.

## Annotationless Schemas Checklist

- [ ] `src/components/editor/use-chat.ts:71` - `ToolName` - S.Class (extends BS.StringLiteralKit)

### Details

#### ToolName (use-chat.ts:71)

```typescript
export class ToolName extends BS.StringLiteralKit("comment", "edit", "generate") {}
```

This class extends `BS.StringLiteralKit`, which is an `S.AnnotableClass` from Effect Schema. It creates a union schema of the string literals "comment", "edit", and "generate".

**Missing**: The class should include annotations with at least an identifier:

```typescript
export class ToolName extends BS.StringLiteralKit("comment", "edit", "generate").annotations({
  identifier: "ToolName",
  title: "Tool Name",
  description: "AI chat tool names for editor operations"
}) {}
```
