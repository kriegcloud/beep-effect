# Phase 1 Orchestrator Prompt

## Context

You are executing Phase 1 of the IAM Effect Patterns specification. Your goal is to perform deep analysis of the current IAM client and UI patterns to identify inconsistencies and boilerplate opportunities.

## Pre-Requisites

1. Read the spec README: `specs/iam-effect-patterns/README.md`
2. Read the handoff document: `specs/iam-effect-patterns/handoffs/HANDOFF_P1.md`
3. Read the reflection log: `specs/iam-effect-patterns/REFLECTION_LOG.md`

## Phase 1 Tasks

### Task 1: Analyze All Handlers

Read each handler file and extract:

```
packages/iam/client/src/core/sign-out/sign-out.handler.ts
packages/iam/client/src/core/get-session/get-session.handler.ts
packages/iam/client/src/sign-in/email/sign-in-email.handler.ts
packages/iam/client/src/sign-up/email/sign-up-email.handler.ts
```

For each, document:
- Effect.fn name string
- Parameter signature (type and optionality)
- Better Auth method called
- Response handling (data extraction, error checking)
- Session signal notification (present/absent, conditional?)
- Schema decode method used

### Task 2: Search for Session Signal Usage

Use grep to find all `$sessionSignal` occurrences:
```bash
grep -rn "\$sessionSignal" packages/iam/
```

Document every occurrence with file, line, and context.

### Task 3: Analyze All Contracts

Read each contract file:

```
packages/iam/client/src/core/sign-out/sign-out.contract.ts
packages/iam/client/src/core/get-session/get-session.contract.ts
packages/iam/client/src/sign-in/email/sign-in-email.contract.ts
packages/iam/client/src/sign-up/email/sign-up-email.contract.ts
```

For each, document:
- Schema class definitions (Payload, Success, Response, etc.)
- Annotation method (withFormAnnotations vs direct)
- Form default values
- Any transformation logic (transformOrFail)

### Task 4: Analyze Services

Read service files:

```
packages/iam/client/src/core/service.ts
packages/iam/client/src/sign-in/service.ts
packages/iam/client/src/sign-up/service.ts
```

Document:
- Service class definition pattern
- Handler aggregation approach
- Runtime creation pattern

### Task 5: Analyze UI Atoms

Read UI atom files:

```
packages/iam/ui/src/sign-in/email/sign-in-email.atom.ts
packages/iam/ui/src/sign-up/email/sign-up-email.atoms.ts
packages/iam/client/src/core/atoms.ts
```

Document:
- Runtime.fn usage
- Toast integration (withToast options)
- Hook exposure (useAtomSet options)
- Any state management patterns

### Task 6: Reference Pattern Analysis

Read reference patterns from other packages:

```
packages/shared/client/src/atom/files/atoms/files.atom.ts
packages/runtime/client/src/runtime.ts
```

Extract patterns that could apply to IAM.

### Task 7: Generate Analysis Report

Create comprehensive report at:
```
specs/iam-effect-patterns/outputs/current-patterns.md
```

Report structure:
1. Executive Summary
2. Handler Analysis Matrix
3. Contract Analysis Matrix
4. Service Pattern Summary
5. UI Atom Pattern Summary
6. Inconsistency Catalog
7. Boilerplate Inventory
8. Recommendations

## Output Template

Use this structure for the report:

```markdown
# Current IAM Effect Patterns Analysis

## Executive Summary

[2-3 paragraphs summarizing findings]

## Handler Analysis

### Matrix

| Handler | Name String | Signature | Mutates Session | Notifies Signal | Error Check |
|---------|-------------|-----------|-----------------|-----------------|-------------|
| ... | ... | ... | ... | ... | ... |

### Detailed Findings

#### sign-out.handler.ts
- **Effect.fn name**: `"core/sign-out/handler"`
- **Signature**: [describe]
- **Session mutation**: [Yes/No]
- **Signal notification**: [Yes/No/Conditional]
- **Error handling**: [describe]
- **Code snippet**: [relevant excerpt]

[Repeat for each handler]

## Contract Analysis

### Matrix

| Contract | Classes | Annotation Method | Has Transform | Defaults |
|----------|---------|-------------------|---------------|----------|
| ... | ... | ... | ... | ... |

### Detailed Findings

[Similar detail for each contract]

## Service Pattern Summary

[Analysis of service files]

## UI Atom Pattern Summary

[Analysis of atom files]

## Inconsistency Catalog

| ID | Description | Files | Severity | Standardization |
|----|-------------|-------|----------|-----------------|
| I1 | ... | ... | ... | ... |

## Boilerplate Inventory

| Pattern | Occurrences | Lines/Instance | Total Lines | Factor? |
|---------|-------------|----------------|-------------|---------|
| ... | ... | ... | ... | ... |

## Recommendations

### Priority 1: Critical Fixes
[List]

### Priority 2: Pattern Standardization
[List]

### Priority 3: Boilerplate Reduction
[List]
```

## Completion Checklist

- [ ] All handlers analyzed
- [ ] Session signal usage mapped
- [ ] All contracts analyzed
- [ ] All services analyzed
- [ ] All UI atoms analyzed
- [ ] Reference patterns reviewed
- [ ] Report generated at `outputs/current-patterns.md`
- [ ] REFLECTION_LOG.md updated with session learnings

## After Completion

1. Update `REFLECTION_LOG.md` with Phase 1 learnings
2. Update spec `README.md` Phase 1 status to Complete
3. Identify any blockers for Phase 2

## Time Budget

Estimated effort: 30-45 minutes of analysis and documentation.

## Questions to Answer

These questions should be definitively answered by Phase 1:

1. Are there any handlers that properly check `response.error`?
2. Is the session signal notification pattern intentionally inconsistent or accidental?
3. What percentage of handler code is boilerplate vs unique logic?
4. Are there any existing factory patterns in the codebase?
5. What is the canonical annotation approach already in use?
