# integration-architecture-migration: Evaluation Rubrics

> Criteria for evaluating spec completion and quality.

---

## Completion Rubric

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Functionality | 40% | Core features work as specified |
| Code Quality | 25% | Follows Effect patterns, clean code |
| Testing | 20% | Adequate test coverage |
| Documentation | 15% | Clear docs and comments |

---

## Quality Checklist

### Functionality
- [ ] All success criteria met
- [ ] Edge cases handled
- [ ] Error handling complete

### Code Quality
- [ ] Effect patterns used correctly
- [ ] No TypeScript errors
- [ ] Lint checks pass

### Testing
- [ ] Unit tests added
- [ ] Integration tests where needed
- [ ] All tests pass

### Documentation
- [ ] README updated
- [ ] JSDoc comments added
- [ ] Reflection log completed

---

## Grading Scale

| Grade | Score | Description |
|-------|-------|-------------|
| A | 90-100% | Exceptional - exceeds requirements |
| B | 80-89% | Good - meets all requirements |
| C | 70-79% | Acceptable - meets core requirements |
| D | 60-69% | Needs improvement |
| F | <60% | Incomplete |

---

## Phase-Specific Rubrics

### Phase 1: Infrastructure Package

| Criterion | Weight | 5 Points | 3 Points | 1 Point |
|-----------|--------|----------|----------|---------|
| Tagged Errors | 20% | All 4 errors extend S.TaggedError with proper fields | Missing some error types | Plain Error class used |
| Context.Tag | 25% | Interface-only in client, impl in server | Mixed concerns | No separation |
| Scope Constants | 15% | All scopes typed as const, exported | Incomplete scope coverage | Hardcoded strings |
| Package Structure | 20% | All 3 packages compile, clean exports | Minor import issues | Circular dependencies |
| Effect Patterns | 20% | Namespace imports, pipe, Effect.gen | Some violations | Native JS patterns |

### Phase 2: Token Store

| Criterion | Weight | 5 Points | 3 Points | 1 Point |
|-----------|--------|----------|----------|---------|
| Encryption | 30% | AES-256 with proper key management | Basic encryption | Plaintext storage |
| Integration | 25% | Uses existing Account model seamlessly | Minor schema changes | Separate table |
| Refresh Logic | 25% | Handles expiry, refresh failures gracefully | Basic refresh | No auto-refresh |
| Effect Service | 20% | Proper Effect.Service pattern | Minor deviations | Class-based |

### Phase 3: Adapters

| Criterion | Weight | 5 Points | 3 Points | 1 Point |
|-----------|--------|----------|----------|---------|
| ACL Translation | 30% | Zero Google types in domain, bidirectional | Some leakage | Direct API types |
| Scope Declaration | 20% | Constants with proper OAuth URLs | Incomplete | Hardcoded |
| Error Handling | 25% | Catches all API errors, maps to domain | Partial coverage | Raw errors |
| Parallel Safety | 25% | No shared mutable state | Minor concerns | Race conditions |

### Phase 4: Migration

| Criterion | Weight | 5 Points | 3 Points | 1 Point |
|-----------|--------|----------|----------|---------|
| Functionality Preservation | 40% | All existing features work | Minor regressions | Breaking changes |
| Import Updates | 30% | All imports updated, no orphans | Some manual fixes | Build failures |
| Layer Composition | 30% | Clean layer hierarchy | Some complexity | Circular layers |

---

## Phase Scoring Calculation

For each phase:

1. **Calculate criterion score**: `(points / 5) × weight`
2. **Sum all weighted scores**: Total phase score out of 100
3. **Apply to overall grade**: Using completion rubric weights

Example:
- Phase 1 Tagged Errors: (5/5) × 20% = 20%
- Phase 1 Context.Tag: (3/5) × 25% = 15%
- ... (continue for all criteria)
- Phase 1 Total: 85% (Grade B)

---

## Critical Failure Conditions

Any of these conditions result in automatic grade cap of C (70%), regardless of other scores:

- **Security**: Plaintext token storage
- **Architecture**: Direct cross-package imports (violating slice boundaries)
- **Type Safety**: Using `any` or `@ts-ignore` for core integration logic
- **Testing**: Zero test coverage for token refresh logic
- **Effect Patterns**: Using Promise-based code instead of Effect in new packages
