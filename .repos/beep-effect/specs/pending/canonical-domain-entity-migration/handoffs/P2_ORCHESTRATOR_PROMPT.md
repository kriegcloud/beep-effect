# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the canonical-domain-entity-migration spec: Wave 1 Simple Entity Migration.

### Context

Phase 1 verified the entity inventory across all 7 slices and cataloged server repo custom methods. Key findings:

- 58 total entities (2 canonical, 56 requiring migration)
- ALL 20 IAM entities have CRUD-only repos (zero custom extensions)
- 4 OAuth entities have NO server repos at all
- Knowledge slice already uses PascalCase (no renaming needed for Wave 3)

### Your Mission

Orchestrate a swarm of 4 parallel agents to migrate 23 simple CRUD entities (all IAM + Calendar + Comms + Customization) to the canonical domain entity pattern.

**Entities to migrate**:
- Batch 1: Account, ApiKey, DeviceCode, Invitation, Jwks (5 entities)
- Batch 2: Member, OrganizationRole, Passkey, RateLimit, ScimProvider (5 entities)
- Batch 3: SsoProvider, Subscription, TeamMember, TwoFactor, Verification, WalletAddress (6 entities)
- Batch 4: OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken, CalendarEvent, EmailTemplate, UserHotkey (7 entities)

**Each entity gets**:
- Renamed from kebab-case to PascalCase (using MCP refactor tools)
- `<Entity>.errors.ts` with NotFound + PermissionDenied errors
- `<Entity>.repo.ts` with `DbRepo.DbRepoSuccess<Model, {}>` (empty extensions)
- `contracts/Get.contract.ts` + `contracts/Delete.contract.ts`
- `<Entity>.rpc.ts`, `<Entity>.http.ts`, `<Entity>.tool.ts`, `<Entity>.entity.ts`
- Updated barrel exports (`index.ts`)

### Critical Patterns

**Identity Builder Pattern (per-module)**:
```typescript
import { $IamDomainId } from "@beep/identity/packages";
const $I = $IamDomainId.create("entities/Member/Member.model");
```

**Error Schema Pattern**:
```typescript
export class MemberNotFoundError extends S.TaggedError<MemberNotFoundError>()(
  $I`MemberNotFoundError`,
  {
    id: IamEntityIds.MemberId,
  },
  $I.annotationsHttp("MemberNotFoundError", {
    status: 404,
    description: "Error when a member with the specified ID cannot be found.",
  })
) {}
```

**Repo Contract Pattern (CRUD-only)**:
```typescript
export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Member.Model,
  {}  // Empty extensions for all Wave 1 entities
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
```

**Get Contract Pattern**:
```typescript
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: IamEntityIds.MemberId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Get Member Contract.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: Member.Model.json,
  },
  $I.annotations("Success", {
    description: "Success response for the Get Member Contract.",
  })
) {}

export const Failure = MemberErrors.MemberNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Get Member Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(MemberErrors.MemberNotFoundError)
    .addSuccess(Success);
}
```

**Delete Contract Pattern**:
```typescript
export class Success extends S.Void.annotations(
  $I.annotations("Success", {
    description: "Success response for the Delete Member contract.",
  })
) {}

export const Failure = S.Union(
  MemberErrors.MemberNotFoundError,
  MemberErrors.MemberPermissionDeniedError,
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Delete Member Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(MemberErrors.MemberNotFoundError)
    .addError(MemberErrors.MemberPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
```

**MCP Renaming Pattern (REQUIRED)**:
```
mcp__mcp-refactor-typescript__file_operations:
  operation: "rename_file"
  sourcePath: "packages/iam/domain/src/entities/member/member.model.ts"
  name: "Member.model.ts"

mcp__mcp-refactor-typescript__file_operations:
  operation: "move_file"
  sourcePath: "packages/iam/domain/src/entities/member"
  destinationPath: "packages/iam/domain/src/entities/Member"
```

### Reference Files

Before spawning agents, ensure they read:
- Pattern: `.claude/skills/canonical-domain-entity.md` - Authoritative pattern document
- Reference: `packages/documents/domain/src/entities/Comment/` - Fully canonical entity
- Handoff: `specs/pending/canonical-domain-entity-migration/handoffs/HANDOFF_P2.md` - Full context for Phase 2

### Swarm Execution Steps

**Step 1: Create Team**
```
TeamCreate:
  team_name: "entity-migration-wave1"
  description: "Wave 1: Migrate simple CRUD entities to canonical pattern"
```

**Step 2: Create Tasks (4 tasks, one per batch)**

Task 1 (iam-batch-1):
```
TaskCreate:
  subject: "Migrate Account, ApiKey, DeviceCode, Invitation, Jwks to canonical pattern"
  description: "Migrate 5 IAM entities (batch 1) to canonical domain entity pattern with Get + Delete contracts"
  activeForm: "Migrating IAM entities batch 1"
```

Task 2 (iam-batch-2):
```
TaskCreate:
  subject: "Migrate Member, OrganizationRole, Passkey, RateLimit, ScimProvider to canonical pattern"
  description: "Migrate 5 IAM entities (batch 2) to canonical domain entity pattern with Get + Delete contracts. Member and Passkey have schemas/ subdirectories to preserve."
  activeForm: "Migrating IAM entities batch 2"
```

Task 3 (iam-batch-3):
```
TaskCreate:
  subject: "Migrate SsoProvider, Subscription, TeamMember, TwoFactor, Verification, WalletAddress to canonical pattern"
  description: "Migrate 6 IAM entities (batch 3) to canonical domain entity pattern with Get + Delete contracts"
  activeForm: "Migrating IAM entities batch 3"
```

Task 4 (simple-batch):
```
TaskCreate:
  subject: "Migrate OAuth entities + CalendarEvent + EmailTemplate + UserHotkey to canonical pattern"
  description: "Migrate 7 entities (4 OAuth + 3 cross-slice simple entities) to canonical domain entity pattern. OAuth entities have no server repos."
  activeForm: "Migrating simple cross-slice entities"
```

**Step 3: Spawn Teammates (4 agents)**

Agent 1 (iam-batch-1):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave1"
  name: "iam-batch-1"
  prompt: "You are migrating 5 IAM entities (Account, ApiKey, DeviceCode, Invitation, Jwks) to the canonical domain entity pattern. Read HANDOFF_P2.md for full context, then execute the migration workflow for each entity. Use MCP refactor tools for renaming (NEVER mv/git mv). All entities are CRUD-only with empty repo extensions. DeviceCode has a schemas/ subdirectory to preserve."
```

Agent 2 (iam-batch-2):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave1"
  name: "iam-batch-2"
  prompt: "You are migrating 5 IAM entities (Member, OrganizationRole, Passkey, RateLimit, ScimProvider) to the canonical domain entity pattern. Read HANDOFF_P2.md for full context. Member has schemas/ for member-status and member-role; Passkey has schemas/ for authenticator-attachment. Use MCP refactor tools for renaming (NEVER mv/git mv). All entities are CRUD-only with empty repo extensions."
```

Agent 3 (iam-batch-3):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave1"
  name: "iam-batch-3"
  prompt: "You are migrating 6 IAM entities (SsoProvider, Subscription, TeamMember, TwoFactor, Verification, WalletAddress) to the canonical domain entity pattern. Read HANDOFF_P2.md for full context. Use MCP refactor tools for renaming (NEVER mv/git mv). All entities are CRUD-only with empty repo extensions."
```

Agent 4 (simple-batch):
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave1"
  name: "simple-batch"
  prompt: "You are migrating 7 cross-slice entities (OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken [IAM], CalendarEvent [Calendar], EmailTemplate [Comms], UserHotkey [Customization]) to the canonical domain entity pattern. Read HANDOFF_P2.md for full context. OAuth entities have NO server repos (still create full module with empty extensions). Use correct identity builders per slice: $IamDomainId for OAuth, $CalendarDomainId for CalendarEvent, $CommsDomainId for EmailTemplate, $CustomizationDomainId for UserHotkey. Use MCP refactor tools for renaming."
```

**Step 4: Assign Tasks to Agents**
```
TaskUpdate:
  taskId: "<task-1-id>"
  owner: "iam-batch-1"

TaskUpdate:
  taskId: "<task-2-id>"
  owner: "iam-batch-2"

TaskUpdate:
  taskId: "<task-3-id>"
  owner: "iam-batch-3"

TaskUpdate:
  taskId: "<task-4-id>"
  owner: "simple-batch"
```

**Step 5: Monitor via TaskList**

Check periodically for completed/blocked tasks. If an agent fails, create a new task and spawn a replacement agent with refined instructions.

**Step 6: Verify Results**

After all agents complete:
```bash
bun run check --filter @beep/iam-domain
bun run check --filter @beep/calendar-domain
bun run check --filter @beep/comms-domain
bun run check --filter @beep/customization-domain
```

If errors, use `package-error-fixer` agent per slice.

### Verification

After each agent completes their batch, verify:

```bash
# IAM batches
bun run check --filter @beep/iam-domain

# Cross-slice batch
bun run check --filter @beep/calendar-domain
bun run check --filter @beep/comms-domain
bun run check --filter @beep/customization-domain
```

Expect zero new failures (pre-existing failures are acceptable and should be documented).

### Success Criteria

Phase 2 is complete when:
- [ ] All 23 entities have full canonical module structure
- [ ] All directories and files renamed to PascalCase using MCP tools
- [ ] All entities have error schemas with NotFound + PermissionDenied
- [ ] All entities have repo contracts with empty extensions
- [ ] All entities have Get + Delete contracts
- [ ] All entities have RPC, HTTP, Tool, Entity infrastructure files
- [ ] All entities have correct barrel exports
- [ ] `bun run check` passes for all 4 domain packages (or only pre-existing failures)
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created (context document)
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt)

### Handoff Document

Read full context in: `specs/pending/canonical-domain-entity-migration/handoffs/HANDOFF_P2.md`

### Next Phase

After completing Phase 2:
1. Update `REFLECTION_LOG.md` with Phase 2 learnings (what worked, what didn't, patterns discovered)
2. Create `handoffs/HANDOFF_P3.md` with:
   - Phase 2 summary and learnings
   - Wave 2 entity batch assignments (Shared + Documents remaining)
   - Known repo locations (cross-slice repos like User/Organization/Session/Team)
   - Legacy RPC handling strategy (Discussion, Document)
   - Custom method catalog for Shared and Documents entities
3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md` with swarm setup instructions for Wave 2

**CRITICAL**: Phase 2 is NOT complete until BOTH P3 handoff files exist.
