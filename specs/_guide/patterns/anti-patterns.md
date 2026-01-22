# Anti-Patterns

> Common mistakes and anti-patterns to avoid when creating and executing specifications.

---

## Overview

This document catalogs 14 anti-patterns discovered during spec execution. Each entry includes:
- **Wrong**: The problematic approach
- **Right**: The correct approach
- **Lesson**: Key takeaway (where applicable)

---

## 1. Manual Everything

**Wrong**: Writing all documentation manually without agents

**Right**: Use doc-writer for structure, reflector for improvement

---

## 2. Skipping Reflection

**Wrong**: Execute phases without logging learnings

**Right**: Update REFLECTION_LOG.md after every phase

---

## 3. Static Prompts

**Wrong**: Same prompts regardless of learnings

**Right**: Use reflector to continuously improve prompts

---

## 4. Agent Overload

**Wrong**: Using every agent for every task

**Right**: Match agents to phase needs (see Agent-Phase Mapping in [Spec Guide](../README.md))

---

## 5. No Validation

**Wrong**: Trust output without verification

**Right**: Use architecture-pattern-enforcer and code-reviewer

---

## 6. Misunderstanding CLI vs Skill Architecture

**Wrong**: Treating CLI commands and Skills as parallel alternatives
- "Option 1: Use CLI" vs "Option 2: Use Skill"
- Assuming both are user-facing tools
- Designing Skills to duplicate CLI functionality

**Right**: Skills orchestrate and may invoke CLI commands
- **CLI commands** are developer-facing automation (deterministic file generation)
- **Skills** are AI agent guidance layers (interactive workflow orchestration)
- Skills MAY invoke CLI commands as one step in multi-phase workflows
- Skills provide context gathering, validation, agent recommendations beyond CLI scope

**Decision Matrix**:
- **When developer manually creates spec** → Use CLI command directly
- **When AI agent orchestrates spec creation** → Skill guides workflow and may invoke CLI
- **When automation script needed** → CLI command
- **When interactive guidance needed** → Skill

**Example**: The `spec-bootstrapper` spec delivers both:
- CLI: `bun run beep bootstrap-spec -n name -d desc` (file generation)
- Skill: `/new-spec` (gathers context, validates, recommends complexity, invokes CLI, suggests next steps)

---

## 7. Effect Pattern Violations in Spec Code Examples

**Wrong**: Using Node.js APIs wrapped in `Effect.try()` in spec documentation
```typescript
// Wrong - in MASTER_ORCHESTRATION.md
const exists = yield* Effect.try(() => fs.existsSync(path));
```

**Right**: Using Effect platform services in all code examples
```typescript
// Right - in MASTER_ORCHESTRATION.md
const fs = yield* FileSystem.FileSystem;
const exists = yield* fs.exists(path);
```

**Critical**: All code examples in specs MUST follow Effect patterns documented in `documentation/EFFECT_PATTERNS.md`. Cross-reference existing working implementations (like `create-slice/handler.ts`) when writing spec code examples.

---

## 8. Template Variable Inconsistencies

**Wrong**: Documenting template variables in spec synthesis reports without auditing actual template file usage

**Right**:
1. Audit ALL template files to extract actual `{{variable}}` usage
2. Only document variables that are ACTUALLY used
3. If mentioning case variants (SpecName, SPEC_NAME), show where/how they're used
4. Keep variable set minimal - avoid over-engineering unused variants

**Lesson**: Template variable documentation in synthesis reports must match reality in template files, or implementation will fail.

---

## 9. Missing Decision Frameworks

**Wrong**: Defining user-facing options (like complexity levels: simple/medium/complex) without decision criteria

**Right**: Provide concrete heuristics for every user-facing choice:
- Number of sessions (1 / 2-3 / 4+)
- Number of files affected (< 5 / 5-15 / 15+)
- Number of agents needed (1 / 2-3 / 4+)
- Example use cases per option
- Decision matrix or checklist

**Lesson**: Users cannot choose wisely without concrete criteria. "Moderate complexity" is not actionable; "2-3 sessions, 5-15 files, multiple agents" is actionable.

---

## 10. Missing Orchestrator Prompts at Phase Completion

**Wrong**: Creating only `HANDOFF_P[N+1].md` at phase end and considering the phase complete

**Right**: Create BOTH handoff files:
- `HANDOFF_P[N+1].md` - Full context document with verification tables, detailed specs
- `P[N+1]_ORCHESTRATOR_PROMPT.md` - Copy-paste ready prompt to start the next phase

**Why Both?**
- The HANDOFF document provides complete context but is too long to paste into a new session
- The ORCHESTRATOR_PROMPT is concise, actionable, and can be copied directly into a new chat
- Without the orchestrator prompt, the next session must manually synthesize the handoff into actionable instructions

**Lesson**: A phase is NOT complete until BOTH files exist. The orchestrator prompt is not optional - it's the primary mechanism for starting the next phase. See [HANDOFF_STANDARDS.md](../HANDOFF_STANDARDS.md) for templates.

---

## 11. Orchestrator Doing Research Directly

**Wrong**: Orchestrator performs sequential Glob/Read/Grep operations
```
[Orchestrator]
Let me find the service patterns...
[Glob: packages/iam/**/*.ts]
[Read: file1.ts]
[Read: file2.ts]
[Grep: "Effect.Service"]
[Read: file3.ts]
... (10+ tool calls, context consumed)
```

**Right**: Orchestrator delegates research to codebase-researcher
```
[Orchestrator]
I need to understand service patterns.
[Task: codebase-researcher]
"Find all Effect.Service definitions in packages/iam/ and summarize patterns"
(Agent returns summary, orchestrator continues with synthesized knowledge)
```

---

## 12. Unbounded Phase Sizes

**Wrong**: Phase defined by feature scope without size limits
```
Phase 2: Full Implementation
- Implement entity service
- Implement relation service
- Implement extraction pipeline
- Implement grounder
- Write all tests
- Add observability
- Create documentation
(7+ items = context exhaustion risk)
```

**Right**: Phase sized to context budget
```
Phase 2a: Core Services (5 items max)
- Entity service (delegate: effect-code-writer)
- Relation service (delegate: effect-code-writer)
- Core tests (delegate: test-writer)
- Verify builds
- Checkpoint handoff

Phase 2b: Pipeline & Extensions
- Extraction pipeline
- Grounder service
- Integration tests
- Observability
- Checkpoint handoff
```

---

## 13. Late Context Checkpoints

**Wrong**: Creating handoff after context stress
```
[... 50+ tool calls ...]
"Context is getting long, let me quickly create a handoff..."
(Rushed, incomplete handoff)
```

**Right**: Proactive checkpointing
```
[After 15-20 tool calls or completing 3 sub-tasks]
"Checkpoint: Creating interim handoff before continuing."
(Deliberate, comprehensive handoff)
```

---

## 14. Context Hoarding

**Wrong**: Including full history in every handoff
```markdown
# Handoff Phase 5

## Complete History
### Phase 1 (full details)
[500+ tokens of Phase 1 content...]

### Phase 2 (full details)
[500+ tokens of Phase 2 content...]

### Phase 3 (full details)
[500+ tokens of Phase 3 content...]

### Phase 4 (full details)
[500+ tokens of Phase 4 content...]

## Phase 5 Tasks
[Actual tasks buried at the end]
```

**Problems**:
- Exceeds 4K token budget
- Critical Phase 5 info buried ("lost in middle" effect)
- Redundant: previous phase details don't change
- Forces next session to parse irrelevant history

**Right**: Compressed rolling summary + phase-specific working context
```markdown
# Handoff Phase 5

## Rolling Summary (Updated Each Phase)
**Key Decisions**:
- Phase 1: Created llms.txt (domain-grouped pattern)
- Phase 2: Added tiered memory model to HANDOFF_STANDARDS
- Phase 3: Defined reflection schema (3 entry types)
- Phase 4: Implemented agent signatures

**Active Constraints**:
- No breaking changes to existing specs
- All patterns backwards-compatible

## Working Context for Phase 5
[Phase 5-specific tasks, criteria, dependencies]

## Verification
[Commands to run]
```

**Benefits**:
- Rolling summary: ~200 tokens (vs 2000+ for full history)
- Working context: ~1000 tokens (focused on current phase)
- Critical info at start (Rolling Summary) and end (Verification)
- Total: ~1500 tokens (well under 4K budget)

**Rule**: If your handoff exceeds 4K tokens, you're context hoarding. Compress episodic history into the rolling summary.

---

## Quick Reference: Anti-Pattern Categories

| Category | Anti-Patterns |
|----------|---------------|
| **Agent Misuse** | #1 Manual Everything, #4 Agent Overload, #11 Orchestrator Research |
| **Process Gaps** | #2 Skipping Reflection, #3 Static Prompts, #5 No Validation |
| **Architecture** | #6 CLI vs Skill, #7 Effect Patterns |
| **Documentation** | #8 Template Variables, #9 Decision Frameworks, #10 Missing Prompts |
| **Context Management** | #12 Unbounded Phases, #13 Late Checkpoints, #14 Context Hoarding |

---

## Related Documentation

- [Spec Guide](../README.md) - Main spec workflow
- [HANDOFF_STANDARDS](../HANDOFF_STANDARDS.md) - Context transfer standards
- [reflection-system](./reflection-system.md) - Pattern extraction workflow
- [validation-dry-runs](./validation-dry-runs.md) - Validation protocols
