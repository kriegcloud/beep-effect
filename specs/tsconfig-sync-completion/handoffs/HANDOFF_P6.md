# Phase 6: Ralph Wiggum Validation Loop

> Automated validation phase using the Ralph Wiggum plugin.

**Status**: Blocked (awaiting P5 completion)
**Depends On**: P5 (Expected Files Generation)
**Plugin Required**: `ralph-wiggum` (via `/ralph-wiggum:ralph-loop`)

---

## Objective

Execute a systematic validation loop that:
1. Runs `tsconfig-sync` on each package
2. Compares actual output against expected files from P5
3. Verifies builds succeed after sync
4. Fixes any bugs discovered
5. Repeats until all packages pass

---

## Pre-requisites

### Required Before Starting

- [ ] P5 complete: All expected files exist in `specs/tsconfig-sync-completion/outputs/<path>/expected/`
- [ ] Expected files validated against REQUIREMENTS.md
- [ ] Clean git state (commit or stash pending changes)
- [ ] Ralph Wiggum plugin available (`/ralph-wiggum:help` to verify)

### Files to Reference

1. **Expected files**: `specs/tsconfig-sync-completion/outputs/<path>/expected/`
2. **Requirements**: `specs/tsconfig-sync-completion/outputs/REQUIREMENTS.md`
3. **Command source**: `tooling/cli/src/commands/tsconfig-sync/`

---

## Ralph Wiggum Loop Workflow

### Loop Initialization

```
/ralph-wiggum:ralph-loop
```

This starts the Ralph Wiggum loop which will:
1. Execute the validation workflow
2. Pause for analysis when issues are found
3. Allow fixes to be applied
4. Resume from the beginning after fixes

### Termination Criteria

The loop exits when:
- **Success**: All packages processed with 0 errors
- **Max iterations**: 10 iterations reached (safety valve)

---

## Validation Workflow (Per Iteration)

### Step 1: Get Package List

```bash
bun run repo-cli topo-sort
```

Process packages in this order (head to tail).

### Step 2: For Each Package

Execute the following sequence:

#### 2.1: Backup Current State

Before running tsconfig-sync, note the current state of config files. This enables rollback.

#### 2.2: Run tsconfig-sync

```bash
bun run repo-cli tsconfig-sync --filter @beep/package-name
```

#### 2.3: Copy Actual Results

Copy the sync results to the outputs folder:

```bash
# For regular packages
mkdir -p specs/tsconfig-sync-completion/outputs/packages/{slice}/{layer}/actual/
cp packages/{slice}/{layer}/tsconfig.build.json specs/tsconfig-sync-completion/outputs/packages/{slice}/{layer}/actual/
cp packages/{slice}/{layer}/tsconfig.src.json specs/tsconfig-sync-completion/outputs/packages/{slice}/{layer}/actual/
cp packages/{slice}/{layer}/tsconfig.test.json specs/tsconfig-sync-completion/outputs/packages/{slice}/{layer}/actual/
cp packages/{slice}/{layer}/package.json specs/tsconfig-sync-completion/outputs/packages/{slice}/{layer}/actual/
```

#### 2.4: Compare Expected vs Actual

```bash
diff -u specs/tsconfig-sync-completion/outputs/packages/{slice}/{layer}/expected/tsconfig.build.json \
        specs/tsconfig-sync-completion/outputs/packages/{slice}/{layer}/actual/tsconfig.build.json
```

Repeat for all config files. Document any discrepancies.

#### 2.5: Run Build Verification

```bash
bun run build --filter @beep/package-name
```

#### 2.6: Run Check Verification

```bash
bun run check --filter @beep/package-name
```

### Step 3: Issue Detection

If ANY of the following occur:
- Expected vs actual diff shows discrepancies
- Build fails
- Check fails

**STOP** the current iteration and proceed to bug fixing.

---

## Bug Fixing Protocol

### When Issues Are Found

1. **Document the issue** in the iteration log
2. **Analyze root cause** - Is it a command bug or incorrect expected file?
3. **Determine fix location**:
   - **Command bug**: Fix in `tooling/cli/src/commands/tsconfig-sync/`
   - **Expected file error**: Update file in `outputs/<path>/expected/`

### Rollback Before Fixing

Restore all modified config files:

```bash
# Restore packages/*, apps/*, tooling/* configs
git restore packages/*/package.json
git restore packages/*/*/package.json
git restore packages/*/*/tsconfig.*.json
git restore apps/*/package.json
git restore apps/*/tsconfig*.json
git restore tooling/*/package.json
git restore tooling/*/tsconfig.*.json
```

**Keep copies in actual/ folders** for reference during debugging.

### Apply Fix

1. Make minimal fix to tsconfig-sync command code
2. Verify fix doesn't break existing tests:
   ```bash
   bun run test --filter @beep/repo-cli
   ```
3. Commit the fix (or stage for later commit)

### Restart Loop

After fixing:
1. Increment iteration counter
2. Check if max iterations (10) reached
3. If not, **restart from Step 1** (head of topo-sort)

---

## Iteration Tracking

### Log Format

For each iteration, maintain a log:

```markdown
## Iteration N

### Packages Processed
- [x] @beep/identity - PASS
- [x] @beep/invariant - PASS
- [x] @beep/types - PASS
- [ ] @beep/schema - FAIL (expected vs actual diff)

### Issue Found
Package: @beep/schema
File: tsconfig.build.json
Expected: [...references...]
Actual: [...references...]
Root cause: Missing transitive dependency @beep/types in references

### Fix Applied
File: tooling/cli/src/commands/tsconfig-sync/references.ts
Change: Added missing transitive closure computation for...

### Rollback Executed
- git restore packages/*/*/tsconfig.*.json
- git restore packages/*/package.json

### Restarting from head...
```

### Iteration Summary

```markdown
| Iteration | Packages Processed | Issues Found | Fix Applied |
|-----------|-------------------|--------------|-------------|
| 1 | 15/59 | Missing transitive deps | references.ts |
| 2 | 42/59 | Incorrect sort order | package-sync.ts |
| 3 | 59/59 | None | N/A |
```

---

## Package Processing Order

Process in topo-sort order (first package = head):

```
1. @beep/calendar-client
2. @beep/calendar-ui
3. @beep/comms-client
4. @beep/comms-ui
5. @beep/customization-client
6. @beep/customization-ui
7. @beep/documents-client
8. @beep/documents-ui
9. @beep/identity
10. @beep/invariant
... (continue through all 59 packages)
58. @beep/todox
59. @beep/web
```

**Note:** `@beep/marketing` is excluded.

---

## Success Criteria

Phase 6 is complete when:

- [ ] All 59 packages processed with tsconfig-sync
- [ ] All actual files match expected files (diff = 0)
- [ ] All packages build successfully
- [ ] All packages pass type checks
- [ ] tsconfig-sync --check returns exit code 0:
  ```bash
  bun run repo-cli tsconfig-sync --check
  ```
- [ ] All iteration logs documented

---

## Artifacts

### During Execution

- `specs/tsconfig-sync-completion/outputs/<path>/actual/` - Sync results
- Iteration logs in conversation history

### After Completion

- Final `VERIFICATION_REPORT_P6.md` documenting:
  - Total iterations required
  - Bugs found and fixed
  - Final verification results

---

## Safety Valves

### Max Iterations

If 10 iterations are reached without success:
1. **STOP** the loop
2. Document all remaining issues
3. Escalate to user for manual review

### Catastrophic Failure

If builds/checks fail in ways unrelated to tsconfig-sync:
1. **STOP** immediately
2. Restore all files: `git restore .`
3. Document the failure
4. Ask user for guidance

---

## Commands Reference

```bash
# Run topo-sort
bun run repo-cli topo-sort

# Sync single package
bun run repo-cli tsconfig-sync --filter @beep/package-name

# Sync all packages
bun run repo-cli tsconfig-sync

# Check mode (validation only)
bun run repo-cli tsconfig-sync --check

# Build single package
bun run build --filter @beep/package-name

# Check single package
bun run check --filter @beep/package-name

# Run CLI tests
bun run test --filter @beep/repo-cli

# Restore all configs
git restore packages/*/package.json packages/*/*/package.json packages/*/*/tsconfig.*.json
git restore apps/*/package.json apps/*/tsconfig*.json
git restore tooling/*/package.json tooling/*/tsconfig.*.json
```

---

## Notes

1. **Ralph Wiggum plugin** handles the loop mechanics - you provide the workflow logic
2. **Keep iteration logs** - They're valuable for debugging
3. **Minimal fixes** - Fix only what's necessary, avoid scope creep
4. **Test after each fix** - Run CLI tests before restarting loop
5. **Preserve actual/ folders** - Useful for comparing across iterations
