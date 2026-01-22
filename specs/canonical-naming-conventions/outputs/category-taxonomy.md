# Category Taxonomy

> Phase 2 deliverable: Synthesized file category taxonomy with standardized postfixes.

---

## Status Legend

| Status | Meaning |
|--------|---------|
| **CURRENT** | Pattern is already followed in codebase |
| **TARGET** | Aspirational pattern requiring migration |
| **PARTIAL** | Some adoption, inconsistent across slices |
| **RESERVED** | Defined for future use, not yet adopted |

---

## Executive Summary

This taxonomy defines **18 active postfixes** mapped to architectural layers, consolidating the 66 file categories observed in Phase 0 into a greppable, consistent naming system. Each postfix is justified by internal adoption patterns and external research evidence.

**Key distinction**: This document differentiates between:
- **Dot-prefixed postfixes**: `{entity}.{postfix}.ts` (entity-named files)
- **Semantic filenames**: `{role}.ts` (context-named files within feature directories)

---

## 1. Postfix Taxonomy by Layer

### 1.1 DOMAIN Layer Postfixes

| Postfix | Purpose | Grep Pattern | Internal Evidence | Status |
|---------|---------|--------------|-------------------|--------|
| `.model.ts` | Domain entity (Effect Schema class) | `*.model.ts` | 46 files, 100% consistency | CURRENT |
| `.errors.ts` | Domain error definitions | `*.errors.ts` | 8 files (documents only) | PARTIAL |
| `.rpc.ts` | RPC contract definitions | `*.rpc.ts` | 3 files (documents only) | PARTIAL |
| `.value.ts` | Value objects | `*.value.ts` | 0 current, 17 need migration | TARGET |
| `.schema.ts` | Validation/enum schemas | `*.schema.ts` | 1 file current, 15+ need postfix | TARGET |

**External Evidence**: DDD Entity pattern, DDD Value Object, Effect Schema convention.

---

### 1.2 TABLES Layer Postfixes

| Postfix | Purpose | Grep Pattern | Internal Evidence | Status |
|---------|---------|--------------|-------------------|--------|
| `.table.ts` | Drizzle table definition | `*.table.ts` | 45 files, 100% postfix adoption | CURRENT (casing migration: 19 files) |

**Note**: Postfix adoption is 100%. Only casing requires standardization (camelCase → kebab-case).

---

### 1.3 SERVER Layer Postfixes

| Postfix | Purpose | Grep Pattern | Internal Evidence | Status |
|---------|---------|--------------|-------------------|--------|
| `.repo.ts` | Database repository | `*.repo.ts` | 38 files, 100% consistency | CURRENT |
| `.handlers.ts` | RPC handler collection | `*.handlers.ts` | 3 files (documents) | CURRENT |
| `.job.ts` | Background job | `*.job.ts` | 0 current | TARGET |

**Note**: Server layer uses **dot-prefixed postfixes** because files are entity-named.

---

### 1.4 CLIENT Layer Postfixes (Semantic Filenames)

| Pattern | Purpose | Grep Pattern | Internal Evidence | Status |
|---------|---------|--------------|-------------------|--------|
| `contract.ts` | RPC payload/success schemas | `**/contract.ts` | 34 files, 100% consistency | CURRENT |
| `handler.ts` | Effect-based RPC handler | `**/handler.ts` | 34 files, 100% consistency | CURRENT |
| `layer.ts` | Feature Layer composition | `**/layer.ts` | 15 files | CURRENT |
| `service.ts` | Feature service aggregation | `**/service.ts` | 15 files | CURRENT |
| `atoms.ts` | Atom collection file | `**/atoms.ts` | 10 files | CURRENT |
| `form.ts` | Form validation schema | `**/form.ts` | 8 files | CURRENT |
| `mod.ts` | Module aggregation | `**/mod.ts` | 49 files | CURRENT |

**Critical note**: Client layer uses **semantic filenames** (no dot prefix) because directory context provides meaning. The file `handler.ts` is NOT `.handler.ts`.

---

### 1.5 UI Layer Postfixes

| Postfix | Purpose | Grep Pattern | Internal Evidence | Status |
|---------|---------|--------------|-------------------|--------|
| `.view.tsx` | Page-level view component | `*.view.tsx` | 2 files | CURRENT |
| `.form.tsx` | Form component | `*.form.tsx` | 3 files | CURRENT |

**Reserved postfixes** (defined but not yet adopted):
- `.dialog.tsx` - Modal dialog component
- `.provider.tsx` - React context provider
- `.context.ts` - React context definition

---

### 1.6 COMMON Layer Postfixes

| Postfix | Purpose | Grep Pattern | Internal Evidence | Status |
|---------|---------|--------------|-------------------|--------|
| `.types.ts` | TypeScript type definitions | `*.types.ts` | 16 files | CURRENT |

**Reserved postfixes** (defined but not yet adopted):
- `.utils.ts` - Utility functions
- `.constants.ts` - Constant definitions

**Note**: Current utils/constants use directory structure (`packages/common/utils/`) instead of file postfixes.

---

### 1.7 BARREL/MODULE Patterns

| Pattern | Purpose | Grep Pattern | Internal Evidence | Status |
|---------|---------|--------------|-------------------|--------|
| `index.ts` | Public API export | `**/index.ts` | 432 files | CURRENT |
| `mod.ts` | Internal module aggregation | `**/mod.ts` | 49 files | CURRENT |

---

## 2. Layer-Postfix Mapping

| Layer | Exclusive Postfixes | Shared Patterns | Status |
|-------|---------------------|-----------------|--------|
| **domain** | `.model.ts`, `.errors.ts`, `.rpc.ts`, `.value.ts`, `.schema.ts` | — | PARTIAL |
| **tables** | `.table.ts` | — | CURRENT |
| **server** | `.repo.ts`, `.handlers.ts`, `.job.ts` | — | CURRENT |
| **client** | `contract.ts`, `handler.ts`, `atoms.ts`, `form.ts` | `service.ts`, `layer.ts`, `mod.ts` | CURRENT |
| **ui** | `.view.tsx`, `.form.tsx` | — | CURRENT |
| **common** | `.types.ts` | — | CURRENT |
| **all** | — | `index.ts` | CURRENT |

---

## 3. New Postfixes (TARGET Status)

### 3.1 `.value.ts` — Value Objects

**Problem**: 17 value objects have no semantic postfix, making discovery impossible.

**Files Affected** (complete list):

```
# packages/knowledge/domain/src/value-objects/
Attributes.ts → attributes.value.ts
EvidenceSpan.ts → evidence-span.value.ts

# packages/shared/domain/src/value-objects/
EntitySource.ts → entity-source.value.ts

# packages/iam/domain/src/value-objects/
paths.ts → paths.value.ts

# packages/documents/domain/src/value-objects/
LinkType.ts → link-type.value.ts
TextStyle.ts → text-style.value.ts

# packages/calendar/domain/src/value-objects/
calendar-color-option.ts → calendar-color-option.value.ts
time-grid-view.ts → time-grid-view.value.ts
calendar-event.ts → calendar-event.value.ts
calendar-view.ts → calendar-view.value.ts
day-grid-view.ts → day-grid-view.value.ts
calendar-filter.ts → calendar-filter.value.ts
list-view.ts → list-view.value.ts
date-picker-control.ts → date-picker-control.value.ts
calendar-range.ts → calendar-range.value.ts

# packages/comms/domain/src/value-objects/ (consolidation: plural → singular)
mail.values.ts → mail.value.ts
logging.values.ts → logging.value.ts
```

**Decision**: Use singular `.value.ts` (not `.values.ts`) for consistency with other postfixes.

---

### 3.2 `.schema.ts` — Schema Files

**Problem**: Schema files in `schemas/` directories lack the `.schema.ts` postfix.

**Files Affected** (~15 files across entity schema directories):
- `member-status.ts` → `member-status.schema.ts`
- `member-role.ts` → `member-role.schema.ts`
- `invitation-status.ts` → `invitation-status.schema.ts`
- (and more in various entity directories)

---

### 3.3 `.job.ts` — Background Jobs

**Problem**: Jobs use generic file names in `jobs/` directory.

**Files Affected**:
```
packages/shared/server/src/jobs/cleanup-upload-sessions.ts
```

**Migration**: Rename to `cleanup-upload-sessions.job.ts`.

---

## 4. Postfix Consolidations

### 4.1 Service Files — Context-Dependent Pattern

**Pattern**:
- **Client layer**: `service.ts` (semantic filename within feature directory)
- **Server layer**: `{Name}.service.ts` (dot-prefixed for flat structures)

**Rationale**: Client features use directory context (`sign-in/service.ts`). Server services need explicit naming.

### 4.2 Handler Files — Context-Dependent Pattern

**Pattern**:
- **Client layer**: `handler.ts` (singular, semantic filename) — one handler per action
- **Server layer**: `{Entity}.handlers.ts` (plural, dot-prefixed) — collection of related handlers

**Rationale**: Reflects actual content structure.

---

## 5. Categories Without Postfixes (Intentional)

Some files intentionally lack postfixes because directory context provides sufficient information:

| Category | Pattern | Directory Context | Example |
|----------|---------|-------------------|---------|
| Entity IDs | `ids.ts`, `any-id.ts` | `entity-ids/` | `entity-ids/iam/ids.ts` |
| Relations | `relations.ts` | `tables/` | `tables/relations.ts` |
| Schema (combined) | `schema.ts` | `tables/` | `tables/schema.ts` |
| RPC implementation | `{action}.ts` | `rpc/v1/` | `rpc/v1/documents/create.ts` |
| Factory | `db-repo.ts` | `factories/` | `factories/db-repo.ts` |
| Adapter client | `client.ts` | `adapters/{name}/` | `adapters/s3/client.ts` |

---

## 6. Verification Commands

```bash
# Count CURRENT postfix adoption
find packages -name "*.model.ts" | wc -l      # Expected: ~46
find packages -name "*.table.ts" | wc -l      # Expected: ~45
find packages -name "*.repo.ts" | wc -l       # Expected: ~38
find packages -name "*.types.ts" | wc -l      # Expected: ~16

# Count TARGET postfixes (pre-migration)
find packages -name "*.value.ts" | wc -l      # Expected: 0
find packages -name "*.job.ts" | wc -l        # Expected: 0

# Find files needing value object postfix
find packages -path "*/value-objects/*" -name "*.ts" -not -name "index.ts" -not -name "*.value.ts"

# Find schema files needing postfix
find packages -path "*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"

# Find table files needing casing migration
find packages -name "*.table.ts" | xargs basename -a | grep -E '[A-Z]'

# Verify semantic filenames in client layer
find packages/*/client/src -name "handler.ts" | wc -l
find packages/*/client/src -name "contract.ts" | wc -l
```

---

## 7. Decision Rationale Summary

| Decision | Internal Evidence | External Evidence | Trade-off | Status |
|----------|-------------------|-------------------|-----------|--------|
| Add `.value.ts` | 17 files missing postfix | DDD Value Object pattern | 17 file renames | TARGET |
| Add `.job.ts` | Jobs in generic-named files | Job/worker convention | ~1 file rename | TARGET |
| Add `.schema.ts` postfix | ~15 files in schemas/ without postfix | Effect singular convention | ~15 file renames | TARGET |
| Standardize table casing | 19 camelCase files | Effect kebab-case convention | 19 file renames | TARGET |
| Preserve semantic filenames | Client 4-file pattern works well | Clean Architecture | None (preserve) | CURRENT |
| Preserve layer-specific postfixes | High consistency within layers | Layer isolation principle | None (preserve) | CURRENT |

---

## 8. Migration Impact Summary

| Category | File Count | Status |
|----------|------------|--------|
| Table casing (camelCase → kebab) | 19 | TARGET |
| Value object postfix | 17 | TARGET |
| Schema postfix | ~15 | TARGET |
| Job postfix | 1 | TARGET |
| **Total migration** | **~53 files** | |

---

*Generated: Phase 2 - Synthesis (Revised after review)*
*Evidence Sources: Phase 0 (existing-patterns-audit.md, file-category-inventory.md), Phase 1 (fp-repo-conventions.md, academic-research.md)*
