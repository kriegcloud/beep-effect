# Structure Standardization: Discovery & Planning Session

## Context

You are working in the `beep-effect` monorepo. The target naming conventions and structure patterns are defined in `/specs/structure-standardization/CONVENTIONS.md`.

Your task is to produce an **exhaustive inventory** of all files and directories that violate the conventions, and create a remediation plan.

## Your Deliverables

Create two files in `/specs/structure-standardization/`:

1. **`PLAN.md`** - Checklist of every violation with current → target paths
2. **`ORCHESTRATION_PROMPT.md`** - Instructions for executing the refactoring

---

## Phase 1: Discovery

### 1.1 Directory Naming Violations

Find directories using PascalCase (should be kebab-case):

```bash
# Find PascalCase directories in packages
find packages -type d -regex '.*/[A-Z][a-zA-Z]*' 2>/dev/null | grep -v node_modules | grep -v ".git"

# Specifically in src directories
find packages/*/src -type d 2>/dev/null | grep -E '/[A-Z][a-zA-Z]+$'

# Check entities directories (commonly PascalCase)
find packages -path "*/entities/*" -type d 2>/dev/null | grep -v node_modules
```

### 1.2 File Naming Violations

Find files with incorrect casing or missing suffixes:

```bash
# Find PascalCase .ts files (should be kebab-case)
find packages/*/src -name "*.ts" 2>/dev/null | grep -E '/[A-Z][a-zA-Z]+\.ts$' | grep -v node_modules | grep -v "\.d\.ts"

# Find service files with inconsistent naming
find packages -name "*Service.ts" 2>/dev/null | grep -v node_modules
find packages -name "*service.ts" -not -name "*.service.ts" 2>/dev/null | grep -v node_modules

# Find table files with inconsistent naming
find packages -name "*.table.ts" 2>/dev/null | grep -v node_modules

# Find model files - check for PascalCase
find packages -name "*.model.ts" 2>/dev/null | grep -v node_modules

# Find layer files
find packages -name "*.layer.ts" 2>/dev/null | grep -v node_modules

# Find repo files
find packages -name "*.repo.ts" 2>/dev/null | grep -v node_modules

# Find atom files (check singular vs plural)
find packages -name "*.atom.ts" 2>/dev/null | grep -v node_modules
find packages -name "*.atoms.ts" 2>/dev/null | grep -v node_modules
```

### 1.3 Missing Barrel Exports

Find directories without index.ts:

```bash
# Find src subdirectories without index.ts
for dir in $(find packages -type d -path "*/src/*" -not -path "*/node_modules/*" 2>/dev/null); do
  if [ -n "$(ls -A "$dir"/*.ts 2>/dev/null)" ] && [ ! -f "$dir/index.ts" ]; then
    echo "$dir"
  fi
done
```

### 1.4 Structure Violations

Check package internal structure:

```bash
# List structure of each package type
for pkg in packages/*/domain/src; do
  echo "=== $pkg ==="
  find "$pkg" -type d | head -20
done

for pkg in packages/*/server/src; do
  echo "=== $pkg ==="
  find "$pkg" -type d | head -20
done

for pkg in packages/*/client/src; do
  echo "=== $pkg ==="
  find "$pkg" -type d | head -20
done
```

---

## Phase 1.5: Determine Package Processing Order

Use the `topo-sort` CLI command to determine the optimal order for processing packages:

```bash
bun run beep topo-sort
```

### What topo-sort Does

The command outputs all `@beep/*` packages in **topological order**, with packages that have **fewer dependencies listed first** (leaf packages). This uses Kahn's algorithm to ensure:

1. Dependencies are always processed before their dependents
2. Circular dependencies are detected and reported
3. Output is deterministic (alphabetically sorted within each tier)

### Example Output

```
Analyzing workspace dependencies...

Found 45 packages in topological order:

@beep/types
@beep/invariant
@beep/identity
@beep/utils
@beep/schema
@beep/contract
@beep/shared-domain
@beep/iam-domain
...
@beep/runtime-server
@beep/web
```

### Why REVERSE Order Matters for Refactoring

**Process packages from BOTTOM to TOP of this list (reverse topological order).**

The topo-sort output shows packages with fewest dependencies first. For **structure refactoring**, we need the OPPOSITE order:

1. **Consumer packages first** (bottom of list, e.g., `@beep/web`)
   - Have the MOST dependencies (import from many packages)
   - Are depended upon by FEW/NONE
   - Internal renames don't break other packages
   - Can run `build`, `check`, `lint` and pass immediately

2. **Provider packages last** (top of list, e.g., `@beep/types`)
   - Have FEW dependencies but are DEPENDED UPON by many
   - Renaming exported files breaks all consumers
   - By processing last, all consumers are already refactored
   - Update consumer imports as part of the provider refactor

### The Problem with Forward Order

If you start with `@beep/types` and rename `unsafe.types.ts`:
- `@beep/types` passes validation ✓
- But `@beep/schema`, `@beep/utils`, and 40+ other packages now have broken imports
- Cannot validate ANY package until fixing imports across entire monorepo
- Context explodes, impossible to work incrementally

### Integrating with PLAN.md

When generating PLAN.md, **REVERSE the topo-sort output**:

```markdown
## Execution Order (Reverse Topological)

Process packages in this exact order (consumers first, providers last):

1. @beep/web (many deps, depended on by none)
2. @beep/runtime-server
3. @beep/iam-ui
...
N-2. @beep/invariant (1 dep, depended on by many)
N-1. @beep/identity (1 dep, depended on by many)
N. @beep/types (0 deps, depended on by almost all)
```

This ensures that when you rename something in `@beep/types`, all packages that import from it have already been internally standardized - you just update their import paths.

---

## Phase 2: Categorize Violations

For each violation found, categorize by type:

### Category A: Directory Renames
Files that need directory path changes (highest impact):
- Affects imports across the codebase
- Requires updating all references

### Category B: File Renames
Files that need name changes:
- May affect imports
- Requires updating barrel exports

### Category C: Missing Index Files
Directories needing new index.ts:
- Low risk, additive change
- Improves import ergonomics

### Category D: Structure Reorganization
Files that need to move to different directories:
- Highest complexity
- May require phased approach

---

## Phase 3: Create PLAN.md

### Required Structure

```markdown
# Structure Standardization Plan

> Generated: [DATE]
> Total Changes: [COUNT]

## Summary

| Category | Count | Complexity |
|----------|-------|------------|
| Directory Renames | X | High |
| File Renames | X | Medium |
| Missing Index Files | X | Low |
| Structure Reorganization | X | High |

## Impact Analysis

### Packages by Change Count
| Package | Changes | Priority |
|---------|---------|----------|
| @beep/iam-domain | X | P1 |
| @beep/shared-server | X | P1 |

---

## Category A: Directory Renames

### @beep/iam-domain

- [ ] `packages/iam/domain/src/entities/Account/` → `packages/iam/domain/src/entities/account/`
  - Files affected: [list files]
  - Imports to update: [count]

- [ ] `packages/iam/domain/src/entities/ApiKey/` → `packages/iam/domain/src/entities/api-key/`
  - Files affected: [list files]
  - Imports to update: [count]

### @beep/shared-domain

- [ ] `packages/shared/domain/src/entities/User/` → `packages/shared/domain/src/entities/user/`
  ...

---

## Category B: File Renames

### @beep/iam-domain

- [ ] `packages/iam/domain/src/entities/account/Account.model.ts` → `account.model.ts`
  - Update barrel export in index.ts

- [ ] `packages/iam/server/src/services/EncryptionService.ts` → `encryption.service.ts`
  - Update barrel export
  - Update imports in: [list files]

### @beep/iam-tables

- [ ] `packages/iam/tables/src/tables/deviceCodes.table.ts` → `device-codes.table.ts`
- [ ] `packages/iam/tables/src/tables/apiKey.table.ts` → `api-key.table.ts`

---

## Category C: Missing Index Files

- [ ] Create `packages/iam/server/src/handlers/index.ts`
  - Export: user.handlers.ts, team.handlers.ts, ...

- [ ] Create `packages/shared/server/src/services/index.ts`
  - Export: email.service.ts, ...

---

## Category D: Structure Reorganization

### @beep/iam-server

Current:
```
src/
├── db/
│   ├── Db/           ← Should be client/
│   └── repos/        ← Correct
```

Target:
```
src/
├── db/
│   ├── client/
│   └── repos/
```

Changes:
- [ ] Rename `db/Db/` → `db/client/`
- [ ] Update imports referencing Db/

---

## Execution Order

Process in this order to minimize breakage:

1. **Missing Index Files** (additive, no breaking changes)
2. **File Renames within same directory** (update barrel only)
3. **Directory Renames** (update imports across codebase)
4. **Structure Reorganization** (most complex, do last)
```

### Requirements

1. **Every change must have a checkbox** `- [ ]`
2. **Every change must show current → target path**
3. **Group by package, then by category**
4. **Include impact analysis** (files affected, imports to update)
5. **Provide execution order** to minimize breakage

---

## Phase 4: Create ORCHESTRATION_PROMPT.md

Create execution instructions using the template in `ORCHESTRATION_TEMPLATE.md`.

Customize for this specific plan:
- Include the specific renames from PLAN.md
- Add validation commands for each category
- Include rollback instructions

---

## Execution Instructions

1. **Run all discovery commands** from Phase 1
2. **Parse results** into categorized lists
3. **Verify each finding** - some may be intentional
4. **Generate PLAN.md** following the structure
5. **Generate ORCHESTRATION_PROMPT.md** for execution
6. **Report summary** with counts by category

## False Positives

Some findings may be intentional:

- `node_modules/` directories - always exclude
- Generated files in `_generated/` - may have different rules
- Test fixtures - may intentionally violate conventions
- Third-party integrations - may require specific naming

When uncertain, include in plan with `[VERIFY]` tag.

## Output

When complete, report:
1. Total violations by category
2. Packages ranked by change count
3. Estimated complexity (based on import updates needed)
4. Any ambiguous cases requiring human review
