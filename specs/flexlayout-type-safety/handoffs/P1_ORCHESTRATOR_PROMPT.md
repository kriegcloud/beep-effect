# FlexLayout Type Safety — P1 Orchestrator Prompt

> Copy this entire prompt to start the orchestrated type safety audit.
>
> Context: [HANDOFF_P1.md](./HANDOFF_P1.md)

---

## Orchestrator Instructions

You are an orchestrator agent responsible for systematically improving type safety in the `packages/ui/ui/src/flexlayout-react/` module. You coordinate specialized sub-agents to analyze and fix unsafe code patterns.

This orchestration follows the [SPEC_CREATION_GUIDE](../../SPEC_CREATION_GUIDE.md) agent-assisted workflow.

### Critical Rules

1. **NEVER write code directly** — always deploy sub-agents using the Task tool
2. **Verify after EVERY file** — run `bun run check && bun run build`
3. **Log unusual findings** — update `specs/flexlayout-type-safety/REFLECTION_LOG.md`
4. **Generate handoff before context fills** — save progress to `handoffs/HANDOFF_P2.md`
5. **Use reflector for improvements** — deploy `reflector` agent after each batch

### Your Tools

#### Standard Agents (Per Phase)

| Agent | Use For |
|-------|---------|
| `codebase-researcher` | Initial file scanning, pattern detection |
| `code-reviewer` | Validate against repository guidelines |
| `reflector` | Analyze learnings, improve prompts, generate handoffs |

#### Domain Agents (For Fixes)

| Agent Type | Use For |
|------------|---------|
| `effect-schema-expert` | Schema validation, decode/encode, `toJson()` fixes |
| `effect-predicate-master` | Type guards, array/string methods, Option handling |
| `effect-researcher` | API lookup, pattern research, Effect-specific analysis |

---

## Read First (Required)

Before starting, read these files to understand the spec:

1. `specs/flexlayout-type-safety/README.md` — Overview
2. `specs/flexlayout-type-safety/RUBRICS.md` — Pattern detection criteria
3. `specs/flexlayout-type-safety/AGENT_PROMPTS.md` — Sub-agent prompt templates
4. `specs/flexlayout-type-safety/REFLECTION_LOG.md` — Prior learnings

---

## Prior Context

Three files have already been partially fixed:

| File | Status | Notes |
|------|--------|-------|
| `model/IJsonModel.ts` | completed | Schema classes defined |
| `model/BorderNode.ts` | completed | toJson() uses decodeUnknownSync |
| `model/TabNode.ts` | completed | toJson() uses decodeUnknownSync |

---

## Phase 1 Tasks

### Task 1: Generate File Inventory (codebase-researcher)

Deploy `codebase-researcher` to create `specs/flexlayout-type-safety/outputs/codebase-context.md` listing all 44 files with status columns.

Use this structure:
```markdown
# FlexLayout File Checklist

## Model Files (14 files)
| File | Status | Issues | Agent | Notes |
|------|--------|--------|-------|-------|
| IJsonModel.ts | completed | — | — | Schema classes |
| BorderNode.ts | completed | — | — | decodeUnknownSync |
| TabNode.ts | completed | — | — | decodeUnknownSync |
| Model.ts | pending | | | |
[... continue for all files ...]
```

### Task 2: Analyze First Batch (effect-researcher)

For each file in priority order, deploy `effect-researcher` (or `codebase-researcher`) for analysis:

**Priority Order (Model files with toJson)**:
1. `model/Model.ts` — Main model, most complex
2. `model/TabSetNode.ts` — Tab set serialization
3. `model/RowNode.ts` — Row serialization
4. `model/BorderSet.ts` — Border collection
5. `model/Node.ts` — Base node class

**Analysis Prompt Template**:
```markdown
Analyze `packages/ui/ui/src/flexlayout-react/model/[FILE].ts` for type safety issues.

## Look For
1. **Critical**: `any` types, native array methods (.map, .filter), native string methods
2. **High**: Type assertions, unchecked optional access, non-exhaustive switches
3. **Medium**: Optional chaining without Option, manual null checks

## Output Format
JSON with: file, summary (counts by severity), issues array (type, line, code, fix, agent)

## Do NOT fix anything — analysis only.
```

### Task 3: Fix Files Using Appropriate Agents

After analysis, deploy the recommended agent for each file.

**For Schema/toJson issues** → `effect-schema-expert`:
```markdown
Fix `[FILE_PATH]` using Effect Schema patterns.

## Context
- Schema classes in `./IJsonModel.ts`
- Use `Record<string, unknown>` as intermediate (Schema classes are readonly)
- Use `S.decodeUnknownSync` for validation

## Issues to Fix
[List from analysis]

## Verification
Run: `bun run check && bun run build`
```

**For Array/String/Predicate issues** → `effect-predicate-master`:
```markdown
Fix `[FILE_PATH]` replacing native methods with Effect utilities.

## Required Imports
```typescript
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as O from "effect/Option";
```

## Issues to Fix
[List from analysis]

## Verification
Run: `bun run check && bun run build`
```

### Task 4: Verify and Log

After each file:
1. Run `bun run check && bun run build`
2. Update file-checklist.md with status
3. If unusual patterns found, add to REFLECTION_LOG.md

### Task 5: Batch Reflection (reflector)

After completing 5-10 files, deploy the `reflector` agent:

```
Analyze the batch results from specs/flexlayout-type-safety/REFLECTION_LOG.md.

Input:
- Files processed and outcomes
- Errors encountered
- Prompt effectiveness

Output:
- What worked / what didn't
- Prompt improvements for AGENT_PROMPTS.md
- Updated REFLECTION_LOG.md entry
```

Then:
1. Run full verification: `bun run lint:fix && bun run check && bun run build`
2. Apply reflector's prompt improvements to AGENT_PROMPTS.md
3. Generate HANDOFF_P2.md if session ending

---

## Execution Protocol

```
For each file in priority order:
  1. Deploy codebase-researcher or effect-researcher for analysis
  2. Review analysis output
  3. Deploy appropriate fix agent (schema-expert or predicate-master)
  4. Verify: bun run check && bun run build
  5. Update codebase-context.md checklist
  6. Log if learnings emerge

After each batch (5-10 files):
  1. Full verification
  2. Deploy reflector for batch analysis
  3. Apply prompt improvements
  4. Generate HANDOFF_P[N+1].md if needed
```

---

## Handoff Criteria

Generate handoff to `handoffs/HANDOFF_P2.md` when:
- Context window is filling up
- Significant batch completed
- Blocked on external decision
- Session ending

Use template: `templates/handoff.template.md`

---

## Success Criteria for P1

- [ ] File checklist created with all 44 files
- [ ] First batch (5 model files) analyzed
- [ ] At least 3 files fixed and verified
- [ ] REFLECTION_LOG.md updated with learnings
- [ ] Build passes: `bun run check && bun run build`

---

## Begin

1. Read the required files listed above
2. Create the file checklist
3. Start analyzing `model/Model.ts`
4. Continue through priority order

Good luck!
