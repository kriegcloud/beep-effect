# P5 Error Migration Master Checklist

## Summary

| Metric | Count |
|--------|-------|
| Files Scanned | 116 |
| Violations Found | 13 |
| Unique Error Types Needed | 5 |
| Special Cases (Lexical callbacks) | 1 |

## Violations by File

### Batch 1: nodes/, plugins/A*-F*

#### apps/todox/src/app/lexical/nodes/EquationComponent.tsx
- [x] **Line 108**: `new Error(String(e))` - ErrorBoundary fallback handler
  - **COMPLETED**: Migrated to use `EquationRenderError` from `../schema/errors`
  - Context: Wraps unknown error for React ErrorBoundary
  - Replaced with: `EquationRenderError({ message: String(e), cause: e })`
  - **COMPLETED**: Migrated to use `EquationRenderError` from `../schema/errors`

#### apps/todox/src/app/lexical/plugins/EmojisPlugin/index.ts
- [x] **Line 72**: `throw new Error("EmojisPlugin: EmojiNode not registered on editor")`
  - Context: useEffect hook validating node registration
  - Replace with: `NodeNotRegisteredError({ plugin: "EmojisPlugin", nodeType: "EmojiNode" })`
  - **COMPLETED**: Migrated to use `NodeNotRegisteredError` from `../../schema/errors`

#### apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx
- [ ] **Line 137**: `throw error;` - **SPECIAL CASE**
  - Context: LexicalComposer onError callback (initialConfig)
  - Note: Lexical framework callback - may need to preserve native throw
  - Action: Document, evaluate if Effect wrapper appropriate at higher level

### Batch 2: plugins/G*-M*

#### apps/todox/src/app/lexical/plugins/ImagesPlugin/index.tsx
- [x] **Line 191**: `throw new Error("ImagesPlugin: ImageNode not registered on editor")`
  - Context: useEffect hook validating node registration
  - Replace with: `NodeNotRegisteredError({ plugin: "ImagesPlugin", nodeType: "ImageNode" })`
  - **COMPLETED**: Migrated to use `NodeNotRegisteredError` from `../../schema/errors`

- [x] **Line 369**: `throw Error("Cannot get the selection when dragging")`
  - Context: DOM API failure in drag-and-drop handler
  - Replace with: `DragSelectionError({ message: "Cannot get the selection when dragging" })`
  - **COMPLETED**: Migrated to use `DragSelectionError` from `../../schema/errors`

#### apps/todox/src/app/lexical/plugins/LayoutPlugin/LayoutPlugin.tsx
- [x] **Line 40**: `throw new Error("LayoutPlugin: LayoutContainerNode, or LayoutItemNode not registered on editor")`
  - Context: useEffect hook validating node registration
  - Replaced with: `NodeNotRegisteredError({ message, plugin: "LayoutPlugin", nodeType: "LayoutContainerNode, LayoutItemNode" })`
  - **COMPLETED**: Migrated to use `NodeNotRegisteredError` from `../../schema/errors`

### Batch 3: plugins/N*-Z*

#### apps/todox/src/app/lexical/plugins/PollPlugin/index.tsx
- [ ] **Line 64**: `throw new Error("PollPlugin: PollNode not registered on editor")`
  - Context: useEffect hook validating node registration
  - Replace with: `NodeNotRegisteredError({ plugin: "PollPlugin", nodes: ["PollNode"] })`

#### apps/todox/src/app/lexical/plugins/TablePlugin.tsx
- [x] **Line 143**: `throw new Error("TablePlugin: TableNode, TableRowNode, or TableCellNode is not registered on editor")`
  - Context: useEffect hook validating node registration
  - Replaced with: `NodeNotRegisteredError({ message, plugin: "TablePlugin", nodeType: "TableNode, TableRowNode, TableCellNode" })`
  - **COMPLETED**: Migrated to use `NodeNotRegisteredError` from `../schema/errors`

### Batch 4: commenting/, context/, hooks/, ui/, utils/

#### apps/todox/src/app/lexical/context/toolbar-context.tsx
- [x] **Line 260**: `throw new Error("useToolbarContext must be used within a ToolbarContextProvider")`
  - Context: React hook validating context provider
  - Replaced with: `MissingContextError({ message, contextName: "ToolbarContext" })`
  - **COMPLETED**: Migrated to use `MissingContextError` from `../../schema/errors`

- [x] **Line 288**: `throw new Error("useToolbarState must be used within a ToolbarProvider")`
  - Context: React hook validating context provider
  - Replaced with: `MissingContextError({ message, contextName: "ToolbarProvider" })`
  - **COMPLETED**: Migrated to use `MissingContextError` from `../../schema/errors`

#### apps/todox/src/app/lexical/context/FlashMessageContext.tsx
- [x] **Line 40**: `throw new Error("Missing FlashMessageContext")`
  - Context: React hook validating context provider
  - Replaced with: `MissingContextError({ message, contextName: "FlashMessageContext" })`
  - **COMPLETED**: Migrated to use `MissingContextError` from `../schema/errors`

#### apps/todox/src/app/lexical/context/AiContext.tsx
- [x] **Line 77**: `throw new Error("useAiContext must be used within AiContextProvider")`
  - Context: React hook validating context provider
  - Replaced with: `MissingContextError({ message, contextName: "AiContext" })`
  - **COMPLETED**: Migrated to use `MissingContextError` from `../schema/errors`

#### apps/todox/src/app/lexical/ui/KatexEquationAlterer.tsx
- [x] **Line 59**: `new Error(String(e))` - ErrorBoundary fallback
  - Context: Wraps unknown error for React ErrorBoundary
  - Replaced with: `EquationRenderError({ message: String(e), cause: e })`
  - **COMPLETED**: Migrated to use `EquationRenderError` from `../schema/errors`

## Error Schemas to Create

Location: `apps/todox/src/app/lexical/schema/errors.ts`

```typescript
import * as S from "effect/Schema";

/**
 * Error when a required Lexical node is not registered on the editor
 */
export class NodeNotRegisteredError extends S.TaggedError<NodeNotRegisteredError>()(
  "NodeNotRegisteredError",
  {
    plugin: S.String,
    nodes: S.Array(S.String),
    message: S.optional(S.String),
  }
) {}

/**
 * Error when React context is accessed outside its provider
 */
export class ContextMissingError extends S.TaggedError<ContextMissingError>()(
  "ContextMissingError",
  {
    contextName: S.String,
    hookName: S.String,
    message: S.optional(S.String),
  }
) {}

/**
 * Error during equation rendering (KaTeX)
 */
export class EquationRenderError extends S.TaggedError<EquationRenderError>()(
  "EquationRenderError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  }
) {}

/**
 * Error when drag selection cannot be obtained
 */
export class DragSelectionError extends S.TaggedError<DragSelectionError>()(
  "DragSelectionError",
  {
    message: S.String,
  }
) {}

/**
 * Generic Lexical plugin error
 */
export class LexicalPluginError extends S.TaggedError<LexicalPluginError>()(
  "LexicalPluginError",
  {
    message: S.String,
    pluginName: S.optional(S.String),
  }
) {}
```

## Execution Order

### Batch A (Files 1-5)
1. Create `apps/todox/src/app/lexical/schema/errors.ts` with all error schemas
2. EquationComponent.tsx
3. EmojisPlugin/index.ts
4. ImagesPlugin/index.tsx (2 violations)
5. LayoutPlugin/LayoutPlugin.tsx

### Batch B (Files 6-10)
6. PollPlugin/index.tsx
7. TablePlugin.tsx
8. toolbar-context.tsx (2 violations)
9. FlashMessageContext.tsx
10. AiContext.tsx

### Batch C (Final)
11. KatexEquationAlterer.tsx
12. CommentPlugin/index.tsx (SPECIAL CASE - evaluate)

## Special Cases

### CommentPlugin/index.tsx:137
This is a Lexical framework callback (`onError` in `initialConfig`). The throw propagates to Lexical's error handling system.

**Recommendation**:
- Document with TODO comment
- Consider Effect wrapper at EditorProvider level in future
- For now: Keep native throw but use typed error

```typescript
// LEXICAL CALLBACK - Must throw natively for framework compatibility
// TODO: Consider Effect wrapper at EditorProvider level
throw new LexicalPluginError({
  message: "Editor initialization error",
  pluginName: "CommentPlugin",
});
```

### React Suspense Patterns (NOT violations)
- `ImageComponent.tsx` lines 146, 153: `throw loadingPromise;`
- These are correct React Suspense patterns, not Error usage

## Verification Commands

After each batch:
```bash
bun tsc --noEmit --isolatedModules <file>
```

After all batches:
```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```
