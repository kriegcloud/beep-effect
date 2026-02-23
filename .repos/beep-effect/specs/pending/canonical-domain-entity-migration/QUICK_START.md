# canonical-domain-entity-migration Quick Start

> 5-minute guide to executing this spec.

---

## When This Spec Applies

- [x] Need to migrate bare domain entities to the canonical TaggedRequest contract pattern?
- [x] 56 entities across 7 slices need full contract surfaces?
- [x] Want unified RPC/HTTP/AI-tool derivation from a single contract class?

If YES to all -> This spec applies. If NO -> Check `specs/README.md` for alternatives.

---

## 1) Understand the Pattern

The canonical pattern gives every entity a uniform structure:

```
packages/<slice>/domain/src/entities/<Entity>/
  <Entity>.model.ts           -- SQL model (already exists)
  <Entity>.errors.ts          -- Tagged errors with HTTP annotations
  <Entity>.repo.ts            -- Repository contract (domain-level)
  <Entity>.rpc.ts             -- RPC group (from contracts)
  <Entity>.http.ts            -- HTTP API group (from contracts)
  <Entity>.tool.ts            -- AI toolkit (from contracts)
  <Entity>.entity.ts          -- Cluster entity (from RPC group)
  contracts/
    Get.contract.ts           -- One file per operation
    Create.contract.ts
    ...
    index.ts                  -- Namespace barrel
  index.ts                    -- Entity barrel
```

**Pattern source of truth**: `.claude/skills/canonical-domain-entity.md`
**Reference implementation**: `packages/documents/domain/src/entities/Comment/`

## 2) Read the Skill

This is the single most important step. Load the canonical-domain-entity skill:

```
.claude/skills/canonical-domain-entity.md
```

It contains the exact code patterns for every file type, HTTP method mapping, error patterns, repo contract patterns, barrel export rules, and 8 anti-patterns to avoid.

## 3) Phase-by-Phase Execution

| Phase | What to Do | Mode | Time | Handoff Required |
|-------|-----------|------|------|------------------|
| P1 | Verify inventory against codebase, catalog server repo methods | Solo | ~20 min | HANDOFF_P2 + P2_ORCHESTRATOR_PROMPT |
| P2 | Migrate ~22 simple entities (IAM + Calendar + Comms + Customization) | **Swarm** | ~30-45 min | HANDOFF_P3 + P3_ORCHESTRATOR_PROMPT |
| P3 | Migrate ~14 medium entities (Shared + Documents remaining) | **Swarm** | ~30-45 min | HANDOFF_P4 + P4_ORCHESTRATOR_PROMPT |
| P4 | Migrate 19 complex entities (Knowledge) | **Swarm** | ~45-60 min | HANDOFF_P5 + P5_ORCHESTRATOR_PROMPT |
| P5 | Run quality gates, fix errors, regenerate barrels | Solo | ~15-30 min | Final REFLECTION_LOG entry |

**CRITICAL**: Each phase MUST produce BOTH handoff documents for the next phase. The phase is NOT complete until they exist. Handoffs MUST include valuable learnings from REFLECTION_LOG.

## 4) Start Execution

**Option A: Full sequential** -- Follow `MASTER_ORCHESTRATION.md` phase by phase.

**Option B: Jump to a wave** -- If inventory is already verified, skip to the wave you need:
- Wave 1 (P2): Simple CRUD entities
- Wave 2 (P3): Entities with custom repo methods
- Wave 3 (P4): Knowledge slice entities

Each wave is independently executable as long as the inventory is verified.

## 5) Quick Swarm Setup (for Waves)

```
1. TeamCreate -> team_name="entity-migration-wave<N>"
2. TaskCreate -> one per agent batch (5-7 entities each)
3. Task tool -> spawn teammates (use general-purpose agent type)
4. TaskUpdate -> assign tasks to teammates
5. Monitor -> TaskList
6. Verify -> bun run check --filter @beep/<slice>-domain
7. Shutdown -> SendMessage type="shutdown_request" to each agent
```

See AGENT_PROMPTS.md Section 3 ("Swarm Orchestrator Instructions") for detailed steps.

## 6) Key Commands

```bash
# Check a specific domain package
bun run check --filter @beep/iam-domain
bun run check --filter @beep/shared-domain
bun run check --filter @beep/documents-domain
bun run check --filter @beep/knowledge-domain

# Full verification
bun run check && bun run lint:fix && bun run lint

# Regenerate barrel exports after adding new modules
bunx effect generate --cwd packages/<slice>/domain

# Isolated type check (avoids turbo cascading)
tsc --noEmit -p packages/<slice>/domain/tsconfig.json
```

## 7) Common Gotchas

- **Identity builder path**: `$I = $SliceDomainId.create("entities/Entity/Entity.module")` -- the path MUST match the actual file location relative to `src/`
- **Repo `type` imports**: The repo file MUST use `type` keyword on model and contract imports to avoid circular runtime dependencies
- **HTTP error chaining**: Chain `.addError(ErrorClass)` per error. NEVER pass a union to `.addError()`
- **Barrel exports**: Errors, RPCs, and contracts use NAMESPACE exports (`export * as X from`). Model, repo, http, tool, entity use FLAT exports (`export * from`)
- **Empty extensions**: CRUD-only entities with no custom methods use `DbRepo.DbRepoSuccess<typeof Model, {}>` (empty object, not omitted)
- **Cross-slice repos**: User, Organization, Session, Team models live in `shared/domain` but their server repos live in `iam/server`
- **Turborepo cascading**: Errors in `shared-domain` will cascade to all downstream domain packages. Fix shared first.
- **File renaming**: ALWAYS use `mcp__mcp-refactor-typescript__file_operations` for renames. Manual `mv` breaks imports across the codebase. The MCP tool updates ALL references automatically.
- **Rename before create**: When converting kebab-case entities, rename existing files FIRST (using MCP tool), then create new canonical files. This prevents broken imports.

## 8) Reference Implementation Quick Tour

The Comment entity shows every pattern:

```
Comment.model.ts     -> M.Class with makeFields(DocumentsEntityIds.CommentId, { ... })
Comment.errors.ts    -> S.TaggedError with annotationsHttp, aggregate Errors union
Comment.repo.ts      -> Context.Tag + DbRepo.DbRepoSuccess with DbRepo.Method extensions
Comment.rpc.ts       -> RpcGroup.make(Get.Contract.Rpc, Create.Contract.Rpc, ...)
Comment.http.ts      -> HttpApiGroup.make("comments").add(...).prefix("/comments")
Comment.tool.ts      -> AiToolkit.make(Get.Contract.Tool, Create.Contract.Tool, ...)
Comment.entity.ts    -> ClusterEntity.fromRpcGroup("Entity", Rpcs).annotateRpcs(...)
contracts/Get.contract.ts -> Payload + Success({ data: Model.json }) + Failure + Contract
contracts/Create.contract.ts -> POST, status 201, mutation errors
contracts/Delete.contract.ts -> DEL, status 204, S.Void success
```
