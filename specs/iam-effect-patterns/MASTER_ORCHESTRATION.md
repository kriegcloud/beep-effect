# Master Orchestration Guide

## Overview

This document provides comprehensive orchestration instructions for the IAM Effect Patterns specification. It defines the complete workflow for each phase, agent deployment strategies, checkpoints, success criteria, and handoff procedures.

## Quick Reference

| Phase | Description | Agents | Duration | Output |
|-------|-------------|--------|----------|--------|
| 1 | Deep Analysis | codebase-researcher | 30-45m | `outputs/current-patterns.md` |
| 2 | Effect Research | mcp-researcher | 20-30m | `outputs/effect-research.md` |
| 3 | Pattern Design | effect-code-writer | 45-60m | `outputs/pattern-proposals.md` |
| 4 | Validation | code-reviewer, architecture-pattern-enforcer | 30m | `outputs/pattern-review.md` |
| 5 | Implementation Plan | orchestrator | 15-20m | `PLAN.md`, updated handoffs |
| 6 | Implementation | effect-code-writer, package-error-fixer | 60-90m | Code changes |
| 7 | Documentation | doc-writer | 30m | AGENTS.md updates |

## Pre-Flight Checklist

Before beginning any phase, the orchestrator must verify:

- [ ] Spec README.md has been read and understood
- [ ] REFLECTION_LOG.md has been reviewed for prior learnings
- [ ] All prerequisite phase outputs exist and are complete
- [ ] Required directories exist (`outputs/`, `handoffs/`, `templates/`)
- [ ] Template files are present in `templates/`

## Phase 1: Deep Analysis

### Objective

Perform comprehensive analysis of current IAM client and UI patterns to identify inconsistencies, boilerplate, and standardization opportunities.

### Agent Deployment

**Primary Agent**: `codebase-researcher`

**Agent Prompt**: See `AGENT_PROMPTS.md` - Section 1

### Input Files

```
packages/iam/client/src/core/sign-out/sign-out.handler.ts
packages/iam/client/src/core/sign-out/sign-out.contract.ts
packages/iam/client/src/core/get-session/get-session.handler.ts
packages/iam/client/src/core/get-session/get-session.contract.ts
packages/iam/client/src/sign-in/email/sign-in-email.handler.ts
packages/iam/client/src/sign-in/email/sign-in-email.contract.ts
packages/iam/client/src/sign-up/email/sign-up-email.handler.ts
packages/iam/client/src/sign-up/email/sign-up-email.contract.ts
packages/iam/client/src/core/service.ts
packages/iam/client/src/sign-in/service.ts
packages/iam/client/src/sign-up/service.ts
packages/iam/ui/src/sign-in/email/sign-in-email.atom.ts
packages/iam/ui/src/sign-up/email/sign-up-email.atoms.ts
packages/iam/client/src/core/atoms.ts
packages/iam/client/src/_common/common.schemas.ts
packages/iam/client/src/_common/common.annotations.ts
packages/iam/client/src/_common/errors.ts
```

### Analysis Targets

1. **Handler Signatures**
   - Document each handler's parameter signature
   - Identify pattern variants (A, B, C as documented)
   - Note Effect.fn name string conventions

2. **Session Signal Usage**
   - Grep for `$sessionSignal` across all IAM files
   - Document which handlers notify vs should notify
   - Identify any conditional notification logic

3. **Contract Patterns**
   - Catalog all schema class definitions
   - Note annotation method (withFormAnnotations vs direct)
   - Document form default values
   - Identify any transformation logic

4. **Service Composition**
   - Analyze service class definitions
   - Document handler aggregation patterns
   - Note runtime creation patterns

5. **UI Atom Patterns**
   - Document runtime.fn usage
   - Catalog toast integration patterns
   - Note hook exposure patterns

### Checkpoint: Phase 1 Complete

Before marking Phase 1 complete, verify:

- [ ] All 4 handlers analyzed with detailed findings
- [ ] Session signal usage fully mapped
- [ ] All 4 contracts analyzed
- [ ] All 3 services analyzed
- [ ] All 3 UI atom files analyzed
- [ ] Inconsistency catalog generated
- [ ] Boilerplate inventory completed
- [ ] `outputs/current-patterns.md` created with full report

### Success Criteria

| Metric | Target |
|--------|--------|
| Handler coverage | 100% (4/4 handlers) |
| Contract coverage | 100% (4/4 contracts) |
| Service coverage | 100% (3/3 services) |
| Atom coverage | 100% (3/3 atom files) |
| Inconsistencies documented | All identified |
| Recommendations generated | Priority 1, 2, 3 |

### Output Template

The output file `outputs/current-patterns.md` must follow this structure:

```markdown
# Current IAM Effect Patterns Analysis

## Executive Summary
[2-3 paragraphs summarizing findings]

## Handler Analysis
### Matrix
| Handler | Name String | Signature | Mutates Session | Notifies Signal | Error Check |
|---------|-------------|-----------|-----------------|-----------------|-------------|

### Detailed Findings
[Per-handler analysis]

## Contract Analysis
### Matrix
| Contract | Classes | Annotation Method | Has Transform | Defaults |
|----------|---------|-------------------|---------------|----------|

### Detailed Findings
[Per-contract analysis]

## Service Pattern Summary
[Service analysis]

## UI Atom Pattern Summary
[Atom analysis]

## Inconsistency Catalog
| ID | Description | Files | Severity | Standardization |
|----|-------------|-------|----------|-----------------|

## Boilerplate Inventory
| Pattern | Occurrences | Lines/Instance | Total Lines | Factor? |
|---------|-------------|----------------|-------------|---------|

## Recommendations
### Priority 1: Critical Fixes
### Priority 2: Pattern Standardization
### Priority 3: Boilerplate Reduction
```

### Handoff to Phase 2

After completing Phase 1:

1. Update `REFLECTION_LOG.md` with findings
2. Update README.md Phase 1 status to "Complete"
3. Verify `outputs/current-patterns.md` exists
4. Note any blockers for Phase 2

---

## Phase 2: Effect Research

### Objective

Research Effect best practices and patterns relevant to the identified issues. Validate proposed patterns against official Effect documentation.

### Agent Deployment

**Primary Agent**: `mcp-researcher`

**Agent Prompt**: See `AGENT_PROMPTS.md` - Section 2

### Research Targets

1. **Effect.fn Best Practices**
   - When to use Effect.fn vs Effect.fnUntraced
   - Naming conventions for trace strings
   - Error handling in generators

2. **Schema Transformation Patterns**
   - transformOrFail vs simple transform
   - Class schema vs struct schemas
   - Annotation patterns

3. **Service Composition**
   - Service class patterns
   - Handler aggregation
   - Layer composition

4. **Error Channel Design**
   - Tagged errors
   - Error transformation
   - Cause preservation

5. **State Machine Patterns**
   - Effect-atom state machines
   - Registry integration
   - Transition effects

### Input Dependencies

- Phase 1 output: `outputs/current-patterns.md`
- Effect documentation (via MCP)
- Effect-atom documentation (via MCP)

### Checkpoint: Phase 2 Complete

Before marking Phase 2 complete, verify:

- [ ] Effect.fn best practices documented
- [ ] Schema patterns researched
- [ ] Service composition patterns documented
- [ ] Error handling patterns documented
- [ ] State machine patterns researched
- [ ] All findings validated against official docs
- [ ] `outputs/effect-research.md` created

### Success Criteria

| Metric | Target |
|--------|--------|
| Topics covered | 5/5 research targets |
| Source validation | All patterns have Effect doc references |
| Applicability | Each pattern mapped to IAM use case |

### Output Template

The output file `outputs/effect-research.md` must follow:

```markdown
# Effect Patterns Research

## Research Summary

## Effect.fn Patterns
### Best Practices
### Naming Conventions
### Applicable to IAM

## Schema Patterns
### Transformation Patterns
### Annotation Patterns
### Applicable to IAM

## Service Composition
### Service Class Patterns
### Applicable to IAM

## Error Handling
### Tagged Error Patterns
### Applicable to IAM

## State Machines
### Effect-Atom Patterns
### Applicable to IAM

## References
```

---

## Phase 3: Pattern Design

### Objective

Design canonical patterns based on Phase 1 analysis and Phase 2 research. Create concrete implementations that address identified issues.

### Agent Deployment

**Primary Agent**: `effect-code-writer`

**Agent Prompt**: See `AGENT_PROMPTS.md` - Section 3

### Input Dependencies

- Phase 1: `outputs/current-patterns.md`
- Phase 2: `outputs/effect-research.md`
- Templates: `templates/*.template.ts`

### Design Targets

1. **Handler Factory**
   - Generic createHandler function
   - Support for payload/no-payload variants
   - Session signal notification flag
   - Error transformation

2. **Schema Helpers**
   - Enhanced withFormAnnotations
   - Response transformation utilities
   - Default value type helpers

3. **Atom Factory**
   - Toast-integrated atom creator
   - Promise mode configuration
   - Hook generation utilities

4. **State Machine Utilities**
   - State transition helpers
   - Registry integration
   - Multi-step flow templates

### Checkpoint: Phase 3 Complete

Before marking Phase 3 complete, verify:

- [ ] Handler factory designed and documented
- [ ] Schema helpers designed
- [ ] Atom factory designed
- [ ] State machine utilities designed
- [ ] All patterns use correct Effect imports
- [ ] No native array/string methods used
- [ ] `outputs/pattern-proposals.md` created

### Success Criteria

| Metric | Target |
|--------|--------|
| Patterns designed | 4/4 |
| Type safety | Zero `any` usage |
| Import compliance | 100% namespace imports |
| Documentation | Each pattern documented |

### Output Template

```markdown
# Pattern Proposals

## Summary

## Handler Factory
### API Design
### Implementation
### Usage Examples
### Migration Guide

## Schema Helpers
### API Design
### Implementation
### Usage Examples

## Atom Factory
### API Design
### Implementation
### Usage Examples

## State Machine Utilities
### API Design
### Implementation
### Usage Examples

## Breaking Changes

## Migration Plan
```

---

## Phase 4: Validation

### Objective

Validate proposed patterns against codebase rules, architecture boundaries, and Effect best practices.

### Agent Deployment

**Primary Agents**: `code-reviewer`, `architecture-pattern-enforcer`

**Agent Prompts**: See `AGENT_PROMPTS.md` - Sections 4 & 5

### Validation Criteria

1. **Effect Import Rules**
   - All imports use namespace style
   - Correct aliases (S, A, O, etc.)
   - PascalCase constructors

2. **No Native Methods**
   - No `array.map()`, `string.split()`, etc.
   - All operations through Effect utilities

3. **Architecture Boundaries**
   - Proper package boundaries
   - Correct dependency direction
   - No circular imports

4. **Security Review**
   - No credential exposure
   - Proper error sanitization
   - Safe default values

5. **Type Safety**
   - No `any` casts
   - No `@ts-ignore`
   - Proper inference

### Checkpoint: Phase 4 Complete

Before marking Phase 4 complete, verify:

- [ ] Import rules validated
- [ ] Native method ban verified
- [ ] Architecture boundaries checked
- [ ] Security review completed
- [ ] Type safety verified
- [ ] All issues documented
- [ ] `outputs/pattern-review.md` created

### Success Criteria

| Metric | Target |
|--------|--------|
| Import compliance | 100% |
| Native method violations | 0 |
| Architecture violations | 0 |
| Security issues | 0 critical, 0 high |
| Type safety violations | 0 |

### Output Template

```markdown
# Pattern Review

## Review Summary
### Overall Assessment
### Ready for Implementation: [Yes/No]

## Import Compliance
### Findings
### Issues

## Native Method Check
### Findings
### Issues

## Architecture Review
### Findings
### Issues

## Security Review
### Findings
### Issues

## Type Safety Review
### Findings
### Issues

## Required Changes Before Implementation

## Approved Patterns
```

---

## Phase 5: Implementation Plan

### Objective

Create detailed implementation plan based on validated patterns.

### Agent Deployment

**Primary Agent**: Orchestrator (main Claude instance)

### Plan Components

1. **File Creation Order**
   - Which files to create first
   - Dependency order

2. **Migration Sequence**
   - Which handlers to migrate first
   - Reference implementation selection

3. **Test Requirements**
   - Unit tests needed
   - Integration tests needed

4. **Rollback Plan**
   - How to revert if issues found
   - Feature flag considerations

### Checkpoint: Phase 5 Complete

Before marking Phase 5 complete, verify:

- [ ] `PLAN.md` created
- [ ] File creation order defined
- [ ] Migration sequence defined
- [ ] Test requirements documented
- [ ] Rollback plan documented
- [ ] Handoff document updated

### Output: PLAN.md

```markdown
# Implementation Plan

## Phase 6 Implementation Order

### Step 1: Create Factory Files
[File list with order]

### Step 2: Reference Implementation
[Handler selection and approach]

### Step 3: Testing
[Test file creation]

### Step 4: Documentation
[AGENTS.md updates needed]

## Rollback Plan
[How to revert]

## Success Verification
[How to verify completion]
```

---

## Phase 6: Implementation

### Objective

Implement canonical patterns and create reference implementations.

### Agent Deployment

**Primary Agents**: `effect-code-writer`, `package-error-fixer`

**Agent Prompts**: See `AGENT_PROMPTS.md` - Section 6

### Implementation Order

1. **Foundation Files**
   ```
   packages/iam/client/src/_common/handler.factory.ts
   packages/iam/client/src/_common/schema.helpers.ts
   packages/iam/client/src/_common/atom.factory.ts
   packages/iam/client/src/_common/state-machine.ts
   ```

2. **Reference Implementation**
   - Refactor `sign-in/email` to use new patterns
   - Refactor `sign-out` to use new patterns

3. **Validation**
   - Run `bun run check`
   - Run `bun run lint:fix`
   - Run tests

### Checkpoint: Phase 6 Complete

Before marking Phase 6 complete, verify:

- [ ] All factory files created
- [ ] Reference implementations complete
- [ ] Type checking passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] No runtime errors

### Success Criteria

| Metric | Target |
|--------|--------|
| Factory files | 4/4 created |
| Reference handlers | 2/2 migrated |
| Type errors | 0 |
| Lint errors | 0 |
| Test failures | 0 |

---

## Phase 7: Documentation

### Objective

Update all relevant documentation to reflect new patterns.

### Agent Deployment

**Primary Agent**: `doc-writer`

**Agent Prompt**: See `AGENT_PROMPTS.md` - Section 7

### Documentation Updates

1. **Package AGENTS.md**
   ```
   packages/iam/client/AGENTS.md
   packages/iam/ui/AGENTS.md
   ```

2. **Spec Documentation**
   - Update README.md status
   - Final REFLECTION_LOG.md entry

### Checkpoint: Phase 7 Complete

Before marking Phase 7 complete, verify:

- [ ] `packages/iam/client/AGENTS.md` updated
- [ ] `packages/iam/ui/AGENTS.md` updated
- [ ] Spec README.md status updated to Complete
- [ ] Final reflection logged
- [ ] Templates validated as accurate

### Success Criteria

| Metric | Target |
|--------|--------|
| AGENTS.md files | 2/2 updated |
| Pattern examples | Included |
| Anti-patterns | Documented |

---

## Error Recovery Procedures

### Phase Failure Recovery

If any phase fails to complete:

1. Document failure reason in REFLECTION_LOG.md
2. Create issue in `outputs/issues.md`
3. Assess if previous phase needs rework
4. Create targeted handoff for resolution

### Agent Failure Recovery

If an agent produces invalid output:

1. Review agent prompt for clarity issues
2. Check input dependencies exist
3. Consider splitting into smaller tasks
4. Re-run with more specific guidance

### Build/Lint Failure Recovery

If implementation fails builds:

1. Run `package-error-fixer` agent
2. Document specific errors
3. Fix one error at a time
4. Re-run validation after each fix

---

## Cross-Phase Dependencies

```
Phase 1 ──────────────────┐
         ↓                │
Phase 2 ←─────────────────┤
         ↓                │
Phase 3 ←─────────────────┤
         ↓                │
Phase 4 ←─────────────────┤
         ↓                │
Phase 5 ←─────────────────┘
         ↓
Phase 6
         ↓
Phase 7
```

### Dependency Matrix

| Phase | Depends On | Blocks |
|-------|-----------|--------|
| 1 | None | 2, 3, 4, 5 |
| 2 | 1 | 3 |
| 3 | 1, 2 | 4 |
| 4 | 3 | 5 |
| 5 | 4 | 6 |
| 6 | 5 | 7 |
| 7 | 6 | None |

---

## Session Management

### Single-Session Phases

These phases can complete in one session:
- Phase 1 (if files are small)
- Phase 2
- Phase 5
- Phase 7

### Multi-Session Phases

These phases may require multiple sessions:
- Phase 3 (complex design work)
- Phase 4 (thorough review)
- Phase 6 (implementation)

### Handoff Protocol

When a phase spans multiple sessions:

1. Create `handoffs/HANDOFF_P{N}.md` with:
   - Work completed
   - Work remaining
   - Blockers identified
   - Next steps

2. Update REFLECTION_LOG.md with:
   - Session learnings
   - Pattern discoveries
   - Issues encountered

3. Update README.md status:
   - Mark phase "In Progress"
   - Note completion percentage

---

## Orchestrator Responsibilities

The orchestrator (main Claude instance) must:

1. **Before Each Phase**
   - Verify prerequisites met
   - Load relevant context
   - Deploy appropriate agent

2. **During Each Phase**
   - Monitor agent progress
   - Intervene if off-track
   - Answer clarifying questions

3. **After Each Phase**
   - Verify checkpoint criteria
   - Update REFLECTION_LOG.md
   - Prepare next phase handoff

4. **Cross-Phase**
   - Maintain consistent context
   - Track overall progress
   - Escalate blockers to user

---

## Quality Gates

### Gate 1: Post-Analysis (After Phase 1)
- All patterns documented
- Inconsistencies cataloged
- No missing coverage

### Gate 2: Post-Design (After Phase 3)
- All patterns designed
- Type-safe implementations
- Usage examples included

### Gate 3: Post-Validation (After Phase 4)
- All rules pass
- No security issues
- Architecture approved

### Gate 4: Post-Implementation (After Phase 6)
- All checks pass
- Reference implementations work
- No regression
