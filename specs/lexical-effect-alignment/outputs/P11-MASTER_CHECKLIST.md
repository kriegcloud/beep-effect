# P11 Master Checklist: Option<T> Migration

## Summary

| Metric | Count |
|--------|-------|
| Total migration candidates | 14 |
| Batches | 5 |
| Directories already using Option | commenting/, context/, hooks/, ui/, utils/ |

## Migration Candidates

### Batch 1: CodeActionMenuPlugin, AiAssistantPlugin (3 functions)

| Status | Function | Location | Pattern |
|--------|----------|----------|---------|
| [ ] | `getCodeDOMNode` | `plugins/CodeActionMenuPlugin/index.tsx:37` | Returns `HTMLElement \| null` |
| [ ] | `getMouseInfo` | `plugins/CodeActionMenuPlugin/index.tsx:140-153` | Returns `{ codeDOMNode: HTMLElement \| null }` |
| [ ] | `broadcastAiActivity` | `plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts:109-116` | Params accept `string \| null, SerializedRange \| null` |

**Callers:**
- `getCodeDOMNode`: lines 130, 132 (passed to CopyButton/PrettierButton)
- `getMouseInfo`: line 43 in debouncedOnMouseMove
- `broadcastAiActivity`: part of CollaborativeAiState interface

### Batch 2: ImagesPlugin (2 functions)

| Status | Function | Location | Pattern |
|--------|----------|----------|---------|
| [ ] | `$getImageNodeInSelection` | `plugins/ImagesPlugin/index.tsx:315` | Returns `ImageNode \| null` |
| [ ] | `getDragSelection` | `plugins/ImagesPlugin/index.tsx:377` | Returns `Range \| null \| undefined` |

**Callers:**
- `$getImageNodeInSelection`: lines 245, 275, 286 in $onDragStart, $onDragover, $onDrop
- `getDragSelection`: line 300 in $onDrop

### Batch 3: MarkdownTransformers, MentionsPlugin, KeywordsPlugin (4 functions)

| Status | Function | Location | Pattern |
|--------|----------|----------|---------|
| [ ] | `mapToTableCells` | `plugins/MarkdownTransformers/index.ts:288` | Returns `Array<TableCellNode> \| null` |
| [ ] | `checkForAtSignMentions` | `plugins/MentionsPlugin/index.tsx:516` | Returns `MenuTextMatch \| null` |
| [ ] | `getPossibleQueryMatch` | `plugins/MentionsPlugin/index.tsx:542` | Returns `MenuTextMatch \| null` |
| [ ] | `getKeywordMatch` | `plugins/KeywordsPlugin/index.ts:29` | Returns `{ end: number; start: number } \| null` |

**Callers:**
- `mapToTableCells`: lines 214, 239 in TABLE transformer
- `checkForAtSignMentions`: line 543 in getPossibleQueryMatch
- `getPossibleQueryMatch`: line 631 in checkForMentionMatch
- `getKeywordMatch`: line 46 passed to useLexicalTextEntity

### Batch 4: ToolbarPlugin, TestRecorderPlugin (3 functions)

| Status | Function | Location | Pattern |
|--------|----------|----------|---------|
| [ ] | `calculateNextFontSize` | `plugins/ToolbarPlugin/utils.ts:41` | Param: `UpdateFontSizeType \| null` |
| [ ] | `getPathFromNodeToEditor` | `plugins/TestRecorderPlugin/index.tsx:94` | Param: `rootElement: HTMLElement \| null` |
| [ ] | `updateFontSizeInSelection` | `plugins/ToolbarPlugin/utils.ts:104` | Params: `newFontSize: string \| null, updateType: UpdateFontSizeType \| null` |

**Callers:**
- `calculateNextFontSize`: lines 115, 141
- `getPathFromNodeToEditor`: lines 333, 337
- `updateFontSizeInSelection`: lines 142, 144

### Batch 5: TableCellResizer, TableHoverActionsV2Plugin (2 functions)

| Status | Function | Location | Pattern |
|--------|----------|----------|---------|
| [ ] | `getCellNodeHeight` | `plugins/TableCellResizer/index.tsx:224` | Returns `number \| undefined` |
| [ ] | `getClosestTopCellPosition` | `plugins/TableHoverActionsV2Plugin/index.tsx:91` | Returns `{ centerX, top, cell } \| null` |

**Callers:**
- `getCellNodeHeight`: line 212 with nullish coalescing
- `getClosestTopCellPosition`: line 203

## Excluded Functions

### $convert*Element Functions (Lexical importDOM API)
These follow Lexical's required `DOMConversionOutput | null` pattern:
- `$convertAudioElement`
- `$convertCollapsibleContentElement`
- `$convertCollapsibleTitleElement`
- `$convertCollapsibleContainerElement`
- `$convertEquationElement`
- `$convertExcalidrawElement`
- `$convertFigureElement`
- `$convertImageElement`
- `$convertInlineImageElement`
- `$convertPollElement`
- `$convertStickyElement`
- `$convertTableElement`
- `$convertTableCellElement`
- `$convertTableRowElement`
- `$convertTweetElement`
- `$convertYouTubeElement`
- `$convertLayoutContainerElement`
- `$convertLayoutItemElement`

### React Component Returns (JSX.Element | null)
Standard React pattern for conditional rendering:
- All components returning `null` for conditional renders
- Components using `{condition && <Element />}` patterns

### Already Using Option Patterns
These directories already follow Effect patterns:
- `commenting/` - Uses Option in models and services
- `context/` - Effect context patterns
- `hooks/` - Uses Option for nullable state
- `ui/` - Component utilities with Option
- `utils/` - Utility functions with Option

## Migration Pattern Reference

### Before (T | null)
```typescript
function getElement(): HTMLElement | null {
  const el = document.getElementById("foo");
  return el;
}

// Caller
const el = getElement();
if (el !== null) {
  el.focus();
}
```

### After (Option<T>)
```typescript
import * as O from "effect/Option";

function getElement(): O.Option<HTMLElement> {
  return O.fromNullable(document.getElementById("foo"));
}

// Caller
pipe(
  getElement(),
  O.map((el) => el.focus())
);
```

### Handling Nested Nullables
```typescript
// Before
function getInfo(): { node: HTMLElement | null } | null

// After
function getInfo(): O.Option<{ node: O.Option<HTMLElement> }>
```

## Notes

1. **Batch order matters**: Some functions call others (e.g., `getPossibleQueryMatch` calls `checkForAtSignMentions`)

2. **DOM APIs return null**: Use `O.fromNullable()` at DOM boundaries

3. **Lexical $-prefixed functions**: These run in editor context and often return null for "not found" semantics

4. **Type-only migrations**: Some functions (like `calculateNextFontSize`) only need parameter type changes, not return type changes
