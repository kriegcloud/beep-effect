---
title: Workspace.ts
nav_order: 29
parent: "@beep/shared-domain"
---

## Workspace.ts overview

Workspace slice entity-id registry.

Since v0.0.0

---
## Exports Grouped by Category
- [entity-ids](#entity-ids)
  - [ApprovalGateId](#approvalgateid)
  - [ApprovalGateId (type alias)](#approvalgateid-type-alias)
  - [CandidateDraftId](#candidatedraftid)
  - [CandidateDraftId (type alias)](#candidatedraftid-type-alias)
  - [CandidateProjectId](#candidateprojectid)
  - [CandidateProjectId (type alias)](#candidateprojectid-type-alias)
  - [CandidateTaskId](#candidatetaskid)
  - [CandidateTaskId (type alias)](#candidatetaskid-type-alias)
  - [ContextPacketId](#contextpacketid)
  - [ContextPacketId (type alias)](#contextpacketid-type-alias)
  - [EmailArtifactId](#emailartifactid)
  - [EmailArtifactId (type alias)](#emailartifactid-type-alias)
  - [WorkspaceId](#workspaceid)
  - [WorkspaceId (type alias)](#workspaceid-type-alias)
---

# entity-ids

## ApprovalGateId

Approval gate entity identifier.

**Example**

```ts
import * as Workspace from "@beep/shared-domain/identity/Workspace"

console.log(Workspace.ApprovalGateId.entityType)
```

**Signature**

```ts
declare const ApprovalGateId: EntityId.EntityId<"workspace", "approval_gate", "workspace_approval_gate", "workspace.approval_gate", "WorkspaceApprovalGate", "WorkspaceApprovalGateId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L217)

Since v0.0.0

## ApprovalGateId (type alias)

Runtime type for `ApprovalGateId`.

**Example**

```ts
import { Effect } from "effect"
import * as Workspace from "@beep/shared-domain/identity/Workspace"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Workspace.ApprovalGateId = yield* S.decodeUnknownEffect(Workspace.ApprovalGateId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type ApprovalGateId = typeof ApprovalGateId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L240)

Since v0.0.0

## CandidateDraftId

Candidate draft entity identifier.

**Example**

```ts
import * as Workspace from "@beep/shared-domain/identity/Workspace"

console.log(Workspace.CandidateDraftId.entityType)
```

**Signature**

```ts
declare const CandidateDraftId: EntityId.EntityId<"workspace", "candidate_draft", "workspace_candidate_draft", "workspace.candidate_draft", "WorkspaceCandidateDraft", "WorkspaceCandidateDraftId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L179)

Since v0.0.0

## CandidateDraftId (type alias)

Runtime type for `CandidateDraftId`.

**Example**

```ts
import { Effect } from "effect"
import * as Workspace from "@beep/shared-domain/identity/Workspace"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Workspace.CandidateDraftId = yield* S.decodeUnknownEffect(Workspace.CandidateDraftId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type CandidateDraftId = typeof CandidateDraftId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L202)

Since v0.0.0

## CandidateProjectId

Candidate project entity identifier.

**Example**

```ts
import * as Workspace from "@beep/shared-domain/identity/Workspace"

console.log(Workspace.CandidateProjectId.entityType)
```

**Signature**

```ts
declare const CandidateProjectId: EntityId.EntityId<"workspace", "candidate_project", "workspace_candidate_project", "workspace.candidate_project", "WorkspaceCandidateProject", "WorkspaceCandidateProjectId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L103)

Since v0.0.0

## CandidateProjectId (type alias)

Runtime type for `CandidateProjectId`.

**Example**

```ts
import { Effect } from "effect"
import * as Workspace from "@beep/shared-domain/identity/Workspace"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Workspace.CandidateProjectId = yield* S.decodeUnknownEffect(Workspace.CandidateProjectId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type CandidateProjectId = typeof CandidateProjectId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L126)

Since v0.0.0

## CandidateTaskId

Candidate task entity identifier.

**Example**

```ts
import * as Workspace from "@beep/shared-domain/identity/Workspace"

console.log(Workspace.CandidateTaskId.entityType)
```

**Signature**

```ts
declare const CandidateTaskId: EntityId.EntityId<"workspace", "candidate_task", "workspace_candidate_task", "workspace.candidate_task", "WorkspaceCandidateTask", "WorkspaceCandidateTaskId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L141)

Since v0.0.0

## CandidateTaskId (type alias)

Runtime type for `CandidateTaskId`.

**Example**

```ts
import { Effect } from "effect"
import * as Workspace from "@beep/shared-domain/identity/Workspace"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Workspace.CandidateTaskId = yield* S.decodeUnknownEffect(Workspace.CandidateTaskId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type CandidateTaskId = typeof CandidateTaskId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L164)

Since v0.0.0

## ContextPacketId

Context packet entity identifier.

**Example**

```ts
import * as Workspace from "@beep/shared-domain/identity/Workspace"

console.log(Workspace.ContextPacketId.entityType)
```

**Signature**

```ts
declare const ContextPacketId: EntityId.EntityId<"workspace", "context_packet", "workspace_context_packet", "workspace.context_packet", "WorkspaceContextPacket", "WorkspaceContextPacketId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L255)

Since v0.0.0

## ContextPacketId (type alias)

Runtime type for `ContextPacketId`.

**Example**

```ts
import { Effect } from "effect"
import * as Workspace from "@beep/shared-domain/identity/Workspace"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Workspace.ContextPacketId = yield* S.decodeUnknownEffect(Workspace.ContextPacketId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type ContextPacketId = typeof ContextPacketId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L278)

Since v0.0.0

## EmailArtifactId

Email artifact entity identifier.

**Example**

```ts
import * as Workspace from "@beep/shared-domain/identity/Workspace"

console.log(Workspace.EmailArtifactId.entityType)
```

**Signature**

```ts
declare const EmailArtifactId: EntityId.EntityId<"workspace", "email_artifact", "workspace_email_artifact", "workspace.email_artifact", "WorkspaceEmailArtifact", "WorkspaceEmailArtifactId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L65)

Since v0.0.0

## EmailArtifactId (type alias)

Runtime type for `EmailArtifactId`.

**Example**

```ts
import { Effect } from "effect"
import * as Workspace from "@beep/shared-domain/identity/Workspace"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Workspace.EmailArtifactId = yield* S.decodeUnknownEffect(Workspace.EmailArtifactId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type EmailArtifactId = typeof EmailArtifactId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L88)

Since v0.0.0

## WorkspaceId

Workspace entity identifier.

**Example**

```ts
import * as Workspace from "@beep/shared-domain/identity/Workspace"

console.log(Workspace.WorkspaceId.entityType)
```

**Signature**

```ts
declare const WorkspaceId: EntityId.EntityId<"workspace", "workspace", "workspace_workspace", "workspace.workspace", "WorkspaceWorkspace", "WorkspaceWorkspaceId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L27)

Since v0.0.0

## WorkspaceId (type alias)

Runtime type for `WorkspaceId`.

**Example**

```ts
import { Effect } from "effect"
import * as Workspace from "@beep/shared-domain/identity/Workspace"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: Workspace.WorkspaceId = yield* S.decodeUnknownEffect(Workspace.WorkspaceId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type WorkspaceId = typeof WorkspaceId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Workspace.ts#L50)

Since v0.0.0