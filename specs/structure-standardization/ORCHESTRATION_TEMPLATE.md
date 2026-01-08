# Structure Standardization Orchestration Prompt

> Use this prompt to execute the refactoring plan in PLAN.md

## Context

You are refactoring the beep-effect monorepo to standardize naming conventions and structure. The complete inventory is in `/specs/structure-standardization/PLAN.md`. The target conventions are in `/specs/structure-standardization/CONVENTIONS.md`.

## Package Processing Order (CRITICAL)

**Process packages in REVERSE topological order** (consumers first, providers last).

### Get the Order

```bash
bun run beep topo-sort
```

This outputs packages with **fewest dependencies first**. For structure refactoring, **REVERSE this list**:

```
@beep/types          ← Process LAST (0 deps, but depended on by all)
@beep/invariant
@beep/identity
@beep/utils
@beep/schema
@beep/contract
@beep/shared-domain
@beep/iam-domain
...
@beep/runtime-server
@beep/web            ← Process FIRST (many deps, depended on by none)
```

### Why REVERSE Order

1. **Consumer packages first** (bottom of topo-sort, e.g., `@beep/web`)
   - Have MOST dependencies (import from many)
   - Are depended upon by FEW/NONE
   - Internal renames don't break other packages
   - `build`, `check`, `lint` pass immediately after refactoring

2. **Provider packages last** (top of topo-sort, e.g., `@beep/types`)
   - Have FEW dependencies but are IMPORTED BY many
   - Renaming exports breaks all consumers
   - By processing last, consumers are already internally standardized
   - Update all consumer imports as part of provider refactor

### The Problem with Forward Order

If you start with `@beep/types` and rename `unsafe.types.ts`:
- `@beep/types` itself passes validation ✓
- But 40+ packages with `import from "@beep/types/unsafe.types"` break
- Cannot validate ANY package until fixing all imports
- Context explodes, incremental validation impossible

**Process from BOTTOM to TOP of topo-sort output. Never skip ahead to a package higher in the list.**

## Critical Validation Requirement

**After EVERY package refactor, ALL dependent packages must pass validation.**

When you refactor package X and rename its exports:
1. Previously-processed packages that import from X now have broken imports
2. You MUST update their import paths immediately
3. You MUST re-validate ALL affected packages before proceeding

### The Complete Per-Package Flow

```
For each package X (in reverse topo order):
  1. Refactor X (internal structure, file renames, export renames)
  2. Update barrel exports in X
  3. Validate X passes: check, build, test, lint:fix
  4. Find all ALREADY-PROCESSED packages that import from X
  5. Update their imports to use new paths
  6. Re-validate ALL affected packages pass: check, build, test, lint:fix
  7. Commit X + all import updates together
  8. Only then proceed to next package
```

### Example: Processing @beep/iam-ui

```bash
# 1. @beep/web was already processed (it's a consumer)
# 2. Now refactoring @beep/iam-ui

# Step 1-3: Refactor iam-ui and validate it
git mv packages/iam/ui/src/SignIn/ packages/iam/ui/src/sign-in/
# Update internal imports...
bun run check --filter @beep/iam-ui  # Must pass

# Step 4-5: Find and fix dependent packages
grep -rn "@beep/iam-ui" apps/web/src --include="*.ts" --include="*.tsx"
# Update any imports referencing old paths

# Step 6: Re-validate ALL affected packages
bun run check --filter @beep/iam-ui --filter @beep/web
bun run build --filter @beep/iam-ui --filter @beep/web
bun run test --filter @beep/iam-ui --filter @beep/web
bun run lint:fix --filter @beep/iam-ui --filter @beep/web

# Step 7: Commit everything together
git add packages/iam/ui/ apps/web/
git commit -m "refactor(@beep/iam-ui): standardize structure

- Rename SignIn/ to sign-in/
- Update exports
- Update imports in @beep/web"
```

### Why This Works Better Than Forward Order

**Reverse order (our strategy):**
- When refactoring `@beep/iam-ui`, only `@beep/web` is affected (1 package)
- `@beep/web` was already internally refactored - just update import paths
- Small, bounded set of changes per step

**Forward order:**
- When refactoring `@beep/types`, 40+ packages break simultaneously
- None of them have been refactored yet
- Must fix imports AND refactor each one - unbounded scope

## Critical Safety Rules

1. **Never delete without backup** - Git tracks everything, but be careful
2. **Update imports immediately** - After any rename, fix all imports before proceeding
3. **Validate after each package** - Build must pass before moving on
4. **Commit frequently** - One commit per package or logical unit
5. **Stop on errors** - Do not proceed if validation fails

---

## Execution Strategy

### Order of Operations

Process categories in this order (lowest risk first):

1. **Category C: Missing Index Files** - Additive only, zero breaking changes
2. **Category B: File Renames** - Within same directory, update barrel only
3. **Category A: Directory Renames** - Cross-codebase import updates
4. **Category D: Structure Reorganization** - Most complex, do last

### For Each Package (Detailed)

1. **Read** the package section from PLAN.md
2. **Execute** changes in category order (C → B → A → D)
3. **Update barrel exports** within the package
4. **Validate** the package itself passes:
   ```bash
   bun run check --filter @beep/[package]
   bun run build --filter @beep/[package]
   bun run test --filter @beep/[package]
   bun run lint:fix --filter @beep/[package]
   ```
5. **Find affected dependents** (already-processed packages):
   ```bash
   grep -rn "@beep/[package]" apps/ packages/ --include="*.ts" --include="*.tsx" | grep -v node_modules
   ```
6. **Update imports** in all affected packages
7. **Re-validate ALL affected packages**:
   ```bash
   bun run check --filter @beep/[package] --filter @beep/[dependent1] --filter @beep/[dependent2]
   bun run build --filter @beep/[package] --filter @beep/[dependent1] --filter @beep/[dependent2]
   bun run test --filter @beep/[package] --filter @beep/[dependent1] --filter @beep/[dependent2]
   ```
8. **Commit** the package + all import updates together
9. **Mark checkboxes** complete in PLAN.md
10. **Only then** proceed to next package

**CRITICAL: Steps 5-7 are mandatory. Never skip them. All validation must pass before proceeding.**

---

## Category C: Adding Missing Index Files

For each missing index.ts:

1. **List files in directory**
2. **Create index.ts with exports**
3. **Validate**

### Pattern

```typescript
// packages/example/src/handlers/index.ts
export * from "./user.handlers"
export * from "./team.handlers"
export * from "./document.handlers"
```

### Validation
```bash
bun run check --filter @beep/[package]
```

---

## Category B: File Renames

### Step-by-Step Process

1. **Rename the file**
```bash
git mv packages/path/OldName.ts packages/path/new-name.ts
```

2. **Update the barrel export**
```typescript
// Before
export * from "./OldName"

// After
export * from "./new-name"
```

3. **Find and update imports**
```bash
# Find files importing the old name
grep -rn "from.*OldName" packages/ --include="*.ts" | grep -v node_modules
```

4. **Update each import**
```typescript
// Before
import { Something } from "./OldName"

// After
import { Something } from "./new-name"
```

5. **Validate**
```bash
bun run check --filter @beep/[package]
```

### Common File Renames

| Current                | Target                  | Notes                   |
|------------------------|-------------------------|-------------------------|
| `UserService.ts`       | `user.service.ts`       | PascalCase → kebab-case |
| `Account.model.ts`     | `account.model.ts`      | PascalCase → kebab-case |
| `deviceCodes.table.ts` | `device-codes.table.ts` | camelCase → kebab-case  |
| `apiKey.table.ts`      | `api-key.table.ts`      | camelCase → kebab-case  |

---

## Category A: Directory Renames

### Step-by-Step Process

1. **Rename the directory**
```bash
git mv packages/path/OldDir packages/path/new-dir
```

2. **Update internal imports within renamed directory**
The relative imports within the directory may still work, but verify.

3. **Find all external imports**
```bash
# Find all files importing from old path
grep -rn "@beep/package-name.*OldDir" packages/ apps/ --include="*.ts" | grep -v node_modules
grep -rn "from.*OldDir" packages/ --include="*.ts" | grep -v node_modules
```

4. **Update each import**
```typescript
// Before
import { Entity } from "@beep/iam-domain/entities/Account"

// After
import { Entity } from "@beep/iam-domain/entities/account"
```

5. **Update barrel exports if needed**
```typescript
// Before
export * as Account from "./Account"

// After
export * as Account from "./account"
```

6. **Validate**
```bash
bun run check --filter @beep/[package]
bun run build --filter @beep/[package]
```

### Common Directory Renames

| Current             | Target              | Package       |
|---------------------|---------------------|---------------|
| `entities/Account/` | `entities/account/` | iam-domain    |
| `entities/ApiKey/`  | `entities/api-key/` | iam-domain    |
| `entities/User/`    | `entities/user/`    | shared-domain |
| `entities/Team/`    | `entities/team/`    | shared-domain |
| `db/Db/`            | `db/client/`        | shared-server |

---

## Category D: Structure Reorganization

These changes move files between directories. Handle with extra care.

### Step-by-Step Process

1. **Create target directory if needed**
```bash
mkdir -p packages/path/new-location
```

2. **Move files**
```bash
git mv packages/path/old-location/file.ts packages/path/new-location/file.ts
```

3. **Create/update barrel exports in both locations**

4. **Update all imports** (may be many)
```bash
grep -rn "from.*old-location" packages/ apps/ --include="*.ts"
```

5. **Validate entire monorepo**
```bash
bun run check
bun run build
```

---

## Validation Commands

### After Each File Change
```bash
# Type check the specific package
bun run check --filter @beep/[package]
```

### After Each Package
```bash
# Full validation
bun run check --filter @beep/[package]
bun run lint:fix --filter @beep/[package]
bun run build --filter @beep/[package]
bun run test --filter @beep/[package]
```

### After Category A (Directory Renames)
```bash
# Cross-package validation (imports may cross boundaries)
bun run check
bun run build
```

### Final Validation
```bash
# Full monorepo build
bun run check
bun run build
bun run test
```

---

## Import Update Patterns

### Namespace Imports
```typescript
// Before
import * as Account from "./Account"
import * as Account from "@beep/iam-domain/entities/Account"

// After
import * as Account from "./account"
import * as Account from "@beep/iam-domain/entities/account"
```

### Named Imports
```typescript
// Before
import { AccountModel } from "./Account/Account.model"

// After
import { AccountModel } from "./account/account.model"
```

### Re-exports
```typescript
// Before
export * as Account from "./Account"

// After
export * as Account from "./account"
```

---

## Commit Strategy

### One Commit Per Package (Recommended)
```bash
git add packages/iam/domain/
git commit -m "refactor(@beep/iam-domain): standardize naming conventions

- Rename entity directories to kebab-case
- Rename model files to kebab-case
- Update barrel exports
- Update internal imports

Part of structure-standardization spec"
```

### For Cross-Package Changes
```bash
git add packages/iam/ packages/shared/
git commit -m "refactor(iam,shared): update cross-package imports

- Update imports after iam-domain directory renames
- Fix shared-domain references

Part of structure-standardization spec"
```

---

## Progress Tracking

Update PLAN.md as you complete items:
- `- [ ]` → `- [x]`

Add completion log:
```markdown
## Completion Log

| Package | Date | Changes | Commit |
|---------|------|---------|--------|
| @beep/iam-domain | 2024-XX-XX | 15 renames | abc123 |
| @beep/shared-server | 2024-XX-XX | 8 renames | def456 |
```

---

## Rollback Strategy

If something goes wrong:

### Undo Uncommitted Changes
```bash
git checkout -- packages/[path]
```

### Undo Last Commit
```bash
git reset --soft HEAD~1
```

### Revert Specific Commit
```bash
git revert [commit-hash]
```

---

## Edge Cases

### Files with Multiple Exports
When renaming a file that exports multiple things, ensure the barrel export is updated:

```typescript
// account.model.ts exports AccountModel, AccountInsert, AccountUpdate
// index.ts must re-export all of them
export * from "./account.model"  // This re-exports everything
```

### Circular Imports
If renaming causes circular import issues:
1. Check the dependency graph
2. May need to restructure exports
3. Consider lazy imports if needed

### Type-Only Imports
```typescript
// These also need updating
import type { AccountModel } from "./Account/Account.model"
// →
import type { AccountModel } from "./account/account.model"
```

### Path Aliases
Check if path aliases in `tsconfig.base.jsonc` need updating:
```json
{
  "paths": {
    "@beep/iam-domain/*": ["packages/iam/domain/src/*"]
  }
}
```

---

## Authorization Gates

**STOP and request user approval before:**

1. Starting a new package
2. Executing Category A (directory renames)
3. Executing Category D (structure reorganization)
4. Committing changes
5. Any change that affects more than one package

**Never auto-proceed without explicit "continue" from user.**

---

## Troubleshooting

### Import Not Found After Rename
1. Check spelling of new path
2. Verify barrel export was updated
3. Check for case-sensitivity issues
4. Run `bun install` to refresh module resolution

### Build Fails After Multiple Renames
1. Run `bun run clean` if available
2. Delete `node_modules/.cache`
3. Run `bun install`
4. Retry build

### Git Shows Deletion + Addition Instead of Rename
Use `git mv` instead of manual rename:
```bash
git mv old-path new-path
```

Git tracks renames better this way, preserving history.
