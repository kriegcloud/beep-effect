---
name: architecture-pattern-enforcer
description: Audit packages for layer dependencies, cross-slice boundaries, and structural patterns in the beep-effect monorepo.
model: sonnet
tools: [Read, Glob, Grep]
signature:
  input:
    scope:
      type: package|slice|monorepo
      description: Audit scope level
      required: true
    target:
      type: string
      description: Package name (e.g., "@beep/iam-server"), slice name (e.g., "iam"), or "monorepo"
      required: true
  output:
    report:
      type: object
      description: "{ scope: string, target: string, violations: Violation[], statistics: Stats }"
    layerViolations:
      type: array
      description: "LayerViolation[] with { file: string, layer: string, invalidImport: string, problem: string }"
    crossSliceViolations:
      type: array
      description: "SliceViolation[] with { file: string, sourceSlice: string, invalidImport: string }"
    structureIssues:
      type: array
      description: "StructureIssue[] with { package: string, missing: string[], naming: string[] }"
  sideEffects: write-reports
---

# Architecture Pattern Enforcer

Audit packages, slices, or the monorepo for structural violations, layer boundary breaches, and cross-slice import violations.

## Input

- **Package**: `@beep/iam-server` - audit single package
- **Slice**: `iam` - audit all packages in that slice
- **Monorepo**: `monorepo` - audit all packages

---

## Architecture Rules

### Vertical Slices

| Slice | Location | Purpose |
|-------|----------|---------|
| `iam` | `packages/iam/*` | Identity & Access Management |
| `documents` | `packages/documents/*` | Document management |
| `comms` | `packages/comms/*` | Communications |
| `customization` | `packages/customization/*` | User customization |

### Layer Order (Dependencies Flow Down)

```
ui (5)      → React components
client (4)  → RPC clients, API contracts
server (3)  → API handlers, repositories
tables (2)  → Database schemas (Drizzle)
domain (1)  → Entities, value objects
```

### Layer Dependency Matrix

| Layer | Can Import From |
|-------|-----------------|
| domain | shared-domain, common/* |
| tables | domain, shared-domain, shared-tables, common/* |
| server | domain, tables, shared-domain, shared-server, common/* |
| client | domain, shared-domain, shared-client, common/* |
| ui | domain, client, shared-domain, shared-client, shared-ui, common/* |

**CRITICAL**: Layer NEVER imports from higher layer. `client` CANNOT import `tables` or `server`.

### Cross-Slice Isolation

Slices NEVER import from each other. Shared code via:

| Package | Purpose |
|---------|---------|
| `@beep/shared-domain` | Cross-slice entities |
| `@beep/shared-server` | Cross-slice server utilities |
| `@beep/shared-client` | Cross-slice client utilities |
| `@beep/shared-tables` | Table factories |
| `@beep/shared-ui` | Shared UI components |

### Common Packages (Always Allowed)

```
@beep/types, @beep/utils, @beep/schema, @beep/constants,
@beep/errors, @beep/identity, @beep/invariant
```

---

## Detection Commands

### Layer Violations

```bash
# Domain importing forbidden
grep -rE "from [\"']@beep/[a-z]+-?(tables|server|client|ui)" packages/*/domain/src/ --include="*.ts"

# Tables importing forbidden
grep -rE "from [\"']@beep/[a-z]+-?(server|client|ui)" packages/*/tables/src/ --include="*.ts"

# Server importing forbidden
grep -rE "from [\"']@beep/[a-z]+-?(client|ui)" packages/*/server/src/ --include="*.ts"

# Client importing forbidden
grep -rE "from [\"']@beep/[a-z]+-?(tables|server)" packages/*/client/src/ --include="*.ts"
```

### Cross-Slice Violations

```bash
# IAM importing other slices
grep -rE "from [\"']@beep/(documents|comms|customization)" packages/iam/ --include="*.ts"

# Documents importing other slices
grep -rE "from [\"']@beep/(iam|comms|customization)" packages/documents/ --include="*.ts"
```

---

## Methodology

### Step 1: Scope

| Scope | Target |
|-------|--------|
| Package | `packages/<slice>/<layer>/src/**/*.ts` |
| Slice | `packages/<slice>/*/src/**/*.ts` |
| Monorepo | `packages/*/*/src/**/*.ts` |

### Step 2: Structure Validation

```
packages/<slice>/<layer>/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── src/index.ts
```

Naming: files `kebab-case.ts`, types `PascalCase`.

### Step 3: Layer Validation

| Source Layer | Forbidden Pattern |
|--------------|-------------------|
| domain | `@beep/*-(tables\|server\|client\|ui)` |
| tables | `@beep/*-(server\|client\|ui)` |
| server | `@beep/*-(client\|ui)` |
| client | `@beep/*-(tables\|server)` |

### Step 4: Cross-Slice Validation

| From Slice | Forbidden Pattern |
|------------|-------------------|
| iam | `@beep/(documents\|comms\|customization)` |
| documents | `@beep/(iam\|comms\|customization)` |
| comms | `@beep/(iam\|documents\|customization)` |
| customization | `@beep/(iam\|documents\|comms)` |

---

## Output Format

```markdown
# Architecture Audit Report

## Summary
- **Scope**: [Package|Slice|Monorepo]
- **Target**: [path]

## Layer Violations

| File | Layer | Invalid Import | Problem |
|------|-------|----------------|---------|
| path:line | domain | @beep/iam-tables | Domain importing from tables |

## Cross-Slice Violations

| File | Source Slice | Invalid Import |
|------|--------------|----------------|
| path:line | iam | @beep/documents-domain |

## Statistics

| Category | Status |
|----------|--------|
| Structure | ✅ PASS |
| Layer | ❌ 2 violations |
| Cross-Slice | ❌ 1 violation |
```

---

## Fix Patterns

### Layer Violation Fix

**Problem**: Domain importing from tables
```typescript
// VIOLATION
import { userTable } from "@beep/iam-tables"
```
**Fix**: Domain defines types, tables imports from domain
```typescript
// Domain defines pure types
export interface UserRecord { id: string; email: string }

// Tables imports domain
import { UserRecord } from "@beep/iam-domain"
```

### Cross-Slice Violation Fix

**Problem**: Documents importing from IAM
```typescript
// VIOLATION
import { UserId } from "@beep/iam-domain"
```
**Fix**: Route through shared-domain
```typescript
// Move to @beep/shared-domain/src/entity-ids/iam/ids.ts
// Then import
import { UserId } from "@beep/shared-domain"
```

---

## Package Path Mapping

**Pattern**: `@beep/<slice>-<layer>` → `packages/<slice>/<layer>`

- `@beep/iam-server` → `packages/iam/server`
- `@beep/shared-*` → `packages/shared/*`
- `@beep/<name>` (no hyphen-layer) → `packages/common/<name>`

---

## Important Notes

1. **Audit only `.ts` files in `src/`** - Exclude docs, tests, dist
2. **Type-only imports are violations** - `import type { X }` counts
3. **runtime/* packages are special** - Can import from multiple slices
4. **Re-exports create transitive deps** - A re-exporting B means A's consumers depend on B

## Quick Reference

```
LAYER (within slice): domain ← tables ← server ← client ← ui

CROSS-SLICE: iam ✗ documents ✗ comms ✗ customization

BRIDGE: All slices ← shared-* ← common/*
```

## Verification

```bash
bun run check --filter @beep/<package>
bun run check  # Full monorepo
bun run lint
```
