# Phase 5 Orchestrator Prompt: Implementation Plan

## Instructions

Copy the prompt below and use it to start Phase 5. This phase creates the implementation plan (`PLAN.md`) for Phase 6.

---

## Prompt

```
Execute Phase 5 of the IAM Effect Patterns specification: Implementation Plan.

## Context

Read these files in order:
1. specs/iam-effect-patterns/README.md - Overview and phase status
2. specs/iam-effect-patterns/handoffs/HANDOFF_P5.md - Phase 5 requirements
3. specs/iam-effect-patterns/outputs/pattern-proposals.md - Approved patterns
4. specs/iam-effect-patterns/outputs/pattern-review.md - Validation results
5. specs/iam-effect-patterns/REFLECTION_LOG.md - Prior learnings

## Deliverables

Create `specs/iam-effect-patterns/PLAN.md` with:

### 1. File Creation Order

Define the sequence for creating these files:
- packages/iam/client/src/_common/errors.ts (enhance)
- packages/iam/client/src/_common/schema.helpers.ts (create)
- packages/iam/client/src/_common/handler.factory.ts (create)
- packages/iam/client/src/_common/atom.factory.ts (create)
- packages/iam/client/src/_common/state-machine.ts (create)

Include:
- Dependencies between files
- Which patterns to implement in each file
- Estimated line counts

### 2. Reference Implementation Plan

Define how to migrate these handlers:
- sign-in/email (complex, with payload)
- core/sign-out (simple, session mutation)

Include:
- Before/after comparison approach
- Coexistence strategy during migration
- Deprecation timeline for old patterns

### 3. Testing Strategy

Define test files to create:
- packages/iam/client/src/_common/__tests__/handler.factory.test.ts
- packages/iam/client/src/_common/__tests__/schema.helpers.test.ts
- packages/iam/client/src/_common/__tests__/atom.factory.test.ts
- packages/iam/client/src/_common/__tests__/state-machine.test.ts

Include:
- Test scenarios for each pattern
- Mocking strategy for Better Auth
- Runtime mocking approach

### 4. Documentation Plan

List AGENTS.md files to update:
- packages/iam/client/AGENTS.md
- packages/iam/ui/AGENTS.md

Include:
- Sections to add/modify
- Quick recipe updates
- Gotcha additions

### 5. Rollback Plan

Document how to safely revert if issues arise:
- Which files are additive vs modifying
- Git revert strategy
- Feature flag considerations

### 6. Success Verification

List exact commands to verify completion:
- Type checking
- Linting
- Testing
- Building

## Constraints

- All file paths use `@beep/*` aliases
- All commands use `bun run <script>` format
- Plan must be actionable without additional context
- Follow PLAN.md template from MASTER_ORCHESTRATION.md

## Post-Completion

After creating PLAN.md:
1. Update REFLECTION_LOG.md with Phase 5 learnings
2. Update README.md to mark Phase 5 complete
3. Create or update handoff document for Phase 6
```

---

## Expected Duration

15-20 minutes

## Phase 5 Success Criteria

| Metric | Target |
|--------|--------|
| PLAN.md created | Yes |
| File order defined | 5/5 files |
| Migration sequence | 2/2 handlers |
| Test plan | 4/4 test files |
| Rollback plan | Documented |
| Commands verified | All listed |
