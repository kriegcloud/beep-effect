# Phase 4 Orchestrator Prompt: Validation

Copy-paste this prompt to start Phase 4 (Validation).

---

## Prompt

You are executing Phase 4 (Validation) of the TypeScript Native Preview Port spec for the `beep-effect` monorepo. You are working on branch `native-preview-experiment`.

### Context

Phases 1-3 have been completed:

- **P1 Discovery**: Inventoried all tsc/typescript usage, tested tsgo compatibility. Report at `specs/pending/typescript-native-preview-port/outputs/P1_DISCOVERY_REPORT.md`.
- **P2 Planning**: Created a detailed migration plan choosing STRICT, HYBRID, or CHECK-ONLY path. Plan at `specs/pending/typescript-native-preview-port/outputs/P2_MIGRATION_PLAN.md`.
- **P3 Implementation**: Executed the migration plan, swapping `tsc` to `tsgo` across packages. Changes committed to branch `native-preview-experiment`.

The package.json files should now reference `tsgo` instead of `tsc` for build and/or check scripts (depending on the chosen path). Your job is to validate that everything works, capture evidence, and produce a final report.

### Your Mission

Run the complete verification suite, capture evidence, verify tsgo is actually being used, and produce a final validation report.

### Task 1: Verify Branch and Baseline

```bash
# Confirm you are on the correct branch
git branch --show-current
# Expected: native-preview-experiment

# Confirm tsgo is installed
npx tsgo --version

# Check git status for uncommitted changes
git status
```

### Task 2: Run All 5 Verification Commands

Run each command individually and capture the exit code and key output lines.

```bash
echo "========================================="
echo "VERIFICATION 1: bun run build"
echo "========================================="
bun run build 2>&1 | tail -20
echo "EXIT CODE: $?"
echo ""

echo "========================================="
echo "VERIFICATION 2: bun run check"
echo "========================================="
bun run check 2>&1 | tail -20
echo "EXIT CODE: $?"
echo ""

echo "========================================="
echo "VERIFICATION 3: bun run lint:fix"
echo "========================================="
bun run lint:fix 2>&1 | tail -20
echo "EXIT CODE: $?"
echo ""

echo "========================================="
echo "VERIFICATION 4: bun run lint"
echo "========================================="
bun run lint 2>&1 | tail -20
echo "EXIT CODE: $?"
echo ""

echo "========================================="
echo "VERIFICATION 5: bun run test"
echo "========================================="
bun run test 2>&1 | tail -30
echo "EXIT CODE: $?"
echo ""
```

Record the exit code for each. ALL five must be 0 for full acceptance.

### Task 3: Verify tsgo Is Actually Being Used

Confirm that `tsgo` is the compiler in the scripts, not `tsc`:

```bash
echo "========================================="
echo "TSGO USAGE VERIFICATION"
echo "========================================="

echo "--- tsgo version ---"
npx tsgo --version

echo ""
echo "--- Packages still using tsc (should be empty or only excluded packages) ---"
grep -rn '"tsc ' packages/*/package.json apps/*/package.json tooling/*/package.json 2>/dev/null || echo "None found"

echo ""
echo "--- Packages using tsgo ---"
grep -rn '"tsgo ' packages/*/package.json apps/*/package.json tooling/*/package.json 2>/dev/null | wc -l
echo "total packages with tsgo"

echo ""
echo "--- Detailed tsgo references ---"
grep -rn '"tsgo ' packages/*/package.json apps/*/package.json tooling/*/package.json 2>/dev/null
```

Expected results:
- `tsgo --version` returns a 7.0.0-dev.* version
- tsc references should only exist in excluded packages (e.g., `tooling/cli` if it was excluded)
- tsgo references should exist in all migrated packages

### Task 4: Verify Excluded Packages (if HYBRID or CHECK-ONLY path)

If the migration plan excluded certain packages from migration, verify those are still working:

```bash
# For each excluded package (e.g., tooling/cli):
bun run check --filter @beep/repo-cli
echo "repo-cli check: $?"

bun run build --filter @beep/repo-cli
echo "repo-cli build: $?"
```

### Task 5: Document Remaining TypeScript Dependencies

```bash
echo "========================================="
echo "REMAINING TYPESCRIPT DEPENDENCIES"
echo "========================================="

echo "--- typescript in root package.json ---"
grep "typescript" package.json

echo ""
echo "--- typescript in any package.json devDependencies ---"
grep -rn '"typescript"' packages/*/package.json apps/*/package.json tooling/*/package.json 2>/dev/null

echo ""
echo "--- ts-morph usage ---"
grep -rn '"ts-morph"' packages/*/package.json apps/*/package.json tooling/*/package.json 2>/dev/null

echo ""
echo "--- effect-language-service in root ---"
grep "effect-language-service" package.json
```

### Task 6: Performance Comparison (Optional but Recommended)

If time permits, compare type-checking speed:

```bash
echo "========================================="
echo "PERFORMANCE COMPARISON"
echo "========================================="

# Clean turbo cache to ensure fair comparison
bunx turbo run check --force --dry-run 2>/dev/null

echo "--- tsgo full check time ---"
time bun run check 2>&1 | tail -5

# Temporarily swap back to tsc for comparison (optional)
# Only do this if you can easily revert
```

### Task 7: Check for Regressions

Verify that no previously working functionality is broken:

```bash
# Run tests for critical packages
bun run test --filter @beep/schema
bun run test --filter @beep/shared-domain
bun run test --filter @beep/iam-domain
bun run test --filter @beep/testkit
```

### Task 8: Produce Final Validation Report

Write the report to `specs/pending/typescript-native-preview-port/outputs/P4_VALIDATION_REPORT.md`.

Structure:

```markdown
# P4 Validation Report

**Date**: YYYY-MM-DD
**Branch**: native-preview-experiment
**tsgo Version**: X.X.X-dev.XXXXXXXX
**Migration Path**: STRICT / HYBRID / CHECK-ONLY

## Verification Results

| Command | Exit Code | Status | Notes |
|---------|-----------|--------|-------|
| `bun run build` | 0/1 | PASS/FAIL | ... |
| `bun run check` | 0/1 | PASS/FAIL | ... |
| `bun run lint:fix` | 0/1 | PASS/FAIL | ... |
| `bun run lint` | 0/1 | PASS/FAIL | ... |
| `bun run test` | 0/1 | PASS/FAIL | ... |

## tsgo Usage Verification

- tsgo version confirmed: YES/NO
- Packages using tsgo: N
- Packages still using tsc: M (list reasons)
- No accidental tsc fallback: YES/NO

## Migration Summary

| Metric | Value |
|--------|-------|
| Total packages in repo | ... |
| Packages migrated to tsgo | ... |
| Packages excluded (with reason) | ... |
| Packages skipped due to errors | ... |

## Excluded Packages

| Package | Reason | Status |
|---------|--------|--------|
| ... | ... | Working with tsc |

## Remaining TypeScript Dependencies

| Dependency | Location | Purpose | Removable? |
|------------|----------|---------|-----------|
| typescript | root devDependencies | ts-morph, effect-language-service | NO |
| ts-morph | tooling/cli | Code generation | NO |

## Performance (if measured)

| Metric | tsc | tsgo | Speedup |
|--------|-----|------|---------|
| Full check time | Xs | Ys | Z.Zx |

## Known Issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| ... | ... | ... |

## Decision Record

- **Path chosen**: STRICT / HYBRID / CHECK-ONLY
- **Rationale**: (from P2)
- **Outcome**: SUCCESS / PARTIAL SUCCESS / FAILURE
- **Recommendation**: (merge to main / further testing / rollback)

## Next Steps

1. [ ] Code review of all changes on `native-preview-experiment` branch
2. [ ] PR to merge into main (if all verifications pass)
3. [ ] Monitor for issues in CI after merge
4. [ ] Consider migrating dev/watch scripts after main merge stabilizes
5. [ ] Track tsgo releases for full JS emit support (if on CHECK-ONLY path)
```

### Task 9: Update Reflection Log

Add a P4 entry to `specs/pending/typescript-native-preview-port/REFLECTION_LOG.md` documenting:
- What worked well in the migration process
- What was harder than expected
- Patterns that could be reused for other tooling migrations
- Specific tsgo behaviors observed that differ from tsc

### Verification

P4 is complete when:

```bash
# Validation report exists
test -f specs/pending/typescript-native-preview-port/outputs/P4_VALIDATION_REPORT.md && echo "EXISTS" || echo "MISSING"

# All 5 verification commands pass
bun run build && bun run check && bun run lint:fix && bun run lint && bun run test && echo "ALL PASS"
```

### Success Criteria

- [ ] All 5 verification commands pass (`build`, `check`, `lint:fix`, `lint`, `test`)
- [ ] tsgo is confirmed as the active compiler (not falling back to tsc)
- [ ] Excluded packages are documented and still working with tsc
- [ ] Remaining TypeScript dependencies are documented
- [ ] Validation report written to `outputs/P4_VALIDATION_REPORT.md`
- [ ] Reflection log updated with P4 entry
- [ ] Decision record documents the migration outcome

### Handling Failures

If any verification command fails:

1. **Identify the failing package(s)** from the Turborepo output
2. **Check if the failure is in a migrated or non-migrated package**
3. **If migrated package**: try reverting just that package to tsc and re-running
4. **If non-migrated package**: this is a pre-existing issue, not caused by the migration
5. **If the failure is in lint**: lint uses Biome, which is independent of the compiler. Check if the failure is a pre-existing lint issue.
6. **If the failure is in test**: check if the test depends on build output. If tsgo emits slightly different JS, test assertions may fail.

After debugging:
- Fix the issue if possible
- Document it in the validation report as a known issue
- If the issue cannot be fixed, document it as a regression and include in the decision record

### Reference Files

- **P2 Migration Plan**: `specs/pending/typescript-native-preview-port/outputs/P2_MIGRATION_PLAN.md`
- **P1 Discovery Report**: `specs/pending/typescript-native-preview-port/outputs/P1_DISCOVERY_REPORT.md`
- **P0 Research Summary**: `specs/pending/typescript-native-preview-port/outputs/P0_RESEARCH_SUMMARY.md`
- **Master Orchestration**: `specs/pending/typescript-native-preview-port/MASTER_ORCHESTRATION.md`
- **Reflection Log**: `specs/pending/typescript-native-preview-port/REFLECTION_LOG.md`

### Final Step

Once the validation report is complete and all criteria are met, the spec is ready for human review. The branch `native-preview-experiment` can be opened as a PR against `main`.
