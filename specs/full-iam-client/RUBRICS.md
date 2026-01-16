# Rubrics

> Evaluation criteria for `full-iam-client` specification outputs.

---

## Handler Quality Rubric

### Score: 0-4 per criterion

| Score | Meaning |
|-------|---------|
| 0 | Missing or fundamentally broken |
| 1 | Present but incomplete |
| 2 | Functional but non-idiomatic |
| 3 | Good, follows patterns |
| 4 | Excellent, exemplary implementation |

### Criteria

#### 1. Error Handling (0-4)

| Score | Description |
|-------|-------------|
| 4 | Checks `response.error`, uses `BetterAuthResponseError`, extracts message properly |
| 3 | Checks `response.error`, uses typed error, message extraction works |
| 2 | Checks for error but uses generic Error type |
| 1 | Partial error handling, may miss cases |
| 0 | No error handling, decodes blindly |

#### 2. Session Signal (0-4)

| Score | Description |
|-------|-------------|
| 4 | Correctly notifies `$sessionSignal` after ALL session mutations |
| 3 | Notifies signal, timing correct |
| 2 | Notifies signal but wrong timing (before success) |
| 1 | Missing notification on some mutations |
| 0 | No session signal notification |

#### 3. Schema Design (0-4)

| Score | Description |
|-------|-------------|
| 4 | Proper types, form annotations, matches Better Auth exactly |
| 3 | Correct types, good annotations |
| 2 | Types work but not optimal (missing annotations) |
| 1 | Schema works but has type issues |
| 0 | Broken or missing schemas |

#### 4. Pattern Adherence (0-4)

| Score | Description |
|-------|-------------|
| 4 | Uses factory where appropriate, manual where needed, correct decision |
| 3 | Correct pattern, well implemented |
| 2 | Correct pattern, minor issues |
| 1 | Wrong pattern choice but functional |
| 0 | Ignores established patterns |

#### 5. Effect Idioms (0-4)

| Score | Description |
|-------|-------------|
| 4 | Namespace imports, no native methods, Effect.fn with span, generators |
| 3 | All idioms followed, minor style issues |
| 2 | Most idioms followed, some violations |
| 1 | Mixed native and Effect patterns |
| 0 | Native JS patterns, no Effect idioms |

### Minimum Passing Score

- **Individual criterion**: >= 2
- **Total score**: >= 15/20 (75%)

---

## Contract Quality Rubric

### Criteria

#### 1. Payload Schema (0-4)

| Score | Description |
|-------|-------------|
| 4 | All fields typed, Redacted for secrets, UUID for IDs, annotations for forms |
| 3 | All fields typed correctly with annotations |
| 2 | Fields typed, missing some annotations |
| 1 | Basic typing, missing security types |
| 0 | Missing or broken schema |

#### 2. Success Schema (0-4)

| Score | Description |
|-------|-------------|
| 4 | Exact match to Better Auth response.data, nested types handled |
| 3 | Correct types, good structure |
| 2 | Types work, some approximations |
| 1 | Basic structure, type mismatches |
| 0 | Missing or broken schema |

#### 3. Export Structure (0-4)

| Score | Description |
|-------|-------------|
| 4 | Clean barrel exports, types exported, no circular deps |
| 3 | Good exports, all needed types available |
| 2 | Exports work, some missing types |
| 1 | Exports incomplete |
| 0 | Missing index file |

### Minimum Passing Score

- **Individual criterion**: >= 2
- **Total score**: >= 9/12 (75%)

---

## Test Quality Rubric

### Criteria

#### 1. Coverage (0-4)

| Score | Description |
|-------|-------------|
| 4 | All paths tested: success, error, edge cases |
| 3 | Happy path + main error cases |
| 2 | Happy path tested |
| 1 | Partial coverage |
| 0 | No tests |

#### 2. Effect Patterns (0-4)

| Score | Description |
|-------|-------------|
| 4 | Uses @beep/testkit, effect(), proper Effect.gen usage |
| 3 | Correct Effect testing patterns |
| 2 | Tests run but non-idiomatic |
| 1 | Mixed patterns |
| 0 | No Effect patterns |

#### 3. Assertions (0-4)

| Score | Description |
|-------|-------------|
| 4 | Type-safe assertions, meaningful error messages |
| 3 | Good assertions, clear intent |
| 2 | Basic assertions work |
| 1 | Weak assertions |
| 0 | Missing or broken assertions |

### Minimum Passing Score

- **Individual criterion**: >= 2
- **Total score**: >= 9/12 (75%)

---

## Phase Completion Checklist

### Phase 0: Discovery

- [ ] Method inventory complete
- [ ] All methods verified to exist
- [ ] Response shapes documented
- [ ] Pattern classification done
- [ ] Reflection logged

### Phase 1-6: Implementation

- [ ] All handlers pass Handler Quality Rubric (>= 15/20)
- [ ] All contracts pass Contract Quality Rubric (>= 9/12)
- [ ] Type check passes: `bun run --filter @beep/iam-client check`
- [ ] Lint check passes: `bun run --filter @beep/iam-client lint`
- [ ] Package exports updated
- [ ] Reflection logged

### Phase 7: Testing & Documentation

- [ ] All tests pass Test Quality Rubric (>= 9/12)
- [ ] AGENTS.md updated with recipes
- [ ] E2E flows tested manually
- [ ] Final verification commands pass
- [ ] Handoff document created

---

## Verification Commands

```bash
# Type check
bun run --filter @beep/iam-client check

# Lint check
bun run --filter @beep/iam-client lint

# Test run
bun run --filter @beep/iam-client test

# Handler count
find packages/iam/client/src -name "*.handler.ts" | wc -l

# Session signal coverage
grep -r "\$sessionSignal" packages/iam/client/src --include="*.handler.ts" | wc -l

# Error check coverage
grep -r "response.error !== null" packages/iam/client/src --include="*.handler.ts" | wc -l

# No unsafe types
grep -r "any\|@ts-ignore" packages/iam/client/src --include="*.ts" | grep -v "Schema.Any" | wc -l
```

---

## Anti-Pattern Detection

### Red Flags

1. **Blind decode**: `S.decodeUnknown(Success)(response.data)` without error check
2. **Missing signal**: Session mutation without `$sessionSignal` notification
3. **Native methods**: `array.map()`, `string.split()` instead of Effect utilities
4. **Any types**: `as any`, `@ts-ignore` without justification
5. **Wrong pattern**: Factory for complex handler, manual for simple

### Immediate Fixes Required

If any red flag detected:
1. Stop implementation
2. Fix the issue
3. Document in reflection log
4. Continue
