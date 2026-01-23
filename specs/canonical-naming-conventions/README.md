# Canonical Naming Conventions Spec

> Research specification for establishing AI-native file/folder naming standards in `beep-effect`.

---

## Purpose

Define canonical, greppable naming conventions that maximize AI agent comprehension with minimal context. This spec focuses on **research and discovery** - the implementation/refactoring phase will be a separate spec.

## Problem Statement

The `beep-effect` monorepo currently exhibits:
- Mixed casing conventions (PascalCase folders like `ApiKey/`, lowercase files like `atoms.ts`)
- Inconsistent use of semantic postfixes (`.model.ts` vs plain `.ts`)
- Varied barrel export patterns (`mod.ts` + `index.ts` namespace vs direct exports)
- No formal category taxonomy for file types

These inconsistencies force AI agents to read file contents to understand purpose, consuming context unnecessarily.

## Research Objectives

### Primary Goals

1. **Category Taxonomy**: Create an exhaustive, category-theoretic inventory of file types with precise postfix naming
2. **Casing Standards**: Define canonical casing rules for files, folders, and exports
3. **Module Structure**: Establish barrel export patterns that enable namespace consumption
4. **AI Greppability**: Optimize naming for pattern matching and semantic search

### Research Questions

| Question                                                          | Phase | Agent                |
|-------------------------------------------------------------------|-------|----------------------|
| What file categories exist in this codebase?                      | 0     | codebase-researcher  |
| What naming conventions do leading Effect/FP repos use?           | 1     | ai-trends-researcher |
| What academic/industry standards exist for AI-friendly codebases? | 1     | ai-trends-researcher |
| How do llms.txt and CLAUDE.md patterns inform file naming?        | 1     | ai-trends-researcher |
| What naming conventions maximize grep/glob efficiency?            | 1     | codebase-researcher  |
| How should category postfixes map to architectural layers?        | 2     | reflector            |

## Success Criteria

### Quantifiable Metrics

| Metric | Target | Verification Command |
|--------|--------|---------------------|
| File patterns documented | 100% of unique postfixes | `find packages -name "*.ts" \| grep -oE '\.[a-z-]+\.tsx?$' \| sort -u` |
| Folder casing documented | 100% of entity/feature folders | `find packages -type d -name "[A-Z]*"` |
| Barrel export adoption | % calculated for mod.ts vs index.ts | `find packages -name "mod.ts" \| wc -l` |
| Inconsistencies identified | All casing/postfix violations listed | Manual review of audit |
| External sources cited | ≥3 sources per research topic | Citation count in outputs |
| Category coverage | All file types have assigned postfix | Taxonomy completeness check |

### Deliverable Checklist

- [ ] Complete inventory of existing file naming patterns (with counts)
- [ ] Exhaustive `.category.ts` postfix taxonomy with rationale
- [ ] Casing convention decision matrix (with examples)
- [ ] `mod.ts`/`index.ts` pattern documentation (with adoption %)
- [ ] External research synthesis with ≥10 citations
- [ ] Decision framework for future file categorization
- [ ] Draft rules for `.claude/rules/naming-conventions.md`

### Phase Completion Gates

| Phase | Gate Criteria |
|-------|---------------|
| P0 → P1 | All 3 audit outputs exist; pattern counts verifiable via grep |
| P1 → P2 | All 4 research outputs exist; ≥3 citations per topic |
| P2 → Complete | Taxonomy covers all discovered patterns; rules draft ready for review |

## Non-Goals

- **Implementation**: This spec does NOT refactor files (separate spec)
- **Tooling**: This spec does NOT create automated linters (future work)
- **Migration**: This spec does NOT plan the migration path (separate spec)

---

## Phase Overview

### Phase 0: Codebase Inventory

**Goal**: Comprehensive audit of existing naming patterns.

**Deliverables**:
- `outputs/existing-patterns-audit.md` - Current naming conventions
- `outputs/file-category-inventory.md` - All file types found
- `outputs/inconsistency-report.md` - Pattern violations and edge cases

### Phase 1: External Research

**Goal**: Gather best practices from industry, academia, and leading repositories.

**Deliverables**:
- `outputs/industry-best-practices.md` - AI-friendly codebase standards
- `outputs/fp-repo-conventions.md` - Effect/Scala/Haskell naming patterns
- `outputs/academic-research.md` - Category theory naming approaches
- `outputs/llms-txt-patterns.md` - AI documentation standards

### Phase 2: Synthesis & Standards Definition

**Goal**: Synthesize research into actionable standards.

**Deliverables**:
- `outputs/category-taxonomy.md` - Exhaustive `.category.ts` postfix list
- `outputs/casing-decision-matrix.md` - File/folder casing rules
- `outputs/module-structure-patterns.md` - Barrel export conventions
- `outputs/naming-rules-draft.md` - Draft of `.claude/rules/naming-conventions.md`

---

## Category Taxonomy Framework

### Guiding Principles

1. **Semantic Precision**: Postfixes should convey purpose without reading contents
2. **Categorical Consistency**: Names should reflect category-theoretic relationships
3. **Grep Efficiency**: Patterns should be unique and searchable
4. **Layer Alignment**: Categories should map to architectural boundaries

### Preliminary Category Candidates

Based on initial codebase observation:

| Category               | Postfix          | Purpose                           | Layer         |
|------------------------|------------------|-----------------------------------|---------------|
| Domain Model           | `.model.ts`      | Entity schemas and business logic | domain        |
| Type Definitions       | `.types.ts`      | Type-only modules (no runtime)    | any           |
| Service Interface      | `.service.ts`    | Effect service definitions        | server         |
| Service Implementation | `.impl.ts`       | Service implementations           | server         |
| Layer Composition      | `.layer.ts`      | Effect Layer definitions          | server         |
| Database Table         | `.table.ts`      | Drizzle table schemas             | tables        |
| Repository Interface   | `.repo.ts`       | Data access interfaces            | server         |
| Contract Schema        | `.contract.ts`   | API/RPC contract definitions      | client        |
| Handler Implementation | `.handler.ts`    | Request/command handlers          | client/server |
| React Provider         | `.provider.tsx`  | React context providers           | ui            |
| React Hook             | `.hook.ts`       | Custom React hooks                | ui            |
| React Component        | `.component.tsx` | Presentational components         | ui            |
| Test Suite             | `.test.ts`       | Unit/integration tests            | test          |
| Configuration          | `.config.ts`     | Config schemas and defaults       | any           |
| Constants              | `.const.ts`      | Constant definitions              | any           |
| Utilities              | `.util.ts`       | Pure utility functions            | common        |
| Error Definitions      | `.error.ts`      | Tagged error classes              | any           |
| Barrel Export          | `mod.ts`         | Namespace re-exports              | any           |
| Module Index           | `index.ts`       | Public API surface                | any           |

### Research-Dependent Categories

These require external research to validate/refine:

- Functor/Monad-related modules
- Schema transformations vs schemas
- Effect generators vs effects
- Test fixtures vs test utilities

---

## Casing Convention Framework

### Current State (Mixed)

```
packages/iam/domain/src/entities/ApiKey/ApiKey.model.ts   # PascalCase folder
packages/common/types/src/or.types.ts                     # lowercase file
packages/ui/ui/src/providers/break-points.provider.tsx    # kebab-case with postfix
```

### Proposed Standard: lower-snake-case

```
packages/iam/domain/src/entities/api-key/api-key.model.ts
packages/common/types/src/or.types.ts
packages/ui/ui/src/providers/break-points.provider.tsx
```

### Research Questions for Casing

1. Do leading Effect/FP repos use lowercase or PascalCase for entity folders?
2. What casing maximizes grep pattern matching efficiency?
3. How do case-insensitive file systems affect convention choices?
4. What casing conventions do AI agents expect/prefer?

---

## Module Structure Pattern

### Current Pattern (sign-in example)

```
sign-in/
├── index.ts       # export * as SignIn from "./mod.ts"
├── mod.ts         # export * as Atoms, export { Email }, etc.
├── atoms.ts
├── email/
│   ├── index.ts   # export { Email } from "./mod.ts"
│   ├── mod.ts     # export * as Contract, Handler, etc.
│   ├── contract.ts
│   └── handler.ts
└── ...
```

### Benefits

- Enables `import { SignIn } from "@beep/iam-client"` with namespace access
- Clean separation between public API (`index.ts`) and implementation (`mod.ts`)
- Grep-friendly: `mod.ts` always means barrel, `index.ts` always means public API

### Research Questions

1. Is `mod.ts` convention from Deno? What's the canonical source?
2. How do other large Effect repos structure barrel exports?
3. Should we have `.barrel.ts` postfix instead of `mod.ts`?

---

## Research Sources

### High Priority

- Effect-TS repository conventions
- Scala ZIO naming patterns
- Haskell module naming conventions
- llms.txt specification
- CLAUDE.md best practices (Anthropic docs)

### Medium Priority

- Nx/Turborepo monorepo conventions
- Domain-Driven Design file structure patterns
- Clean Architecture naming standards

### Academic/Theoretical

- Category theory module naming
- Type theory correspondence to file organization
- Algebraic data type naming conventions

---

## Related Specifications

- `.claude/skills/mcp-refactor-typescript.md` - TypeScript-aware refactoring (file renames, import updates, symbol renames)

---

## Handoff Sequence

| Phase | Input             | Output                      | Next                |
|-------|-------------------|-----------------------------|---------------------|
| 0     | This README       | Codebase audit artifacts    | Phase 1             |
| 1     | Phase 0 outputs   | External research synthesis | Phase 2             |
| 2     | Phase 0+1 outputs | Standards documents         | Implementation Spec |

---

## Execution

Start with: `handoffs/P0_ORCHESTRATOR_PROMPT.md`

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute orientation |
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Complete phase workflows |
| [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) | Ready-to-use agent prompts |
| [RUBRICS.md](./RUBRICS.md) | Evaluation criteria |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Cumulative learnings |
