# Phase 3 Orchestrator Prompt: Implementation

Copy-paste this prompt to start Phase 3 (Implementation).

---

## Prompt

You are executing Phase 3 (Implementation) of the TypeScript Native Preview Port spec for the `beep-effect` monorepo. You are working on branch `native-preview-experiment`.

### Context

Phase 1 (Discovery) and Phase 2 (Planning) have been completed. The key documents are:

- **Migration plan**: `specs/pending/typescript-native-preview-port/outputs/P2_MIGRATION_PLAN.md` -- READ THIS FIRST. It contains the exact changes to make, in order.
- **Discovery report**: `specs/pending/typescript-native-preview-port/outputs/P1_DISCOVERY_REPORT.md` -- Reference for flag compatibility and test results.
- **Research summary**: `specs/pending/typescript-native-preview-port/outputs/P0_RESEARCH_SUMMARY.md` -- Background on tsgo capabilities.
- **Master orchestration**: `specs/pending/typescript-native-preview-port/MASTER_ORCHESTRATION.md` -- Full orchestration guide including rollback procedures.

The migration plan specifies:
- The chosen migration path (STRICT, HYBRID, or CHECK-ONLY)
- An ordered list of packages to migrate
- The exact script changes for each package
- Any tsconfig changes needed
- Packages excluded from migration
- Rollback procedures

### Your Mission

Execute the migration plan from P2, package by package. Follow these rules strictly:

### Critical Rules

1. **Work on branch `native-preview-experiment`** -- verify with `git branch` before starting.
2. **Follow the package order from P2_MIGRATION_PLAN.md exactly** -- do not skip ahead or reorder.
3. **Verify after EVERY package change** before moving to the next one.
4. **Commit after each successful package migration** -- atomic commits.
5. **If a package fails verification, STOP and debug** -- do not continue to the next package.
6. **If debugging does not resolve the issue within 3 attempts, skip the package** and document why.
7. **If more than 5 packages fail, STOP the entire migration** and report back.

### Step-by-Step Process

For each package in the migration order from P2:

**Step 1: Apply tsconfig changes (if any -- do this ONCE at the start)**

If P2 identified tsconfig flag changes:

```bash
# Read the current tsconfig.base.jsonc
cat tsconfig.base.jsonc

# Make the documented changes (e.g., remove unsupported flags)
# Edit the file according to P2_MIGRATION_PLAN.md

# Verify the change does not break tsc (for packages still using tsc)
bun run check --filter @beep/types
```

**Step 2: Edit package.json for the current package**

The migration plan specifies the exact before/after for each script. Apply the change. For the typical pattern:

```json
// BEFORE
"build-esm": "tsc -b tsconfig.build.json",
"check": "tsc -b tsconfig.json",
"dev": "tsc -b tsconfig.build.json --watch"

// AFTER (STRICT or HYBRID path)
"build-esm": "tsgo -b tsconfig.build.json",
"check": "tsgo -b tsconfig.json",
"dev": "tsgo -b tsconfig.build.json --watch"

// AFTER (CHECK-ONLY path)
"check": "tsgo -b tsconfig.json"
// build-esm and dev remain unchanged
```

**Step 3: Verify the package**

```bash
bun run check --filter @beep/<package>
echo "check exit code: $?"

bun run build --filter @beep/<package>
echo "build exit code: $?"

bun run test --filter @beep/<package>
echo "test exit code: $?"
```

All three must exit with code 0.

**Step 4: Commit on success**

```bash
git add packages/<slice>/<layer>/package.json
git commit -m "chore(<package-short-name>): swap tsc -> tsgo for build and check"
```

Use short package names in the commit scope (e.g., `types`, `schema`, `iam-domain`).

**Step 5: Handle failure**

If verification fails:

1. **Check if the error is pre-existing** (run the same command with tsc to compare):
   ```bash
   # Temporarily revert
   git checkout -- packages/<slice>/<layer>/package.json
   bun run check --filter @beep/<package>
   ```

2. **If the error exists with tsc too**: the error is pre-existing, not caused by tsgo. Document it and proceed with the tsgo swap (the package was already broken).

3. **If the error is tsgo-specific**:
   - Read the error message carefully
   - Check if it relates to a known tsgo limitation (declaration emit, decorator metadata, etc.)
   - If fixable (e.g., removing an unnecessary flag): fix it and retry
   - If not fixable: revert the package, document the error, skip to next package

4. **If the error cascades** (downstream packages that were previously passing now fail):
   - This is a serious issue
   - Revert the current package
   - Check if downstream packages need to be migrated together
   - If the cascade cannot be resolved, STOP and report

### Batch Mode (Optional)

If the P2 plan indicates that ALL packages use the identical script pattern and tsgo is confirmed working for all tiers, you may use batch mode:

```bash
# Apply the change to all package.json files at once
find packages apps tooling -name package.json -exec grep -l '"tsc -b' {} \; | while read f; do
  sed -i 's/"tsc -b/"tsgo -b/g' "$f"
done

# Verify the full repo
bun run check
bun run build
bun run test
```

Only use batch mode if:
- P1 confirmed tsgo works on all tested packages
- P2 explicitly recommends batch mode
- You are confident there are no package-specific exceptions

If batch mode fails, revert ALL changes and fall back to the per-package approach.

### Handling Specific Issues

**Declaration emit failure on a package:**
```bash
# If tsgo -b tsconfig.build.json fails with declaration errors:
# Option A: Fall back to tsc for build only
"build-esm": "tsc -b tsconfig.build.json",  # Keep tsc
"check": "tsgo -b tsconfig.json"              # Use tsgo for check only

# Option B: Fix type errors that prevent declaration emit
# (tsgo requires zero errors for declaration emit, tsc does not)
```

**Type-checking discrepancy (tsgo reports different errors than tsc):**
```bash
# Compare outputs
npx tsc -b packages/<pkg>/tsconfig.json 2>&1 > /tmp/tsc-errors.txt
npx tsgo -b packages/<pkg>/tsconfig.json 2>&1 > /tmp/tsgo-errors.txt
diff /tmp/tsc-errors.txt /tmp/tsgo-errors.txt
```

If tsgo is stricter (reports errors tsc does not): the code may have latent bugs that tsgo catches. Fix them if reasonable, skip the package if not.

If tsgo is more permissive (misses errors tsc catches): this is a tsgo bug. Not a blocker for migration, but document it.

**Flag rejection at build time:**
If tsgo rejects a flag that was accepted during P1 testing (which tested with `--noEmit`), the flag may only be relevant to emit mode. Check the P2 plan for the recommended fix.

### Progress Tracking

As you work through packages, keep a running count:

```
Migrated: X / Y total
Skipped:  Z (with reasons)
Current:  @beep/<package>
```

### Output

The primary output of P3 is the set of committed changes to package.json files. Additionally, if any packages were skipped or required special handling, document them in a brief report.

If issues were encountered, update the reflection log:
`specs/pending/typescript-native-preview-port/REFLECTION_LOG.md`

### Verification

Before considering P3 complete, run the full repo verification:

```bash
bun run check
echo "check: $?"

bun run build
echo "build: $?"

# Lint is independent of compiler swap but verify it still works
bun run lint:fix
echo "lint:fix: $?"

bun run lint
echo "lint: $?"

bun run test
echo "test: $?"
```

If any of the five commands fail, debug and fix before proceeding to P4. If the failure cannot be resolved, document it and proceed to P4 with partial success.

### Success Criteria

- [ ] All packages in the migration plan have been processed (migrated or documented as skipped)
- [ ] Each migrated package passes `check`, `build`, and `test` individually
- [ ] `bun run check` passes for the full repo
- [ ] `bun run build` passes for the full repo
- [ ] All changes are committed to branch `native-preview-experiment`
- [ ] Skipped packages (if any) are documented with specific error details
- [ ] No regressions in packages that were not touched

### Rollback

If the migration goes catastrophically wrong:

```bash
# Nuclear option: revert ALL package.json changes
git checkout -- packages/*/package.json apps/*/package.json tooling/*/package.json

# Or revert to the last known good commit
git log --oneline -20
git reset --hard <pre-migration-commit>
bun install
```

### Reference Files

- **Migration plan (PRIMARY INPUT)**: `specs/pending/typescript-native-preview-port/outputs/P2_MIGRATION_PLAN.md`
- Discovery report: `specs/pending/typescript-native-preview-port/outputs/P1_DISCOVERY_REPORT.md`
- Research summary: `specs/pending/typescript-native-preview-port/outputs/P0_RESEARCH_SUMMARY.md`
- Master orchestration: `specs/pending/typescript-native-preview-port/MASTER_ORCHESTRATION.md`
- Root tsconfig: `tsconfig.base.jsonc`

### Next Phase

After completing Phase 3, proceed to Phase 4 (Validation) to run the complete verification suite and produce a final report with evidence.
