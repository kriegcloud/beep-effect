# Phase 2 Handoff: Native String Methods

## Phase Summary

Replace all native JavaScript String methods with `effect/String` equivalents in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `.toLowerCase()`, `.toUpperCase()`, etc. replaced with `Str.*` functions
- [ ] All `.split()` replaced with `Str.split()`
- [ ] All `.slice()`, `.substring()` replaced with `Str.slice()` or `Str.takeLeft()`/`Str.takeRight()`
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Blocking Issues

None identified. P1 completed successfully.

### Constraints

- Orchestrator must NOT write code directly
- Orchestrator must NOT research files directly
- Deploy sub-agents for all substantive work
- Maximum 5 effect-code-writer agents per batch

### P1 Learnings to Apply

1. **Option Returns**: Some string methods return `Option<T>`:
   - `Str.match()` returns `Option<RegExpMatchArray>` (defer to P8)
   - `Str.charAt()` returns `Option<string>`

2. **Signature Differences**:
   - `Str.slice(str, start, end)` - takes string first
   - `Str.takeLeft(str, n)` - for first N characters
   - `Str.takeRight(str, n)` - for last N characters

3. **Str.split() Returns Native Array**: The result is `string[]`, not an Effect collection. This is acceptable.

---

## Episodic Memory (Phase 1 Completion)

### Phase 1 Results

- **Violations Found**: 168 across 49 files
- **Files Migrated**: 15 files in 3 batches
- **Verification Status**: All passed (build, check, lint)

### Phase 1 Key Files Modified

| File | Changes |
|------|---------|
| `nodes/PollNode.tsx` | `A.findFirstIndex`, `A.remove`, `A.modify`, `A.append` |
| `nodes/LayoutItemNode.ts` | `A.every` |
| `nodes/ImageNode.tsx` | `A.filter` |
| `nodes/DateTimeNode/DateTimeComponent.tsx` | `A.map` |
| `nodes/ExcalidrawNode/ExcalidrawComponent.tsx` | `Struct.keys`, length checks |
| `plugins/AiAssistantPlugin/hooks/useCollaborativeAi.ts` | `pipe()` chains |
| `plugins/AiAssistantPlugin/components/AiActivityIndicator.tsx` | `A.findFirst`, `A.filter`, `A.map` |
| `plugins/AutocompletePlugin/index.tsx` | `A.findFirst` with Option |
| `plugins/CommentPlugin/index.tsx` | `Str.length`, `Str.takeLeft`, `A.map`, `A.contains` |
| `plugins/MarkdownTransformers/index.ts` | `A.findFirst`, `A.contains`, `A.join`, `A.prepend` |
| `plugins/ToolbarPlugin/index.tsx` | `A.filter`, `A.findFirst`, `A.map` |
| `commenting/models.ts` | `A.fromIterable`, `A.findFirstIndex`, `A.forEach`, `A.reverse` |
| `ui/ColorPicker.tsx` | `A.map` |

### Phase 1 Gotchas Discovered

1. **Str.slice vs Str.takeLeft**: Use `Str.takeLeft(str, n)` for "first N chars" pattern.
2. **Non-null assertions after Option**: Sometimes necessary when TypeScript can't narrow.
3. **Biome formatting**: Import order changes required `bun biome check --write`.

---

## Semantic Memory (Constants)

### Target Directory

```
apps/todox/src/app/lexical/
```

### Import Pattern

```typescript
import * as Str from "effect/String";
import * as O from "effect/Option";  // If handling charAt, match returns
```

### Target Methods

| Native | Effect Replacement |
|--------|-------------------|
| `.split()` | `Str.split(str, sep)` |
| `.toLowerCase()` | `Str.toLowerCase(str)` |
| `.toUpperCase()` | `Str.toUpperCase(str)` |
| `.trim()` | `Str.trim(str)` |
| `.trimStart()` | `Str.trimStart(str)` |
| `.trimEnd()` | `Str.trimEnd(str)` |
| `.slice()` | `Str.slice(str, start, end)` or `Str.takeLeft/takeRight` |
| `.substring()` | `Str.slice(str, start, end)` |
| `.startsWith()` | `Str.startsWith(str, prefix)` |
| `.endsWith()` | `Str.endsWith(str, suffix)` |
| `.includes()` | `Str.includes(str, search)` |
| `.replace()` | `Str.replace(str, search, replacement)` |
| `.replaceAll()` | `Str.replaceAll(str, search, replacement)` |
| `.charAt()` | `Str.charAt(str, index)` → Returns `Option<string>` |
| `.padStart()` | `Str.padStart(str, length, fillStr)` |
| `.padEnd()` | `Str.padEnd(str, length, fillStr)` |
| `.repeat()` | `Str.repeat(str, count)` |
| `.length` | `Str.length(str)` |

### Deferred Methods (P8 - Regex)

- `.match()` → `Str.match(regex)(str)` returns `Option<RegExpMatchArray>`

---

## Execution Steps

### Step 1: Create Agent Prompts

Create `P2-string-discovery.md` and `P2-code-writer.md` based on P1 versions.

### Step 2: Deploy Discovery Agents (Parallel)

Deploy 4 `Explore` agents simultaneously:

| Agent | Scope | Output |
|-------|-------|--------|
| Discovery-1 | `nodes/`, `plugins/A*-F*` | `outputs/P2-discovery-1.md` |
| Discovery-2 | `plugins/G*-M*` | `outputs/P2-discovery-2.md` |
| Discovery-3 | `plugins/N*-Z*` | `outputs/P2-discovery-3.md` |
| Discovery-4 | `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level | `outputs/P2-discovery-4.md` |

### Step 3: Consolidate

Deploy 1 agent with: `agent-prompts/consolidator.md`

Creates: `outputs/P2-MASTER_CHECKLIST.md`

### Step 4: Execute (Batched Parallel)

- 5 files per batch
- 1 agent per file
- Wait for batch completion before next batch

### Step 5: Verify

```bash
bun run build --filter @beep/todox
bun run check --filter @beep/todox
bun biome check --write apps/todox/src/app/lexical
bun run lint --filter @beep/todox
```

### Step 6: Reflect & Handoff

Deploy `reflector` agent, update `REFLECTION_LOG.md`, create P3 handoffs.

---

## Known Issues & Gotchas

### Str.slice vs Native slice

```typescript
// For "first N chars", prefer:
Str.takeLeft(str, 5)

// For explicit range:
Str.slice(str, start, end)
```

### charAt Returns Option

```typescript
const char = pipe(
  Str.charAt(str, 0),
  O.getOrElse(() => '')
);
```

### Import Organization

Run `bun biome check --write` after migrations to fix import order.

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Working | 2,000 tokens | ~1,000 |
| Episodic | 1,000 tokens | ~800 |
| Semantic | 500 tokens | ~500 |
| Total | 4,000 tokens | ~2,300 |

Within budget.
