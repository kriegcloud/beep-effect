# Phase 6 Orchestrator Prompt: Ralph Wiggum Validation Loop

> Copy this entire prompt into a new Claude session to execute Phase 6.

---

## Context

You are executing **Phase 6** of the `tsconfig-sync-completion` spec. This phase uses the **Ralph Wiggum plugin** to run a systematic validation loop that verifies the `tsconfig-sync` command produces correct output for all packages.

**Phase 5 MUST be complete before starting** - Expected files must exist in `specs/tsconfig-sync-completion/outputs/<path>/expected/`.

---

## Pre-requisites

### Verify Before Starting

```bash
# 1. Check expected files exist
ls specs/tsconfig-sync-completion/outputs/packages/
ls specs/tsconfig-sync-completion/outputs/tooling/
ls specs/tsconfig-sync-completion/outputs/apps/

# 2. Verify clean git state
git status

# 3. Verify tsconfig-sync works
bun run repo-cli tsconfig-sync --help

# 4. Verify Ralph Wiggum available
# (Run /ralph-wiggum:help to check)
```

### Read These Documents

1. **Handoff**: `specs/tsconfig-sync-completion/handoffs/HANDOFF_P6.md`
2. **Requirements**: `specs/tsconfig-sync-completion/outputs/REQUIREMENTS.md`
3. **P5 Handoff**: `specs/tsconfig-sync-completion/handoffs/HANDOFF_P5.md` (for context)

---

## Mission

Run a validation loop that:
1. Processes each package in topo-sort order
2. Runs `tsconfig-sync` and captures actual output
3. Compares actual vs expected
4. Runs build and check verification
5. Fixes any bugs in the tsconfig-sync command
6. Repeats until all packages pass

**Max iterations: 10**

---

## Start Ralph Wiggum Loop

```
/ralph-wiggum:ralph-loop
```

---

## Loop Workflow

### For Each Iteration

Execute this workflow. Track progress in an iteration log.

#### Step 1: Get Ordered Package List

```bash
bun run repo-cli topo-sort
```

This is your processing order. Start at the head (first package).

#### Step 2: Process Each Package

For each package `@beep/{name}` at path `{pkg_path}`:

##### 2.1: Run tsconfig-sync

```bash
bun run repo-cli tsconfig-sync --filter @beep/{name}
```

##### 2.2: Copy Actual Results to Outputs

```bash
# Create actual directory
mkdir -p specs/tsconfig-sync-completion/outputs/{pkg_path}/actual/

# Copy results (adjust file list based on package type)
cp {pkg_path}/tsconfig.build.json specs/tsconfig-sync-completion/outputs/{pkg_path}/actual/ 2>/dev/null || true
cp {pkg_path}/tsconfig.src.json specs/tsconfig-sync-completion/outputs/{pkg_path}/actual/ 2>/dev/null || true
cp {pkg_path}/tsconfig.test.json specs/tsconfig-sync-completion/outputs/{pkg_path}/actual/ 2>/dev/null || true
cp {pkg_path}/tsconfig.json specs/tsconfig-sync-completion/outputs/{pkg_path}/actual/ 2>/dev/null || true
cp {pkg_path}/package.json specs/tsconfig-sync-completion/outputs/{pkg_path}/actual/
```

##### 2.3: Compare Expected vs Actual

```bash
# Compare each file that exists
diff -u specs/tsconfig-sync-completion/outputs/{pkg_path}/expected/tsconfig.build.json \
        specs/tsconfig-sync-completion/outputs/{pkg_path}/actual/tsconfig.build.json

diff -u specs/tsconfig-sync-completion/outputs/{pkg_path}/expected/package.json \
        specs/tsconfig-sync-completion/outputs/{pkg_path}/actual/package.json
```

If diff shows differences, **document and continue to 2.4**.

##### 2.4: Build Verification

```bash
bun run build --filter @beep/{name}
```

If build fails, **STOP and proceed to Bug Fix Protocol**.

##### 2.5: Check Verification

```bash
bun run check --filter @beep/{name}
```

If check fails, **STOP and proceed to Bug Fix Protocol**.

##### 2.6: Mark Package Complete

Log: `[x] @beep/{name} - PASS` (or FAIL with details)

#### Step 3: Continue or Fix

- **If all packages pass**: Exit loop successfully
- **If any package fails**: Execute Bug Fix Protocol, then restart

---

## Bug Fix Protocol

When an issue is found:

### 1. Document the Issue

```markdown
### Issue Found
Package: @beep/{name}
File: {filename}
Type: [diff mismatch | build failure | check failure]
Details: {specific error or diff output}
```

### 2. Analyze Root Cause

Determine if the issue is:
- **Command bug**: tsconfig-sync produces wrong output
- **Expected file error**: P5 created incorrect expected file
- **Unrelated issue**: Pre-existing error in package

### 3. Rollback Config Files

**CRITICAL**: Restore all modified configs before fixing:

```bash
git restore packages/*/package.json
git restore packages/*/*/package.json
git restore packages/*/*/tsconfig.*.json
git restore apps/*/package.json
git restore apps/*/tsconfig*.json
git restore tooling/*/package.json
git restore tooling/*/tsconfig.*.json
```

**Note**: Actual files in `outputs/*/actual/` are preserved for reference.

### 4. Apply Fix

#### If Command Bug:
1. Fix code in `tooling/cli/src/commands/tsconfig-sync/`
2. Run tests: `bun run test --filter @beep/repo-cli`
3. Verify fix compiles: `bun run check --filter @beep/repo-cli`

#### If Expected File Error:
1. Update file in `specs/tsconfig-sync-completion/outputs/{path}/expected/`
2. Document why the expected file was wrong

### 5. Restart Loop

1. Increment iteration counter
2. Check: `iteration < 10`?
3. If yes, **restart from Step 1** (head of topo-sort)
4. If no, **STOP and escalate**

---

## Iteration Log Template

Maintain this log throughout execution:

```markdown
# Phase 6 Validation Log

## Iteration 1

### Progress
- [x] @beep/calendar-client - PASS
- [x] @beep/calendar-ui - PASS
- [ ] @beep/comms-client - FAIL

### Issue
Package: @beep/comms-client
Type: Diff mismatch
File: tsconfig.build.json
Expected refs: 5
Actual refs: 3
Missing: @beep/shared-domain, @beep/types

### Root Cause
computeTransitiveClosure not being called for client packages

### Fix
File: tooling/cli/src/commands/tsconfig-sync/references.ts
Line: 42
Change: Added transitive closure computation

### Rollback
git restore packages/*/*/tsconfig.*.json

### Restarting...

---

## Iteration 2

### Progress
- [x] @beep/calendar-client - PASS
... (all 59 packages)
- [x] @beep/web - PASS

### Result: SUCCESS

All packages validated. No issues found.
```

---

## Final Verification

After all packages pass:

```bash
# Full repo sync check
bun run repo-cli tsconfig-sync --check

# Full repo build
bun run build

# Full repo type check
bun run check
```

All should pass with exit code 0.

---

## Completion Checklist

- [ ] All 59 packages processed
- [ ] All actual files match expected files
- [ ] All builds pass
- [ ] All type checks pass
- [ ] `tsconfig-sync --check` returns 0
- [ ] Iteration log complete
- [ ] `VERIFICATION_REPORT_P6.md` created

---

## Create Final Report

After successful completion, create:

`specs/tsconfig-sync-completion/handoffs/VERIFICATION_REPORT_P6.md`

Include:
- Total iterations required
- Bugs found and fixed (with details)
- Final verification results
- Command to re-run validation

---

## Safety Rules

### Max Iterations
If iteration 10 is reached without success:
1. STOP the loop
2. Document remaining issues
3. Ask user: "Reached max iterations. {N} packages still failing. How to proceed?"

### Catastrophic Failure
If unrecoverable error occurs:
1. STOP immediately
2. Run: `git restore .`
3. Document what happened
4. Ask user for help

### Scope Discipline
- Fix ONLY tsconfig-sync command bugs
- Do NOT fix unrelated package issues
- Do NOT refactor during bug fixes
- Minimal changes only

---

## Quick Reference

```bash
# Topo sort
bun run repo-cli topo-sort

# Sync one package
bun run repo-cli tsconfig-sync --filter @beep/pkg

# Sync all
bun run repo-cli tsconfig-sync

# Check mode
bun run repo-cli tsconfig-sync --check

# Build one
bun run build --filter @beep/pkg

# Check one
bun run check --filter @beep/pkg

# CLI tests
bun run test --filter @beep/repo-cli

# Rollback all configs
git restore packages/*/package.json packages/*/*/package.json packages/*/*/tsconfig.*.json apps/*/package.json apps/*/tsconfig*.json tooling/*/package.json tooling/*/tsconfig.*.json

# Cancel Ralph loop
/ralph-wiggum:cancel-ralph
```

---

## Start

When ready:

1. Verify P5 complete (expected files exist)
2. Verify clean git state
3. Start Ralph Wiggum: `/ralph-wiggum:ralph-loop`
4. Begin with: `bun run repo-cli topo-sort`

Good luck!
