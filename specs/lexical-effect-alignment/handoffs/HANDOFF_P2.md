# Phase 2 Handoff: Native String Methods

## Phase Summary

Replace all native JavaScript String methods with `effect/String` equivalents in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `.toLowerCase()`, `.toUpperCase()`, `.trim()` replaced with `Str.*` functions
- [ ] All `.split()`, `.slice()` replaced with `Str.*` functions
- [ ] All `.startsWith()`, `.endsWith()`, `.includes()` replaced with `Str.*` functions
- [ ] All `.replace()`, `.replaceAll()` replaced with `Str.*` functions
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Blocking Issues

Check P1 reflection for any cascading issues.

### Constraints

- Orchestrator must NOT write code directly
- Orchestrator must NOT research files directly
- Deploy sub-agents for all substantive work
- Maximum 5 effect-code-writer agents per batch

---

## Episodic Memory (Previous Phase)

### P1 Summary

Phase 1 replaced native Array methods with `effect/Array`. Key outcomes:
- Files modified: [from P1 reflection]
- Patterns established for discovery → consolidation → execution workflow

### Key Learnings from P1

[Insert P1 reflection insights here]

---

## Semantic Memory (Constants)

### Target Directory

```
apps/todox/src/app/lexical/
```

### Import Pattern

```typescript
import * as Str from "effect/String";
import * as O from "effect/Option";  // If using charAt/charCodeAt
```

### Key Method Changes

| Native | Effect |
|--------|--------|
| `.split(",")` | `Str.split(str, ",")` |
| `.toLowerCase()` | `Str.toLowerCase(str)` |
| `.trim()` | `Str.trim(str)` |
| `.startsWith("x")` | `Str.startsWith(str, "x")` |

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-2` | Phase 2 details |
| `agent-prompts/P2-string-discovery.md` | Discovery agent prompt |
| `agent-prompts/P2-code-writer.md` | Code writer agent prompt |
| `agent-prompts/consolidator.md` | Consolidation agent prompt |
| `.claude/rules/effect-patterns.md` | Effect patterns reference |

---

## Execution Steps

### Step 1: Deploy Discovery Agents (Parallel)

Deploy 4 `Explore` agents simultaneously:

| Agent | Scope | Output |
|-------|-------|--------|
| Discovery-1 | `nodes/`, `plugins/A*-F*` | `outputs/P2-discovery-1.md` |
| Discovery-2 | `plugins/G*-M*` | `outputs/P2-discovery-2.md` |
| Discovery-3 | `plugins/N*-Z*` | `outputs/P2-discovery-3.md` |
| Discovery-4 | `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level | `outputs/P2-discovery-4.md` |

Each agent uses: `agent-prompts/P2-string-discovery.md`

### Step 2: Consolidate (Sequential)

Deploy 1 agent with: `agent-prompts/consolidator.md`

Creates: `outputs/P2-MASTER_CHECKLIST.md`

### Step 3: Execute (Batched Parallel)

From master checklist, extract unique files. Deploy `effect-code-writer` agents:
- 5 files per batch
- 1 agent per file
- Wait for batch completion before next batch

Each agent uses: `agent-prompts/P2-code-writer.md`

### Step 4: Verify

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

### Step 5: Reflect

Deploy `reflector` agent to update `REFLECTION_LOG.md`

### Step 6: Handoff

Create:
- `handoffs/HANDOFF_P3.md`
- `handoffs/P3_ORCHESTRATOR_PROMPT.md`

---

## Known Issues & Gotchas

### Option Return Types

`Str.charAt` and `Str.charCodeAt` return `Option<T>`, not direct values:

```typescript
// Before
const char = str.charAt(0);

// After
const char = Str.charAt(str, 0);
// Returns Option<string> - use O.getOrElse(() => "")
```

### Argument Order

Effect string functions take the string first:

```typescript
// Native: str.split(",")
// Effect: Str.split(str, ",")
//               ^ str is first argument
```

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Working | 2,000 tokens | ~600 |
| Episodic | 1,000 tokens | ~200 |
| Semantic | 500 tokens | ~300 |
| Total | 4,000 tokens | ~1,100 |

Within budget.
