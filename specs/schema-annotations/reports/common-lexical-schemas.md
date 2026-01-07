# Schema Annotations Audit: @beep/lexical-schemas

## Summary
- Total Schemas Found: 17
- Annotated: 17
- Missing Annotations: 0

## Status: FULLY ANNOTATED

All schemas in this package have proper annotations via the `$I.annotations()` pattern.

## Annotated Schemas Reference

### errors.ts
- `src/errors.ts:35` - `LexicalSchemaValidationError` - S.TaggedError
- `src/errors.ts:80` - `UnknownNodeTypeError` - S.TaggedError

### nodes/base.ts
- `src/nodes/base.ts:38` - `ElementFormatType` - BS.LiteralKit
- `src/nodes/base.ts:80` - `TextDirectionType` - BS.LiteralKit
- `src/nodes/base.ts:117` - `TextModeType` - BS.LiteralKit
- `src/nodes/base.ts:160` - `SerializedLexicalNodeBase` - S.Struct

### nodes/element.ts
- `src/nodes/element.ts:64` - `SerializedLexicalNode` - S.suspend (recursive union)
- `src/nodes/element.ts:469` - `SerializedRootNode` - S.Struct
- `src/nodes/element.ts:507` - `SerializedParagraphNode` - S.Struct

### nodes/tab.ts
- `src/nodes/tab.ts:50` - `SerializedTabNode` - S.Struct (class)

### nodes/text.ts
- `src/nodes/text.ts:51` - `SerializedTextNode` - S.Struct (class)

### nodes/linebreak.ts
- `src/nodes/linebreak.ts:40` - `SerializedLineBreakNode` - S.Struct (class)

### state.ts
- `src/state.ts:67` - `SerializedEditorState` - S.Struct (class)

### nodes/plugins/index.ts
- `src/nodes/plugins/index.ts:26` - `HeadingTagType` - BS.StringLiteralKit
- `src/nodes/plugins/index.ts:42` - `ListTypeEnum` - BS.StringLiteralKit
- `src/nodes/plugins/index.ts:58` - `ListTagType` - BS.StringLiteralKit
- `src/nodes/plugins/index.ts:74` - `TableCellHeaderState` - BS.LiteralKit

## Annotationless Schemas Checklist

(None - all schemas are annotated)
