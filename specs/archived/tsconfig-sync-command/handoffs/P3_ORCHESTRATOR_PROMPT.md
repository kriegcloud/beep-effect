# P3 Orchestrator Prompt: Exhaustive Verification

## Mission

You are the P3 verification orchestrator for the `tsconfig-sync` command. Your task is to systematically verify EVERY workspace package against the spec requirements, identify issues, fix them, and loop until all packages pass.

---

## Ralph Wiggum Loop Integration

This verification uses the `ralph-wiggum` plugin for iterative execution. Start the loop with:

```
/ralph-wiggum:ralph-loop
```

### Loop State Machine

```
┌─────────────────┐
│  VERIFY_PACKAGE │◄──────────────────────┐
└────────┬────────┘                       │
         │                                │
         ▼                                │
    ┌─────────┐    PASS                   │
    │  CHECK  │─────────► NEXT_PACKAGE ───┤
    └────┬────┘                           │
         │ FAIL                           │
         ▼                                │
    ┌─────────┐                           │
    │   FIX   │                           │
    └────┬────┘                           │
         │                                │
         ▼                                │
    ┌─────────┐                           │
    │ RE-TEST │───────────────────────────┘
    └─────────┘
```

### Loop Iteration Protocol

Each iteration:
1. **Pick next unverified package** from checklist
2. **Verify** against spec requirements
3. **If PASS**: Mark complete, continue to next
4. **If FAIL**: Fix the issue, re-verify, then continue
5. **Loop ends** when all packages pass or `/ralph-wiggum:cancel-ralph` is called

---

## Loop State Tracking

Maintain this state across iterations. Update after each package:

```yaml
# P3 Verification State - Copy and update each iteration
current_package_index: 0
total_packages: 44
packages_passed: 0
packages_failed: 0
issues_found: []
issues_fixed: []
current_status: "IN_PROGRESS"  # IN_PROGRESS | FIXING | COMPLETE
```

### Package Queue (Process in Order)

```yaml
packages:
  # Common Layer
  - name: "@beep/types"
    status: "pending"  # pending | passed | failed | fixing
    issues: []
  - name: "@beep/invariant"
    status: "pending"
  - name: "@beep/identity"
    status: "pending"
  - name: "@beep/utils"
    status: "pending"
  - name: "@beep/schema"
    status: "pending"
  - name: "@beep/constants"
    status: "pending"
  - name: "@beep/errors"
    status: "pending"
  - name: "@beep/wrap"
    status: "pending"
  # Shared Layer
  - name: "@beep/shared-domain"
    status: "pending"
  - name: "@beep/shared-env"
    status: "pending"
  - name: "@beep/shared-tables"
    status: "pending"
  - name: "@beep/shared-server"
    status: "pending"
  - name: "@beep/shared-client"
    status: "pending"
  - name: "@beep/shared-ai"
    status: "pending"
  # Domain Slices (continue pattern...)
```

---

## Required Reading (Do This First)

1. Read the spec: `specs/tsconfig-sync-command/README.md`
2. Read P3 handoff: `specs/tsconfig-sync-command/handoffs/HANDOFF_P3.md`
3. Understand key requirements:
   - **Root-relative paths** (L85-117): `../../../packages/...` format
   - **Topological sorting** (L119-136): deps before dependents
   - **Transitive hoisting** (L177-179): recursive peer dep inclusion

---

## Loop Iteration Actions

### On Each Iteration

**Step 1: Identify Current Package**
```bash
# Get next pending package from state
PKG="@beep/[next-pending-package]"
echo "Verifying: $PKG"
```

**Step 2: Run Verification**
```bash
# Restore to clean state first
git checkout packages/*/tsconfig.build.json packages/*/*/tsconfig.build.json 2>/dev/null

# Run the command
bun run repo-cli tsconfig-sync --filter "$PKG" --verbose 2>&1
```

**Step 3: Check Against Spec**

Verify these requirements:
1. ✓ Root-relative paths (`../../../packages/...`)
2. ✓ Topological order (deps before dependents)
3. ✓ All workspace deps have references
4. ✓ No extra/missing references

**Step 4: Decision Branch**

IF all checks pass:
```yaml
# Update state
packages[current].status: "passed"
packages_passed: packages_passed + 1
current_package_index: current_package_index + 1
# Continue to next iteration
```

IF any check fails:
```yaml
# Log the issue
issues_found:
  - package: "$PKG"
    check: "[which check failed]"
    expected: "[spec requirement]"
    actual: "[what happened]"
# Attempt fix (see Fix Protocol below)
```

**Step 5: Fix Protocol (If Failed)**

1. Identify root cause in handler or utilities
2. Apply minimal fix
3. Re-run verification for SAME package
4. If still fails, document in handoff for manual review
5. If passes, mark as fixed and continue

---

## Termination Conditions

**Success (End Loop)**:
- All packages have `status: "passed"`
- `packages_passed == total_packages`

**Failure (Create Handoff)**:
- Same issue occurs 3+ times across packages
- Fix attempt fails to resolve issue
- Circular dependency or blocking issue found

To cancel: `/ralph-wiggum:cancel-ralph`

---

## Verification Workflow

### Phase A: Setup & Baseline

```bash
# 1. Restore all tsconfig files to git state (clean baseline)
git checkout packages/*/tsconfig.build.json packages/*/*/tsconfig.build.json

# 2. Get package list in topological order
PACKAGES=$(bun run repo-cli topo-sort 2>&1 | grep -E "^@beep/" | grep -v -E "^@beep/(web|mail|server$|repo-cli|testkit|tooling)")
```

### Phase B: Sequential Package Verification

For EACH package in topological order:

#### Step 1: Capture Original State

```bash
PKG="@beep/package-name"

# Find package directory
PKG_DIR=$(find packages -name "package.json" -exec grep -l "\"name\": \"$PKG\"" {} \; | head -1 | xargs dirname)

# Save originals
mkdir -p /tmp/tsconfig-verify/$PKG
cp "$PKG_DIR/tsconfig.build.json" "/tmp/tsconfig-verify/$PKG/original-tsconfig.json" 2>/dev/null || echo "No tsconfig.build.json"
cp "$PKG_DIR/package.json" "/tmp/tsconfig-verify/$PKG/original-package.json"
```

#### Step 2: Analyze Expected State

From the original package.json, determine:

1. **Direct workspace deps**: All `@beep/*` in dependencies, devDependencies, peerDependencies
2. **Transitive deps**: Recursive peer deps from each direct dep
3. **Expected references**: Topologically sorted list of tsconfig paths

#### Step 3: Run Command

```bash
bun run repo-cli tsconfig-sync --filter "$PKG" --verbose 2>&1 | tee "/tmp/tsconfig-verify/$PKG/output.log"
```

#### Step 4: Verify Results

Compare generated tsconfig.build.json against spec:

**Check 1: Path Format (L85-117)**
```bash
# All paths should match pattern: ../../../{packages|tooling}/...
grep -E '"path"' "$PKG_DIR/tsconfig.build.json" | grep -v '../../../'
# Should return NOTHING if correct
```

**Check 2: Topological Order (L119-136)**
```bash
# Extract reference package names from paths
# Verify order matches dependency graph (deps before dependents)
```

**Check 3: Complete References**
```bash
# Every workspace dep should have a corresponding reference
# Compare dep list vs reference list
```

**Check 4: No Extra References**
```bash
# No references to packages that aren't dependencies
```

#### Step 5: Document Findings

For each package, record:

```markdown
### @beep/package-name

**Status**: PASS | FAIL
**Workspace Deps**: [@beep/dep1, @beep/dep2, ...]
**Expected Refs**: [count]
**Actual Refs**: [count]

**Issues**:
- [ ] Issue description (if any)

**Evidence**:
```
[relevant output or diff]
```
```

---

## Issue Categories

Track issues by category for targeted fixes:

### Category 1: Path Format Issues
- Paths not root-relative
- Wrong depth calculation
- Absolute paths appearing

### Category 2: Topological Order Issues
- Dependents appearing before deps
- Inconsistent ordering between runs
- Circular reference handling

### Category 3: Missing References
- Workspace deps without references
- Transitive deps not hoisted
- DevDependencies ignored

### Category 4: Extra References
- References to non-dependencies
- Duplicate references
- Self-references

### Category 5: File Writing Issues
- JSON formatting problems
- Comment preservation failures
- Partial writes

---

## Output Deliverables

### 1. VERIFICATION_REPORT_P3.md

Create in `specs/tsconfig-sync-command/handoffs/`:

```markdown
# P3 Verification Report

**Date**: YYYY-MM-DD
**Packages Tested**: XX/XX
**Pass Rate**: XX%

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Path Issues | X | High |
| Order Issues | X | High |
| Missing Refs | X | Medium |
| Extra Refs | X | Low |

## Detailed Results

[Per-package results]

## Recommended Fixes

[Prioritized list]
```

### 2. Fix Handoff Documents

For each issue category with >0 issues, create:

**FIX_[CATEGORY].md**:

```markdown
# Fix Handoff: [Category Name]

## Problem Statement
[Clear description of the bug]

## Affected Packages
[List of packages exhibiting this issue]

## Root Cause Analysis
[Where in the code the bug originates]

## Spec Requirement
[Quote from spec that's being violated]

## Proposed Fix
[High-level approach]

## Files to Modify
[List of files]

## Test Cases
[How to verify the fix]
```

---

## Execution Checklist

Use this to track progress:

```markdown
## Common Layer
- [ ] @beep/types
- [ ] @beep/invariant
- [ ] @beep/identity
- [ ] @beep/utils
- [ ] @beep/schema
- [ ] @beep/constants
- [ ] @beep/errors
- [ ] @beep/wrap

## Shared Layer
- [ ] @beep/shared-domain
- [ ] @beep/shared-env
- [ ] @beep/shared-tables
- [ ] @beep/shared-server
- [ ] @beep/shared-client
- [ ] @beep/shared-ai

## IAM Slice
- [ ] @beep/iam-domain
- [ ] @beep/iam-tables
- [ ] @beep/iam-server

## Documents Slice
- [ ] @beep/documents-domain
- [ ] @beep/documents-tables
- [ ] @beep/documents-server

## Calendar Slice
- [ ] @beep/calendar-domain
- [ ] @beep/calendar-tables
- [ ] @beep/calendar-server
- [ ] @beep/calendar-client
- [ ] @beep/calendar-ui

## Comms Slice
- [ ] @beep/comms-domain
- [ ] @beep/comms-tables
- [ ] @beep/comms-server
- [ ] @beep/comms-client
- [ ] @beep/comms-ui

## Customization Slice
- [ ] @beep/customization-domain
- [ ] @beep/customization-tables
- [ ] @beep/customization-server
- [ ] @beep/customization-client
- [ ] @beep/customization-ui

## Knowledge Slice
- [ ] @beep/knowledge-domain
- [ ] @beep/knowledge-tables
- [ ] @beep/knowledge-server
- [ ] @beep/knowledge-client
- [ ] @beep/knowledge-ui

## UI Layer
- [ ] @beep/ui-core
- [ ] @beep/ui
- [ ] @beep/ui-editor

## Runtime
- [ ] @beep/runtime-client
```

---

## Critical Rules

1. **NEVER skip a package** - Every package must be verified
2. **ALWAYS restore baseline** - Start each package from git state
3. **Document EVERYTHING** - Even passes need brief notes
4. **Categorize issues** - Group for efficient fixing
5. **Create handoffs** - Issues get separate documents for fixers

---

## Quick Commands

```bash
# Restore all tsconfigs to baseline
git checkout packages/*/tsconfig.build.json packages/*/*/tsconfig.build.json

# Run on single package
bun run repo-cli tsconfig-sync --filter @beep/schema --verbose

# Check mode (no writes)
bun run repo-cli tsconfig-sync --filter @beep/schema --check

# Dry-run (preview)
bun run repo-cli tsconfig-sync --filter @beep/schema --dry-run

# Full repo check
bun run repo-cli tsconfig-sync --check
```

---

## Success Criteria

P3 verification is complete when:

1. ✅ All packages in checklist verified
2. ✅ VERIFICATION_REPORT_P3.md created
3. ✅ Fix handoffs created for all issue categories
4. ✅ Issues prioritized by severity
5. ✅ README.md success criteria updated with findings
