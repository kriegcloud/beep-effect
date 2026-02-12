# canonical-domain-entity-migration

> Migrate all 56 remaining domain entity modules to the canonical TaggedRequest contract pattern using swarm-mode parallel agents.

---

## Success Criteria

### Must Have

- [ ] Every domain entity module has: `*.model.ts`, `*.errors.ts`, `*.repo.ts`, `*.rpc.ts`, `*.http.ts`, `*.tool.ts`, `*.entity.ts`, `contracts/`, `index.ts`
- [ ] Every operation exposed via server repos has a corresponding `<Operation>.contract.ts` with `Payload`, `Success`, `Failure`, `Contract` + static `Rpc`, `Tool`, `Http`
- [ ] Domain repo contracts (`*.repo.ts`) define `DbRepo.DbRepoSuccess` with `DbRepo.Method` extensions matching server repo custom methods
- [ ] `bun run check` passes (zero new failures)
- [ ] `bun run lint:fix && bun run lint` passes
- [ ] Each phase creates BOTH handoff documents for the next phase before completion

### Nice to Have

- [ ] Pre-existing test/check failures documented in `outputs/pre-existing-failures.md`
- [ ] Reflection log contains entries for every phase executed
- [ ] All 58 entities pass isolated `tsc --noEmit -p tsconfig.json` per domain package (58 total, 56 migrated + 2 already canonical)

---

## Problem Statement

56 of 58 domain entities use bare model or legacy RPC patterns. The canonical pattern (established by Comment and Page in `@beep/documents-domain`) provides a single-source-of-truth contract that derives RPC, HTTP, and AI tool schemas from a unified `S.TaggedRequest`.

Currently, server repos expose custom methods (e.g., `findByOntology`, `resolveCanonical`, `search`) that have no corresponding domain-level type contracts. This makes it impossible to depend on repo shapes without importing server code, violating the `domain -> tables -> server` dependency direction.

The canonical pattern solves this by defining the repo shape in the domain package via `DbRepo.DbRepoSuccess<Model, Extensions>`, where Extensions use `DbRepo.Method<{ payload, success, failure? }>` to declare custom methods with contract-derived types.

### Why This Matters

- **Type safety**: Server repos that implement `RepoShape` from the domain are mechanically checked against the contract
- **Unified derivation**: A single `Contract` class derives RPC, HTTP endpoint, and AI tool schemas
- **Slice boundary compliance**: Domain code can depend on repo *shapes* without importing server layers
- **Discoverability**: Every entity operation is a named contract file, not hidden inside a legacy RPC handler

---

## Scope

### In Scope

- Create/update domain-level files for all 56 non-canonical entities across all 7 slices (shared, iam, documents, calendar, knowledge, comms, customization)
- Rename all kebab-case entity directories and files to PascalCase (e.g., `api-key/api-key.model.ts` -> `ApiKey/ApiKey.model.ts`) to match the canonical pattern
- Rename kebab-case entity directories and files to PascalCase using `mcp__mcp-refactor-typescript` MCP tools (automatic import updates)
- Define domain repo contracts with `DbRepo.Method` extensions informed by existing server repo methods
- Create error types (`*.errors.ts`) for each entity
- Create contract files (`contracts/<Operation>.contract.ts`) for each operation
- Create infrastructure files (`*.rpc.ts`, `*.http.ts`, `*.tool.ts`, `*.entity.ts`)
- Update barrel exports (`index.ts` at entity and contracts level)

### Out of Scope (Explicit Non-Goals)

- **NOT modifying server repo implementations** -- they should already satisfy the new domain contracts (or be updated in a follow-up spec)
- **NOT modifying table schemas or migrations** -- data layer untouched
- **NOT adding new business logic or changing existing behavior**
- **NOT creating server-side implementations for entities that don't currently have repos** -- entities without repos still get the full module structure but with empty repo extensions
- **NOT modifying client or UI packages** -- domain layer only
- **NOT renaming server repo files** -- only domain package directories and files are renamed
- **NOT migrating Comment or Page** -- they are already canonical

---

## Inventory Summary

### Total: 58 entities across 7 slices

| Slice | Entities | Already Canonical | To Migrate | Complexity |
|-------|----------|-------------------|------------|------------|
| **IAM** | 20 | 0 | 20 | Low (all CRUD-only stubs) |
| **Knowledge** | 19 | 0 | 19 | High (rich custom SQL extensions) |
| **Documents** | 8 | 2 (Comment, Page) | 6 | Medium (legacy RPCs + custom repos) |
| **Shared** | 8 | 0 | 8 | Medium (repos split across slices) |
| **Calendar** | 1 | 0 | 1 | Low (CRUD-only) |
| **Comms** | 1 | 0 | 1 | Low (CRUD-only) |
| **Customization** | 1 | 0 | 1 | Low (CRUD-only) |
| **Total** | **58** | **2** | **56** | |

### Naming Convention Standardization

All entity directories and files will be renamed to PascalCase to match the canonical pattern:

| Slice | Current Convention | Example (Current) | Example (Target) |
|-------|-------------------|-------------------|-------------------|
| IAM | kebab-case | `api-key/api-key.model.ts` | `ApiKey/ApiKey.model.ts` |
| Shared | kebab-case | `upload-session/upload-session.model.ts` | `UploadSession/UploadSession.model.ts` |
| Calendar | kebab-case | `calendar-event/calendar-event.model.ts` | `CalendarEvent/CalendarEvent.model.ts` |
| Comms | kebab-case | `email-template/email-template.model.ts` | `EmailTemplate/EmailTemplate.model.ts` |
| Customization | kebab-case | `user-hotkey/user-hotkey.model.ts` | `UserHotkey/UserHotkey.model.ts` |
| Docs (legacy) | kebab-case | `discussion/discussion.model.ts` | `Discussion/Discussion.model.ts` |
| Docs (canonical) | PascalCase (already correct) | `Comment/Comment.model.ts` | No change |
| Knowledge | PascalCase (already correct) | `Entity/Entity.model.ts` | No change |

**Special case**: Knowledge `Agent/KnowledgeAgent.model.ts` -- the directory is `Agent/` but the file uses `KnowledgeAgent`. Keep the `KnowledgeAgent` prefix for all new files in this entity.

### Identity Builders by Slice

| Slice | Identity Builder Import | Source |
|-------|------------------------|--------|
| Shared | `$SharedDomainId` from `@beep/identity/packages` | `packages/common/identity/src/packages.ts` |
| IAM | `$IamDomainId` from `@beep/identity/packages` | `packages/common/identity/src/packages.ts` |
| Documents | `$DocumentsDomainId` from `@beep/identity/packages` | `packages/common/identity/src/packages.ts` |
| Knowledge | `$KnowledgeDomainId` from `@beep/identity/packages` | `packages/common/identity/src/packages.ts` |
| Calendar | `$CalendarDomainId` from `@beep/identity/packages` | `packages/common/identity/src/packages.ts` |
| Comms | `$CommsDomainId` from `@beep/identity/packages` | `packages/common/identity/src/packages.ts` |
| Customization | `$CustomizationDomainId` from `@beep/identity/packages` | `packages/common/identity/src/packages.ts` |

---

## Complexity Assessment

```
Phase Count:       5 phases    x 2 = 10
Agent Diversity:   4 agents    x 3 = 12
Cross-Package:     7 slices    x 4 = 28
External Deps:     0           x 3 =  0
Uncertainty:       2 (low)     x 5 = 10
Research Required: 2 (low)     x 2 =  4
----------------------------------------------
Total Score:                       64 -> Critical
```

**Structure**: Full orchestration with MASTER_ORCHESTRATION.md, AGENT_PROMPTS.md, swarm mode, handoffs.

---

## Phase Overview

| Phase | Focus | Mode | Key Agents | Deliverable | Handoff Required |
|-------|-------|------|------------|-------------|------------------|
| P1 | Inventory Verification & Task Planning | Solo | `codebase-explorer` | `outputs/verified-inventory.md`, task list | HANDOFF_P2 + P2_ORCHESTRATOR_PROMPT |
| P2 | Wave 1: Simple Entities (IAM + Calendar + Comms + Customization) | **Swarm** | 3-4 `effect-code-writer` agents | ~22 entities migrated | HANDOFF_P3 + P3_ORCHESTRATOR_PROMPT |
| P3 | Wave 2: Medium Entities (Shared + Documents remaining) | **Swarm** | 3-4 `effect-code-writer` agents | ~14 entities migrated | HANDOFF_P4 + P4_ORCHESTRATOR_PROMPT |
| P4 | Wave 3: Complex Entities (Knowledge) | **Swarm** | 4-5 `effect-code-writer` agents | ~19 entities migrated | HANDOFF_P5 + P5_ORCHESTRATOR_PROMPT |
| P5 | Verification & Cleanup | Solo | `package-error-fixer` | All gates green | Final REFLECTION_LOG entry |

**CRITICAL**: Each phase is NOT complete until BOTH handoff documents for the next phase exist. Handoffs MUST incorporate learnings from the REFLECTION_LOG.

---

## Entry Points

- **Start here**: Read this README, then proceed to `MASTER_ORCHESTRATION.md` for full workflow.
- **Quick start**: Use `QUICK_START.md` for the 5-minute version.
- **Phase-by-phase**: Use `handoffs/P[N]_ORCHESTRATOR_PROMPT.md` to launch each phase.

---

## Key Files

| File | Role |
|------|------|
| `.claude/skills/canonical-domain-entity.md` | **Pattern source of truth** -- exact module structure, contract pattern, anti-patterns |
| `packages/documents/domain/src/entities/Comment/` | **Reference implementation** -- fully canonical entity |
| `packages/documents/domain/src/entities/Page/` | **Second reference** -- canonical entity with 16 contracts |
| `packages/shared/domain/src/factories/db-repo.ts` | Domain types: `BaseRepo`, `Method`, `DbRepoSuccess` |
| `packages/*/domain/src/entities/*/*.model.ts` | Existing model files (starting point for each entity) |
| `packages/*/server/src/db/repos/*.repo.ts` | Server repos to READ for custom method signatures |
| `packages/common/identity/src/packages.ts` | Identity builders for all slices |

---

## Related

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Canonical pattern skill: `.claude/skills/canonical-domain-entity.md`
- Completed db-repo-standardization spec: `specs/completed/db-repo-standardization/`
