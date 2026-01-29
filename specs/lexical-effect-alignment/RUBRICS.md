# Evaluation Rubrics

> Quality criteria for phase completion and agent output evaluation.

---

## Phase Completion Rubric

### Discovery Phase

| Criterion | Weight | Pass | Fail |
|-----------|--------|------|------|
| Coverage | 30% | All files in scope scanned | Files missed |
| Accuracy | 30% | <5% false positives | >10% false positives |
| Format | 20% | Exact checklist format followed | Format inconsistent |
| Line Numbers | 20% | All line numbers accurate | Line numbers off by >2 |

**Pass threshold**: 80%

### Consolidation Phase

| Criterion | Weight | Pass | Fail |
|-----------|--------|------|------|
| Completeness | 40% | All discovery docs merged | Docs missing |
| Deduplication | 30% | No duplicate entries | Duplicates present |
| Statistics | 15% | Counts accurate | Counts incorrect |
| Batch Planning | 15% | Batches calculated correctly | Math errors |

**Pass threshold**: 90%

### Execution Phase

| Criterion | Weight | Pass | Fail |
|-----------|--------|------|------|
| Correctness | 40% | Code works after migration | Runtime errors |
| Completeness | 30% | All checklist items addressed | Items skipped |
| Style | 15% | Effect patterns used correctly | Wrong patterns |
| Preservation | 15% | Unrelated code unchanged | Collateral changes |

**Pass threshold**: 85%

### Verification Phase

| Criterion | Weight | Pass | Fail |
|-----------|--------|------|------|
| Build | 25% | `bun run build` passes | Build fails |
| Type Check | 25% | `bun run check` passes | Type errors |
| Lint Fix | 25% | `bun run lint:fix` completes | Lint errors unfixable |
| Lint | 25% | `bun run lint` passes | Lint errors remain |

**Pass threshold**: 100% (all must pass)

---

## Agent Output Quality Rubric

### Discovery Agent Output

| Dimension | Score 3 | Score 2 | Score 1 | Score 0 |
|-----------|---------|---------|---------|---------|
| **Precision** | >95% true positives | 90-95% | 80-90% | <80% |
| **Recall** | >95% violations found | 90-95% | 80-90% | <80% |
| **Format Compliance** | Perfect format | Minor issues | Major issues | Unusable |
| **Line Accuracy** | Exact lines | Off by 1-2 | Off by 3-5 | Off by >5 |
| **Replacement Quality** | Perfect replacements | Minor errors | Missing some | Missing most |

**Scoring**: Sum dimensions (max 15). Pass threshold: 12+

### Code Writer Agent Output

| Dimension | Score 3 | Score 2 | Score 1 | Score 0 |
|-----------|---------|---------|---------|---------|
| **Correctness** | All migrations correct | 1-2 errors | 3-5 errors | >5 errors |
| **Completeness** | All items done | 1-2 missed | 3-5 missed | >5 missed |
| **Import Handling** | Perfect imports | Duplicate imports | Missing imports | Wrong imports |
| **Code Preservation** | No collateral changes | Minor unrelated changes | Significant changes | Broke functionality |
| **Type Safety** | Compiles clean | Minor type warnings | Type errors | Won't compile |

**Scoring**: Sum dimensions (max 15). Pass threshold: 12+

---

## Violation Severity Classification

Used to prioritize execution order:

### Critical (Fix First)
- Type errors (code won't compile)
- Runtime crashes (code won't execute)
- Data corruption (incorrect results)

### High
- Mutations on array methods (`.push`, `.splice`)
- Sort operations (often have side effects)
- Reduce operations (argument order matters)

### Medium
- Map/filter/flatMap operations
- Find operations (Option return type)
- Static method replacements

### Low
- Length checks
- Join operations
- Contains/includes operations

---

## Progress Tracking Metrics

### Per-Phase Metrics

Track these for each phase:

| Metric | Target | Current |
|--------|--------|---------|
| Discovery agents deployed | [N] | |
| Discovery completion rate | 100% | |
| Violations discovered | TBD | |
| Master checklist created | Yes | |
| Execution batches | [N] | |
| Execution completion rate | 100% | |
| Build passing | Yes | |
| Check passing | Yes | |
| Lint passing | Yes | |
| Reflection completed | Yes | |
| Handoff created | Yes | |

### Cumulative Metrics

Track across all phases:

| Metric | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 |
|--------|----|----|----|----|----|----|----|----|----|----|-----|
| Violations fixed | | | | | | | | | | | |
| Files modified | | | | | | | | | | | |
| Agent deployments | | | | | | | | | | | |
| Handoff count | | | | | | | | | | | |
| Quality gate passes | | | | | | | | | | | |

---

## Quality Gate Checklist

Before marking ANY phase complete:

```markdown
## Phase [N] Quality Gate

- [ ] All discovery documents created
- [ ] Master checklist consolidated
- [ ] All checklist items executed
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint:fix` applied
- [ ] `bun run lint` passes
- [ ] Reflection completed
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P[N+1].md created
- [ ] P[N+1]_ORCHESTRATOR_PROMPT.md created
```
