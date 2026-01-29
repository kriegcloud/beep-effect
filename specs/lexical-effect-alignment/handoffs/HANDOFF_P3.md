# Phase 3 Handoff: Native Set

## Phase Summary

Replace all native JavaScript `Set` usage with `effect/MutableHashSet` or `effect/HashSet` in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `new Set()` replaced with `MutableHashSet.make()` or `HashSet.make()`
- [ ] All `.add()`, `.delete()`, `.clear()` use MutableHashSet
- [ ] All `.has()` use HashSet or MutableHashSet
- [ ] All `[...set]` replaced with `HashSet.toArray()`
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Decision Criteria

- **Mutable operations** (`.add()`, `.delete()`, `.clear()`) → `MutableHashSet`
- **Immutable operations** (`.has()`, iteration only) → `HashSet`

### Constraints

- Orchestrator must NOT write code directly
- Deploy sub-agents for all substantive work
- Maximum 5 effect-code-writer agents per batch

---

## Episodic Memory (Previous Phase)

### P2 Summary

Phase 2 replaced native String methods with `effect/String`. Key outcomes:
- 41 violations found across 18 files
- 4 code-writer batches executed
- **28 type errors** post-migration required fix phase
- All verification commands pass after fixes

### Key Learnings from P2 (CRITICAL)

1. **Effect uses data-last curried functions**:
   - WRONG: `Str.slice(str, 0, 5)`
   - CORRECT: `Str.slice(0, 5)(str)` or `pipe(str, Str.slice(0, 5))`

2. **Some functions ARE direct** (not curried):
   - `Str.toLowerCase(str)` - Direct call
   - `Str.trim(str)` - Direct call

3. **Discovery → Execute → Check → Fix → Verify workflow**: Always run type check and fix errors before final verification

4. **Agent prompt quality**: Include exact API patterns with both curried and direct examples

### Agent Prompt Improvements for P3

- Include explicit API patterns showing function signatures
- Note which functions return modified values vs mutate in place
- Show type parameter examples: `MutableHashSet.make<string>()`

---

## Semantic Memory (Constants)

### Target Directory

```
apps/todox/src/app/lexical/
```

### Import Patterns

```typescript
import * as MutableHashSet from "effect/MutableHashSet";
import * as HashSet from "effect/HashSet";
```

### Key Method Changes

| Native | Effect |
|--------|--------|
| `new Set()` | `MutableHashSet.make()` |
| `set.add(x)` | `MutableHashSet.add(set, x)` |
| `set.has(x)` | `MutableHashSet.has(set, x)` |
| `set.delete(x)` | `MutableHashSet.remove(set, x)` |
| `[...set]` | `HashSet.toArray(set)` |

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-3` | Phase 3 details |
| `agent-prompts/P3-set-discovery.md` | Discovery agent prompt |
| `agent-prompts/P3-code-writer.md` | Code writer agent prompt |

---

## Execution Steps

### Step 1: Deploy Discovery Agents (Parallel)

Deploy 4 `Explore` agents simultaneously:

| Agent | Scope | Output |
|-------|-------|--------|
| Discovery-1 | `nodes/`, `plugins/A*-F*` | `outputs/P3-discovery-1.md` |
| Discovery-2 | `plugins/G*-M*` | `outputs/P3-discovery-2.md` |
| Discovery-3 | `plugins/N*-Z*` | `outputs/P3-discovery-3.md` |
| Discovery-4 | `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level | `outputs/P3-discovery-4.md` |

### Step 2: Consolidate (Sequential)

Deploy 1 agent with: `agent-prompts/consolidator.md`

Creates: `outputs/P3-MASTER_CHECKLIST.md`

### Step 3: Execute (Batched Parallel)

Deploy `effect-code-writer` agents:
- 5 files per batch
- 1 agent per file
- Wait for batch completion before next batch

### Step 4: Verify & Fix

```bash
bun run check --filter=./apps/todox
```

**CRITICAL**: If type errors occur, deploy `package-error-fixer` agent immediately (learned from P2).

### Step 5: Final Verification

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

### Step 6: Reflect

Deploy `reflector` agent to update `REFLECTION_LOG.md`

### Step 7: Handoff

Create `handoffs/HANDOFF_P4.md` and `handoffs/P4_ORCHESTRATOR_PROMPT.md`

---

## Known Issues & Gotchas

### Size is a Function, Not Property

```typescript
// Native
set.size

// Effect - Size is a function!
MutableHashSet.size(set)
```

### No Method Chaining

```typescript
// Native (chaining)
new Set().add("a").add("b")

// Effect - No chaining, use sequential calls
const set = MutableHashSet.make<string>();
MutableHashSet.add(set, "a");
MutableHashSet.add(set, "b");
```

### Type Parameters Required

```typescript
// Always specify type parameter
const set = MutableHashSet.make<string>();  // Explicit type
```

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Working | 2,000 tokens | ~500 |
| Episodic | 1,000 tokens | ~200 |
| Semantic | 500 tokens | ~250 |
| Total | 4,000 tokens | ~950 |

Within budget.
