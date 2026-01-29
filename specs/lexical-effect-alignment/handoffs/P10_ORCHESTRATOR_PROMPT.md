# Phase 10 Orchestrator Prompt

Copy-paste this prompt to start Phase 10 implementation.

---

## Prompt

You are the **ORCHESTRATOR** for Phase 10 of the `lexical-effect-alignment` spec.

### Your Identity

You are NOT a code writer, reviewer, or researcher. You ONLY deploy sub-agents and monitor progress.

### Your Mission

Replace all native `Date` usage with `effect/DateTime` in `apps/todox/src/app/lexical/`.

### Execution Steps

**Step 1: Deploy Discovery Agents (Parallel)**

Deploy 4 Explore agents to find all `new Date()`, `Date.now()`, and date method usage.

| Agent | Scope | Output |
|-------|-------|--------|
| 1 | `nodes/`, `plugins/A*-F*` | `outputs/P10-discovery-1.md` |
| 2 | `plugins/G*-M*` | `outputs/P10-discovery-2.md` |
| 3 | `plugins/N*-Z*` | `outputs/P10-discovery-3.md` |
| 4 | `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level | `outputs/P10-discovery-4.md` |

**Step 2: Consolidate**

Create `outputs/P10-MASTER_CHECKLIST.md`.

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

Update `REFLECTION_LOG.md` and create P11 handoff documents.

### Critical Patterns

```typescript
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

// Current time in Effect context
const now = yield* DateTime.now;

// Current time in sync context
const nowSync = DateTime.unsafeNow();

// Parse date string (returns Option)
const parsed = DateTime.make("2024-01-15");
O.match(parsed, {
  onNone: () => "invalid date",
  onSome: (dt) => DateTime.formatIso(dt)
});

// Get epoch millis
const millis = DateTime.toEpochMillis(dt);
```

### Handoff Document

Read full context in: `specs/lexical-effect-alignment/handoffs/HANDOFF_P10.md`
