# Lexical Effect Alignment Spec

> Orchestrator-driven refactoring of lexical playground code to align with Effect-first repository standards.

---

## Overview

This spec defines a systematic, orchestrator-driven approach to refactor 170+ TypeScript/TSX files in `apps/todox/src/app/lexical/` to comply with beep-effect repository standards. The orchestrator coordinates specialized sub-agents but **NEVER** writes code, reviews code, or researches code directly.

**Source Specs**: `specs/lexical-editor-ai-features`, `specs/lexical-playground-port`

---

## Orchestrator Contract

### The Orchestrator IS

- A **coordinator** that deploys and monitors sub-agents
- A **planner** that creates phase-specific agent prompts
- A **synthesizer** that combines sub-agent reports into master checklists
- A **progress tracker** that monitors completion via checklist documents

### The Orchestrator IS NOT

- A code writer (delegates to `effect-code-writer`)
- A code reviewer (delegates to `code-reviewer`)
- A researcher (delegates to `codebase-researcher`, `Explore` agents)

### Context Management

If the orchestrator reaches **50% context capacity**, it MUST:
1. Complete reflection for the current phase
2. Create an intra-phase handoff document using alphanumeric format:
   - `P1a_ORCHESTRATOR_PROMPT.md`, `P1b_ORCHESTRATOR_PROMPT.md`, etc.
3. Document lessons learned about sub-agent performance

---

## Target Scope

```
apps/todox/src/app/lexical/
├── App.tsx, Editor.tsx, Settings.tsx, ...  (top-level)
├── commenting/
├── context/
├── hooks/
├── nodes/
├── plugins/  (54 plugin directories)
├── schema/
├── themes/
├── ui/
└── utils/
```

**File Count**: ~170 TypeScript/TSX files

---

## Phase Summary

| Phase | Focus | Pattern |
|-------|-------|---------|
| **P1** | Native Array methods | `A.map`, `A.filter`, `A.reduce`, etc. |
| **P2** | Native String methods | `Str.split`, `Str.toLowerCase`, etc. |
| **P3** | Native `Set` | `MutableHashSet` / `HashSet` |
| **P4** | Native `Map` | `MutableHashMap` / `HashMap` |
| **P5** | Native `Error` | `S.TaggedError` schemas |
| **P6** | `JSON.parse`/`stringify` | `S.parseJson` schemas |
| **P7** | Promise-based code | `useRuntime`, `runPromise` patterns |
| **P8** | Raw regex | `Str.match` patterns |
| **P9** | `switch` statements | `effect/Match` |
| **P10** | Native `Date` | `effect/DateTime` |
| **P11** | Nullable returns | `effect/Option` |

---

## Phase Execution Pattern

Each phase follows this execution pattern:

### Step 1: Discovery (Parallel Sub-Agents)

Deploy `codebase-researcher` sub-agents in parallel to index violations:
- Each sub-agent scans a subset of files
- Each produces a checklist document in `outputs/P[N]-discovery-[batch].md`
- Checklist format: `[ ] file:line - violation - replacement`

### Step 2: Consolidation

Deploy a single agent to merge all discovery documents into:
- `outputs/P[N]-MASTER_CHECKLIST.md`

### Step 3: Execution (Parallel Batches)

Deploy `effect-code-writer` agents in **parallel batches of 5** (1 agent per file):
- Total batches = `ceil(unique_files / 5)`
- Each agent receives the agent-prompt from `agent-prompts/P[N]-code-writer.md`
- Agent marks checklist items complete upon success

### Step 4: Verification

Run quality commands:
```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

### Step 5: Reflection

Deploy `reflector` agent on the phase:
- Update `REFLECTION_LOG.md`
- Document sub-agent performance insights
- Improve agent prompts for next phase

### Step 6: Handoff

Create handoff documents for next phase:
- `handoffs/HANDOFF_P[N+1].md`
- `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`

---

## Success Criteria

### Phase Completion Gates

| Phase | Verification Command | Pass Criteria |
|-------|---------------------|---------------|
| P1 | `grep -rE "\\.map\\(\\|\\|\\.filter\\(\\|\\|\\.reduce\\(" apps/todox/src/app/lexical --include="*.ts" --include="*.tsx" \| wc -l` | = 0 |
| P2 | `grep -rE "\\.toLowerCase\\(\\|\\|\\.toUpperCase\\(\\|\\|\\.trim\\(\\|\\|\\.split\\(" apps/todox/src/app/lexical --include="*.ts" --include="*.tsx" \| wc -l` | = 0 |
| P3 | `grep -rE "new Set\\(" apps/todox/src/app/lexical --include="*.ts" --include="*.tsx" \| wc -l` | = 0 |
| P4 | `grep -rE "new Map\\(" apps/todox/src/app/lexical --include="*.ts" --include="*.tsx" \| wc -l` | = 0 |
| P5 | `grep -rE "throw new Error\\|new Error\\(" apps/todox/src/app/lexical --include="*.ts" --include="*.tsx" \| wc -l` | = 0 |
| P6 | `grep -rE "JSON\\.parse\\|JSON\\.stringify" apps/todox/src/app/lexical --include="*.ts" --include="*.tsx" \| wc -l` | = 0 |
| P7 | `grep -rE "async function\\|await " apps/todox/src/app/lexical --include="*.ts" --include="*.tsx" \| wc -l` | = 0 (or documented exceptions) |
| P8 | `grep -rE "\\.match\\(/\\|/\\.test\\(" apps/todox/src/app/lexical --include="*.ts" --include="*.tsx" \| wc -l` | = 0 |
| P9 | `grep -rE "switch\\s*\\(" apps/todox/src/app/lexical --include="*.ts" --include="*.tsx" \| wc -l` | = 0 |
| P10 | `grep -rE "new Date\\(\\|Date\\.now\\(" apps/todox/src/app/lexical --include="*.ts" --include="*.tsx" \| wc -l` | = 0 |
| P11 | Manual review of nullable returns | Documented in outputs/P11-MASTER_CHECKLIST.md |

### Build Verification

- [ ] `bun run build` passes with 0 errors
- [ ] `bun run check` passes with 0 errors
- [ ] `bun run lint` passes with 0 errors

### Documentation Artifacts

- [ ] All 11 phase discovery outputs in `outputs/`
- [ ] All 11 master checklists in `outputs/`
- [ ] REFLECTION_LOG.md has entries for all phases
- [ ] All dual handoff files present in `handoffs/`

### Overall Completion

- [ ] All phase gates pass
- [ ] All build verification passes
- [ ] All documentation artifacts present

---

## Reference Patterns

### Array Migration

```typescript
// BEFORE
array.map(x => x + 1)
array.filter(x => x > 0)
array.reduce((acc, x) => acc + x, 0)

// AFTER
import * as A from "effect/Array";
A.map(array, x => x + 1)
A.filter(array, x => x > 0)
A.reduce(array, 0, (acc, x) => acc + x)
```

### String Migration

```typescript
// BEFORE
str.split(",")
str.toLowerCase()

// AFTER
import * as Str from "effect/String";
Str.split(str, ",")
Str.toLowerCase(str)
```

### Error Migration

```typescript
// BEFORE
throw new Error("message")

// AFTER
import * as S from "effect/Schema";
export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String,
}) {}
Effect.fail(new MyError({ message: "message" }))
```

See `.claude/rules/effect-patterns.md` for complete pattern reference.

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `.claude/rules/effect-patterns.md` | Effect pattern requirements |
| `specs/_guide/README.md` | Spec creation guide |
| `specs/_guide/HANDOFF_STANDARDS.md` | Handoff requirements |
| `documentation/patterns/effect-collections.md` | Collection migration guide |
