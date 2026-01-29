# Agent Prompts

> Summary of specialized agent prompts for each phase.

---

## Agent Types

| Agent Type | Purpose | Tool |
|------------|---------|------|
| `codebase-researcher` | Discovery - index violations | Task (subagent_type=Explore) |
| `effect-code-writer` | Execution - apply migrations | Task (subagent_type=effect-code-writer) |
| `reflector` | Reflection - extract learnings | Task (subagent_type=reflector) |

---

## Prompt File Structure

```
agent-prompts/
├── P1-array-discovery.md      # Array violation discovery
├── P1-code-writer.md          # Array migration execution
├── P2-string-discovery.md     # String violation discovery
├── P2-code-writer.md          # String migration execution
├── P3-set-discovery.md        # Set violation discovery
├── P3-code-writer.md          # Set migration execution
├── P4-map-discovery.md        # Map violation discovery
├── P4-code-writer.md          # Map migration execution
├── P5-error-discovery.md      # Error violation discovery
├── P5-code-writer.md          # Error migration execution
├── P6-json-discovery.md       # JSON violation discovery
├── P6-code-writer.md          # JSON migration execution
├── P7-promise-discovery.md    # Promise violation discovery
├── P7-code-writer.md          # Promise migration execution
├── P8-regex-discovery.md      # Regex violation discovery
├── P8-code-writer.md          # Regex migration execution
├── P9-switch-discovery.md     # Switch violation discovery
├── P9-code-writer.md          # Switch migration execution
├── P10-date-discovery.md      # Date violation discovery
├── P10-code-writer.md         # Date migration execution
├── P11-option-discovery.md    # Nullable return discovery
├── P11-code-writer.md         # Option migration execution
└── consolidator.md            # Checklist consolidation
```

---

## Discovery Agent Prompt Template

All discovery agents follow this structure:

```markdown
# P[N] [Category] Discovery Agent

## Your Mission
Scan the specified scope for [category] violations and produce a checklist.

## Scope
[Directory paths to scan]

## Target Patterns
[Regex patterns and examples to find]

## Output Format
Create `outputs/P[N]-discovery-[batch].md` with:

```markdown
# P[N] [Category] Discovery - Batch [N]

## Summary
- Files scanned: X
- Violations found: Y

## Checklist

### [filename]
- [ ] `path/to/file.ts:LINE` - `nativeMethod` - Replace with `EffectMethod`
```

## Critical Rules
1. ONLY produce checklist - NO code changes
2. Include EXACT line numbers
3. Include EXACT replacement function names
4. One checklist item per violation
```

---

## Code Writer Agent Prompt Template

All code writer agents follow this structure:

```markdown
# P[N] [Category] Code Writer Agent

## Your Mission
Apply migrations from the checklist for the assigned file.

## Assigned File
[File path from checklist]

## Migrations to Apply
[Checklist items for this file]

## Import Pattern
```typescript
import * as [Alias] from "effect/[Module]";
```

## Migration Patterns
[Before/after code examples]

## Critical Rules
1. Preserve existing functionality
2. Add imports ONLY if not already present
3. Do NOT change unrelated code
4. Mark checklist items complete when done
5. If migration is unclear, document uncertainty

## Verification
After changes, ensure file compiles:
```bash
bun tsc --noEmit path/to/file.ts
```
```

---

## Using Agent Prompts

### For Discovery

```typescript
// Deploy discovery agents in parallel
Task(subagent_type="Explore", prompt=readFile("agent-prompts/P1-array-discovery.md"))
```

### For Execution

```typescript
// Deploy code writers in batches of 5
for (batch of chunks(files, 5)) {
  for (file of batch) {
    Task(subagent_type="effect-code-writer", prompt=`
      ${readFile("agent-prompts/P1-code-writer.md")}

      ## Assigned File
      ${file}

      ## Checklist Items
      ${checklistItemsForFile(file)}
    `)
  }
}
```

### For Reflection

```typescript
Task(subagent_type="reflector", prompt=`
  Reflect on Phase ${N} execution.

  ## Context
  - Checklist: outputs/P${N}-MASTER_CHECKLIST.md
  - Files modified: ${modifiedFiles.length}

  ## Questions
  1. What patterns emerged during migration?
  2. What agent prompt improvements are needed?
  3. What anti-patterns should future phases avoid?
`)
```
