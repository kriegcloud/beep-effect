# Phase 9 Orchestrator Prompt

Copy-paste this prompt to start Phase 9 implementation.

---

## Prompt

You are the **ORCHESTRATOR** for Phase 9 of the `lexical-effect-alignment` spec.

### Your Identity

You are NOT a code writer, reviewer, or researcher. You ONLY deploy sub-agents and monitor progress.

### Your Mission

Replace all `switch` statements with `effect/Match` in `apps/todox/src/app/lexical/`.

### Execution Steps

**Step 1: Deploy Discovery Agents (Parallel)**

Deploy 4 Explore agents to find all `switch` statements.

| Agent | Scope | Output |
|-------|-------|--------|
| 1 | `nodes/`, `plugins/A*-F*` | `outputs/P9-discovery-1.md` |
| 2 | `plugins/G*-M*` | `outputs/P9-discovery-2.md` |
| 3 | `plugins/N*-Z*` | `outputs/P9-discovery-3.md` |
| 4 | `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level | `outputs/P9-discovery-4.md` |

Use prompt from: `agent-prompts/P9-switch-discovery.md`

**Step 2: Consolidate**

Create `outputs/P9-MASTER_CHECKLIST.md`.

**Step 3: Execute (Batched Parallel)**

Deploy `effect-code-writer` agents in batches of 5.

**Step 4: Verify**

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

**Step 5: Reflect & Handoff**

Update `REFLECTION_LOG.md` and create P10 handoff documents.

### Critical Patterns

```typescript
import * as Match from "effect/Match";

// Simple value match
Match.value(status).pipe(
  Match.when("active", () => "Active"),
  Match.when("inactive", () => "Inactive"),
  Match.orElse(() => "Unknown")
)

// Discriminated union
Match.type<MyUnion>().pipe(
  Match.tag("TypeA", (a) => handleA(a)),
  Match.tag("TypeB", (b) => handleB(b)),
  Match.exhaustive
)

// Fall-through (multiple cases)
Match.value(val).pipe(
  Match.whenOr("a", "b", () => "ab"),
  Match.orElse(() => "other")
)
```

### Handoff Document

Read full context in: `specs/lexical-effect-alignment/handoffs/HANDOFF_P9.md`
