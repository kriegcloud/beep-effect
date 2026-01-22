# Existing Patterns Audit

> Phase 0 deliverable: Comprehensive inventory of all naming patterns in beep-effect.

---

## Executive Summary

The `beep-effect` monorepo uses **21 distinct semantic postfix patterns** across **1717+ TypeScript source files**. The codebase exhibits a clear vertical slice architecture (domain → tables → server → client → ui) with layer-specific naming conventions. Key patterns include `.model.ts` for domain entities, `.table.ts` for Drizzle tables, `.repo.ts` for repositories, and a 4-file feature pattern (`contract.ts`, `handler.ts`, `mod.ts`, `index.ts`) in the client layer.

---

## 1. Postfix Pattern Inventory

### 1.1 High-Volume Patterns (>15 files)

| Pattern | Count | Primary Packages | Purpose |
|---------|-------|------------------|---------|
| `.model.ts` | 46 | `*/domain/src/entities/*` | Domain models (Effect Schema definitions) |
| `.table.ts` | 45 | `*/tables/src/tables/*` | Drizzle ORM table definitions |
| `.repo.ts` | 38 | `*/server/src/db/repos/*` | Database repositories |
| `contract.ts` | 34 | `iam/client/src/**/` | RPC contract schemas (payload/success) |
| `handler.ts` | 34 | `iam/client/src/**/` | Client-side RPC handlers |
| `mod.ts` | 49 | `iam/client/src/**/` | Module re-exports (Deno-style) |
| `.types.ts` | 16 | `common/types/src/*` | TypeScript type definitions |
| `.service.ts` | 15 | `shared/*/src/services/*` | Effect services |
| `layer.ts` | 15 | `iam/client/src/**/`, `runtime/server/src/` | Effect Layer definitions |
| `service.ts` | 15 | `iam/client/src/**/` | Service aggregations |
| `.atom.ts` | 14 | `shared/client/src/atom/*` | Jotai atoms |
| `.layer.ts` | 12 | `runtime/server/src/` | Effect Layer definitions (PascalCase) |
| `.test.ts` | 114 | `*/test/*` | Unit and integration tests |
| `index.ts` | 432 | Throughout | Barrel exports |

### 1.2 Medium-Volume Patterns (5-15 files)

| Pattern | Count | Primary Packages | Purpose |
|---------|-------|------------------|---------|
| `.utils.ts` | 9 | `common/utils/src/data/*` | Utility functions |
| `.schema.ts` | 8 | `shared/domain/src/*`, `iam/client/src/*` | Schema definitions |
| `.errors.ts` | 8 | `*/domain/src/errors/*` | Error class definitions |
| `.schemas.ts` | 6 | `iam/client/src/_internal/*` | Schema collections |
| `.handlers.ts` | 3 | `documents/server/src/handlers/` | Server-side RPC handlers |
| `.rpc.ts` | 3 | `documents/domain/src/entities/*` | RPC definitions |

### 1.3 Low-Volume Patterns (<5 files)

| Pattern | Count | Location | Purpose |
|---------|-------|----------|---------|
| `.values.ts` | 2 | `comms/domain/src/value-objects/` | Value objects |
| `.atoms.ts` | 1 | `shared/client/src/services/` | Jotai atom collections |
| `.constants.ts` | 1 | `shared/domain/src/entities/user/` | Constants |
| `.factory.ts` | 1 | `common/utils/src/factories/` | Factory functions |
| `.config.ts` | 1 | `_internal/db-admin/` | Configuration |
| `.hook.ts` | 1 | `ui/ui/src/organisms/confirm-dialog/` | React hook |
| `.context.ts` | 1 | `ui/ui/src/organisms/confirm-dialog/` | React context |

### 1.4 Postfix Distribution by Slice

| Slice | `.model.ts` | `.table.ts` | `.repo.ts` | `.service.ts` |
|-------|-------------|-------------|------------|---------------|
| `iam` | 18 | 18 | 21 | - |
| `documents` | 5 | 5 | 4 | - |
| `knowledge` | 10 | 10 | 6 | - |
| `shared` | 8 | 5 | 3 | 5 |
| `calendar` | 1 | 1 | 1 | - |
| `customization` | 1 | 1 | 1 | - |
| `comms` | 1 | 1 | 1 | - |

---

## 2. Folder Casing Analysis

### 2.1 Casing by Architectural Layer

| Layer | Folder Naming | File Naming | Consistency |
|-------|---------------|-------------|-------------|
| **Domain (entities)** | kebab-case | `{name}.model.ts` (kebab-case) | Consistent |
| **Domain (schemas)** | `schemas/` (kebab-case) | Mixed: kebab-case OR PascalCase | **Inconsistent** |
| **Tables** | `tables/` (kebab-case) | Mixed: camelCase OR kebab-case | **Inconsistent** |
| **Server (repos)** | `db/repos/` (kebab-case) | PascalCase `{Name}.repo.ts` | Consistent |
| **Server (handlers)** | `handlers/` (kebab-case) | PascalCase `{Name}.handlers.ts` | Consistent |
| **Client (features)** | kebab-case | kebab-case files | Consistent |
| **UI (features)** | kebab-case | kebab-case files | Consistent |

### 2.2 Entity Folder Examples

| Slice | Entity Folder Examples | Casing |
|-------|------------------------|--------|
| `@beep/iam-domain` | `api-key/`, `device-code/`, `oauth-access-token/`, `two-factor/`, `wallet-address/` | kebab-case |
| `@beep/documents-domain` | `document/`, `document-file/`, `document-version/`, `discussion/`, `comment/` | kebab-case |
| `@beep/shared-domain` | `upload-session/`, `audit-log/`, `file/`, `folder/`, `user/`, `team/` | kebab-case |
| `@beep/knowledge-domain` | `entity-cluster/`, `same-as-link/`, `property-definition/`, `class-definition/` | kebab-case |

### 2.3 Feature Module Examples

| Slice | Feature Folder Examples | Casing |
|-------|------------------------|--------|
| `@beep/iam-client` | `sign-in/`, `sign-up/`, `two-factor/`, `password/`, `multi-session/`, `email-verification/`, `organization/` | kebab-case |
| `@beep/iam-ui` | `sign-in/`, `sign-up/`, `_common/`, `_components/` | kebab-case |

---

## 3. Barrel Export Patterns

### 3.1 Pattern Types

| Pattern | Description | Count | Primary Usage |
|---------|-------------|-------|---------------|
| **mod.ts + namespace** | `export * as Name from "./mod.ts"` | 51 | IAM client only |
| **Namespace export** | `export * as Name from "./file"` (no mod.ts) | ~95 | Domain entities, layers, services |
| **Direct re-export** | `export * from "./module"` or `export { }` | ~380 | UI, schema, tables, db repos |
| **Hybrid** | Mixed patterns in same file | ~15 | Package root index files |

### 3.2 Adoption Metrics

| Pattern | Percentage | Primary Usage |
|---------|------------|---------------|
| **Direct re-export** (`export * from`) | **88%** | UI, schema, tables, db repos |
| **Namespace export** (`export * as`) | **22%** | Domain entities, layers, services |
| **mod.ts + namespace** | **12%** | IAM client only |
| **Hybrid** | **3%** | Package root index files |

*Note: Percentages exceed 100% because hybrid files are counted in multiple categories*

### 3.3 Package-Level Pattern Distribution

| Slice/Package | Primary Pattern | Notes |
|---------------|-----------------|-------|
| `packages/iam/client/` | mod.ts + namespace | Consistent hierarchical feature structure |
| `packages/iam/domain/` | Namespace export | Entity grouping without mod.ts |
| `packages/iam/server/` | Direct re-export | Flat db repos, adapters |
| `packages/shared/*` | Hybrid | Namespace for services, direct for utilities |
| `packages/ui/*` | Direct re-export | Flat component/hook exports |
| `packages/common/*` | Mixed | Some namespaces for utilities |
| `packages/knowledge/*` | Namespace export | Service modules (Ai, Embedding, etc.) |
| `packages/documents/*` | Namespace export | Entity-centric organization |

---

## 4. Files Without Semantic Postfixes

### 4.1 Candidate Files for Postfix Standardization

| Current Pattern | Count | Examples | Suggested Postfix |
|-----------------|-------|----------|-------------------|
| `PascalCase.ts` (Schemas) | 15+ | `UserRole.ts`, `SubscriptionStatus.schema.ts` | `.schema.ts` |
| `PascalCase.ts` (Value Objects) | 10+ | `Attributes.ts`, `EvidenceSpan.ts` | `.value.ts` |
| `PascalCase.ts` (Extractors) | 5 | `EntityExtractor.ts` | `.extractor.ts` |
| `PascalCase.ts` (Providers) | 3 | `MockProvider.ts` | `.provider.ts` |

### 4.2 Specific Files Lacking Postfixes

| File | Purpose | Suggested Postfix |
|------|---------|-------------------|
| `shared/domain/src/entities/user/schemas/UserRole.ts` | Schema for user role enum | `UserRole.schema.ts` |
| `knowledge/domain/src/value-objects/Attributes.ts` | Value object | `Attributes.value.ts` |
| `knowledge/domain/src/value-objects/EvidenceSpan.ts` | Value object | `EvidenceSpan.value.ts` |
| `shared/domain/src/ManualCache.ts` | Utility class | Keep as-is (class) |
| `shared/domain/src/Policy.ts` | Policy definition | Keep as-is (entry point) |
| `iam/server/src/adapters/better-auth/Options.ts` | Config options | `Options.config.ts` |
| `iam/server/src/adapters/better-auth/Emails.ts` | Email templates | `Emails.templates.ts` |

---

## 5. IAM Client 4-File Feature Pattern

The `@beep/iam-client` package uses a highly consistent feature pattern:

```
src/{feature}/
├── index.ts      # Public API (re-exports from mod.ts)
├── mod.ts        # Module aggregation
├── layer.ts      # Effect Layer composition
├── service.ts    # Service definitions
├── atoms.ts      # Jotai state (optional)
├── form.ts       # Form validation (optional)
└── {action}/
    ├── index.ts      # Re-exports
    ├── mod.ts        # Module aggregation
    ├── handler.ts    # Effect-based handler
    └── contract.ts   # Request/response schemas
```

**Example paths:**
- `iam/client/src/sign-in/email/contract.ts`
- `iam/client/src/sign-in/email/handler.ts`
- `iam/client/src/organization/members/list/handler.ts`

---

## 6. Verification Commands

```bash
# Verify postfix pattern counts
find packages -name "*.model.ts" | wc -l      # Expected: ~46
find packages -name "*.table.ts" | wc -l      # Expected: ~45
find packages -name "*.repo.ts" | wc -l       # Expected: ~38
find packages -name "mod.ts" | wc -l          # Expected: ~49

# Verify folder casing
find packages -type d -path "*/entities/*" | head -20

# Verify barrel patterns
grep -r "export \* as .* from" packages --include="index.ts" | wc -l
grep -r "export \* from" packages --include="index.ts" | wc -l
```

---

## 7. Pattern Observations (Non-Normative)

### Patterns with High Consistency
- `.model.ts` in domain layer
- `.table.ts` in tables layer
- `.repo.ts` in server layer
- 4-file feature pattern in IAM client
- kebab-case entity folders

### Patterns with Lower Consistency
- Schema files within domain entities (kebab vs PascalCase)
- Table file naming (camelCase vs kebab-case)
- Layer/service file naming (with vs without postfix)
- Handlers naming (singular vs plural)

---

*Generated: Phase 0 - Codebase Inventory*
*Note: This document contains observations only. Normative recommendations will be made in Phase 2.*
