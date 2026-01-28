# Phase 7 Orchestrator Prompt: Type Assertions

Copy-paste this prompt to start Phase 7 implementation.

---

## Prompt

You are implementing Phase 7 of the `lexical-playground-port` spec: **Type Assertions Conversion**.

### CRITICAL: YOU ARE THE ORCHESTRATOR

**You MUST NOT write code yourself.** Delegate ALL code work to sub-agents:

| Task | Delegate To |
|------|-------------|
| Code modifications | `effect-code-writer` |
| Codebase research | `Explore` agent |
| Error fixing | `package-error-fixer` |

### Context

Phase 6 (Effect Patterns) is complete:
- try/catch blocks: 7 → 1 (valid try/finally pattern)
- JSON.parse: All wrapped with Either.try
- throw new Error: 46 → 18 (18 intentionally kept as React/Lexical invariants)
- All quality commands pass

**Key Lesson from P6**: Categorize patterns into KEEP vs CONVERT before starting work. Not everything needs conversion.

### Your Mission

Convert type assertions (`as`) to proper type guards where beneficial.

**Current Metrics:**
- Type assertions: 79 total
- Non-null assertions: 0 (already clean)

**Conversion Targets:**
1. **Lexical node casts (7)** → Use `$isXNode()` type guards
2. **High-risk DOM casts (~15)** → Use instanceof or Option patterns
3. **Safe patterns (~57)** → KEEP (document as intentionally preserved)

### Critical Patterns

**Pattern 1: Lexical Node Type Guards**
```typescript
// BEFORE - unsafe cast
const textNode = selection.getNodes()[0] as TextNode;

// AFTER - use Lexical type guard
import { $isTextNode } from "lexical";
const node = selection.getNodes()[0];
if (!$isTextNode(node)) return;
// node is TextNode here
```

**Pattern 2: DOM Element Guards**
```typescript
// BEFORE - unsafe after querySelector
const element = container.querySelector(".editor") as HTMLElement;

// AFTER - guard with instanceof
const element = container.querySelector(".editor");
if (!(element instanceof HTMLElement)) return;
// element is HTMLElement here
```

**Pattern 3: Patterns to KEEP**
```typescript
// KEEP - as const for literal types
...([1, 2, 3] as const).map(...)

// KEEP - keyof patterns (TypeScript idiom)
blockType: "paragraph" as keyof typeof blockTypeToBlockName

// KEEP - YJS interop (necessary for collaborative features)
provider.doc.get("comments", YArray) as YArray<UnsafeTypes.UnsafeAny>
```

### Implementation Steps

1. **Categorize all 79 assertions** (delegate to Explore):
   - CONVERT: Lexical node casts, high-risk DOM casts
   - KEEP: as const, keyof, YJS, React events, schema results

2. **Convert Lexical node casts first** (delegate to effect-code-writer):
   - Files: AutocompletePlugin, TableHoverActionsPlugin
   - Use: `$isTextNode()`, `$isTableRowNode()`, etc.

3. **Convert high-risk DOM casts** (delegate to effect-code-writer):
   - querySelector results without null checks
   - event.target without instanceof guards

4. **Verify after each batch** (run commands yourself):
   ```bash
   bunx turbo run check --filter=@beep/todox
   bunx turbo run lint --filter=@beep/todox
   ```

### Delegation Example

```
Convert the TextNode cast in apps/todox/src/app/lexical/plugins/AutocompletePlugin/index.tsx
to use the $isTextNode() type guard.

Current code (around line 130):
const prevNode = selection.getNodes()[0] as TextNode;

Convert to pattern:
const nodes = selection.getNodes();
const firstNode = nodes[0];
if (!$isTextNode(firstNode)) {
  return; // handle non-text case appropriately
}
// firstNode is now properly typed as TextNode

Required import: import { $isTextNode } from "lexical";
```

### Reference Files

- Pattern reference: `apps/todox/src/app/lexical/plugins/ActionsPlugin/index.tsx`
- Error classes: `apps/todox/src/app/lexical/schema/errors.ts`
- Lexical imports: Check existing imports in target files for `$isXNode` patterns

### Verification

After each file conversion:
```bash
bunx turbo run lint --filter=@beep/todox
bunx turbo run check --filter=@beep/todox
```

Final verification:
```bash
bunx turbo run build --filter=@beep/todox

# Progress check
grep -r " as " apps/todox/src/app/lexical/ | grep -v "import" | grep -v "as const" | wc -l
```

### Success Criteria

- [ ] Lexical node casts converted to $isXNode() guards
- [ ] High-risk DOM casts use instanceof or Option patterns
- [ ] Safe patterns (as const, keyof, YJS) documented and preserved
- [ ] All quality commands pass (lint, check, build)
- [ ] HANDOFF_P8.md created (if more work remains)
- [ ] P8_ORCHESTRATOR_PROMPT.md created (if more work remains)

### Handoff Document

Full context, metrics, and examples in: `specs/lexical-playground-port/handoffs/HANDOFF_P7.md`

### Files with Most Assertions

| File | Count | Primary Action |
|------|-------|----------------|
| commenting/models.ts | 11 | KEEP (YJS interop) |
| ToolbarPlugin/index.tsx | 9 | KEEP (keyof patterns) |
| TableHoverActionsV2Plugin | 4 | CONVERT (DOM casts) |
| ToolbarContext.tsx | 4 | KEEP (format types) |
| AutocompletePlugin/index.tsx | ~3 | CONVERT (node casts) |

### ROI Assessment

**High Value Conversions:**
- Lexical node casts - Prevents runtime errors, follows framework patterns
- DOM query results - Prevents null reference errors

**Low Value (SKIP):**
- as const - Already safe, TypeScript idiom
- YJS casts - Required for interop, no alternative
- React event props - Framework pattern, safe

Focus effort on high-value conversions. Don't convert everything just to reduce the count.
