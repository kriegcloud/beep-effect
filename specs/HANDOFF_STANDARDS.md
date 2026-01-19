# Handoff Standards

> **Project-wide standards for creating phase handoff documents in multi-session specifications.**

---

## Quick Reference

**At the end of EVERY phase, create BOTH files:**

| File                            | Purpose                                                                               | Location                      |
|---------------------------------|---------------------------------------------------------------------------------------|-------------------------------|
| `HANDOFF_P[N+1].md`             | Full context document with verification tables, schema shapes, implementation details | `specs/[spec-name]/handoffs/` |
| `P[N+1]_ORCHESTRATOR_PROMPT.md` | Copy-paste ready prompt to start the next phase                                       | `specs/[spec-name]/handoffs/` |

**Do NOT consider a phase complete until BOTH files exist and pass their verification checklists.**

---

## Purpose

Phase handoffs are the **primary context transfer mechanism** for multi-session spec execution. A high-quality handoff can save hours of debugging by providing accurate information upfront.

This document establishes mandatory requirements based on learnings from completed specs (notably `full-iam-client`).

---

## When to Create Handoffs

| Spec Complexity       | Handoff Required | Location                                |
|-----------------------|------------------|-----------------------------------------|
| Simple (1 session)    | No               | N/A                                     |
| Medium (2-3 sessions) | Yes              | `specs/[name]/handoffs/HANDOFF_P[N].md` |
| Complex (4+ sessions) | Yes              | `specs/[name]/handoffs/HANDOFF_P[N].md` |

**Rule**: Any spec spanning multiple Claude sessions MUST use handoffs to preserve context.

---

## Context Budget Protocol

### Budget Tracking

Orchestrators MUST track context consumption using these heuristics:

| Metric | Green Zone | Yellow Zone | Red Zone (STOP!) |
|--------|------------|-------------|------------------|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads (>200 lines) | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |

### Zone Response Protocol

**Green Zone**: Continue normally, monitor metrics.

**Yellow Zone**:
- Assess remaining work (< 30% vs > 30%)
- If < 30% remaining, continue cautiously
- If > 30% remaining, create checkpoint

**Red Zone**:
1. STOP immediately
2. Create `HANDOFF_P[N]_CHECKPOINT.md`
3. Either continue in new session or hand off

### Checkpoint Trigger Events

Create a checkpoint when ANY of these occur:
- Direct tool calls reach 15
- Large file reads reach 4
- 3 major sub-tasks completed
- Subjective "context pressure" feeling
- Before starting large/risky work item

---

## Mandatory Requirements

### 0. Orchestrator Prompt Creation (CRITICAL)

**Rule**: At the end of EVERY phase, you MUST create BOTH handoff documents:

1. **`HANDOFF_P[N+1].md`** - Full context document (this file)
2. **`P[N+1]_ORCHESTRATOR_PROMPT.md`** - Copy-paste ready prompt to start the next phase

**Why Both?**
- `HANDOFF_P[N+1].md` provides complete context, verification tables, and detailed specifications
- `P[N+1]_ORCHESTRATOR_PROMPT.md` is a concise, actionable prompt that can be copied directly into a new chat session

**Location**: Both files go in `specs/[spec-name]/handoffs/`

**Do NOT consider a phase complete until BOTH files exist.**

See the Handoff Template section below for the structure of `HANDOFF_P[N+1].md`.
See the Orchestrator Prompt Template section for the structure of `P[N+1]_ORCHESTRATOR_PROMPT.md`.

---

### 1. External API Source Verification (CRITICAL)

**Rule**: ALL response schemas for external APIs MUST be verified against source code. NEVER assume response shapes.

#### Verification Process

For EACH external API method in the handoff:

1. **Locate route/endpoint implementation** in the external library's source code
2. **Extract exact response shape** from return statements
3. **Cross-reference with test files** for usage examples
4. **Document ALL fields** including optional/nullable fields

#### Documentation Format

````markdown
## Source Verification (MANDATORY)

| Method       | Source File         | Line | Test File             | Verified |
|--------------|---------------------|------|-----------------------|----------|
| `methodName` | `path/to/routes.ts` | 42   | `path/to/tests.ts:15` | Y        |

**Verification Process**:
1. Located implementation in `path/to/routes.ts`
2. Extracted exact response shape from return statements
3. Cross-referenced with test assertions
4. Documented ALL fields including optional/null fields
````

#### Common Mistakes

**WRONG** (assumed response):
```typescript
export class Success extends S.Class<Success>("Success")({
  status: S.Boolean,  // Missing 'message' field!
}) {}
```

**RIGHT** (verified from source):
```typescript
// Verified from routes.ts line 42
export class Success extends S.Class<Success>("Success")({
  status: S.Boolean,
  message: S.String,  // Field present in actual response
}) {}
```

---

### 2. Method Name Conventions

**Rule**: Document the naming convention used by the external API's client.

#### Common Patterns

| Pattern             | Example                   | Client Method                     |
|---------------------|---------------------------|-----------------------------------|
| Kebab-case endpoint | `/request-password-reset` | `client.requestPasswordReset()`   |
| Snake-case endpoint | `/request_password_reset` | `client.request_password_reset()` |
| Nested plugin       | `/plugin/method`          | `client.plugin.method()`          |

**Always document the conversion pattern** so implementers know how to find correct client methods.

---

### 3. Response Shape Documentation

**Rule**: Document the EXACT response shape with source line reference.

#### Template

```markdown
### methodName

**Client Method**: `client.methodName()`

**Verified Response Shape** (from `routes.ts` line 42):
```typescript
{
  field1: boolean,
  field2: string | null,
  nestedObject: {
    field3: string
  }
}
```

**Success Schema**:
```typescript
export class Success extends S.Class<Success>("Success")({
  field1: S.Boolean,
  field2: S.NullOr(S.String),
  nestedObject: S.Struct({
    field3: S.String,
  }),
}) {}
```
```

---

### 4. Null vs Undefined Handling

**Rule**: External APIs often use `null` for optional fields. Document this distinction.

| Pattern | Effect Schema |
|---------|---------------|
| Field is `null` or value | `S.NullOr(S.String)` |
| Field is `undefined` or value | `S.optional(S.String)` |
| Field can be `null` OR `undefined` | `S.optionalWith(S.String, { nullable: true })` |

**Example**:
```typescript
// API returns: { token: string | null, user: { ... } }

// Correct schema:
export class Success extends S.Class<Success>("Success")({
  token: S.NullOr(S.String),  // Use NullOr for nullable fields
  user: UserSchema,
}) {}
```

---

### 5. Nested Object Structures

**Rule**: When responses contain nested objects, document the complete structure.

**WRONG** (incomplete):
```typescript
export class Success extends S.Class<Success>("Success")({
  user: S.Any,  // Never use Any!
}) {}
```

**RIGHT** (complete):
```typescript
export class Success extends S.Class<Success>("Success")({
  user: S.Struct({
    id: S.String,
    email: S.String,
    name: S.NullOr(S.String),
    createdAt: S.Date,
    updatedAt: S.Date,
  }),
}) {}
```

---

## Orchestrator Prompt Template

Use this template for `P[N+1]_ORCHESTRATOR_PROMPT.md` files:

````markdown
# Phase [N+1] Orchestrator Prompt

Copy-paste this prompt to start Phase [N+1] implementation.

---

## Prompt

You are implementing Phase [N+1] of the [SPEC_NAME] spec.

### Context

[Brief summary of what was completed in previous phases - 2-3 sentences max]

[Key findings or learnings from previous phase that inform this phase]

### Your Mission

[Clear, concise description of what this phase accomplishes]

[Bulleted list of specific work items or files to create/modify]

### Critical Patterns

[Include 2-5 code examples showing key patterns or gotchas]

**Pattern Name**:
```typescript
// Example code showing the pattern
```

### Reference Files

[List of files to consult during implementation, with brief descriptions]

- Pattern: `path/to/reference.ts` - What pattern it demonstrates
- Domain: `path/to/model.ts` - What to reference
- Shared: `path/to/shared.ts` - What utilities are available

### Verification

[Commands to run after each step]

```bash
bun run check --filter @beep/package
bun run test --filter @beep/package
```

### Success Criteria

- [ ] [Specific, measurable completion item 1]
- [ ] [Specific, measurable completion item 2]
- [ ] Type check passes
- [ ] Tests pass

### Handoff Document

Read full context in: `specs/[SPEC_NAME]/handoffs/HANDOFF_P[N+1].md`

### Next Phase

After completing Phase [N+1]:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `HANDOFF_P[N+2].md` (context document)
3. Create `P[N+2]_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
````

---

## Handoff Document Template

Use this template for `HANDOFF_P[N+1].md` files (full context documents):

````markdown
# Phase [N] Handoff: [Feature Name]

**Date**: YYYY-MM-DD
**From**: Phase [N-1] ([Previous Feature])
**To**: Phase [N] ([Current Feature])
**Status**: Ready for implementation

---

## Phase [N-1] Summary

[What was accomplished in previous phase]

### Key Learnings Applied

[Specific improvements made based on prior phase experience]

---

## Source Verification (MANDATORY)

**CRITICAL**: All response schemas have been verified against source code.

| Method       | Source File         | Line | Test File           | Verified |
|--------------|---------------------|------|---------------------|----------|
| `methodName` | `path/to/source.ts` | N    | `path/to/test.ts:N` | Y        |

**Verification Process**:
1. Located implementation in source files
2. Extracted exact response shape from return statements
3. Cross-referenced with test assertions
4. Documented ALL fields including optional/null fields

---

## Methods to Implement

### [Feature Domain]

| Method       | Client Call             | Parameters        | Returns           | Pattern        |
|--------------|-------------------------|-------------------|-------------------|----------------|
| `methodName` | `client.methodName()`   | `{ field: type }` | `{ data, error }` | Factory/Manual |

**Naming Convention**: [Document endpoint-to-method conversion]

---

## Schema Shapes

### method-name.contract.ts

**Client Method**: `client.methodName()`

**Verified Response Shape** (from `source.ts` line N):
```typescript
{
  field1: type,
  field2: type | null,
}
````

**Contract Implementation**:
```typescript
import * as S from "effect/Schema";

export class Payload extends S.Class<Payload>("Payload")({
  field1: S.String,
}) {}

export class Success extends S.Class<Success>("Success")({
  field1: S.Boolean,
  field2: S.NullOr(S.String),
}) {}
```

---

## Implementation Order

1. [First item] - [Reason for order]
2. [Second item] - [Reason]
3. [Feature]/index.ts - Barrel file (create LAST)

---

## Verification Steps

After implementing each handler:

```bash
bun run check --filter @beep/[package]
bun run lint:fix --filter @beep/[package]
```

---

## Known Issues & Gotchas

[Document issues discovered in previous phases that this phase should avoid]

---

## Success Criteria

Phase [N] is complete when:
- [ ] All handlers implemented
- [ ] Correct patterns used (Factory/Manual)
- [ ] Feature barrel file exports all handlers
- [ ] Package index.ts exports feature module
- [ ] Type check passes
- [ ] Lint passes
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P[N+1].md created (if more phases remain)
```

---

## Verification Checklist for Handoff Authors

Before finalizing any handoff, verify BOTH files are complete:

### Orchestrator Prompt Checklist (`P[N+1]_ORCHESTRATOR_PROMPT.md`)

- [ ] **File exists** in `specs/[spec-name]/handoffs/` directory
- [ ] **Copy-paste ready** - prompt is self-contained and actionable
- [ ] **Context section** summarizes previous phase completion
- [ ] **Mission section** clearly states phase objectives
- [ ] **Critical patterns** include 2-5 code examples
- [ ] **Reference files** listed with descriptions
- [ ] **Verification commands** included
- [ ] **Success criteria** are specific and measurable
- [ ] **Links to HANDOFF document** for full context
- [ ] **Next phase instructions** remind to create next handoff files

### Handoff Document Checklist (`HANDOFF_P[N+1].md`)

- [ ] **File exists** in `specs/[spec-name]/handoffs/` directory
- [ ] **Every method's response shape verified from source code**
- [ ] **Source file references included** (file + line numbers)
- [ ] **ALL response fields documented** (no omissions)
- [ ] **Null vs undefined distinctions documented**
- [ ] **Nested objects fully structured** (no `S.Any`)
- [ ] **Naming convention documented**
- [ ] **Test file references included** for usage examples
- [ ] **Known gotchas from previous phases included**
- [ ] **Verification process documented in handoff**

### Context Budget Checklist

- [ ] Context budget was tracked during phase execution
- [ ] No Red Zone violations occurred (or were properly checkpointed)
- [ ] Sub-agent delegations were used appropriately
- [ ] Checkpoint files exist for any mid-phase pauses

### Critical Rule

**A phase is NOT complete until BOTH files exist and pass their respective checklists.**

---

## Anti-Patterns

### Assuming Response Shapes

```markdown
## Methods to Implement

| Method | Returns |
|--------|---------|
| doSomething | `{ status: boolean }` |
```

**Problem**: No verification, missing fields.

**Solution**: Always include source verification with file:line references.

### Using S.Any for Complex Types

```typescript
export class Success extends S.Class<Success>("Success")({
  data: S.Any,  // NEVER do this
}) {}
```

**Problem**: Loses type safety, allows runtime errors.

**Solution**: Fully type all nested structures.

### Inconsistent Null Handling

```typescript
// Source returns: { value: string | null }
// Wrong schema:
value: S.optional(S.String)  // Wrong! This expects undefined
```

**Solution**: Match the exact nullability from the source code.

---

## Intra-Phase Checkpoints

For phases that risk exceeding context limits, use intra-phase checkpoints.

### When to Use

- Phase has 6-7 work items
- Phase involves multiple large sub-agent delegations
- Entering Yellow Zone mid-phase

### Checkpoint File Format

```markdown
# Phase [N] Checkpoint: [Brief Description]

**Timestamp**: YYYY-MM-DD HH:MM
**Checkpoint Reason**: [Yellow Zone / Red Zone / Proactive / Manual]

## Context Budget Status
- Direct tool calls: X/20
- Large file reads: X/5
- Sub-agent delegations: X/10

## Completed Work
- [x] Work item 1
- [x] Work item 2

## In Progress
- [ ] Work item 3 (status: [description])

## Remaining Work
- [ ] Work item 4
- [ ] Work item 5

## Sub-Agent Outputs Captured
[Reference any sub-agent outputs that should be preserved]

## Resume Instructions
1. Start from [specific point]
2. Use [specific sub-agent output] for context
3. Continue with [next work item]
```

### Recovery Protocol

When resuming from a checkpoint:
1. Read the checkpoint file first
2. Review "In Progress" and "Remaining Work" sections
3. Check "Resume Instructions" for specific guidance
4. DO NOT re-do completed work
5. Continue delegating per the delegation matrix

---

## Related Documentation

- [SPEC_CREATION_GUIDE](SPEC_CREATION_GUIDE.md) - Full spec creation workflow
- [Effect Patterns](../.claude/rules/effect-patterns.md) - Schema type selection guide
- [External API Integration](../documentation/patterns/external-api-integration.md) - API wrapper patterns

---

## Origin

This standard was promoted from `specs/full-iam-client/HANDOFF_CREATION_GUIDE.md` based on learnings from implementing 35+ handlers across 6 phases of the full-iam-client specification.
