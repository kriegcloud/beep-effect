# Structure Standardization Orchestration Prompt

> Use this prompt to execute the refactoring plan in PLAN.md

## Context

You are refactoring the beep-effect monorepo to standardize naming conventions and structure. The complete inventory is in `/specs/structure-standardization/PLAN.md`. The target conventions are in `/specs/structure-standardization/CONVENTIONS.md`.

## Package Processing Order (CRITICAL)

**Process packages in REVERSE topological order** (consumers first, providers last).

### Execution Order (51 packages)

Process in this exact order:

1. @beep/web (many deps, depended on by none)
2. @beep/iam-ui
3. @beep/server
4. @beep/shared-ui
5. @beep/runtime-server *(12 layer file renames)*
6. @beep/iam-client *(1 directory rename)*
7. @beep/db-admin
8. @beep/shared-client *(2 file renames, 1 directory rename)*
9. @beep/iam-server *(30 repo file renames, 1 Db→client directory)*
10. @beep/customization-server *(1 repo file, 1 Db→client)*
11. @beep/documents-server *(9 file renames, 1 Db→client)*
12. @beep/comms-server *(1 repo file, 1 Db→client)*
13. @beep/runtime-client
14. @beep/iam-tables *(14 table file renames)*
15. @beep/documents-tables *(2 table file renames)*
16. @beep/customization-tables
17. @beep/comms-tables
18. @beep/ui *(3 directory renames)*
19. @beep/shared-tables
20. @beep/shared-server *(4 file renames, 1 Db→client)*
21. @beep/shared-env
22. @beep/iam-domain *(19 directory renames, 24 file renames)*
23. @beep/documents-domain *(5 directory renames, 9 file renames)*
24. @beep/customization-domain *(1 directory, 1 file)*
25. @beep/comms-domain *(1 directory, 1 file)*
26. @beep/shared-domain *(10 directory renames, 15 file renames)*

### Why REVERSE Order

1. **Consumer packages first** (bottom of topo-sort, e.g., `@beep/web`)
   - Have MOST dependencies (import from many)
   - Are depended upon by FEW/NONE
   - Internal renames don't break other packages
   - `build`, `check`, `lint` pass immediately after refactoring

2. **Provider packages last** (top of topo-sort, e.g., `@beep/shared-domain`)
   - Have FEW dependencies but are IMPORTED BY many
   - Renaming exports breaks all consumers
   - By processing last, consumers are already internally standardized
   - Update all consumer imports as part of provider refactor

---

## Critical Safety Rules

1. **Never delete without backup** - Git tracks everything, but be careful
2. **Update imports immediately** - After any rename, fix all imports before proceeding
3. **Validate after each package** - Build must pass before moving on
4. **Commit frequently** - One commit per package or logical unit
5. **Stop on errors** - Do not proceed if validation fails

---

## Execution Strategy

### Order of Operations per Package

Process categories in this order (lowest risk first):

1. **Category C: Missing Index Files** - Additive only, zero breaking changes
2. **Category B: File Renames** - Within same directory, update barrel only
3. **Category A: Directory Renames** - Cross-codebase import updates

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

---

## Category C: Adding Missing Index Files

For each missing index.ts:

```typescript
// packages/documents/server/src/files/index.ts
export * from "./exif-tool.service"
export * from "./pdf-metadata.service"
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
grep -rn "from.*OldName" packages/ --include="*.ts" | grep -v node_modules
```

4. **Validate**
```bash
bun run check --filter @beep/[package]
```

### Common File Renames in This Plan

| Current                | Target                  | Package          |
|------------------------|-------------------------|------------------|
| `Account.model.ts`     | `account.model.ts`      | iam-domain       |
| `Account.repo.ts`      | `account.repo.ts`       | iam-server       |
| `apiKey.table.ts`      | `api-key.table.ts`      | iam-tables       |
| `AuthContext.layer.ts` | `auth-context.layer.ts` | runtime-server   |
| `Comment.handlers.ts`  | `comment.handlers.ts`   | documents-server |

---

## Category A: Directory Renames

### Step-by-Step Process

1. **Rename the directory**
```bash
git mv packages/path/OldDir packages/path/new-dir
```

2. **Update internal imports within renamed directory**

3. **Find all external imports**
```bash
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

5. **Update barrel exports**
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

### Common Directory Renames in This Plan

| Current                       | Target                    | Package                         |
|-------------------------------|---------------------------|---------------------------------|
| `entities/Account/`           | `entities/account/`       | iam-domain                      |
| `entities/User/`              | `entities/user/`          | shared-domain                   |
| `db/Db/`                      | `db/client/`              | shared-server, iam-server, etc. |
| `services/EncryptionService/` | `services/encryption/`    | shared-domain                   |

---

## Validation Commands

### After Each File Change
```bash
bun run check --filter @beep/[package]
```

### After Each Package
```bash
bun run check --filter @beep/[package]
bun run lint:fix --filter @beep/[package]
bun run build --filter @beep/[package]
bun run test --filter @beep/[package]
```

### After Domain Package Renames (Category A)
```bash
# Cross-package validation (imports may cross boundaries)
bun run check
bun run build
```

### Final Validation
```bash
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
git commit -m "$(cat <<'EOF'
refactor(@beep/iam-domain): standardize naming conventions

- Rename entity directories to kebab-case
- Rename model files to kebab-case
- Update barrel exports
- Update internal imports

Part of structure-standardization spec

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### For Cross-Package Import Updates
```bash
git add packages/iam/ packages/shared/
git commit -m "$(cat <<'EOF'
refactor(iam,shared): update cross-package imports

- Update imports after iam-domain directory renames
- Fix shared-domain references

Part of structure-standardization spec

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
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
| @beep/runtime-server | 2026-01-XX | 12 layer renames | abc123 |
| @beep/iam-tables | 2026-01-XX | 14 table renames | def456 |
```

---

## Rollback Strategy

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

## Authorization Gates

**STOP and request user approval before:**

1. Starting a new package
2. Executing Category A (directory renames)
3. Committing changes
4. Any change that affects more than one package

**Never auto-proceed without explicit "continue" from user.**

---

## High-Impact Packages

These packages have the most changes and widest impact:

| Package              | Directory Renames | File Renames | Impact                 |
|----------------------|-------------------|--------------|------------------------|
| @beep/iam-domain     | 19                | 24           | HIGH - Many consumers  |
| @beep/shared-domain  | 10                | 15           | HIGHEST - All packages |
| @beep/ui             | 3                 | 0            | LOW - Non-Lexical only |
| @beep/iam-server     | 1                 | 30           | HIGH - Many repos      |
| @beep/runtime-server | 0                 | 12           | MEDIUM - Layer files   |

Process these last to minimize cascading impact.

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

---

## Edge Cases

### @beep/ui Lexical Components (EXCLUDED)
The Lexical editor's 44 PascalCase directories have been excluded from standardization.
They follow Lexical library conventions and are isolated under `lexical/mui/`.
Only 3 non-Lexical directories in @beep/ui require standardization:
- `AudioVisualizer/` → `audio-visualizer/`
- `LiveAudioVisualizer/` → `live-audio-visualizer/`
- `SimpleBar/` → `simple-bar/`

### Schema Files in Entities
Schema files like `DeviceCodeStatus.ts` need both directory and file rename:
- Directory: `DeviceCode/` → `device-code/`
- File: `DeviceCodeStatus.ts` → `device-code-status.schema.ts`

### Db → client Directory
This is a semantic rename (not just casing):
- `db/Db/Db.ts` → `db/client/client.ts`
- Update all imports referencing "Db"
