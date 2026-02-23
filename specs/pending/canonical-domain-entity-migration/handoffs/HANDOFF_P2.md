# Phase 2 Handoff: Wave 1 Simple Entity Migration

**Date**: 2026-02-11
**From**: Phase 1 (Inventory Verification)
**To**: Phase 2 (Wave 1: Simple CRUD Entities)
**Status**: Ready for swarm implementation

---

## Phase 1 Summary

Phase 1 verified the entity inventory across all 7 slices and cataloged server repo custom methods. Key findings:

**Verified Inventory**:
- 58 total entities, 2 canonical (Comment, Page), 56 requiring migration
- IAM: 20 entities, ALL repos CRUD-only (zero custom extensions)
- Knowledge: 19 entities, 11 repos with 36 custom methods
- Documents: 8 entities (6 requiring migration), some with legacy inline RPCs
- Shared: 8 entities, 3 repos with 10 custom methods
- Calendar: 1 entity (CRUD only)
- Comms: 1 entity (CRUD only)
- Customization: 1 entity (CRUD only)

**Critical Discovery**: ALL 20 IAM entities have CRUD-only repos (or no repos at all), making them ideal for parallel Wave 1 execution.

**Entities Without Server Repos**: OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken (IAM slice) -- these still receive full canonical module structure with empty repo extensions and minimal contract surface (Get + Delete only).

---

## Wave 1 Scope: Simple CRUD Entities

### Total: 23 entities across 4 slices

| Slice | Entities | Repo Status |
|-------|----------|-------------|
| IAM | 20 | All CRUD-only or no repo |
| Calendar | 1 | CRUD-only |
| Comms | 1 | CRUD-only |
| Customization | 1 | CRUD-only |

### Agent Batch Assignments

**Batch 1 (iam-batch-1)**: Account, ApiKey, DeviceCode, Invitation, Jwks (5 entities)
**Batch 2 (iam-batch-2)**: Member, OrganizationRole, Passkey, RateLimit, ScimProvider (5 entities)
**Batch 3 (iam-batch-3)**: SsoProvider, Subscription, TeamMember, TwoFactor, Verification, WalletAddress (6 entities)
**Batch 4 (simple-batch)**: OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken, CalendarEvent, EmailTemplate, UserHotkey (7 entities)

---

## Prerequisite Context

### Pattern Source of Truth

**CRITICAL**: Agents MUST read these references FIRST:

1. `.claude/skills/canonical-domain-entity.md` -- The authoritative pattern document with exact module structure, contract templates, error patterns, repo contract patterns, infrastructure file patterns, barrel export rules, and 8 common anti-patterns.

2. `packages/documents/domain/src/entities/Comment/` -- Reference implementation with 5 contracts (Get, Create, Update, Delete, ListByDiscussion). Read ALL files in this directory:
   - `Comment.model.ts`
   - `Comment.errors.ts`
   - `Comment.repo.ts`
   - `Comment.rpc.ts`
   - `Comment.http.ts`
   - `Comment.tool.ts`
   - `Comment.entity.ts`
   - `contracts/Get.contract.ts`
   - `contracts/Create.contract.ts`
   - `contracts/Delete.contract.ts`
   - `contracts/index.ts`
   - `index.ts`

---

## Identity Builder and EntityId Reference

### Identity Builders by Slice

| Slice | Identity Builder Import | Usage Pattern |
|-------|------------------------|---------------|
| IAM | `import { $IamDomainId } from "@beep/identity/packages"` | `const $I = $IamDomainId.create("entities/Account/Account.model")` |
| Calendar | `import { $CalendarDomainId } from "@beep/identity/packages"` | `const $I = $CalendarDomainId.create("entities/CalendarEvent/CalendarEvent.model")` |
| Comms | `import { $CommsDomainId } from "@beep/identity/packages"` | `const $I = $CommsDomainId.create("entities/EmailTemplate/EmailTemplate.model")` |
| Customization | `import { $CustomizationDomainId } from "@beep/identity/packages"` | `const $I = $CustomizationDomainId.create("entities/UserHotkey/UserHotkey.model")` |

### EntityIds by Slice

| Slice | Import | Common EntityIds |
|-------|--------|------------------|
| IAM | `import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain"` | `IamEntityIds.MemberId`, `SharedEntityIds.UserId`, `SharedEntityIds.OrganizationId` |
| Calendar | `import { CalendarEntityIds, SharedEntityIds } from "@beep/shared-domain"` | `CalendarEntityIds.EventId`, `SharedEntityIds.UserId` |
| Comms | `import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain"` | `CommsEntityIds.EmailTemplateId`, `SharedEntityIds.OrganizationId` |
| Customization | `import { CustomizationEntityIds, SharedEntityIds } from "@beep/shared-domain"` | `CustomizationEntityIds.UserHotkeyId`, `SharedEntityIds.UserId` |

**All Wave 1 entities use their slice-specific EntityId for the `id` field and may reference `SharedEntityIds` for foreign keys (`userId`, `organizationId`, etc.).**

---

## Entity Migration Workflow (Per Entity)

### Step 1: Rename Directory and Files (REQUIRED)

**CRITICAL**: ALL Wave 1 entities use kebab-case and MUST be renamed to PascalCase using MCP refactor tools. NEVER use `mv` or `git mv`.

**Current directory names → Target names**:
- `account` → `Account`
- `api-key` → `ApiKey`
- `device-code` → `DeviceCode`
- `invitation` → `Invitation`
- `jwks` → `Jwks`
- `member` → `Member`
- `oauth-access-token` → `OAuthAccessToken`
- `oauth-client` → `OAuthClient`
- `oauth-consent` → `OAuthConsent`
- `oauth-refresh-token` → `OAuthRefreshToken`
- `organization-role` → `OrganizationRole`
- `passkey` → `Passkey`
- `rate-limit` → `RateLimit`
- `scim-provider` → `ScimProvider`
- `sso-provider` → `SsoProvider`
- `subscription` → `Subscription`
- `team-member` → `TeamMember`
- `two-factor` → `TwoFactor`
- `verification` → `Verification`
- `wallet-address` → `WalletAddress`
- `calendar-event` → `CalendarEvent`
- `email-template` → `EmailTemplate`
- `user-hotkey` → `UserHotkey`

**Rename Workflow**:

1. **Rename existing model file** (triggers import updates across codebase):
   ```
   mcp__mcp-refactor-typescript__file_operations:
     operation: "rename_file"
     sourcePath: "packages/<slice>/domain/src/entities/<kebab-name>/<kebab-name>.model.ts"
     name: "<PascalName>.model.ts"
   ```

2. **Rename any other existing files** (errors, rpc, index, schemas/):
   Repeat `rename_file` for each existing file in the directory.

3. **Rename the directory** itself:
   ```
   mcp__mcp-refactor-typescript__file_operations:
     operation: "move_file"
     sourcePath: "packages/<slice>/domain/src/entities/<kebab-name>"
     destinationPath: "packages/<slice>/domain/src/entities/<PascalName>"
   ```

4. **Fix any remaining issues**:
   ```
   mcp__mcp-refactor-typescript__code_quality:
     operation: "fix_all"
     filePath: "packages/<slice>/domain/src/entities/<PascalName>/index.ts"
   ```

### Step 2: Create Error Schemas (`<Entity>.errors.ts`)

**Template** (based on Comment entity):

```typescript
import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/Member/Member.errors");

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

export class MemberPermissionDeniedError extends S.TaggedError<MemberPermissionDeniedError>()(
  $I`MemberPermissionDeniedError`,
  {
    id: IamEntityIds.MemberId,
  },
  $I.annotationsHttp("MemberPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the member.",
  })
) {}

// Aggregate union at bottom
export const Errors = S.Union(MemberNotFoundError, MemberPermissionDeniedError);
export type Errors = typeof Errors.Type;
```

**Every entity needs**:
- `<Entity>NotFoundError` (404)
- `<Entity>PermissionDeniedError` (403)
- Aggregate `Errors` union + matching `type` alias

### Step 3: Create Repository Contract (`<Entity>.repo.ts`)

**Template for CRUD-only entities** (all Wave 1 entities):

```typescript
import { $IamDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Member from "./Member.model";

const $I = $IamDomainId.create("entities/Member/Member.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Member.Model,
  {}  // Empty extensions for CRUD-only entities
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
```

**CRITICAL**: ALL Wave 1 entities use `{}` (empty extensions) because they are CRUD-only. NO custom `DbRepo.Method` entries needed.

### Step 4: Create Contracts (`contracts/Get.contract.ts`, `contracts/Delete.contract.ts`)

**Minimal contract surface for Wave 1**:
- **Get.contract.ts** -- Get by ID
- **Delete.contract.ts** -- Delete by ID

**Get.contract.ts Template**:

```typescript
import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MemberErrors from "../Member.errors";
import * as Member from "../Member.model";

const $I = $IamDomainId.create("entities/Member/contracts/Get.contract");

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

**Delete.contract.ts Template**:

```typescript
import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as MemberErrors from "../Member.errors";

const $I = $IamDomainId.create("entities/Member/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: IamEntityIds.MemberId,
  },
  $I.annotations("Payload", {
    description: "Payload for the Delete Member contract.",
  })
) {}

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

**contracts/index.ts** (barrel for contracts):

```typescript
export * as Delete from "./Delete.contract";
export * as Get from "./Get.contract";
```

### Step 5: Create Infrastructure Files

**`<Entity>.rpc.ts`** (aggregates contract RPCs):

```typescript
import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Delete, Get } from "./contracts";

export class Rpcs extends RpcGroup.make(
  Get.Contract.Rpc,
  Delete.Contract.Rpc
) {}
```

**`<Entity>.http.ts`** (aggregates contract HTTP endpoints):

```typescript
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import { Delete, Get } from "./contracts";

export class Http extends HttpApiGroup.make("members")
  .add(Get.Contract.Http)
  .add(Delete.Contract.Http)
  .prefix("/members") {}
```

**`<Entity>.tool.ts`** (aggregates contract AI tools):

```typescript
import * as AiToolkit from "@effect/ai/Toolkit";
import { Delete, Get } from "./contracts";

export const Toolkit = AiToolkit.make(
  Get.Contract.Tool,
  Delete.Contract.Tool
);
```

**`<Entity>.entity.ts`** (cluster entity):

```typescript
import * as ClusterSchema from "@effect/cluster/ClusterSchema";
import * as ClusterEntity from "@effect/cluster/Entity";
import { Rpcs } from "./Member.rpc";

export const Entity = ClusterEntity.fromRpcGroup("Entity", Rpcs)
  .annotateRpcs(ClusterSchema.Persisted, true);
```

### Step 6: Update Barrel Exports (`index.ts`)

**Entity `index.ts`**:

```typescript
export * from "./Member.entity";
export * from "./Member.http";
export * from "./Member.model";
export * from "./Member.repo";
export * from "./Member.tool";
export * as MemberErrors from "./Member.errors";
export * as Rpcs from "./Member.rpc";
export * as Contracts from "./contracts";
```

**Rules**:
- Flat `export *` for modules with unique exported names (model, repo, http, tool, entity)
- Namespace `export * as X` for collections (errors, rpcs, contracts)

---

## Entities with `schemas/` Subdirectories to Preserve

Some entities have existing `schemas/` directories that must be preserved during rename:

| Entity | Schemas Directory | Contents |
|--------|-------------------|----------|
| DeviceCode | `schemas/` | `device-code-status.schema.ts` |
| Invitation | `schemas/` | `invitation-status.schema.ts` |
| Member | `schemas/` | `member-status.schema.ts`, `member-role.schema.ts` |
| Passkey | `schemas/` | `authenticator-attachment.schema.ts` |

**When renaming these entities, also rename the schema files**:
```
mcp__mcp-refactor-typescript__file_operations:
  operation: "rename_file"
  sourcePath: "packages/iam/domain/src/entities/member/schemas/member-status.schema.ts"
  name: "MemberStatus.schema.ts"
```

---

## Entities Without Server Repos

Four OAuth entities have NO server repos:
- OAuthAccessToken
- OAuthClient
- OAuthConsent
- OAuthRefreshToken

**These entities still receive**:
- Full canonical module structure
- Empty repo extensions (`{}`)
- Get + Delete contracts only (minimal surface)

**Rationale**: The canonical pattern is the standard for ALL entities, regardless of whether a server repo exists. Empty extensions document "this entity has no custom methods beyond base CRUD."

---

## Swarm Setup Instructions

### 1. Create Team

```
TeamCreate:
  team_name: "entity-migration-wave1"
  description: "Wave 1: Migrate simple CRUD entities to canonical pattern"
```

### 2. Create Tasks (one per batch)

**Task 1 (iam-batch-1)**:
```
TaskCreate:
  subject: "Migrate Account, ApiKey, DeviceCode, Invitation, Jwks to canonical pattern"
  description: "Migrate 5 IAM entities (batch 1) to canonical domain entity pattern with Get + Delete contracts"
  activeForm: "Migrating IAM entities batch 1"
```

**Task 2 (iam-batch-2)**:
```
TaskCreate:
  subject: "Migrate Member, OrganizationRole, Passkey, RateLimit, ScimProvider to canonical pattern"
  description: "Migrate 5 IAM entities (batch 2) to canonical domain entity pattern with Get + Delete contracts. Member and Passkey have schemas/ subdirectories to preserve."
  activeForm: "Migrating IAM entities batch 2"
```

**Task 3 (iam-batch-3)**:
```
TaskCreate:
  subject: "Migrate SsoProvider, Subscription, TeamMember, TwoFactor, Verification, WalletAddress to canonical pattern"
  description: "Migrate 6 IAM entities (batch 3) to canonical domain entity pattern with Get + Delete contracts"
  activeForm: "Migrating IAM entities batch 3"
```

**Task 4 (simple-batch)**:
```
TaskCreate:
  subject: "Migrate OAuth entities + CalendarEvent + EmailTemplate + UserHotkey to canonical pattern"
  description: "Migrate 7 entities (4 OAuth + 3 cross-slice simple entities) to canonical domain entity pattern. OAuth entities have no server repos."
  activeForm: "Migrating simple cross-slice entities"
```

### 3. Spawn Teammates (one per batch)

**Agent 1 (iam-batch-1)**:
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave1"
  name: "iam-batch-1"
  prompt: "You are migrating 5 IAM entities (Account, ApiKey, DeviceCode, Invitation, Jwks) to the canonical domain entity pattern. Read HANDOFF_P2.md for full context, then execute the migration workflow for each entity. Use MCP refactor tools for renaming (NEVER mv/git mv). All entities are CRUD-only with empty repo extensions."
```

**Agent 2 (iam-batch-2)**:
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave1"
  name: "iam-batch-2"
  prompt: "You are migrating 5 IAM entities (Member, OrganizationRole, Passkey, RateLimit, ScimProvider) to the canonical domain entity pattern. Read HANDOFF_P2.md for full context. Member and Passkey have schemas/ subdirectories to preserve. Use MCP refactor tools for renaming (NEVER mv/git mv). All entities are CRUD-only with empty repo extensions."
```

**Agent 3 (iam-batch-3)**:
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave1"
  name: "iam-batch-3"
  prompt: "You are migrating 6 IAM entities (SsoProvider, Subscription, TeamMember, TwoFactor, Verification, WalletAddress) to the canonical domain entity pattern. Read HANDOFF_P2.md for full context. Use MCP refactor tools for renaming (NEVER mv/git mv). All entities are CRUD-only with empty repo extensions."
```

**Agent 4 (simple-batch)**:
```
Task tool:
  subagent_type: "effect-code-writer"
  team_name: "entity-migration-wave1"
  name: "simple-batch"
  prompt: "You are migrating 7 cross-slice entities (OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken, CalendarEvent, EmailTemplate, UserHotkey) to the canonical domain entity pattern. Read HANDOFF_P2.md for full context. OAuth entities have NO server repos (still create full module with empty extensions). Use MCP refactor tools for renaming. Use correct identity builders per slice."
```

### 4. Assign Tasks to Agents

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

### 5. Monitor via TaskList

Check periodically for completed/blocked tasks. Re-assign failed batches to new agents if needed.

---

## Post-Swarm Verification

After all agents complete:

```bash
bun run check --filter @beep/iam-domain
bun run check --filter @beep/calendar-domain
bun run check --filter @beep/comms-domain
bun run check --filter @beep/customization-domain
```

If errors, use `package-error-fixer` agent per slice.

---

## Known Issues and Gotchas

### 1. MCP Refactor Tool Required for Renaming

**NEVER use `mv`, `git mv`, or manual renaming**. The MCP refactor tool uses the TypeScript compiler to update ALL references:
- Dynamic imports
- Re-exports through barrel files
- Type-only imports
- JSDoc `@see` references
- Test file imports
- Cross-package path alias references

### 2. Empty Repo Extensions for CRUD-Only Entities

ALL Wave 1 entities use `DbRepo.DbRepoSuccess<typeof Model, {}>` (empty object for extensions). This documents "no custom methods beyond base CRUD."

### 3. OAuth Entities Without Server Repos

OAuthAccessToken, OAuthClient, OAuthConsent, OAuthRefreshToken have no server repos but still get full canonical structure with empty extensions. This maintains consistency and future-proofs for when repos are added.

### 4. schemas/ Subdirectories

DeviceCode, Invitation, Member, Passkey have existing `schemas/` subdirectories. Rename schema files to PascalCase as well using MCP tools.

### 5. Identity Builder Per-Module Pattern

Every file creates its own `$I` identity builder with the module path:
```typescript
const $I = $IamDomainId.create("entities/Member/Member.model");
```
This enables unique schema identifiers across all files in the entity.

### 6. HTTP Endpoint Naming Convention

- GET: `HttpApiEndpoint.get("Get", "/:id")`
- DELETE: `HttpApiEndpoint.del("Delete", "/:id")` with `{ status: 204 }`

Always chain `.addError()` per error class, NEVER pass a union to `.addError()`.

---

## Success Criteria

Phase 2 is complete when ALL of:
- [ ] All 23 entities have full canonical module structure
- [ ] All directories and files renamed to PascalCase using MCP tools
- [ ] All entities have `<Entity>.errors.ts` with NotFound + PermissionDenied errors
- [ ] All entities have `<Entity>.repo.ts` with `DbRepo.DbRepoSuccess<Model, {}>`
- [ ] All entities have Get.contract.ts + Delete.contract.ts
- [ ] All entities have `.rpc.ts`, `.http.ts`, `.tool.ts`, `.entity.ts`
- [ ] All entities have correct barrel exports (`index.ts` at entity and contracts level)
- [ ] `bun run check --filter @beep/iam-domain` passes (or only pre-existing failures)
- [ ] `bun run check --filter @beep/calendar-domain` passes
- [ ] `bun run check --filter @beep/comms-domain` passes
- [ ] `bun run check --filter @beep/customization-domain` passes
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

**CRITICAL**: Phase is NOT complete until BOTH P3 handoff files exist.

---

## Learnings from Phase 1

### What Worked
- Entity count confirmed at 58 total, 56 requiring migration
- ALL IAM repos verified as CRUD-only -- simplifies Wave 1 significantly
- Server repo catalog complete and accurate

### What to Apply in Phase 2
- Use swarm mode with 4 parallel agents (5-7 entities each)
- Batch by slice affinity (all IAM together, cross-slice simple entities together)
- Embed exact templates in agent prompts for one-pass mechanical execution
- Use MCP refactor tools for ALL renaming operations

### Key Insights
- Knowledge slice already uses PascalCase -- no renaming needed for Wave 3
- OAuth entities have no repos but still get full canonical structure
- Several entities have schemas/ subdirectories that must be preserved
- The DbRepo.Method type at `@beep/shared-domain/factories/db-repo` is well-typed with automatic DatabaseError union
