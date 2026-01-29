# Phase 1 Handoff: Native Array Methods

## Phase Summary

Replace all native JavaScript Array methods with `effect/Array` equivalents in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `.map()`, `.filter()`, `.reduce()`, etc. replaced with `A.*` functions
- [ ] All `Array.isArray()` replaced with `A.isArray()`
- [ ] All array spread patterns replaced with `A.append*` functions
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Blocking Issues

None identified. This is Phase 1 - fresh start.

### Constraints

- Orchestrator must NOT write code directly
- Orchestrator must NOT research files directly
- Deploy sub-agents for all substantive work
- Maximum 5 effect-code-writer agents per batch

---

## Episodic Memory (Previous Phase)

This is Phase 1 - no previous phase.

**Completed Specs Reference:**
- `specs/lexical-editor-ai-features` - AI features implementation
- `specs/lexical-playground-port` - Lexical playground port

These specs created the code that now needs Effect alignment.

---

## Semantic Memory (Constants)

### Target Directory

```
apps/todox/src/app/lexical/
```

### File Count

~170 TypeScript/TSX files

### Import Pattern

```typescript
import * as A from "effect/Array";
import * as Order from "effect/Order";  // If using sort
```

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-1` | Phase 1 details |
| `agent-prompts/P1-array-discovery.md` | Discovery agent prompt |
| `agent-prompts/P1-code-writer.md` | Code writer agent prompt |
| `agent-prompts/consolidator.md` | Consolidation agent prompt |
| `.claude/rules/effect-patterns.md` | Effect patterns reference |

---

## Execution Steps

### Step 1: Deploy Discovery Agents (Parallel)

Deploy 4 `Explore` agents simultaneously:

| Agent | Scope | Output |
|-------|-------|--------|
| Discovery-1 | `nodes/`, `plugins/A*-F*` | `outputs/P1-discovery-1.md` |
| Discovery-2 | `plugins/G*-M*` | `outputs/P1-discovery-2.md` |
| Discovery-3 | `plugins/N*-Z*` | `outputs/P1-discovery-3.md` |
| Discovery-4 | `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level | `outputs/P1-discovery-4.md` |

Each agent uses: `agent-prompts/P1-array-discovery.md`

### Step 2: Consolidate (Sequential)

Deploy 1 agent with: `agent-prompts/consolidator.md`

Creates: `outputs/P1-MASTER_CHECKLIST.md`

### Step 3: Execute (Batched Parallel)

From master checklist, extract unique files. Deploy `effect-code-writer` agents:
- 5 files per batch
- 1 agent per file
- Wait for batch completion before next batch

Each agent uses: `agent-prompts/P1-code-writer.md`

### Step 4: Verify

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

### Step 5: Reflect

Deploy `reflector` agent to analyze:
- Discovery accuracy
- Code writer quality
- Agent prompt effectiveness

Update: `REFLECTION_LOG.md`

### Step 6: Handoff

Create:
- `handoffs/HANDOFF_P2.md`
- `handoffs/P2_ORCHESTRATOR_PROMPT.md`

---

## Verification Status

| Check | Status |
|-------|--------|
| Discovery agents deployed | Pending |
| Master checklist created | Pending |
| Execution complete | Pending |
| `bun run build` | Pending |
| `bun run check` | Pending |
| `bun run lint` | Pending |
| Reflection complete | Pending |
| P2 handoff created | Pending |

---

## Known Issues & Gotchas

### Option Return Types

`A.findFirst` and `A.findFirstIndex` return `Option<T>`, not `T | undefined`. Callers may need updates:

```typescript
// Before
const item = array.find(x => x.id === id);
if (item) { ... }

// After
const item = A.findFirst(array, x => x.id === id);
O.match(item, {
  onNone: () => { ... },
  onSome: (found) => { ... }
})
```

### Reduce Argument Order

Effect `A.reduce` has different argument order:

```typescript
// Native: array.reduce((acc, x) => acc + x, 0)
// Effect: A.reduce(array, 0, (acc, x) => acc + x)
//                       ^ init comes BEFORE fn
```

### Sort Requires Order

```typescript
// Native: array.sort((a, b) => a - b)
// Effect: A.sort(array, Order.number)
```

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Working | 2,000 tokens | ~800 |
| Episodic | 1,000 tokens | ~200 |
| Semantic | 500 tokens | ~300 |
| Total | 4,000 tokens | ~1,300 |

Within budget. No compression needed.
