# Quality Rubrics

Phase-specific quality gates for the Handler Factory Type Safety specification.

---

## Universal Quality Standards

### Code Quality

| Criterion | Required | Score |
|-----------|----------|-------|
| Zero `as` type assertions | MUST | Pass/Fail |
| Zero `@ts-ignore` comments | MUST | Pass/Fail |
| Zero `@ts-expect-error` comments | MUST | Pass/Fail |
| Namespace imports for Effect modules | MUST | Pass/Fail |
| PascalCase Schema constructors | MUST | Pass/Fail |
| No native JS array/string methods | MUST | Pass/Fail |

### Documentation Quality

| Criterion | Required | Score |
|-----------|----------|-------|
| Code examples compile | MUST | Pass/Fail |
| File paths accurate | MUST | Pass/Fail |
| No TODO placeholders | SHOULD | 0-1 |
| Clear rationale provided | SHOULD | 0-1 |

---

## Phase 0: Discovery & Pattern Research

### Output: pattern-analysis.md

| Criterion | Weight | Score Range |
|-----------|--------|-------------|
| Match.when behavior documented | 25% | 0-4 |
| Type narrowing limitations identified | 25% | 0-4 |
| Code examples from Effect docs included | 25% | 0-4 |
| Recommendations for our use case | 25% | 0-4 |

**Scoring Guide:**
- 0: Missing entirely
- 1: Present but incomplete/inaccurate
- 2: Adequate but lacks depth
- 3: Good coverage with examples
- 4: Excellent with edge cases considered

**Pass Threshold:** Average score ≥ 2.5

### Output: call-site-analysis.md

| Criterion | Weight | Score Range |
|-----------|--------|-------------|
| All createHandler usages found | 40% | 0-4 |
| Return type usage documented | 30% | 0-4 |
| Type inference dependencies noted | 30% | 0-4 |

**Pass Threshold:** Average score ≥ 2.5

### Output: poc-approach.ts

| Criterion | Weight | Score Range |
|-----------|--------|-------------|
| Compiles without errors | 30% | Pass/Fail (0 or 4) |
| Zero `as` assertions | 30% | Pass/Fail (0 or 4) |
| Demonstrates generic flow | 20% | 0-4 |
| Comments explain approach | 20% | 0-4 |

**Pass Threshold:** Must compile + zero assertions + average ≥ 2.0

### Output: design-proposal.md

| Criterion | Weight | Score Range |
|-----------|--------|-------------|
| Clear approach recommendation | 20% | 0-4 |
| Type definitions provided | 20% | 0-4 |
| Implementation skeleton | 20% | 0-4 |
| Risk assessment | 20% | 0-4 |
| Rollback plan | 20% | 0-4 |

**Pass Threshold:** Average score ≥ 2.5

---

## Phase 1: Scratchpad Setup

### Checklist

| Criterion | Required | Verification |
|-----------|----------|--------------|
| handler.factory.ts copied | MUST | File exists |
| errors.ts copied | MUST | File exists |
| common.types.ts copied | MUST | File exists |
| schema.helpers.ts copied | MUST | File exists |
| sign-in-email handler copied | MUST | Files exist |
| sign-out handler copied | MUST | Files exist |
| tsconfig.json created | MUST | File exists |
| Baseline type-checks | MUST | `bun tsc --noEmit` passes |

**Pass Criteria:** ALL items must pass

---

## Phase 2: Design Type-Safe Architecture

### Output: type-definitions.ts (or in design doc)

| Criterion | Weight | Score Range |
|-----------|--------|-------------|
| ConfigWithPayload type correct | 25% | 0-4 |
| ConfigNoPayload type correct | 25% | 0-4 |
| Type guard properly narrows | 25% | 0-4 |
| Implementation signatures typed | 25% | 0-4 |

**Scoring Guide:**
- 0: Missing or fundamentally broken
- 1: Present but won't compile
- 2: Compiles but doesn't achieve narrowing
- 3: Works but verbose/inelegant
- 4: Clean, idiomatic, fully type-safe

**Pass Threshold:** Average score ≥ 3.0

---

## Phase 3: Implement in Scratchpad

### Refactored handler.factory.ts

| Criterion | Required | Verification |
|-----------|----------|--------------|
| Zero `as` assertions | MUST | grep -c " as " handler.factory.ts = 0 |
| Type-checks successfully | MUST | `bun tsc --noEmit` passes |
| Match.when used | MUST | Import and usage present |
| Type guard implemented | MUST | hasPayloadSchema function exists |
| createWithPayloadImpl exists | MUST | Function exists |
| createNoPayloadImpl exists | MUST | Function exists |
| Overload signatures unchanged | MUST | Diff shows no signature changes |

**Pass Criteria:** ALL items must pass

### Code Quality Score

| Criterion | Weight | Score Range |
|-----------|--------|-------------|
| Clean separation of concerns | 25% | 0-4 |
| Proper Effect patterns | 25% | 0-4 |
| Readable implementation | 25% | 0-4 |
| Error handling preserved | 25% | 0-4 |

**Pass Threshold:** Average score ≥ 2.5

---

## Phase 4: Validate Scratchpad Handlers

### Handler Validation

| Handler | Required Checks |
|---------|-----------------|
| sign-in-email.handler.ts | Type-checks, return type inferred |
| sign-out.handler.ts | Type-checks, return type inferred |

### Validation Criteria

| Criterion | Required | Verification |
|-----------|----------|--------------|
| All handlers type-check | MUST | `bun tsc --noEmit` passes |
| No new type annotations needed | MUST | Diff shows no added annotations |
| Return types match original | MUST | Side-by-side comparison |
| No regression in type safety | MUST | Manual review |

**Pass Criteria:** ALL items must pass

---

## Phase 5: Apply to Real Code

### Pre-Application Checklist

| Criterion | Required |
|-----------|----------|
| Phase 4 passed | MUST |
| Backup created | MUST |
| Clean git state | SHOULD |

### Post-Application Verification

| Command | Required Result |
|---------|-----------------|
| `bun run check --filter @beep/iam-client` | Exit 0 |
| `bun run test --filter @beep/iam-client` | Exit 0 |
| `bun run lint --filter @beep/iam-client` | Exit 0 |

### Handler Verification

ALL handlers must continue to type-check:
- [ ] `sign-in/email/sign-in-email.handler.ts`
- [ ] `core/sign-out/sign-out.handler.ts`
- [ ] `multi-session/set-active/*.handler.ts`
- [ ] `multi-session/revoke/*.handler.ts`
- [ ] `multi-session/list-sessions/*.handler.ts`

**Pass Criteria:** All checks pass, all handlers verified

---

## Phase 6: Final Validation & Docs

### Documentation Updates

| Criterion | Required | Verification |
|-----------|----------|--------------|
| CLAUDE.md updated | MUST | Section added |
| Pattern documented | MUST | Code examples included |
| Extension guide provided | SHOULD | Instructions present |
| Scratchpad cleaned | MUST | Directory removed |

### Reflection Quality

| Criterion | Weight | Score Range |
|-----------|--------|-------------|
| Learnings documented | 25% | 0-4 |
| What worked/didn't documented | 25% | 0-4 |
| Patterns generalizable | 25% | 0-4 |
| Methodology improvements noted | 25% | 0-4 |

**Pass Threshold:** Average score ≥ 2.0

---

## Overall Spec Completion Rubric

### Phase Completion

| Phase | Status | Notes |
|-------|--------|-------|
| 0 | ☐ Pending / ☐ Passed / ☐ Failed | |
| 1 | ☐ Pending / ☐ Passed / ☐ Failed | |
| 2 | ☐ Pending / ☐ Passed / ☐ Failed | |
| 3 | ☐ Pending / ☐ Passed / ☐ Failed | |
| 4 | ☐ Pending / ☐ Passed / ☐ Failed | |
| 5 | ☐ Pending / ☐ Passed / ☐ Failed | |
| 6 | ☐ Pending / ☐ Passed / ☐ Failed | |

### Success Criteria Summary

**Quantitative (ALL required):**
- [ ] Zero `as` type assertions in final implementation
- [ ] Zero `@ts-ignore` or `@ts-expect-error` comments
- [ ] 100% backward compatibility (no signature changes)
- [ ] All existing tests pass without modification
- [ ] Type inference preserved at call sites

**Qualitative (Score ≥ 3.0):**
- [ ] Implementation uses idiomatic Effect patterns
- [ ] Code is more readable than original
- [ ] Error cases exhaustively handled
- [ ] Pattern reusable for other factories

### Spec Status

- ☐ **NOT STARTED** - No phases completed
- ☐ **IN PROGRESS** - Some phases completed
- ☐ **BLOCKED** - Phase failed, needs intervention
- ☐ **COMPLETED** - All phases passed
- ☐ **ARCHIVED** - Spec abandoned or superseded

---

## Quick Reference Checklist

### Before Each Phase

- [ ] Read phase entry criteria
- [ ] Check previous phase outputs exist
- [ ] Review REFLECTION_LOG.md for learnings

### During Phase

- [ ] Follow agent prompts from AGENT_PROMPTS.md
- [ ] Document blockers immediately
- [ ] Run verification commands frequently

### After Each Phase

- [ ] Verify all exit criteria met
- [ ] Update REFLECTION_LOG.md
- [ ] Create handoff prompt for next phase
- [ ] Update QUICK_START.md status table
