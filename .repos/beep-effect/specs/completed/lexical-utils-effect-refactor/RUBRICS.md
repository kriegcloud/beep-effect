# Evaluation Rubrics

> Scoring criteria for evaluating the Lexical Utils Effect Refactor spec execution.

---

## Phase Scoring

### Phase 1: Discovery (20 points max)

| Criterion | Points | Evidence Required |
|-----------|--------|-------------------|
| All 10 files analyzed | 8 | `outputs/codebase-analysis.md` covers each file |
| Native patterns catalogued | 4 | Line numbers documented for each pattern type |
| Effect API research complete | 6 | `outputs/effect-api-research.md` covers all required APIs |
| Reflection log updated | 2 | Phase 1 entry in REFLECTION_LOG.md |

### Phase 2: Evaluation (15 points max)

| Criterion | Points | Evidence Required |
|-----------|--------|-------------------|
| Architecture review complete | 5 | `outputs/architecture-review.md` with PASS/FAIL |
| Code quality review complete | 5 | `outputs/code-quality-review.md` with examples |
| No blocking issues | 3 | All findings addressable |
| Handoff created | 2 | HANDOFF_P3.md and P3_ORCHESTRATOR_PROMPT.md |

### Phase 3: Schema Creation (20 points max)

| Criterion | Points | Evidence Required |
|-----------|--------|-------------------|
| URL schema created | 6 | `url.schema.ts` with S.pattern() |
| DocHash schema created | 6 | `docHash.schema.ts` with S.pattern() |
| Schema index updated | 2 | Exports added to `index.ts` |
| Type check passes | 4 | `bun run check --filter todox` |
| Reflection log updated | 2 | Phase 3 entry in REFLECTION_LOG.md |

### Phase 4: Priority 1 Refactor (25 points max)

| Criterion | Points | Evidence Required |
|-----------|--------|-------------------|
| docSerialization.ts refactored | 10 | No async/await, uses Stream |
| swipe.ts refactored | 8 | HashSet replaces Set, Option for nulls |
| url.ts refactored | 5 | Uses schemas, HashSet |
| Type check passes | 2 | `bun run check --filter todox` |

### Phase 5: Priority 2-3 Refactor (15 points max)

| Criterion | Points | Evidence Required |
|-----------|--------|-------------------|
| All 7 files refactored | 10 | No native String/Array methods remain |
| Index.ts updated | 2 | All exports present |
| Type check passes | 3 | `bun run check --filter todox` |

### Phase 6: Verification (15 points max)

| Criterion | Points | Evidence Required |
|-----------|--------|-------------------|
| All type errors fixed | 5 | Clean type check |
| Lint passes | 3 | Clean lint |
| Tests created | 5 | `utils.test.ts` with key cases |
| Tests pass | 2 | `bun run test --filter todox` |

---

## Quality Rubric

### Code Transformation Quality (30 points max)

| Criterion | Points | Description |
|-----------|--------|-------------|
| No native String methods | 6 | All replaced with Str.* |
| No native Array methods | 6 | All replaced with A.* |
| No native Set | 4 | All replaced with HashSet |
| No async/await | 4 | All replaced with Effect.gen |
| No JSON.parse | 4 | All replaced with Schema decode |
| Proper null handling | 4 | Option/Predicate used correctly |
| No throw statements | 2 | TaggedError classes used |

### Schema Quality (15 points max)

| Criterion | Points | Description |
|-----------|--------|-------------|
| S.pattern() for regex | 5 | Regex extracted to schemas |
| $TodoxId annotations | 3 | Proper identifiers |
| Type exports | 3 | Types exported alongside schemas |
| Reusable schemas | 4 | Shared patterns extracted |

### Documentation Quality (10 points max)

| Criterion | Points | Description |
|-----------|--------|-------------|
| REFLECTION_LOG updated each phase | 4 | Learnings captured |
| Handoffs created for each phase | 4 | Both HANDOFF + ORCHESTRATOR_PROMPT |
| JSDoc on complex transforms | 2 | Breaking changes documented |

---

## Scoring Thresholds

| Total Score | Grade | Status |
|-------------|-------|--------|
| 90-110 | A | Production-ready, exemplary |
| 75-89 | B | Complete, minor improvements possible |
| 60-74 | C | Functional, needs polish |
| 45-59 | D | Incomplete, blocking issues |
| <45 | F | Failed, requires restart |

---

## Anti-Pattern Deductions

| Anti-Pattern | Deduction | Description |
|--------------|-----------|-------------|
| `any` type used | -5 | Per occurrence |
| Native method leaked | -3 | Per occurrence |
| Missing handoff | -5 | Per missing phase handoff |
| S.Any in schema | -4 | Per occurrence |
| Untested transformation | -2 | Per untested utility |
