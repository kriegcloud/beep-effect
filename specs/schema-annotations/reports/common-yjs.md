# Schema Annotations Audit: @beep/yjs

## Summary
- Total Schemas Found: 72
- Annotated: 70
- Missing Annotations: 2

## Annotationless Schemas Checklist

- [ ] `src/protocol/Ai.ts:30` - `ContextualPromptResponseOther` - S.Class
- [ ] `src/protocol/Groups.ts:17` - `GroupScopes` - S.Struct (via S.pipe with S.partial)

## Notes

### Excluded Items

The following were reviewed but excluded from the checklist:

1. **`lib/assert.ts:4` - `AssertError`**: Uses `Data.TaggedError` (from `effect/Data`), not `S.TaggedError` (from `effect/Schema`). This is a runtime error type, not a Schema type.

2. **`protocol/Comments.ts` - `CommentDataBase`, `CommentDataWithBody`, `CommentDataDeleted`**: These are local variables (not exported) used to construct the `CommentData` union, which is properly annotated.

3. **Generic factory functions**: Functions like `ThreadData()`, `QueryMetadata()`, `UpdatePresenceServerMsg()`, `InboxNotificationActivity()`, etc. apply annotations internally when invoked. These are schema constructors, not static schemas.

4. **`lib/abort-controller.ts`**: Contains no Schema definitions (just utility functions).

5. **`lib/position.ts` helper functions**: `nthDigit`, `isPos`, etc. are internal functions, not schemas.

## Detailed Findings

### Missing Annotations

#### 1. `ContextualPromptResponseOther` (src/protocol/Ai.ts:30)

```typescript
export class ContextualPromptResponseOther extends S.Class<ContextualPromptResponseOther>(
  $I`ContextualPromptResponseOther`
)({
  type: S.tag("other"),
  text: S.String,
}) {}
```

Missing the second argument to the class definition which should contain annotations:

```typescript
$I.annotations("ContextualPromptResponseOther", {
  description: "Contextual prompt response other for Yjs protocol",
})
```

#### 2. `GroupScopes` (src/protocol/Groups.ts:17)

```typescript
export const GroupScopes = S.Struct({
  mention: S.Literal(true),
}).pipe(S.partial);
```

Should have `.annotations()` call:

```typescript
export const GroupScopes = S.Struct({
  mention: S.Literal(true),
}).pipe(S.partial).annotations(
  $I.annotations("GroupScopes", {
    description: "Group scopes for Yjs protocol",
  })
);
```
