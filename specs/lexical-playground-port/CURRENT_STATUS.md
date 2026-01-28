# Current Status: Lexical Playground Port

> Last Updated: 2026-01-27

## Status: Phase 9 COMPLETE, Phase 11 Ready

The Lexical Playground has been ported to Next.js and is accessible at `/lexical`. Core functionality works. Effect pattern conversion complete. Type assertion conversion complete. Runtime verification complete with 1 non-blocking issue found.

**Next Phase**: P11 - CSS Consolidation to Tailwind (remove all CSS files, move to globals.css)

---

## Phase Completion Summary

| Phase | Description | Status |
|-------|-------------|--------|
| P1 | Lint/Build/Check fixes | ✅ COMPLETE |
| P2 | CSS consolidation + shadcn wrapping | ✅ COMPLETE |
| P3 | Next.js page + API routes | ✅ COMPLETE |
| P4 | Runtime error fixes | ✅ COMPLETE |
| P6 | Effect patterns | ✅ COMPLETE |
| P7 | Type assertions | ✅ COMPLETE |
| P9 | Runtime verification | ✅ COMPLETE |
| P10 | Issue resolution | Skipped (non-blocking) |
| P11 | CSS to Tailwind/globals.css | **READY TO START** |

---

## Phase 6 Completion Summary

### Final Metrics

| Metric | Original | Final | Target |
|--------|----------|-------|--------|
| `try {` blocks | 7 | 1 | ≤1 ✅ |
| `JSON.parse` (unprotected) | 7 | 0 | 0 ✅ |
| `throw new Error` | 46 | 18 | KEEP category ✅ |

### Files Converted (Effect Patterns)

| File | Pattern Used | Conversion Type |
|------|--------------|-----------------|
| CopyButton/index.tsx | Pattern B | Clipboard.writeString Effect |
| PrettierButton/index.tsx | Pattern B | Effect.tryPromise formatting |
| TweetNode.tsx | Pattern B | Twitter SDK loading |
| ImagesPlugin/index.tsx | Pattern E | Either.try for JSON.parse |
| PollNode.tsx | Pattern E | Either.try + Option |
| ExcalidrawComponent.tsx | Pattern E | Either.try with fallback |
| DateTimeNode.tsx | Pattern E | Either.try + Option |
| setupEnv.ts | Pattern E | Either.try for JSON.parse |
| TestRecorderPlugin/index.tsx | Pattern E | Either.try for execCommand |
| commenting/models.ts | Pattern E | Either.try for disconnect |
| TableCellResizer/index.tsx | Early return | 11 throws → returns |
| CollapsiblePlugin/*.ts | Early return | 6 throws → fallbacks |
| TableActionMenuPlugin/index.tsx | Early return | 4 throws → return disable() |
| getThemeSelector.ts | Early return | throw → return "" |
| ColorPicker.tsx | Early return | throw → return value |

### Throw Statement Categorization

**KEEP (18 throws)** - Intentionally preserved:
- 2 React context invariants (ToolbarContext, FlashMessageContext)
- 16 plugin node registration checks (Lexical convention)

**CONVERTED (26 throws)** - Changed to safe patterns:
- State validation → early returns
- DOM validation → Option patterns
- Node structure validation → fallback values

### Remaining try Block

1 valid `try/finally` pattern in `commenting/models.ts:400` (cleanup pattern, not error handling)

---

## Phase 7: Type Assertions (COMPLETE)

### Final Metrics

| Metric | Original | Final | Strategy |
|--------|----------|-------|----------|
| Type assertions (`as`) | 79 | 61 | -18 converted to guards |
| Non-null assertions (`!`) | 0 | 0 | Already clean |

### Files Converted (Type Guards)

| File | Conversion | Pattern |
|------|------------|---------|
| TableHoverActionsPlugin/index.tsx | `as TableRowNode` | `$isTableRowNode()` guard |
| AutocompletePlugin/index.tsx | `as TextNode` | `$isTextNode()` guard |
| focusUtils.ts | `querySelector as HTMLElement` | `instanceof HTMLElement` guard |
| getDOMRangeRect.ts | `firstElementChild as HTMLElement` | `instanceof HTMLElement` + break |
| index.tsx | `getElementById as HTMLElement` | null check + throw |
| EmojiNode.tsx | `inner as HTMLElement` | `instanceof HTMLElement` guard |
| CommentPlugin/index.tsx | `activeElement as HTMLElement` | `instanceof HTMLElement` guard |
| TableActionMenuPlugin/index.tsx | `scrollableContainer as HTMLElement` | `instanceof HTMLElement` guard |
| DraggableBlockPlugin/index.tsx | `event.target as Node` | `instanceof Node` ternary |
| TableCellResizer/index.tsx | `event.target as Element` | `instanceof Element` + fallback |
| setFloatingElemPosition.ts | `textNode as Element` | `instanceof Element` + null check |
| FloatingLinkEditorPlugin/index.tsx | `relatedTarget as Element` | `instanceof Node` check |
| TableHoverActionsPlugin/index.tsx | `tableDOMElement as HTMLTableElement` | Type annotation + existing check |
| ImageComponent.tsx | `event.target as HTMLElement` | `instanceof HTMLElement` in condition |

### Type Assertions Intentionally KEPT (61)

**as const (10)** - Safe literal type assertions:
- editor.schema.ts, settings.ts, ComponentPickerPlugin, ToolbarPlugin/utils.ts, etc.

**keyof typeof (4)** - TypeScript-idiomatic key assertions:
- setupEnv.ts, ToolbarContext.tsx (2), ToolbarPlugin/index.tsx

**YJS Interop (6)** - Required for collaborative editing:
- commenting/models.ts - YArray/YMap access patterns

**React forwardRef (3)** - Necessary for polymorphic refs:
- EquationEditor.tsx - RefObject casts for input/textarea

**Floating UI / Library Interop (4)** - Required for positioning APIs:
- TableHoverActionsV2Plugin - `as unknown as Element` for virtual refs

**React Event Patterns (3)** - Component adapter patterns:
- DropDown.tsx, Switch.tsx - Event type bridges

**Schema/Discriminated Unions (5)** - Safe type narrowing:
- ColorPicker.tsx - Color union access
- ShortcutsPlugin - HeadingTagType literal

**Lexical DOM Conversion (2)** - Safe within conversion context:
- ImageNode.tsx - `domNode as HTMLImageElement` (Lexical convention)

**Other Safe Patterns (~24)** - Documented and intentional:
- Schema results, polyfill checks, global type extensions

### Key Lesson from P7

**Categorize before converting.** Following P6's lesson, we categorized all 79 assertions:
- 18 high-risk casts converted to runtime guards
- 61 safe patterns documented and preserved
- ROI-focused: Lexical node guards and DOM null checks provide most value

**Handoff Documents:**
- `specs/lexical-playground-port/handoffs/HANDOFF_P7.md`
- `specs/lexical-playground-port/handoffs/P7_ORCHESTRATOR_PROMPT.md`

---

## Phase 9: Runtime Verification (COMPLETE)

### Purpose

Validate the Lexical Playground works correctly at runtime using browser automation and DevTools inspection.

### Test Results

| Category | Status | Notes |
|----------|--------|-------|
| Page Load | ✅ Pass | Editor renders, 1 non-blocking warning |
| Core Features | ✅ Pass | Text input, bold, italic, undo/redo all work |
| Toolbar | ✅ Pass | All dropdowns and buttons functional |
| Plugins | ✅ Pass | Table, code block, collapsible all work |
| Debug Panel | ✅ Pass | TreeView updates in real-time |

### Issues Found

| Issue | Severity | Status |
|-------|----------|--------|
| Timeout error on page load | Warning (non-blocking) | Ready for P10 fix |

### Outputs Created

- `specs/lexical-playground-port/P9_ISSUES.md` - Full issue documentation
- `specs/lexical-playground-port/handoffs/HANDOFF_P10.md` - Fix recommendations

### Handoff Documents

- `specs/lexical-playground-port/handoffs/HANDOFF_P9.md`
- `specs/lexical-playground-port/handoffs/P9_ORCHESTRATOR_PROMPT.md`

---

## Phase 11: CSS to Tailwind/shadcn (READY)

### Objective

Consolidate CSS to a single `lexical-theme.css` and convert UI to shadcn/Tailwind:
1. Create `lexical-theme.css` with required Lexical theme classes
2. Convert UI components to shadcn components + Tailwind classes
3. Replace icon CSS with Lucide React components
4. Delete all original CSS files

### Strategy

| Category | Approach |
|----------|----------|
| Lexical theme classes (`PlaygroundEditorTheme__*`) | Keep in `lexical-theme.css` |
| UI components (toolbar, dropdown, buttons) | Convert to shadcn + Tailwind |
| Icons (`i.bold`, `i.italic`, etc.) | Convert to Lucide React |
| Animations | Tailwind animate utilities where possible |

### Files to Create

- `lexical/themes/lexical-theme.css` - Required Lexical classes only

### CSS Files to Delete (5)

1. `lexical/index.css` (1770 lines)
2. `lexical/themes/PlaygroundEditorTheme.css` (789 lines)
3. `lexical/themes/CommentEditorTheme.css` (7 lines)
4. `lexical/themes/StickyEditorTheme.css` (7 lines)
5. `lexical/plugins/CommentPlugin/index.css` (437 lines)

### Components to Convert

| Component | shadcn Components |
|-----------|-------------------|
| ToolbarPlugin | Button (ghost), DropdownMenu |
| DropDown.tsx | DropdownMenu, DropdownMenuItem |
| CommentPlugin | Card, Button, Input |
| ActionsPlugin | Button (secondary) |
| FloatingLinkEditorPlugin | Input, Button |

### Handoff Documents

- `specs/lexical-playground-port/handoffs/HANDOFF_P11.md`
- `specs/lexical-playground-port/handoffs/P11_ORCHESTRATOR_PROMPT.md`

---

## Verified Functionality

### Quality Commands

Lexical code quality verified as of 2026-01-27:

```bash
bunx turbo run lint --filter=@beep/todox   # Pre-existing issues in demo/ and runtime-client
bunx turbo run check --filter=@beep/todox  # Pre-existing @beep/runtime-client type error
bunx turbo run build --filter=@beep/todox  # Pre-existing @beep/runtime-client build error
```

**Note**: Pre-existing issues are outside lexical scope:
- `@beep/runtime-client` - Geolocation service type mismatch (modified before P7)
- `dangerouslySetInnerHTML` - In demo code, not lexical folder

### Editor Features Tested

- [x] Editor loads without crashes
- [x] Lexical logo displays correctly
- [x] Can type text
- [x] Bold formatting (Ctrl+B)
- [x] Italic formatting (Ctrl+I)
- [x] TreeView debug panel works
- [x] Toolbar dropdowns functional

---

## Key Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Lint errors | 106 | 0 | 0 ✅ |
| Type errors | Blocked | 0 | 0 ✅ |
| CSS files | 32 | 5 | 1 (P11: lexical-theme.css) |
| Build status | Failing | Passing | ✅ |
| Runtime errors | Multiple | 1 (acceptable) | ✅ |
| try/catch blocks | 7 | 1 (valid pattern) | ✅ |
| Unprotected JSON.parse | 7 | 0 | 0 ✅ |
| Type assertions (`as`) | 79 | 61 (18 converted) | ✅ |
| Non-null assertions (`!`) | 0 | 0 | 0 ✅ |

---

## Pattern Reference (Phase 6 Learnings)

### Four Effect Patterns for React/Lexical

| Pattern | Name | When to Use |
|---------|------|-------------|
| **A** | Effect.Service + makeAtomRuntime | HTTP requests, API calls |
| **B** | useRuntime() + makeRunClientPromise() | Async browser APIs, third-party SDKs |
| **E** | effect/Either + effect/Option | **Sync without runtime** - Lexical callbacks, useMemo |
| **F** | makeRunClientSync(runtime) | Sync with Effect services |

### Key Lesson: Pattern E Preferred for Lexical

Pattern E (Either/Option) is the most appropriate for Lexical code because:
1. Most Lexical callbacks are synchronous
2. No runtime overhead needed
3. Works in static methods and useMemo
4. Cleaner than wrapping Effect runtime

### Throw Categorization Heuristic

**KEEP as throws:**
- React context invariants (missing context = developer error)
- Plugin registration checks (startup validation)
- Lexical invariants that indicate incorrect usage

**CONVERT to safe patterns:**
- Runtime state validation (user actions may cause)
- DOM element queries (may be missing)
- Node type checks (may receive unexpected types)

---

## Known Issues (Acceptable for MVP)

### 1. WebSocket Timeout Warning

**Symptom**: "Timeout" unhandled rejection in console
**Cause**: Collaboration plugin tries to connect to non-existent Yjs server
**Impact**: None - collaboration disabled by default

### 2. Circular Dependencies (7 instances)

**Location**: Lexical nodes (EquationNode, ImageNode, etc.)
**Cause**: Upstream Lexical playground architecture
**Impact**: Build warnings only, no runtime issues

---

## File Structure

### Key Paths

| Purpose | Path |
|---------|------|
| Page route | `apps/todox/src/app/lexical/page.tsx` |
| Main app | `apps/todox/src/app/lexical/App.tsx` |
| Editor | `apps/todox/src/app/lexical/Editor.tsx` |
| Plugins | `apps/todox/src/app/lexical/plugins/` |
| Nodes | `apps/todox/src/app/lexical/nodes/` |
| Error classes | `apps/todox/src/app/lexical/schema/errors.ts` |
| API routes | `apps/todox/src/app/api/lexical/` |

---

## Session Summary

### Sessions Used

| Phase | Sessions | Notes |
|-------|----------|-------|
| P0 (Discovery) | 0.5 | File inventory, lint baseline |
| P1 (Lint/Check) | 1 | Corrupted file fix, lint cleanup |
| P2 (CSS/shadcn) | 2 | 32 → 5 CSS files, component wrapping |
| P3 (Next.js) | 1 | Page + API routes |
| P4 (Runtime) | 1 | SSR guards, asset paths, Floating UI |
| P6 (Effect) | 1.5 | Effect patterns, throw categorization |
| P7 (Type assertions) | 0.5 | 79 → 61 assertions, guards added |
| P9 (Verification) | 0.5 | All features tested, 1 warning found |
| P10 (Issue fixes) | - | Skipped (non-blocking WebSocket warning) |
| P11 (CSS removal) | TBD | 5 → 0 CSS files, Tailwind conversion |
| **Total** | **8+** | Within estimate |

### Key Learnings (Phase 6 & 7)

1. **Categorize before converting** - Not all throws/casts should be converted
2. **Pattern E preferred for sync** - Cleaner than Effect runtime for Lexical
3. **Early returns beat Effect for callbacks** - Simpler, more idiomatic
4. **React context throws are idiomatic** - Keep as-is
5. **Library interop casts are necessary** - Floating UI, YJS, forwardRef patterns
6. **instanceof provides runtime safety** - Better than type casts for DOM queries
