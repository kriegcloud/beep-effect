# Phase 5 Handoff: Implementation Plan

## Status Summary

| Phase | Status | Output |
|-------|--------|--------|
| Phase 0 | Complete | Spec scaffolding |
| Phase 1 | Complete | `outputs/current-patterns.md` |
| Phase 2 | Complete | `outputs/effect-research.md` |
| Phase 3 | Complete | `outputs/pattern-proposals.md` |
| Phase 4 | Complete | `outputs/pattern-review.md` |
| **Phase 5** | **Ready** | `PLAN.md` (to create) |

## Phase 5 Objective

Create detailed implementation plan for Phase 6 based on validated patterns. The plan must define:
1. File creation order with dependencies
2. Migration sequence for existing handlers
3. Test requirements
4. Rollback strategy

## Key Context from Prior Phases

### Phase 4 Validation Results

**All patterns APPROVED** with:
- 6/6 validation checks passed
- 0 blocking issues
- Native method violations fixed during review
- Full compliance with codebase rules

### Patterns Ready for Implementation

| Pattern | File | Dependencies |
|---------|------|--------------|
| Error Hierarchy | `errors.ts` | None (enhance existing) |
| Schema Helpers | `schema.helpers.ts` | Error types |
| Handler Factory | `handler.factory.ts` | Schema helpers, Error types |
| Atom Factory | `atom.factory.ts` | Handler factory (optional) |
| State Machine | `state-machine.ts` | None |

### Reference Implementations Selected

| Handler | Why Selected |
|---------|--------------|
| `sign-in/email` | Most complex (payload, session mutation, Better Auth call) |
| `core/sign-out` | Session mutation without payload |

## What Phase 5 Must Produce

### PLAN.md Structure

```markdown
# Implementation Plan

## Phase 6 Implementation Order

### Step 1: Foundation Files
[Ordered list of files to create with dependencies]

### Step 2: Reference Implementations
[Handler migration sequence]

### Step 3: Testing Strategy
[Test files and approaches]

### Step 4: Documentation Updates
[AGENTS.md changes needed]

## Rollback Plan
[How to revert safely]

## Success Verification
[Commands to verify completion]
```

## Implementation Sequence (Recommendation from Phase 4)

Based on Phase 4 review findings:

1. **Error Hierarchy First** (no dependencies)
   - Add `Data.TaggedError` variants to `errors.ts`
   - Keep existing `S.TaggedError` for backward compatibility

2. **Schema Helpers Second** (depends on errors)
   - Create `schema.helpers.ts`
   - Add `BetterAuthSuccessFrom` transform
   - Re-export `withFormAnnotations`

3. **Handler Factory Third** (depends on errors, schemas)
   - Create `handler.factory.ts`
   - TypeScript overloads for payload/no-payload variants

4. **Atom Factory Fourth** (depends on handlers)
   - Create `atom.factory.ts`
   - `createMutationAtom` and `createQueryAtom`

5. **State Machine Fifth** (independent, least urgent)
   - Create `state-machine.ts`
   - No immediate consumers (for future multi-step flows)

## Testing Strategy

### Unit Tests Required

| File | Test Focus |
|------|------------|
| `handler.factory.test.ts` | Factory function, error handling, session signal |
| `schema.helpers.test.ts` | Transform behavior, error extraction |
| `atom.factory.test.ts` | Atom creation, toast integration |
| `state-machine.test.ts` | State transitions, guards |

### Integration Tests

- Better Auth mock for handler factory
- Runtime mock for atom factory

## Rollback Considerations

- All new files are additive (no existing file modifications except `errors.ts`)
- `errors.ts` changes are additive (existing types preserved)
- Reference implementations can coexist with original handlers
- No database changes required

## Success Verification Commands

```bash
# Type checking
bun run check --filter @beep/iam-client

# Linting
bun run lint --filter @beep/iam-client

# Tests
bun run test --filter @beep/iam-client

# Build
bun run build --filter @beep/iam-client
```

## Files to Read Before Phase 5

| File | Purpose |
|------|---------|
| `outputs/pattern-proposals.md` | Complete pattern implementations |
| `outputs/pattern-review.md` | Validation results |
| `REFLECTION_LOG.md` | Session learnings |
| `MASTER_ORCHESTRATION.md` | Phase 5 template |

## Constraints

1. Output must follow `PLAN.md` template from MASTER_ORCHESTRATION.md
2. Plan must be actionable for Phase 6 without additional context
3. File paths must use `@beep/*` aliases in examples
4. All commands must use `bun run <script>` format

## Phase 5 Checkpoint

Before marking Phase 5 complete, verify:

- [ ] `PLAN.md` created
- [ ] File creation order defined with dependencies
- [ ] Migration sequence for reference handlers defined
- [ ] Test requirements documented
- [ ] Rollback plan documented
- [ ] Success verification commands included
- [ ] REFLECTION_LOG.md updated with Phase 5 learnings
- [ ] README.md updated to mark Phase 5 complete

## Ready to Execute

All prerequisites satisfied. Phase 5 can proceed immediately.
