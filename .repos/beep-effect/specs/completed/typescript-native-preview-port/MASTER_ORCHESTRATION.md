# Master Orchestration: TypeScript Native Preview Port

**Target Agent**: Codex (OpenAI autonomous coding agent)
**Branch**: `native-preview-experiment`
**Repository**: `beep-effect` monorepo (Bun workspace, Turborepo, Effect)

---

## Overview

This document provides a complete orchestration guide for migrating the beep-effect monorepo from `tsc` (TypeScript 5.9) to `tsgo` (`@typescript/native-preview`, TypeScript 7 Go-based compiler). The migration is divided into 4 phases with strict go/no-go gates between each.

**Critical Context**: This is a high-complexity migration (score: 50) affecting 50+ packages in a monorepo that uses Effect (advanced type-level programming), project references, composite builds, and several non-standard TypeScript flags. The agent MUST work incrementally and verify after each change.

---

## Phase Overview

```
P1 Discovery ──[GO/NO-GO]──> P2 Planning ──[GO/NO-GO]──> P3 Implementation ──[GO/NO-GO]──> P4 Validation
     |                            |                              |                              |
  Inventory                  Migration plan               Execute changes               Verify everything
  Feasibility test           Strict vs hybrid             Package by package             Produce evidence
  Flag compatibility         Ordered steps                Incremental verify             Final report
```

---

## Pre-Requisites (Before Any Phase)

```bash
# Ensure you are on the correct branch
git checkout native-preview-experiment

# Ensure dependencies are installed
bun install

# Verify the repo builds with current tsc (baseline)
bun run check
bun run build
```

If the baseline does not pass, STOP. Fix baseline issues before proceeding with the migration.

---

## Phase 1: Discovery

### Objective

Inventory all `tsc` and `typescript` usage in the repository. Test `tsgo` on a single leaf package. Produce a feasibility report.

### Tasks

#### 1.1 Install @typescript/native-preview

```bash
bun add -D @typescript/native-preview
```

Verify the binary is available:

```bash
npx tsgo --version
```

Expected output: something like `Version 7.0.0-dev.20260210` (nightly date will vary).

#### 1.2 Inventory All tsc Invocations

Search for every script in every `package.json` that invokes `tsc`:

```bash
grep -r '"tsc ' packages/*/package.json apps/*/package.json tooling/*/package.json scratchpad/*/package.json
```

Also check the root `package.json` and any standalone scripts:

```bash
grep -r 'tsc' package.json
grep -r 'tsc' scripts/
```

Record the results in `outputs/P1_DISCOVERY_REPORT.md`.

#### 1.3 Inventory All TypeScript JS API Consumers

Search for runtime imports of the `typescript` module:

```bash
grep -rn "from ['\"]typescript['\"]" packages/ apps/ tooling/
grep -rn "require(['\"]typescript['\"])" packages/ apps/ tooling/
grep -rn "ts-morph" packages/ apps/ tooling/
grep -rn "effect-language-service" package.json
grep -rn "@effect/docgen" packages/ tooling/
```

Record each consumer with file path, purpose, and whether it blocks strict replacement.

#### 1.4 Test tsgo Flag Compatibility

Test whether tsgo accepts the non-standard flags used in this project:

```bash
# Test with the base tsconfig (contains all flags)
npx tsgo --noEmit -p tsconfig.base.jsonc 2>&1 | head -50
```

If tsgo rejects specific flags, record which ones and what the error messages say.

Then test individual flags:

```bash
# Test rewriteRelativeImportExtensions
echo '{"extends": "./tsconfig.base.jsonc", "include": ["packages/common/types/src/**/*"]}' > /tmp/test-tsgo.json
npx tsgo --noEmit -p /tmp/test-tsgo.json 2>&1 | head -20
```

#### 1.5 Test tsgo on a Leaf Package

Pick `@beep/types` (type-only package, zero runtime, no downstream risk):

```bash
# Type-check only (no emit)
cd packages/common/types
npx tsgo -b tsconfig.json 2>&1

# Build (emit JS + declarations)
npx tsgo -b tsconfig.build.json 2>&1
```

Record:
- Does type-checking pass? Any different errors from tsc?
- Does build/emit work? Are declarations generated?
- How long did tsgo take vs tsc?

#### 1.6 Test tsgo on a Package Using Effect

Pick `@beep/schema` or `@beep/shared-domain` (uses Effect Schema heavily):

```bash
cd packages/common/schema
npx tsgo -b tsconfig.json 2>&1

# Compare error count with tsc
npx tsc -b tsconfig.json 2>&1 | wc -l
npx tsgo -b tsconfig.json 2>&1 | wc -l
```

Record any type-checking discrepancies specific to Effect types.

### Go/No-Go Gate: P1 -> P2

| Criterion | Required | Notes |
|-----------|----------|-------|
| tsgo installed and binary works | YES | `npx tsgo --version` succeeds |
| tsc invocations inventoried | YES | Complete list in discovery report |
| TypeScript JS API consumers identified | YES | All consumers listed |
| tsgo accepts base tsconfig flags (or rejections documented) | YES | Flag compatibility known |
| tsgo type-checks a leaf package | YES | At least one package passes |
| tsgo type-checks an Effect package | RECOMMENDED | Identifies potential blockers |
| Feasibility report written | YES | `outputs/P1_DISCOVERY_REPORT.md` |

**GO**: All YES criteria met. Proceed to P2.
**NO-GO**: If tsgo cannot even type-check a leaf package, or rejects critical flags with no workaround, STOP. Document findings and report back.

### Output

- `outputs/P1_DISCOVERY_REPORT.md` containing:
  - List of all `tsc` invocations with file paths
  - List of all TypeScript JS API consumers
  - Flag compatibility results
  - Leaf package test results
  - Effect package test results (if attempted)
  - Feasibility assessment (strict / hybrid / check-only / not feasible)

---

## Phase 2: Planning

### Objective

Based on P1 findings, decide on the migration path (strict / hybrid / check-only) and create a detailed, ordered migration plan.

### Decision Tree

Read the P1 discovery report. Apply this decision tree:

```
1. Can tsgo emit JS + declarations for a leaf package?
   YES -> Continue to step 2
   NO  -> PATH = "check-only" (tsgo for check, tsc for build)

2. Can tsgo emit JS + declarations for an Effect-heavy package?
   YES -> Continue to step 3
   NO  -> PATH = "check-only"

3. Does tsgo accept all tsconfig flags, or can rejected flags be removed/changed?
   YES -> Continue to step 4
   NO  -> PATH = "check-only" (unless flags can be conditionally applied)

4. Can the `typescript` package be fully removed?
   YES -> PATH = "strict"
   NO  -> PATH = "hybrid" (tsgo for build+check, keep typescript for JS API consumers)
```

### Tasks

#### 2.1 Choose Migration Path

Based on the decision tree, choose one of:

- **STRICT**: Remove `typescript` entirely. Replace all `tsc` with `tsgo`.
- **HYBRID**: Replace all `tsc` with `tsgo` in build/check scripts. Keep `typescript` in root devDependencies for ts-morph, effect-language-service, docgen.
- **CHECK-ONLY**: Replace `tsc` with `tsgo` only in `check` scripts. Keep `tsc` for `build-esm` scripts.

Document the choice and rationale.

#### 2.2 Identify Flag Changes

If tsgo rejects any tsconfig flags:

- Can the flag be removed without breaking anything? (e.g., `preserveWatchOutput` is irrelevant for build)
- Can the flag be moved to a tsgo-specific override? (e.g., separate tsconfig.tsgo.json)
- Does the flag need to remain for tsc but be excluded for tsgo?

Create a list of flag changes with before/after.

#### 2.3 Create Package Migration Order

Using the tiered approach from the research summary:

1. List all packages to migrate in order (leaf to root)
2. For each package, specify what scripts change
3. Identify any package-specific gotchas

#### 2.4 Define Per-Package Acceptance Criteria

For each package:

```bash
# After swapping tsc -> tsgo in package.json:
bun run check --filter @beep/<package>
bun run build --filter @beep/<package>
bun run test --filter @beep/<package>
```

All three must pass before moving to the next package.

#### 2.5 Plan for ts-morph / effect-language-service

If hybrid or check-only path:
- Document that `typescript` stays in root `devDependencies`
- Document that `tooling/cli` package.json keeps `ts-morph` dependency unchanged
- Document that root `prepare` script (`effect-language-service patch`) remains unchanged
- Ensure tsgo and tsc binaries do not conflict

#### 2.6 Write Migration Plan

Produce `outputs/P2_MIGRATION_PLAN.md` with:
- Chosen path and rationale
- Ordered list of packages with specific script changes
- Flag changes (if any)
- Rollback procedure
- Acceptance criteria per package

### Go/No-Go Gate: P2 -> P3

| Criterion | Required |
|-----------|----------|
| Migration path chosen and documented | YES |
| Package migration order defined | YES |
| Flag changes identified (if any) | YES |
| Rollback procedure documented | YES |
| Per-package acceptance criteria defined | YES |
| Migration plan written | YES |

**GO**: All criteria met. Proceed to P3.
**NO-GO**: If P1 findings reveal fundamental incompatibilities with no workaround, STOP.

### Output

- `outputs/P2_MIGRATION_PLAN.md`

---

## Phase 3: Implementation

### Objective

Execute the migration plan from P2. Work incrementally -- one package at a time. Verify after each change. Keep the repo buildable at every step.

### Critical Rules

1. **ALWAYS work on branch `native-preview-experiment`**.
2. **NEVER change more than one package before verifying**.
3. **If a package fails verification, STOP and debug before continuing**.
4. **Commit after each successful package migration** (atomic, reviewable commits).
5. **If you hit an unexpected issue, document it and reassess the plan**.

### Implementation Strategy by Path

#### STRICT or HYBRID Path: Build + Check Swap

For each package in the migration order:

1. **Edit `package.json`**: Replace `tsc` with `tsgo` in scripts:

```json
// BEFORE
"build-esm": "tsc -b tsconfig.build.json",
"check": "tsc -b tsconfig.json",
"dev": "tsc -b tsconfig.build.json --watch"

// AFTER
"build-esm": "tsgo -b tsconfig.build.json",
"check": "tsgo -b tsconfig.json",
"dev": "tsgo -b tsconfig.build.json --watch"
```

2. **Verify**:

```bash
bun run check --filter @beep/<package>
bun run build --filter @beep/<package>
bun run test --filter @beep/<package>
```

3. **Commit** if all pass:

```bash
git add packages/<slice>/<layer>/package.json
git commit -m "chore(<package>): swap tsc -> tsgo for build and check"
```

4. **If verification fails**:
   - Check if the error is a tsgo-specific issue or a pre-existing error
   - If tsgo-specific: document the error, skip this package, continue to next
   - If the error cascades (downstream packages depend on this one), STOP and reassess

#### CHECK-ONLY Path: Check Swap Only

Same as above, but only modify `check` scripts. Leave `build-esm` and `dev` scripts using `tsc`.

```json
// BEFORE
"check": "tsc -b tsconfig.json"

// AFTER
"check": "tsgo -b tsconfig.json"
```

### Handling tsconfig Flag Issues

If tsgo rejects certain flags in `tsconfig.base.jsonc`:

**Option A: Remove the flag globally** (if safe):
```bash
# Edit tsconfig.base.jsonc to remove/change the flag
# Verify with both tsc and tsgo
```

**Option B: Create tsgo-specific tsconfig** (if flag is tsc-only):
```json
// tsconfig.tsgo-base.jsonc
{
  "extends": "./tsconfig.base.jsonc",
  "compilerOptions": {
    // Override incompatible flags
    "emitDecoratorMetadata": false
  }
}
```

Then update package tsconfigs to extend tsgo-specific base when using tsgo.

**Option C: Conditional scripts** (least preferred):
```json
{
  "check": "tsgo -b tsconfig.json || tsc -b tsconfig.json",
  "check:tsgo": "tsgo -b tsconfig.json",
  "check:tsc": "tsc -b tsconfig.json"
}
```

### Handling Declaration Emit Issues

If tsgo fails to emit declarations for certain packages:

1. Try adding `--declaration` flag explicitly
2. Check if the failure is due to type errors (tsgo requires clean types for declaration emit)
3. If declarations fail on complex Effect types, fall back to tsc for that specific package's build

### Batch Processing

If the migration is mechanical (same change for all packages), consider a batch approach:

```bash
# Find all package.json files with tsc scripts
find packages apps tooling -name package.json -exec grep -l '"tsc ' {} \;

# Apply the replacement (be careful, verify after)
find packages apps tooling -name package.json -exec sed -i 's/"tsc -b/"tsgo -b/g' {} \;

# Verify the full repo
bun run check
bun run build
bun run test
```

Only use batch if P1/P2 confirmed that tsgo works for all packages. Otherwise, do it one by one.

### Rollback Procedure

If the migration fails catastrophically:

```bash
# Option 1: Revert all package.json changes
git checkout -- packages/*/package.json apps/*/package.json tooling/*/package.json

# Option 2: Revert to last known good commit
git log --oneline -10  # Find the last good commit
git reset --soft <commit>

# Option 3: Global sed to swap back
find packages apps tooling -name package.json -exec sed -i 's/"tsgo -b/"tsc -b/g' {} \;
```

### Go/No-Go Gate: P3 -> P4

| Criterion | Required |
|-----------|----------|
| All target packages have tsgo in their scripts | YES |
| `bun run check` passes | YES |
| `bun run build` passes | YES |
| No cascading failures in downstream packages | YES |
| All changes committed | YES |
| Any skipped packages documented with reason | YES |

**GO**: All criteria met. Proceed to P4.
**PARTIAL-GO**: Most packages migrated, some skipped. Proceed to P4 but document exceptions.
**NO-GO**: Cascading failures, regression in core functionality. Roll back and reassess.

### Output

- All package.json files updated (committed to git)
- List of any skipped packages with reasons
- Any tsconfig changes made

---

## Phase 4: Validation

### Objective

Run the complete verification suite. Capture evidence of each command passing. Verify that tsgo is actually being used (not falling back to tsc). Produce a final report.

### Tasks

#### 4.1 Run Full Verification Suite

```bash
# Capture each command's output

echo "=== bun run build ===" > /tmp/tsgo-validation.log
bun run build 2>&1 | tee -a /tmp/tsgo-validation.log
echo "EXIT CODE: $?" >> /tmp/tsgo-validation.log

echo "=== bun run check ===" >> /tmp/tsgo-validation.log
bun run check 2>&1 | tee -a /tmp/tsgo-validation.log
echo "EXIT CODE: $?" >> /tmp/tsgo-validation.log

echo "=== bun run lint:fix ===" >> /tmp/tsgo-validation.log
bun run lint:fix 2>&1 | tee -a /tmp/tsgo-validation.log
echo "EXIT CODE: $?" >> /tmp/tsgo-validation.log

echo "=== bun run lint ===" >> /tmp/tsgo-validation.log
bun run lint 2>&1 | tee -a /tmp/tsgo-validation.log
echo "EXIT CODE: $?" >> /tmp/tsgo-validation.log

echo "=== bun run test ===" >> /tmp/tsgo-validation.log
bun run test 2>&1 | tee -a /tmp/tsgo-validation.log
echo "EXIT CODE: $?" >> /tmp/tsgo-validation.log
```

All five commands must exit with code 0.

#### 4.2 Verify tsgo Is Actually Being Used

```bash
# Check that package.json scripts reference tsgo, not tsc
echo "=== Remaining tsc references ===" >> /tmp/tsgo-validation.log
grep -rn '"tsc ' packages/*/package.json apps/*/package.json tooling/*/package.json >> /tmp/tsgo-validation.log 2>&1

# Check tsgo binary resolves
echo "=== tsgo version ===" >> /tmp/tsgo-validation.log
npx tsgo --version >> /tmp/tsgo-validation.log 2>&1

# List all packages now using tsgo
echo "=== Packages using tsgo ===" >> /tmp/tsgo-validation.log
grep -rn '"tsgo ' packages/*/package.json apps/*/package.json tooling/*/package.json >> /tmp/tsgo-validation.log 2>&1
```

Expected:
- Zero `tsc` references in build/check scripts (except tooling packages that must keep tsc)
- tsgo version resolves to 7.0.0-dev.*
- All target packages list tsgo in their scripts

#### 4.3 Document Remaining TypeScript Dependencies

If hybrid path:

```bash
echo "=== typescript package consumers ===" >> /tmp/tsgo-validation.log
grep -rn "typescript" package.json >> /tmp/tsgo-validation.log 2>&1
grep -rn "ts-morph" tooling/cli/package.json >> /tmp/tsgo-validation.log 2>&1
```

Document why `typescript` remains and which packages depend on it.

#### 4.4 Performance Comparison (Optional)

```bash
# Time tsc on full repo check
time npx tsc -b tsconfig.json --noEmit 2>&1

# Time tsgo on full repo check
time npx tsgo -b tsconfig.json --noEmit 2>&1
```

Record the speedup ratio.

#### 4.5 Produce Final Report

Write `outputs/P4_VALIDATION_REPORT.md` containing:
- Pass/fail status for each of the 5 verification commands
- Evidence (exit codes, key output lines)
- tsgo version used
- Migration path taken (strict / hybrid / check-only)
- List of packages migrated
- List of packages NOT migrated (with reasons)
- Remaining `typescript` dependencies (if hybrid)
- Performance comparison (if measured)
- Known issues or regressions
- Recommendations for next steps

### Acceptance Gate: Final

| Criterion | Status |
|-----------|--------|
| `bun run build` passes | |
| `bun run check` passes | |
| `bun run lint:fix` passes | |
| `bun run lint` passes | |
| `bun run test` passes | |
| tsgo is confirmed as the active compiler | |
| Validation report written | |
| Decision documented (strict/hybrid/check-only) | |

---

## Rollback Procedures

### Full Rollback (Revert Everything)

```bash
git checkout native-preview-experiment
git log --oneline -20  # Find the commit before migration started
git reset --hard <pre-migration-commit>
bun install
bun run check  # Verify baseline is restored
```

### Partial Rollback (Single Package)

```bash
# Revert a single package's package.json
git checkout HEAD~1 -- packages/<slice>/<layer>/package.json
bun run check --filter @beep/<package>
bun run build --filter @beep/<package>
```

### Script-Level Rollback (Swap Back)

```bash
# Replace tsgo back to tsc in all package.json files
find packages apps tooling -name package.json -exec sed -i 's/"tsgo -b/"tsc -b/g' {} \;
bun run check
bun run build
```

---

## Troubleshooting Guide

### tsgo Rejects a tsconfig Flag

```
error TS5023: Unknown compiler option 'someFlag'.
```

**Fix**: Check if the flag is supported by tsgo. If not, either remove it from tsconfig.base.jsonc (if safe) or create a tsgo-specific override.

### Declaration Emit Fails

```
error TS5069: Unable to emit declarations.
```

**Fix**: This usually means there are type errors that prevent declaration generation. Fix the type errors first. If the errors are tsgo-specific (not present in tsc), fall back to tsc for this package's build.

### Type-Checking Discrepancy

tsgo reports errors that tsc does not, or vice versa.

**Fix**: Compare error output between `tsc` and `tsgo` for the specific file. If tsgo is stricter on a valid pattern, check if there is a tsgo issue filed. If it is a genuine bug in tsgo, skip that package and document it.

### Side-by-Side Installation Conflict

`@typescript/native-preview` and `typescript` interfere with each other.

**Fix**: Ensure scripts explicitly reference the binary by path:
```json
"check": "./node_modules/.bin/tsgo -b tsconfig.json"
```

Or use `npx tsgo` instead of bare `tsgo`.

### Build Passes But Tests Fail

The JS emit from tsgo may differ subtly from tsc.

**Fix**: Compare the `build/esm/` output between tsc and tsgo for the failing package. Look for differences in import paths, declaration content, or emitted JavaScript.

---

## Communication Protocol

### When to Stop and Report Back

1. **tsgo cannot be installed** (npm/bun error).
2. **tsgo crashes on any command** (segfault, panic).
3. **tsgo rejects a flag with no workaround** that is essential for the build.
4. **More than 5 packages fail migration** with tsgo-specific errors.
5. **Full repo verification fails** after all packages are migrated and debugging does not resolve it within reasonable effort.
6. **The rollback procedure fails** (baseline cannot be restored).

In any of these cases, document what happened, what was tried, and stop. Do not attempt heroic workarounds.

### When to Continue Despite Issues

1. **A single leaf package fails** -- skip it, document it, continue with others.
2. **A non-critical flag is rejected** -- remove or override it if safe.
3. **Watch mode does not work** -- not required for acceptance.
4. **LSP auto-imports use wrong paths** -- developer experience issue, not a build blocker.
5. **Performance is not 7x faster** -- any improvement is acceptable as long as correctness is maintained.
