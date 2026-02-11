# Master Orchestration: canonical-domain-entity-migration

> Complete workflow for migrating all 56 non-canonical domain entities to the canonical TaggedRequest contract pattern using swarm-mode parallel agents.

---

## Mandatory Handoff Protocol

**INVIOLABLE RULE**: Every phase MUST create BOTH handoff documents for the next phase before the current phase can be considered complete:

1. `handoffs/HANDOFF_P[N+1].md` -- Full context document
2. `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` -- Copy-paste prompt

Handoff documents MUST incorporate valuable learnings from `REFLECTION_LOG.md` to maximize the next phase's probability of success. Information not passed forward is LOST -- agents start fresh each session.

See `specs/_guide/HANDOFF_STANDARDS.md` for format requirements and context budget protocol.

---

## Pattern Source of Truth

**CRITICAL**: All agents MUST read these two references before writing any code:

1. **Skill**: `.claude/skills/canonical-domain-entity.md` -- The authoritative pattern document. Contains exact module structure, contract template, error pattern, repo contract pattern, infrastructure file patterns, barrel export rules, and 8 common anti-patterns.

2. **Reference implementation**: `packages/documents/domain/src/entities/Comment/` -- A fully canonical entity with 5 contracts (Get, Create, Update, Delete, ListByDiscussion). Every file in this directory is the gold standard.

---

## TypeScript Refactor Tool (MCP)

**CRITICAL**: When renaming entity directories and files from kebab-case to PascalCase, agents MUST use the `mcp__mcp-refactor-typescript` MCP tools instead of manual `mv` commands. These tools perform compiler-aware renames that automatically update ALL imports, re-exports, dynamic imports, and JSDoc references across the entire codebase.

### Available Operations

| Operation | Tool | Use Case |
|-----------|------|----------|
| `rename_file` | `mcp__mcp-refactor-typescript__file_operations` | Rename a single file with import updates |
| `batch_move_files` | `mcp__mcp-refactor-typescript__file_operations` | Rename/move multiple files at once |
| `find_references` | `mcp__mcp-refactor-typescript__workspace` | Check import impact BEFORE renaming |
| `fix_all` | `mcp__mcp-refactor-typescript__code_quality` | Fix any remaining issues after rename |
| `organize_imports` | `mcp__mcp-refactor-typescript__code_quality` | Clean up imports after refactoring |

### Rename Workflow Per Entity

For each entity being renamed from kebab-case to PascalCase:

1. **Preview references** (optional but recommended for high-traffic entities):
   ```
   mcp__mcp-refactor-typescript__workspace:
     operation: "find_references"
     filePath: "packages/<slice>/domain/src/entities/<kebab-name>/<kebab-name>.model.ts"
     text: "<export name>"
     line: <line of export>
   ```

2. **Rename the model file** (triggers import updates across codebase):
   ```
   mcp__mcp-refactor-typescript__file_operations:
     operation: "rename_file"
     sourcePath: "packages/<slice>/domain/src/entities/<kebab-name>/<kebab-name>.model.ts"
     name: "<PascalName>.model.ts"
   ```

3. **Rename any other existing files** (errors, rpc, index, schemas/):
   Repeat `rename_file` for each existing file in the directory.

4. **Rename the directory** itself:
   ```
   mcp__mcp-refactor-typescript__file_operations:
     operation: "move_file"
     sourcePath: "packages/<slice>/domain/src/entities/<kebab-name>"
     destinationPath: "packages/<slice>/domain/src/entities/<PascalName>"
   ```

5. **Fix any remaining issues**:
   ```
   mcp__mcp-refactor-typescript__code_quality:
     operation: "fix_all"
     filePath: "packages/<slice>/domain/src/entities/<PascalName>/index.ts"
   ```

### Why NOT Manual Rename

Manual `mv` + `grep` renames will MISS:
- Dynamic imports
- Re-exports through barrel files
- Type-only imports
- JSDoc `@see` references
- Test file imports
- Cross-package path alias references

The MCP refactor tool catches ALL of these because it uses the TypeScript compiler's reference graph.

---

## Phase 1: Inventory Verification & Task Planning

### Purpose

Verify the entity inventory against the actual codebase (entities may have changed since spec creation), catalog server repo custom methods, and produce a verified task list for swarm execution.

### Mode: Solo

### Tasks

#### Task 1.1: Read Canonical References

Read the canonical pattern skill and Comment entity:

```
.claude/skills/canonical-domain-entity.md
packages/documents/domain/src/entities/Comment/Comment.model.ts
packages/documents/domain/src/entities/Comment/Comment.errors.ts
packages/documents/domain/src/entities/Comment/Comment.repo.ts
packages/documents/domain/src/entities/Comment/Comment.rpc.ts
packages/documents/domain/src/entities/Comment/Comment.http.ts
packages/documents/domain/src/entities/Comment/Comment.tool.ts
packages/documents/domain/src/entities/Comment/Comment.entity.ts
packages/documents/domain/src/entities/Comment/contracts/Get.contract.ts
packages/documents/domain/src/entities/Comment/contracts/Create.contract.ts
packages/documents/domain/src/entities/Comment/index.ts
packages/documents/domain/src/entities/Comment/contracts/index.ts
```

#### Task 1.2: Verify Entity Inventory

For each slice, verify entities exist in `packages/<slice>/domain/src/entities/`:

```bash
ls packages/shared/domain/src/entities/
ls packages/iam/domain/src/entities/
ls packages/documents/domain/src/entities/
ls packages/knowledge/domain/src/entities/
ls packages/calendar/domain/src/entities/
ls packages/comms/domain/src/entities/
ls packages/customization/domain/src/entities/
```

Cross-reference against the inventory in `README.md`. Note any entities that were added, removed, or renamed since spec creation.

#### Task 1.3: Catalog Server Repo Custom Methods

For each entity with a server repo, read the repo file and catalog ALL custom methods (beyond base CRUD). This data is critical for defining `DbRepo.Method` extensions in domain repo contracts.

**Server repo locations**:

| Slice | Repo Directory |
|-------|---------------|
| Shared | `packages/shared/server/src/db/repos/` |
| IAM | `packages/iam/server/src/db/repos/` |
| Documents | `packages/documents/server/src/db/repos/` |
| Knowledge | `packages/knowledge/server/src/db/repos/` |
| Calendar | `packages/calendar/server/src/db/repos/` |
| Comms | `packages/comms/server/src/db/repos/` |
| Customization | `packages/customization/server/src/db/repos/` |

For each custom method, record:
- Method name
- Input type (what arguments it takes)
- Output type (what it returns)
- Whether it can fail (and with what error)

#### Task 1.4: Produce Verified Inventory

Write `outputs/verified-inventory.md` with:
1. Confirmed entity list per slice (with any changes from README inventory)
2. Per-entity custom methods from server repos
3. Entities grouped into migration waves (Wave 1: simple, Wave 2: medium, Wave 3: complex)
4. Agent batch assignments for each wave

### Phase Completion Requirements

Phase 1 is complete when ALL of:
- [ ] `outputs/verified-inventory.md` exists with confirmed entity list and custom methods
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created -- must include verified batch assignments and key findings
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created -- must include swarm setup instructions and entity batches

**CRITICAL**: Phase is NOT complete until BOTH P2 handoff files exist.

---

## Phase 2: Wave 1 -- Simple Entities (Swarm Mode)

### Purpose

Migrate all CRUD-only entities (IAM + Calendar + Comms + Customization) using parallel agents. These entities have no or minimal custom repo methods, making them ideal for parallel execution.

### Mode: **Swarm** (TeamCreate + parallel agents)

### Entities: ~22

**IAM (20 entities)**: Account, ApiKey, DeviceCode, Invitation, Jwks, Member, OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken, OrganizationRole, Passkey, RateLimit, ScimProvider, SsoProvider, Subscription, TeamMember, TwoFactor, Verification, WalletAddress

**Calendar (1)**: CalendarEvent

**Comms (1)**: EmailTemplate

**Customization (1)**: UserHotkey

### Swarm Setup

1. **Create team**:
   ```
   TeamCreate: team_name="entity-migration-wave1", description="Wave 1: Migrate simple CRUD entities to canonical pattern"
   ```

2. **Create tasks** via TaskCreate -- one task per agent batch (5-7 entities each)

3. **Spawn teammates** via Task tool with `team_name="entity-migration-wave1"` and `subagent_type="effect-code-writer"`:
   - **Agent 1 (iam-batch-1)**: Account, ApiKey, DeviceCode, Invitation, Jwks
   - **Agent 2 (iam-batch-2)**: Member, OrganizationRole, Passkey, RateLimit, ScimProvider
   - **Agent 3 (iam-batch-3)**: SsoProvider, Subscription, TeamMember, TwoFactor, Verification, WalletAddress
   - **Agent 4 (simple-batch)**: OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken, CalendarEvent, EmailTemplate, UserHotkey

4. **Assign tasks** via TaskUpdate with `owner` set to each agent name

5. **Monitor** via TaskList

### Critical Instructions for Agents

- **Read first**: Load `.claude/skills/canonical-domain-entity.md` and read the Comment entity as reference
- **Rename first, then create**: For kebab-case entities, FIRST rename existing files/directory to PascalCase using `mcp__mcp-refactor-typescript__file_operations`, THEN create new files. This ensures import paths are correct before new files reference them.
- **Use MCP refactor tools**: NEVER use `mv` or `git mv` for renaming. ALWAYS use `mcp__mcp-refactor-typescript__file_operations` with `rename_file` or `move_file` operations. See "TypeScript Refactor Tool (MCP)" section above.
- **CRUD-only entities**: Repo contract uses `DbRepo.DbRepoSuccess<typeof Model, {}>` (empty extensions)
- **Entities with NO server repo** (OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken): Still create full module structure with empty repo extensions. Define only Get and Delete contracts (minimal surface).
- **Identity builder**: All IAM entities use `$IamDomainId`, Calendar uses `$CalendarDomainId`, Comms uses `$CommsDomainId`, Customization uses `$CustomizationDomainId`
- **EntityIds**: IAM entities use `IamEntityIds` and `SharedEntityIds` from `@beep/shared-domain`. Calendar uses `CalendarEntityIds`, etc.
- Each agent should use the AGENT_PROMPTS.md "Entity Migration Agent" template

**NOTE**: Entity names above are the target PascalCase names. Current directory names may differ (e.g., `account/` -> `Account/`, `api-key/` -> `ApiKey/`). Agents must check actual directory names before renaming.

### Post-Swarm Verification

After all agents complete:

```bash
bun run check --filter @beep/iam-domain
bun run check --filter @beep/calendar-domain
bun run check --filter @beep/comms-domain
bun run check --filter @beep/customization-domain
```

If errors, use `package-error-fixer` per slice.

### Phase Completion Requirements

Phase 2 is complete when ALL of:
- [ ] All ~22 entities have full canonical module structure
- [ ] `bun run check` passes for all 4 domain packages (or only pre-existing failures)
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created -- must include patterns that worked, gotchas discovered, and batch assignments for Wave 2
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

**CRITICAL**: Phase is NOT complete until BOTH P3 handoff files exist.

---

## Phase 3: Wave 2 -- Medium Entities (Swarm Mode)

### Purpose

Migrate entities with server repos that have custom methods (Shared + remaining Documents). These require reading server repos before writing domain repo contracts.

### Mode: **Swarm** (TeamCreate + parallel agents)

### Entities: ~14

**Shared (8)**: User, Organization, Session, Team, File, Folder, UploadSession, AuditLog

**Documents (6)**: Discussion, Document, DocumentVersion, DocumentFile, DocumentSource, PageShare

### Critical Pre-Condition

**Before writing the domain repo contract, each agent MUST read the corresponding server repo to catalog custom methods.** Those methods inform `DbRepo.Method` extensions.

### Critical Instructions for Agents

- **Rename first, then create**: For kebab-case entities, FIRST rename existing files/directory to PascalCase using `mcp__mcp-refactor-typescript__file_operations`, THEN create new files. This ensures import paths are correct before new files reference them.
- **Use MCP refactor tools**: NEVER use `mv` or `git mv` for renaming. ALWAYS use `mcp__mcp-refactor-typescript__file_operations` with `rename_file` or `move_file` operations. See "TypeScript Refactor Tool (MCP)" section above.
- **Read server repos first**: Before writing domain repo contracts, read the corresponding server repo to catalog custom methods.

### Known Repo Locations (Cross-Slice)

| Entity | Model Location | Server Repo Location |
|--------|---------------|---------------------|
| User | `packages/shared/domain/src/entities/User/` | `packages/iam/server/src/db/repos/` |
| Organization | `packages/shared/domain/src/entities/Organization/` | `packages/iam/server/src/db/repos/` |
| Session | `packages/shared/domain/src/entities/Session/` | `packages/iam/server/src/db/repos/` |
| Team | `packages/shared/domain/src/entities/Team/` | `packages/iam/server/src/db/repos/` |
| File | `packages/shared/domain/src/entities/File/` | `packages/shared/server/src/db/repos/` |
| Folder | `packages/shared/domain/src/entities/Folder/` | `packages/shared/server/src/db/repos/` |
| UploadSession | `packages/shared/domain/src/entities/UploadSession/` | `packages/shared/server/src/db/repos/` |
| AuditLog | `packages/shared/domain/src/entities/AuditLog/` | No repo |
| Discussion | `packages/documents/domain/src/entities/Discussion/` | `packages/documents/server/src/db/repos/` |
| Document | `packages/documents/domain/src/entities/Document/` | `packages/documents/server/src/db/repos/` |
| DocumentVersion | `packages/documents/domain/src/entities/DocumentVersion/` | `packages/documents/server/src/db/repos/` |
| DocumentFile | `packages/documents/domain/src/entities/DocumentFile/` | `packages/documents/server/src/db/repos/` |
| DocumentSource | `packages/documents/domain/src/entities/DocumentSource/` | `packages/documents/server/src/db/repos/` |
| PageShare | `packages/documents/domain/src/entities/PageShare/` | No repo |

### Swarm Setup

```
TeamCreate: team_name="entity-migration-wave2", description="Wave 2: Migrate medium-complexity entities with custom repo methods"
```

### Agent Assignments

- **Agent 1 (shared-iam-repos)**: User, Organization, Session, Team -- NOTE: repos live in `packages/iam/server/src/db/repos/`, not shared/server
- **Agent 2 (shared-server-repos)**: File, Folder, UploadSession, AuditLog -- repos in `packages/shared/server/src/db/repos/`
- **Agent 3 (documents-batch-1)**: Discussion (6 ops), PageShare (no repo)
- **Agent 4 (documents-batch-2)**: Document (15 ops), DocumentVersion (1 op), DocumentFile, DocumentSource

### Special Handling: Legacy Inline RPCs

Discussion and Document currently have legacy inline RPC definitions (not contract-based). When migrating these entities:

1. Read the existing `*.rpc.ts` file to understand what operations exist
2. Create a separate `contracts/<Operation>.contract.ts` for each operation
3. Replace the inline RPC definitions in `*.rpc.ts` with contract-derived RPCs
4. The new `*.rpc.ts` should aggregate `Contract.Rpc` from each contract (like Comment.rpc.ts does)

### Known Custom Methods from Server Repos

**File**: `listPaginated`, `moveFiles`, `deleteFiles`, `getFilesByKeys`
**Folder**: `deleteFolders`
**UploadSession**: `store` (upsert), `findByFileKey`, `deleteByFileKey`, `deleteExpired`, `isValid`
**Discussion**: `findByIdOrFail`, `getWithComments`, `listByDocument`, `create`, `resolve`, `unresolve`, `hardDelete`
**Document**: `findByIdOrFail`, `search` (full-text), `listByUser`, `list`, `listArchived`, `listChildren`, `archive`, `restore`, `publish`, `unpublish`, `lock`, `unlock`, `hardDelete`
**DocumentVersion**: `findByIdOrFail`, `getWithAuthor`, `listByDocument`, `createSnapshot`, `hardDelete`
**DocumentFile**: `findByIdOrFail`, `listByDocument`, `listByUser`, `create`, `hardDelete`
**DocumentSource**: `findByMappingKey`

### Post-Swarm Verification

```bash
bun run check --filter @beep/shared-domain
bun run check --filter @beep/documents-domain
```

### Phase Completion Requirements

Phase 3 is complete when ALL of:
- [ ] All ~14 entities have full canonical module structure
- [ ] Domain repo contracts include `DbRepo.Method` extensions for all custom methods
- [ ] `bun run check` passes for shared-domain and documents-domain
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] `handoffs/HANDOFF_P4.md` created -- must include lessons from Wave 2 (especially legacy RPC handling) and batch assignments for Wave 3
- [ ] `handoffs/P4_ORCHESTRATOR_PROMPT.md` created

**CRITICAL**: Phase is NOT complete until BOTH P4 handoff files exist.

---

## Phase 4: Wave 3 -- Complex Entities (Swarm Mode)

### Purpose

Migrate Knowledge slice entities -- 19 entities with rich custom SQL extensions. Knowledge repos use the legacy `Context.Tag` + `Layer.effect` pattern internally, but domain contracts should still use the canonical `Context.Tag($I\`Repo\`)` pattern.

### Mode: **Swarm** (TeamCreate + parallel agents)

### Entities: 19

Entity, EntityCluster, Embedding, Ontology, Relation, SameAsLink, Mention, MentionRecord, MergeHistory, RelationEvidence, ClassDefinition, PropertyDefinition, MeetingPrepBullet, MeetingPrepEvidence, Batch, Extraction, EmailThread, EmailThreadMessage, Agent (KnowledgeAgent)

### Critical Pre-Condition

**Agents MUST read each server repo** in `packages/knowledge/server/src/db/repos/` to extract custom method signatures. Knowledge repos have the richest query surfaces in the codebase.

### Critical Instructions for Agents

- **Rename first, then create**: For kebab-case entities, FIRST rename existing files/directory to PascalCase using `mcp__mcp-refactor-typescript__file_operations`, THEN create new files. This ensures import paths are correct before new files reference them.
- **Use MCP refactor tools**: NEVER use `mv` or `git mv` for renaming. ALWAYS use `mcp__mcp-refactor-typescript__file_operations` with `rename_file` or `move_file` operations. See "TypeScript Refactor Tool (MCP)" section above.
- **Knowledge entities are mostly PascalCase already**: Most Knowledge entities already use PascalCase directories. Check each entity before attempting rename.
- **KnowledgeAgent special case**: The `Agent/` directory uses `KnowledgeAgent` as the file prefix (not `Agent`). Keep the `KnowledgeAgent` prefix for all new files.

### Swarm Setup

```
TeamCreate: team_name="entity-migration-wave3", description="Wave 3: Migrate Knowledge slice complex entities"
```

### Agent Assignments (grouped by repo complexity)

- **Agent 1 (knowledge-complex-1)**: Entity (5+ methods), EntityCluster (5+ methods)
- **Agent 2 (knowledge-complex-2)**: Embedding (4 methods + custom `SimilarityResult` type), Relation (5 methods)
- **Agent 3 (knowledge-complex-3)**: SameAsLink (7 methods), MergeHistory (4 methods)
- **Agent 4 (knowledge-medium)**: Mention (3 methods), MentionRecord (4 methods), RelationEvidence (3 methods)
- **Agent 5 (knowledge-simple)**: Ontology, ClassDefinition, PropertyDefinition, MeetingPrepBullet, MeetingPrepEvidence, Batch, Extraction, EmailThread, EmailThreadMessage, Agent

### Known Custom Methods from Server Repos

**Entity**: `findByIds`, `findByOntology`, `findByType`, `countByOrganization`, `findByNormalizedText`
**EntityCluster**: `findByCanonicalEntity`, `findByMember`, `findByOntology`, `findHighCohesion`, `deleteByOntology`
**Embedding**: `findByCacheKey`, `findSimilar`, `findByEntityType`, `deleteByEntityIdPrefix` + custom `SimilarityResult`
**Ontology**: CRUD only
**Relation**: `findBySourceIds`, `findByTargetIds`, `findByEntityIds`, `findByPredicate`, `countByOrganization`
**SameAsLink**: `findByCanonical`, `findByMember`, `resolveCanonical`, `findHighConfidence`, `findBySource`, `deleteByCanonical`, `countMembers`
**Mention**: `findByEntityId`, `findByIds`, `findByDocumentId`
**MentionRecord**: `findByExtractionId`, `findByResolvedEntityId`, `findUnresolved`, `updateResolvedEntityId`
**MergeHistory**: `findByTargetEntity`, `findBySourceEntity`, `findByUser`, `findByOrganization`
**RelationEvidence**: `findByRelationId`, `findByIds`, `searchByText`
**ClassDefinition**: CRUD only
**PropertyDefinition**: CRUD only
**MeetingPrepBullet**: `listByMeetingPrepId`
**MeetingPrepEvidence**: `listByBulletId`
**Batch, Extraction, EmailThread, EmailThreadMessage, Agent**: No server repos -- create full module structure with empty extensions

### Special Handling: Custom Return Types

Some Knowledge repos return custom types beyond the entity model:
- `Embedding.findSimilar` returns a `SimilarityResult` (entity + score) -- define a value object or inline schema in the contract Success
- Knowledge repos use `Context.Tag` + `Layer.effect` pattern for their implementations -- this does NOT affect domain contracts (which always use the canonical `Context.Tag($I\`Repo\`)` pattern)

### Post-Swarm Verification

```bash
bun run check --filter @beep/knowledge-domain
```

### Phase Completion Requirements

Phase 4 is complete when ALL of:
- [ ] All 19 Knowledge entities have full canonical module structure
- [ ] Domain repo contracts include `DbRepo.Method` extensions for all custom methods
- [ ] Custom return types (SimilarityResult) properly defined in contracts
- [ ] `bun run check` passes for knowledge-domain
- [ ] `REFLECTION_LOG.md` updated with Phase 4 learnings
- [ ] `handoffs/HANDOFF_P5.md` created -- must include all entities completed and any remaining type errors
- [ ] `handoffs/P5_ORCHESTRATOR_PROMPT.md` created

**CRITICAL**: Phase is NOT complete until BOTH P5 handoff files exist.

---

## Phase 5: Verification & Cleanup

### Purpose

Run all quality gates, fix any remaining type errors, and regenerate barrel exports.

### Mode: Solo (with `package-error-fixer` delegation)

### Tasks

#### Task 5.1: Regenerate Barrel Exports

For each modified domain package:

```bash
bunx effect generate --cwd packages/shared/domain
bunx effect generate --cwd packages/iam/domain
bunx effect generate --cwd packages/documents/domain
bunx effect generate --cwd packages/knowledge/domain
bunx effect generate --cwd packages/calendar/domain
bunx effect generate --cwd packages/comms/domain
bunx effect generate --cwd packages/customization/domain
```

#### Task 5.2: Run Quality Gates

```bash
bun run check
bun run lint:fix && bun run lint
```

#### Task 5.3: Fix Remaining Errors

If errors remain, delegate to `package-error-fixer` per slice:

```bash
bun run check --filter @beep/iam-domain
bun run check --filter @beep/shared-domain
bun run check --filter @beep/documents-domain
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/calendar-domain
bun run check --filter @beep/comms-domain
bun run check --filter @beep/customization-domain
```

#### Task 5.4: Document Pre-Existing Failures

If any check/test failures exist that are NOT caused by this migration, document them in `outputs/pre-existing-failures.md`.

### Completion Criteria

- [ ] `bun run check` -- zero new failures
- [ ] `bun run lint:fix && bun run lint` -- zero new failures
- [ ] All barrel exports regenerated
- [ ] Pre-existing failures documented (if any)
- [ ] `REFLECTION_LOG.md` updated with final learnings

---

## Context Budget Tracking

Per `specs/_guide/HANDOFF_STANDARDS.md`, orchestrators MUST monitor context consumption.

| Phase | Work Items | Est. Tool Calls | Sub-Agents | Large Reads | Risk | Split Trigger |
|-------|------------|-----------------|------------|-------------|------|---------------|
| P1 | 4 | 8-15 | 1 | 5-10 | Medium | N/A |
| P2 | 4 | 4-6 (orchestrator only) | 3-4 swarm | 0 | Low | N/A |
| P3 | 4 | 4-6 (orchestrator only) | 3-4 swarm | 0 | Medium | Split if legacy RPCs are complex |
| P4 | 5 | 5-8 (orchestrator only) | 4-5 swarm | 0 | Medium | Split if custom types are complex |
| P5 | 4 | 10-15 | 1-7 | 0-5 | Medium | Split per-slice if many errors |

**Zone Protocol**:
- **Green** (0-10 tool calls, 0-2 large reads, 0-5 sub-agents): Continue normally
- **Yellow** (11-15 / 3-4 / 6-8): Assess remaining work, create checkpoint if >30% remaining
- **Red** (16+ / 5+ / 9+): STOP immediately, create checkpoint handoff

---

## Swarm Operation Reference

This section provides step-by-step instructions for instances unfamiliar with TeamCreate/Task tools.

### Setting Up a Swarm

```
1. TeamCreate
   - team_name: "entity-migration-wave<N>"
   - description: "Wave <N>: <purpose>"

2. TaskCreate (one per agent batch)
   - subject: "Migrate <Entity1>, <Entity2>, ... to canonical pattern"
   - description: "<detailed instructions>"
   - activeForm: "Migrating <slice> entities"

3. Task tool (spawn teammates)
   - Use subagent_type: "effect-code-writer" or equivalent general-purpose agent
   - Set team_name: "entity-migration-wave<N>"
   - Set name: "<descriptive-agent-name>"
   - Provide the agent prompt from AGENT_PROMPTS.md

4. TaskUpdate (assign tasks)
   - taskId: "<task-id>"
   - owner: "<agent-name>"

5. Monitor via TaskList
   - Check periodically for completed/blocked tasks
   - Re-assign failed batches to new agents if needed
```

### Handling Agent Failures

If an agent fails or produces incorrect output:

1. Check the agent's last message for error details
2. Create a new task for the failed entities
3. Spawn a new agent with a refined prompt incorporating the failure context
4. If the same pattern fails repeatedly, fall back to solo mode for those entities

### Shutting Down a Swarm

After all agents complete their tasks:

```
1. SendMessage with type: "shutdown_request" to each agent
2. Wait for shutdown confirmations
3. Verify all tasks are marked completed via TaskList
4. TeamDelete to clean up team resources
```
