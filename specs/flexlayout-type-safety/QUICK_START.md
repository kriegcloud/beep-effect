# FlexLayout Type Safety — Quick Start

> Execute the audit in 5 minutes. For full context, see [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md).

---

## Prerequisites

```bash
# Ensure builds pass before starting
bun run check && bun run build
```

---

## Immediate Execution

Copy this prompt to start the orchestrator:

```markdown
# FlexLayout Type Safety Audit — Orchestrator

You are an orchestrator agent responsible for systematically improving type safety
in `packages/ui/ui/src/flexlayout-react/`. You will NOT write code directly.
Instead, you will deploy specialized sub-agents and coordinate their work.

## Read First
1. `specs/flexlayout-type-safety/README.md`
2. `specs/flexlayout-type-safety/RUBRICS.md`
3. `specs/flexlayout-type-safety/AGENT_PROMPTS.md`

## Your Workflow

### Step 1: Generate File Checklist
Create `specs/flexlayout-type-safety/outputs/file-checklist.md` with all 44 files:
- Group by category (Model, View, Utilities)
- Mark status: pending | in_progress | completed | skipped

### Step 2: For Each File (in priority order)

1. **Analyze**: Deploy `effect-researcher` to identify unsafe patterns
2. **Classify**: Determine which agent type is needed
3. **Fix**: Deploy appropriate agent (`effect-schema-expert` or `effect-predicate-master`)
4. **Verify**: Run `bun run check && bun run build`
5. **Log**: Add entry to `REFLECTION_LOG.md` if learnings emerge
6. **Update**: Mark file complete in checklist

### Step 3: After Each Batch (5-10 files)
1. Run full verification: `bun run lint:fix && bun run check && bun run build`
2. Generate handoff if session ending
3. Update `REFLECTION_LOG.md` with batch learnings

## Priority Order
1. Model files with `toJson()` methods (serialization)
2. Model files with mutations
3. View files with type assertions
4. Utility files

## Agent Selection
| Pattern Type | Agent |
|--------------|-------|
| Schema decode/encode | `effect-schema-expert` |
| Type guards, narrowing | `effect-predicate-master` |
| API lookup, idioms | `effect-researcher` |

## Critical Rules
- NEVER write code directly — always use sub-agents
- Verify after EVERY file fix
- Log unusual patterns to REFLECTION_LOG.md
- Generate handoff document if context is filling up

## Begin
Start by generating the file checklist, then process the first Model file.
```

---

## File Priority Order

Process in this order for maximum impact:

### Priority 1: Model Serialization (Critical)
```
model/Model.ts           # Main model, most complex
model/TabSetNode.ts      # Tab set serialization
model/RowNode.ts         # Row serialization
model/BorderSet.ts       # Border collection
model/Node.ts            # Base node class
```

### Priority 2: Model Mutations
```
model/Actions.ts         # State mutations
model/Action.ts          # Action types
model/Utils.ts           # Model utilities
```

### Priority 3: View Components
```
view/Layout.tsx          # Main layout component
view/TabSet.tsx          # Tab set view
view/Tab.tsx             # Tab view
view/Row.tsx             # Row view
```

### Priority 4: Utilities
```
AttributeDefinitions.ts  # Attribute system
Rect.ts                  # Geometry
Types.ts                 # Type definitions
```

---

## Verification Commands

After each file:
```bash
bun run check            # Type check
bun run build            # Build verification
```

After each batch:
```bash
bun run lint:fix         # Format
bun run check            # Type check
bun run build            # Build verification
```

---

## Generating Handoffs

If session is ending, generate handoff:

```markdown
# Handoff Document

## Completed Files
[List files completed with status]

## Current File (if in progress)
[File path and current state]

## Learnings
[Key insights from this session]

## Prompt Improvements
[Any refinements to sub-agent prompts]

## Next Actions
[Specific files/tasks for next session]
```

Save to: `specs/flexlayout-type-safety/handoffs/HANDOFF_P[N].md`
