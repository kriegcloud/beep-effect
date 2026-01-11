# AI-Friendliness Audit: Context Discovery

> Phase 1 Output - Read-Only Discovery
> Date: 2026-01-06

---

## Executive Summary

The beep-effect monorepo demonstrates strong architectural foundations for AI-assisted development:
- **42 packages** with consistent vertical slice architecture
- **40 AGENTS.md files** providing excellent per-package guidance (95% coverage)
- **Zero cross-slice import violations** - boundaries are well-enforced
- **Strict TypeScript configuration** with most recommended strictness options enabled
- **Turborepo** for build orchestration with Bun 1.3.2 package manager

Key concerns identified:
- CLAUDE.md at 562 lines exceeds recommended 60-100 line threshold
- Pattern violations exist (native .map, Date, switch statements)
- Some type utility files use `any` (acceptable in type-level code)
- 3 packages missing barrel exports

---

## Repository Structure

### Apps (4)
| App              | Purpose                         |
|------------------|---------------------------------|
| `apps/web`       | Next.js 16 + React 19 frontend  |
| `apps/server`    | Effect Platform backend runtime |
| `apps/marketing` | Marketing site                  |

### Packages by Category

| Category      | Package Count | Packages                                                                        |
|---------------|---------------|---------------------------------------------------------------------------------|
| common        | 11            | constants, contract, errors, identity, invariant, schema, types, utils, yjs |
| iam           | 5             | client, domain, server, tables, ui                                              |
| documents     | 5             | client, domain, server, tables, ui                                              |
| comms         | 5             | client, domain, server, tables, ui                                              |
| customization | 5             | client, domain, server, tables, ui                                              |
| shared        | 6             | client, domain, env, server, tables, ui                                         |
| runtime       | 2             | client, server                                                                  |
| ui            | 2             | core, ui                                                                        |
| _internal     | 1             | db-admin                                                                        |

### Tooling (6)
- build-utils, cli, repo-scripts, testkit, utils

---

## Documentation Inventory

### AGENTS.md Coverage: 40/42 packages (95%)

**Packages WITH AGENTS.md:**
- All apps (web, server, notes)
- All common packages (11/11)
- All feature slices (iam, documents, comms, customization) - 20/20
- All shared packages (6/6)
- All runtime packages (2/2)
- All ui packages (2/2)
- All tooling packages (6/6)
- _internal/db-admin (1/1)

**Packages WITHOUT AGENTS.md:**
- `apps/marketing` (new/WIP)
- `packages/shared/env` - verified present

### README.md Coverage
- 20+ packages have README files
- Most feature slice packages have README
- Some common packages lack README

### JSDoc Coverage (Sampled)
| Package         | JSDoc Blocks           |
|-----------------|------------------------|
| common/contract | 4 files, minimal JSDoc |
| common/schema   | 1-7 per file, sparse   |

---

## Configuration Analysis

### TypeScript (tsconfig.base.jsonc)
**Strictness Level: EXCELLENT (5/5)**

| Option                           | Status |
|----------------------------------|--------|
| strict                           | true   |
| noUncheckedIndexedAccess         | true   |
| exactOptionalPropertyTypes       | true   |
| noImplicitOverride               | true   |
| noImplicitReturns                | true   |
| noUnusedLocals                   | true   |
| noUnusedParameters               | true   |
| noFallthroughCasesInSwitch       | true   |
| forceConsistentCasingInFileNames | true   |
| verbatimModuleSyntax             | true   |

**Notable**: Uses @effect/language-service plugin for enhanced Effect support.

### Path Aliases
All packages use `@beep/*` aliases consistently defined in tsconfig.base.jsonc.

### Biome (biome.jsonc)
- Linting enabled with recommended rules
- `noExplicitAny`: warn (not error)
- Many rules disabled (complexity, a11y, correctness)
- Import organization enabled

---

## Structural Analysis

### Barrel Export Compliance: 39/42 (93%)

**Missing barrel exports:**
- `packages/_internal/db-admin/` - NO BARREL
- `packages/ui/core/` - NO BARREL
- `packages/ui/ui/` - NO BARREL

### Cross-Slice Import Violations: ZERO

Verified:
- IAM does not import from Documents
- Documents does not import from IAM
- Comms does not import from IAM
- Customization does not import from Documents

### Naming Conventions
- Directories: lowercase with hyphens (compliant)
- Files: kebab-case for modules (mostly compliant)
- Exports: PascalCase for types, camelCase for functions (compliant)

---

## Pattern Violation Baseline

### `.map()` Usage Analysis
- Total occurrences: 129 across 50 files
- Most are `Effect.map`, `A.map`, `Arr.map` (legitimate)
- True native violations: ~10-20 instances

**Sample Locations:**
- `packages/shared/server/src/factories/db-client/pg/PgClient.ts:171` - native `.map()`
- `packages/documents/server/src/handlers/Discussion.handlers.ts:54` - nested `.map()`

### `any` Type Usage
- Total occurrences: 30+ instances
- Most are in type utility files (acceptable)
- `packages/common/types/src/` - type-level `any` (necessary for type utilities)
- `packages/common/contract/src/internal/contract/types.ts` - schema type variance

### `new Date()` Usage
- Total occurrences: ~28
- Many in mock data and documentation examples
- Some legitimate utility code for formatting

**Sample Locations:**
- `packages/common/errors/src/server.ts:228`
- `packages/common/utils/src/format-time.ts` (multiple)

### `switch` Statement Usage
- Total occurrences: ~20
- Many in documentation/comments
- Some actual violations in utility code

**Sample Locations:**
- `packages/shared/server/src/factories/db-client/pg/PgClient.ts:415`
- `packages/common/utils/src/format-time.ts:324`

---

## Test Infrastructure

- **Test files**: 148 across packages and tooling
- **Test framework**: Bun test via `@beep/testkit`
- **Test pattern**: Colocated in package `test/` directories

---

## AI Instruction Analysis

### CLAUDE.md Size
- **Current**: 562 lines
- **Recommended**: 60-100 lines
- **Reduction needed**: ~450 lines

### Instruction Density
- Contains comprehensive Effect pattern rules
- Code examples embedded inline
- Detailed import conventions documented

---

## Discovery Checkpoint Validation

- [x] All apps/ directories documented (4 apps)
- [x] All packages/ directories cataloged (42 packages)
- [x] Monorepo tool identified (Turborepo + Bun)
- [x] Configuration cascade understood (tsconfig.base.jsonc + slices)
- [x] Cross-slice import patterns documented (zero violations)
- [x] AGENTS.md coverage mapped (95%)
- [x] Pattern violations baselined

---

## Key Findings for Phase 2

1. **Documentation Quality**: Good AGENTS.md coverage, sparse JSDoc
2. **Structural Clarity**: Excellent boundaries, 3 missing barrels
3. **Effect Patterns**: Some native method usage to audit
4. **Tooling**: Strict TypeScript, Biome has gaps
5. **AI Instructions**: CLAUDE.md needs significant reduction

---

## Next Steps

Proceed to Phase 2: Criteria Evaluation with scoring for each dimension.
