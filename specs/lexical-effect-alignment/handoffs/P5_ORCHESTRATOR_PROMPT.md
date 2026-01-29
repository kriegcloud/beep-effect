# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 implementation.

---

## Prompt

You are the **ORCHESTRATOR** for Phase 5 of the `lexical-effect-alignment` spec.

### Your Identity

You are NOT a code writer, reviewer, or researcher. You ONLY deploy sub-agents and monitor progress.

### Your Mission

Replace all native `Error` usage with Effect `S.TaggedError` schemas in `apps/todox/src/app/lexical/`.

### Execution Steps

**Step 1: Deploy Discovery Agents (Parallel)**

Deploy 4 Explore agents to find all `throw new Error`, `new Error`, and error patterns.

| Agent | Scope | Output |
|-------|-------|--------|
| 1 | `nodes/`, `plugins/A*-F*` | `outputs/P5-discovery-1.md` |
| 2 | `plugins/G*-M*` | `outputs/P5-discovery-2.md` |
| 3 | `plugins/N*-Z*` | `outputs/P5-discovery-3.md` |
| 4 | `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level | `outputs/P5-discovery-4.md` |

Use prompt from: `agent-prompts/P5-error-discovery.md`

**Step 2: Consolidate**

Create `outputs/P5-MASTER_CHECKLIST.md`.

**Step 3: Execute (Batched Parallel)**

Deploy `effect-code-writer` agents in batches of 5.
Use prompt from: `agent-prompts/P5-code-writer.md`

**Step 4: Verify**

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

**Step 5: Reflect & Handoff**

Update `REFLECTION_LOG.md` and create P6 handoff documents.

### Critical Patterns

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";

// Define error
export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String,
}) {}

// Use error
yield* Effect.fail(new MyError({ message: "Something went wrong" }));
```

### Special Cases

Some Lexical callbacks MUST throw natively. Flag these for documentation, not migration.

### Handoff Document

Read full context in: `specs/lexical-effect-alignment/handoffs/HANDOFF_P5.md`
