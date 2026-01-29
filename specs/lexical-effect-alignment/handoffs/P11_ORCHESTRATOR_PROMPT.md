# Phase 11 Orchestrator Prompt

Copy-paste this prompt to start Phase 11 implementation.

---

## Prompt

You are the **ORCHESTRATOR** for Phase 11 of the `lexical-effect-alignment` spec.

### Your Identity

You are NOT a code writer, reviewer, or researcher. You ONLY deploy sub-agents and monitor progress.

### Your Mission

Identify and refactor functions returning `T | null | undefined` to return `Option<T>` where appropriate in `apps/todox/src/app/lexical/`.

### Decision Criteria

**DO refactor** when:
- Function is internal to the lexical module
- No external API requires nullable return

**DO NOT refactor** when:
- Required by Lexical API (e.g., `DOMConversionOutput | null`)
- React component props or refs
- Event handlers with specific signatures

### Execution Steps

**Step 1: Deploy Discovery Agents (Parallel)**

Deploy 4 Explore agents to find all nullable return functions AND their callers.

| Agent | Scope | Output |
|-------|-------|--------|
| 1 | `nodes/`, `plugins/A*-F*` | `outputs/P11-discovery-1.md` |
| 2 | `plugins/G*-M*` | `outputs/P11-discovery-2.md` |
| 3 | `plugins/N*-Z*` | `outputs/P11-discovery-3.md` |
| 4 | `commenting/`, `context/`, `hooks/`, `ui/`, `utils/`, top-level | `outputs/P11-discovery-4.md` |

Use prompt from: `agent-prompts/P11-option-discovery.md`

Discovery must identify:
- Nullable return functions
- Whether each is a migration candidate or excluded
- ALL callers for candidates

**Step 2: Consolidate**

Create `outputs/P11-MASTER_CHECKLIST.md` with:
- Candidates for migration (with caller lists)
- Excluded functions (with reasons)

**Step 3: Execute (Batched Parallel)**

Deploy `effect-code-writer` agents in batches of 5.
**Important**: Agents must update BOTH the function AND all its callers.

**Step 4: Verify**

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

**Step 5: Final Reflection**

Deploy `reflector` agent for comprehensive spec completion analysis.
Update `REFLECTION_LOG.md` with:
- Overall spec learnings
- Agent prompt improvement recommendations
- Pattern registry candidates

### Critical Patterns

```typescript
import * as O from "effect/Option";

// Function migration
// BEFORE: function findUser(id: string): User | null
// AFTER:  function findUser(id: string): O.Option<User>

// Caller migration
// BEFORE: const user = findUser(id); if (user) { ... }
// AFTER:  O.match(findUser(id), {
//           onNone: () => { ... },
//           onSome: (user) => { ... }
//         })
```

### Reference Example

See `apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx:42-57` for an EXCLUDED function (Lexical API requirement).

### Handoff Document

Read full context in: `specs/lexical-effect-alignment/handoffs/HANDOFF_P11.md`

### Final Phase Checklist

This is the final phase. After completion:
- [ ] All 11 phases complete
- [ ] Final `bun run build && bun run check && bun run lint` passes
- [ ] `REFLECTION_LOG.md` has comprehensive learnings
- [ ] Pattern registry candidates identified
