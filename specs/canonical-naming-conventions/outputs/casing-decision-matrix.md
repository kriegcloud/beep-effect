# Casing Decision Matrix

> Phase 2 deliverable: Casing convention decisions with rationale and migration cost analysis.

---

## Executive Summary

After synthesizing internal patterns and external research, **kebab-case** is recommended as the primary file naming convention, aligning with Effect-TS official patterns. PascalCase is preserved for repository files (`.repo.ts`) and server handlers (`.handlers.ts`) where the casing encodes the entity name. This hybrid approach minimizes migration cost while achieving consistency with the Effect ecosystem.

---

## 1. Current State Analysis

### 1.1 Observed Casing Patterns

| Pattern | File Type | Example | Count |
|---------|-----------|---------|-------|
| **kebab-case** | Entity folders | `api-key/`, `sign-in/` | ~100 |
| **kebab-case** | Schema files (iam-domain) | `member-status.ts` | ~20 |
| **kebab-case** | Table files (shared) | `upload-session.table.ts` | ~15 |
| **camelCase** | Table files (iam/documents) | `apiKey.table.ts` | ~30 |
| **PascalCase** | Schema files (shared-domain) | `SubscriptionStatus.schema.ts` | ~10 |
| **PascalCase** | Repo files | `Member.repo.ts` | ~38 |
| **PascalCase** | Handler files (server) | `Document.handlers.ts` | ~3 |

### 1.2 Inconsistency Impact

| Inconsistency | Files Affected | Grep Impact |
|---------------|----------------|-------------|
| Table file casing | ~45 files | Cannot grep all tables with single pattern |
| Schema file casing | ~30 files | Cannot grep all schemas with single pattern |
| Mixed layer conventions | ~80+ files | Confusion about "correct" pattern |

---

## 2. External Research Findings

### 2.1 Effect-TS Official Convention

**Source**: Effect GitHub repository (HIGH credibility)

Effect official packages use:
- **File names**: kebab-case (`http-client.ts`, `sql-client.ts`)
- **Namespace exports**: PascalCase (`export * as HttpClient from "./http-client.js"`)
- **Internal separation**: `internal/` directory

**Evidence**:
```typescript
// packages/platform/src/index.ts
export * as HttpClient from "./http-client.js"
export * as HttpServer from "./http-server.js"
export * as FileSystem from "./file-system.js"
```

### 2.2 FP Language Conventions

**Source**: Haskell, Elm, PureScript, OCaml (HIGH credibility)

All FP languages use PascalCase for module identifiers:
- Haskell: `Data.User.Repository.hs`
- Elm: `User/Repository.elm`
- PureScript: `Data.User.Repository.purs`

**Effect diverges from FP tradition** to align with JavaScript ecosystem norms.

### 2.3 JavaScript/TypeScript Ecosystem

**Source**: npm, React, Next.js patterns (MEDIUM credibility)

JavaScript ecosystem generally uses:
- kebab-case for package names (`@effect/platform`)
- kebab-case for file names (`http-client.ts`)
- PascalCase for class/type files (`UserService.ts`) — but declining

---

## 3. Decision Matrix

### 3.1 File Name Casing

| File Type | Recommended Casing | Current State | Migration Cost |
|-----------|-------------------|---------------|----------------|
| **Entity folders** | kebab-case | kebab-case | None |
| **Feature folders** | kebab-case | kebab-case | None |
| **Table files** | kebab-case | Mixed (camelCase/kebab) | ~30 renames |
| **Schema files** | kebab-case | Mixed (kebab/PascalCase) | ~10 renames |
| **Model files** | kebab-case | kebab-case | None |
| **Repo files** | PascalCase | PascalCase | None |
| **Handler files (client)** | kebab-case | kebab-case | None |
| **Handler files (server)** | PascalCase | PascalCase | None |
| **Service files** | kebab-case | Mixed | ~5 renames |

### 3.2 Folder Name Casing

| Folder Type | Recommended Casing | Example |
|-------------|-------------------|---------|
| **Package names** | kebab-case | `iam-domain`, `shared-client` |
| **Entity directories** | kebab-case | `entities/api-key/` |
| **Feature directories** | kebab-case | `sign-in/email/` |
| **Layer directories** | kebab-case | `db/repos/` |
| **Internal directories** | underscore-prefix | `_internal/`, `_common/` |

---

## 4. Detailed Decisions

### 4.1 Decision: kebab-case for Table Files

**Current Pattern**: Mixed
- `@beep/iam-tables`: `apiKey.table.ts`, `deviceCodes.table.ts` (camelCase)
- `@beep/shared-tables`: `upload-session.table.ts` (kebab-case)

**Recommendation**: Standardize on **kebab-case**.

**Rationale**:
1. **Effect alignment**: Official Effect packages use kebab-case
2. **Grep consistency**: Single pattern `find -name "*.table.ts"` works
3. **Entity folder alignment**: Entity folders already use kebab-case (`api-key/`)
4. **Newer code**: shared-tables (newer) uses kebab-case; iam-tables (older) uses camelCase

**Migration**:
```bash
# Example renames
apiKey.table.ts → api-key.table.ts
deviceCodes.table.ts → device-codes.table.ts
oauthAccessToken.table.ts → oauth-access-token.table.ts
```

**Files Affected**: ~30 files in iam-tables, documents-tables, knowledge-tables

---

### 4.2 Decision: kebab-case for Schema Files

**Current Pattern**: Mixed
- `@beep/iam-domain`: `member-status.ts` (kebab-case, no postfix)
- `@beep/shared-domain`: `SubscriptionStatus.schema.ts` (PascalCase, with postfix)

**Recommendation**: Standardize on **kebab-case with `.schema.ts` postfix**.

**Rationale**:
1. **Effect alignment**: Effect uses kebab-case file names
2. **Entity folder alignment**: Schemas are in kebab-case entity folders
3. **Greppability**: `.schema.ts` postfix enables discovery

**Migration**:
```bash
# Example renames
SubscriptionStatus.schema.ts → subscription-status.schema.ts
member-status.ts → member-status.schema.ts  # Add postfix
```

**Files Affected**: ~15 renames + ~15 postfix additions

---

### 4.3 Decision: Preserve PascalCase for Repos and Server Handlers

**Current Pattern**: Consistent PascalCase
- `Member.repo.ts`, `Document.handlers.ts`

**Recommendation**: **Preserve PascalCase**.

**Rationale**:
1. **100% consistency**: All 38 repo files use this pattern
2. **Entity name encoding**: PascalCase matches the entity name (`Member.repo.ts` → `Member` entity)
3. **Visual distinction**: Differentiates infrastructure files from domain files
4. **Migration cost**: Zero (no change needed)

---

### 4.4 Exception: PascalCase for React Components

**Recommendation**: Allow **PascalCase** for React components where community convention expects it.

**Current Pattern**:
- Most components: `sign-in.view.tsx` (kebab-case)
- Some utility components: `FormHead.tsx` (PascalCase)

**Guidance**:
- Page views: kebab-case (`sign-in.view.tsx`)
- Reusable components: kebab-case (`form-head.tsx`)
- Exception: External components following library conventions

---

## 5. Trade-off Analysis

### 5.1 kebab-case Adoption

| Benefit | Evidence |
|---------|----------|
| Effect ecosystem alignment | Official packages use kebab-case |
| Cross-platform safety | No case-sensitivity issues (Windows/macOS) |
| URL-safe | Can be used in URLs without encoding |
| Grep simplicity | Consistent patterns for tooling |

| Cost | Mitigation |
|------|------------|
| ~45 file renames | Automated with sed/rename script |
| Import path updates | IDE refactoring or codemod |
| Git history | Use `git mv` to preserve history |

### 5.2 Mixed Approach (Hybrid)

| Pattern | Applies To | Rationale |
|---------|------------|-----------|
| kebab-case | Most files | Effect alignment, grep consistency |
| PascalCase | `.repo.ts`, `.handlers.ts` (server) | Entity name encoding, 100% existing adoption |

---

## 6. Migration Cost Estimate

| Category | Files Affected | Effort |
|----------|----------------|--------|
| Table files (camelCase → kebab) | ~30 | Low (automated) |
| Schema files (PascalCase → kebab) | ~10 | Low (automated) |
| Schema files (add postfix) | ~15 | Low (automated) |
| Import path updates | ~100+ | Medium (IDE assist) |
| Test file updates | ~20 | Medium (verify patterns) |

**Total Estimated Renames**: ~55 files
**Estimated Effort**: 2-4 hours with automated tooling

---

## 7. Implementation Strategy

### 7.1 Phase 1: Audit and Script

```bash
# Find files needing casing changes
find packages -name "*.table.ts" -name "*[A-Z]*"
find packages -path "*/schemas/*" -name "[A-Z]*"

# Generate rename list
for f in $(find packages -name "*.table.ts" -name "*[A-Z]*"); do
  dir=$(dirname "$f")
  base=$(basename "$f" .table.ts)
  kebab=$(echo "$base" | sed 's/\([A-Z]\)/-\L\1/g' | sed 's/^-//')
  echo "git mv \"$f\" \"$dir/$kebab.table.ts\""
done
```

### 7.2 Phase 2: Execute Renames

```bash
# Use git mv to preserve history
git mv packages/iam/tables/src/tables/apiKey.table.ts packages/iam/tables/src/tables/api-key.table.ts
```

### 7.3 Phase 3: Update Imports

Use IDE refactoring or codemod to update all import paths.

### 7.4 Phase 4: Verify

```bash
# Ensure no mixed casing remains
find packages -name "*.table.ts" | xargs -I {} basename {} | sort | uniq
bun run check
bun run test
```

---

## 8. Decision Summary

| Category | Decision | Migration Required |
|----------|----------|-------------------|
| Folders | kebab-case | No |
| Table files | kebab-case | Yes (~30 files) |
| Schema files | kebab-case + `.schema.ts` | Yes (~25 files) |
| Model files | kebab-case | No |
| Repo files | PascalCase (preserve) | No |
| Server handlers | PascalCase (preserve) | No |
| Client feature files | kebab-case (semantic) | No |
| React components | kebab-case (default) | Minimal |

---

*Generated: Phase 2 - Synthesis*
*Evidence Sources: Phase 0 (inconsistency-report.md), Phase 1 (fp-repo-conventions.md, industry-best-practices.md)*
