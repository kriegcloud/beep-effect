# Schema Annotation Checklist

## Summary

All schema files have been updated to use the `$I.annotations()` pattern from `@beep/identity/packages`.

| File | Schemas | Status |
|------|---------|--------|
| `nodes/plugins/index.ts` | 4 | **COMPLETED** |
| `nodes/base.ts` | 4 | **COMPLETED** |
| `nodes/element.ts` | 3 | **COMPLETED** |
| `nodes/text.ts` | 1 | **COMPLETED** |
| `nodes/linebreak.ts` | 1 | **COMPLETED** |
| `nodes/tab.ts` | 1 | **COMPLETED** |
| `state.ts` | 1 | **COMPLETED** |
| `errors.ts` | 2 | **COMPLETED** |
| `annotation-utils.ts` | N/A | **CREATED** |

---

## File: nodes/plugins/index.ts
Module Path: `"nodes/plugins"`

### Schemas Updated
- [x] HeadingTagType - uses `$I.annotations()`
- [x] ListTypeEnum - uses `$I.annotations()`
- [x] ListTagType - uses `$I.annotations()`
- [x] TableCellHeaderState - uses `$I.annotations()`

---

## File: nodes/base.ts
Module Path: `"nodes/base"`

### Schemas Updated
- [x] ElementFormatType - uses `$I.annotations()` with description, documentation, examples, message, parseIssueTitle
- [x] TextDirectionType - uses `$I.annotations()` with description, documentation, examples, message, parseIssueTitle
- [x] TextModeType - uses `$I.annotations()` with description, documentation, examples, message, parseIssueTitle
- [x] SerializedLexicalNodeBase - uses `$I.annotations()` with description, documentation, message, parseIssueTitle

---

## File: nodes/element.ts
Module Path: `"nodes/element"`

### Schemas Updated
- [x] SerializedLexicalNode - uses `$I.annotations()` with description, documentation, message, parseIssueTitle
- [x] SerializedRootNode - uses `$I.annotations()` with description, documentation, message, parseIssueTitle
- [x] SerializedParagraphNode - uses `$I.annotations()` with description, documentation, message, parseIssueTitle

---

## File: nodes/text.ts
Module Path: `"nodes/text"`

### Schemas Updated
- [x] SerializedTextNode - uses `$I.annotations()` with description, documentation, message, parseIssueTitle

---

## File: nodes/linebreak.ts
Module Path: `"nodes/linebreak"`

### Schemas Updated
- [x] SerializedLineBreakNode - uses `$I.annotations()` with description, documentation, message, parseIssueTitle

---

## File: nodes/tab.ts
Module Path: `"nodes/tab"`

### Schemas Updated
- [x] SerializedTabNode - uses `$I.annotations()` with description, documentation, message, parseIssueTitle

---

## File: state.ts
Module Path: `"state"`

### Schemas Updated
- [x] SerializedEditorState - uses `$I.annotations()` with description, documentation, message, parseIssueTitle

---

## File: errors.ts
Module Path: `"errors"`

### Schemas Updated
- [x] LexicalSchemaValidationError - uses `$I.annotations()` with description, documentation, message, parseIssueTitle
- [x] UnknownNodeTypeError - uses `$I.annotations()` with description, documentation, message, parseIssueTitle

---

## Annotation Utilities Created

Created `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/lexical-schemas/src/annotation-utils.ts`:

- `literalAnnotations` - for enum/literal schemas with examples
- `nodeAnnotations` - for struct node schemas
- `errorAnnotations` - for TaggedError schemas
- `structAnnotations` - for general struct schemas

---

## Verification Results

- [x] `bun run check` passes with no type errors
- [x] `bun test` passes all 17 tests (81 expect() calls)
- [x] `biome check .` passes with no errors
- [x] All schemas use `$I.annotations()` instead of manual `.annotations()`
- [x] All schemas have `description` annotation
- [x] All schemas have `documentation` annotation
- [x] All schemas have `message` annotation
- [x] All schemas have `parseIssueTitle` annotation
- [x] Literal/enum schemas have `examples` annotation
- [x] No manual `identifier`, `schemaId`, or `title` properties remain

---

## Notes

### Examples Removed from Complex Structs

During implementation, we discovered that complex struct schemas with nested types (like `SerializedTextNode`, `SerializedEditorState`, etc.) cannot have `examples` in their annotations due to TypeScript's type inference. The literal values in examples are inferred as narrower types (e.g., `"normal"` instead of `"normal" | "token" | "segmented"`), which conflicts with the schema's full union types.

**Resolution**: Removed `examples` from struct schemas while keeping them on literal/enum schemas where they work correctly. This is a limitation of the identity annotation system's type inference, not a problem with the annotation pattern itself.

### Literal/Enum Schemas with Examples

The following schemas have `examples` annotations:
- `ElementFormatType`: `["left", "start", "center", "right", "end", "justify", ""]`
- `TextDirectionType`: `["ltr", "rtl", null]`
- `TextModeType`: `["normal", "token", "segmented"]`
- `TableCellHeaderState`: `[0, 1, 2, 3, 4]`
- `HeadingTagType`, `ListTypeEnum`, `ListTagType` (existing)
