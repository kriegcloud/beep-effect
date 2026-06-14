---
title: Shared.ts
nav_order: 27
parent: "@beep/shared-domain"
---

## Shared.ts overview

Shared-kernel entity-id registry.

Since v0.0.0

---
## Exports Grouped by Category
- [entity-ids](#entity-ids)
  - [ActivityId](#activityid)
  - [ActivityId (type alias)](#activityid-type-alias)
  - [AgentId](#agentid)
  - [AgentId (type alias)](#agentid-type-alias)
  - [AgentVersionId](#agentversionid)
  - [AgentVersionId (type alias)](#agentversionid-type-alias)
  - [ConnectorAccountId](#connectoraccountid)
  - [ConnectorAccountId (type alias)](#connectoraccountid-type-alias)
  - [LocalMachineId](#localmachineid)
  - [LocalMachineId (type alias)](#localmachineid-type-alias)
  - [MembershipId](#membershipid)
  - [MembershipId (type alias)](#membershipid-type-alias)
  - [OrganizationId](#organizationid)
  - [OrganizationId (type alias)](#organizationid-type-alias)
  - [ServiceAccountId](#serviceaccountid)
  - [ServiceAccountId (type alias)](#serviceaccountid-type-alias)
  - [TeamId](#teamid)
  - [TeamId (type alias)](#teamid-type-alias)
  - [UserId](#userid)
  - [UserId (type alias)](#userid-type-alias)
---

# entity-ids

## ActivityId

Activity entity identifier used by provenance and lifecycle entity fields.

**Example**

```ts
import { ActivityId } from "@beep/shared-domain/identity/Shared"

console.log(ActivityId.tableName)
```

**Signature**

```ts
declare const ActivityId: EntityId.EntityId<"shared", "activity", "shared_activity", "shared.activity", "SharedActivity", "SharedActivityId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L331)

Since v0.0.0

## ActivityId (type alias)

Companion type for `ActivityId.Type`.

**Example**

```ts
import { Effect } from "effect"
import { ActivityId } from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(ActivityId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type ActivityId = typeof ActivityId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L354)

Since v0.0.0

## AgentId

Agent entity identifier.

**Example**

```ts
import { AgentId } from "@beep/shared-domain/identity/Shared"

console.log(AgentId.tableName)
```

**Signature**

```ts
declare const AgentId: EntityId.EntityId<"shared", "agent", "shared_agent", "shared.agent", "SharedAgent", "SharedAgentId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L217)

Since v0.0.0

## AgentId (type alias)

Companion type for `AgentId.Type`.

**Example**

```ts
import { Effect } from "effect"
import { AgentId } from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(AgentId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type AgentId = typeof AgentId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L240)

Since v0.0.0

## AgentVersionId

Agent-version entity identifier.

**Example**

```ts
import { AgentVersionId } from "@beep/shared-domain/identity/Shared"

console.log(AgentVersionId.tableName)
```

**Signature**

```ts
declare const AgentVersionId: EntityId.EntityId<"shared", "agent_version", "shared_agent_version", "shared.agent_version", "SharedAgentVersion", "SharedAgentVersionId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L255)

Since v0.0.0

## AgentVersionId (type alias)

Companion type for `AgentVersionId.Type`.

**Example**

```ts
import { Effect } from "effect"
import { AgentVersionId } from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(AgentVersionId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type AgentVersionId = typeof AgentVersionId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L278)

Since v0.0.0

## ConnectorAccountId

Connector-account entity identifier.

**Example**

```ts
import { ConnectorAccountId } from "@beep/shared-domain/identity/Shared"

console.log(ConnectorAccountId.tableName)
```

**Signature**

```ts
declare const ConnectorAccountId: EntityId.EntityId<"shared", "connector_account", "shared_connector_account", "shared.connector_account", "SharedConnectorAccount", "SharedConnectorAccountId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L293)

Since v0.0.0

## ConnectorAccountId (type alias)

Companion type for `ConnectorAccountId.Type`.

**Example**

```ts
import { Effect } from "effect"
import { ConnectorAccountId } from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(ConnectorAccountId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type ConnectorAccountId = typeof ConnectorAccountId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L316)

Since v0.0.0

## LocalMachineId

Local-machine entity identifier used by synchronization metadata.

**Example**

```ts
import { LocalMachineId } from "@beep/shared-domain/identity/Shared"

console.log(LocalMachineId.tableName)
```

**Signature**

```ts
declare const LocalMachineId: EntityId.EntityId<"shared", "local_machine", "shared_local_machine", "shared.local_machine", "SharedLocalMachine", "SharedLocalMachineId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L369)

Since v0.0.0

## LocalMachineId (type alias)

Companion type for `LocalMachineId.Type`.

**Example**

```ts
import { Effect } from "effect"
import { LocalMachineId } from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(LocalMachineId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type LocalMachineId = typeof LocalMachineId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L392)

Since v0.0.0

## MembershipId

Membership entity identifier.

**Example**

```ts
import { MembershipId } from "@beep/shared-domain/identity/Shared"

console.log(MembershipId.tableName)
```

**Signature**

```ts
declare const MembershipId: EntityId.EntityId<"shared", "membership", "shared_membership", "shared.membership", "SharedMembership", "SharedMembershipId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L103)

Since v0.0.0

## MembershipId (type alias)

Companion type for `MembershipId.Type`.

**Example**

```ts
import { Effect } from "effect"
import { MembershipId } from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(MembershipId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type MembershipId = typeof MembershipId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L126)

Since v0.0.0

## OrganizationId

Organization entity identifier.

**Example**

```ts
import { OrganizationId } from "@beep/shared-domain/identity/Shared"

console.log(OrganizationId.tableName)
```

**Signature**

```ts
declare const OrganizationId: EntityId.EntityId<"shared", "organization", "shared_organization", "shared.organization", "SharedOrganization", "SharedOrganizationId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L27)

Since v0.0.0

## OrganizationId (type alias)

Companion type for `OrganizationId.Type`.

**Example**

```ts
import { Effect } from "effect"
import { OrganizationId } from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(OrganizationId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type OrganizationId = typeof OrganizationId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L50)

Since v0.0.0

## ServiceAccountId

Service-account entity identifier.

**Example**

```ts
import { ServiceAccountId } from "@beep/shared-domain/identity/Shared"

console.log(ServiceAccountId.tableName)
```

**Signature**

```ts
declare const ServiceAccountId: EntityId.EntityId<"shared", "service_account", "shared_service_account", "shared.service_account", "SharedServiceAccount", "SharedServiceAccountId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L179)

Since v0.0.0

## ServiceAccountId (type alias)

Companion type for `ServiceAccountId.Type`.

**Example**

```ts
import { Effect } from "effect"
import { ServiceAccountId } from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(ServiceAccountId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type ServiceAccountId = typeof ServiceAccountId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L202)

Since v0.0.0

## TeamId

Team entity identifier.

**Example**

```ts
import { TeamId } from "@beep/shared-domain/identity/Shared"

console.log(TeamId.tableName)
```

**Signature**

```ts
declare const TeamId: EntityId.EntityId<"shared", "team", "shared_team", "shared.team", "SharedTeam", "SharedTeamId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L141)

Since v0.0.0

## TeamId (type alias)

Companion type for `TeamId.Type`.

**Example**

```ts
import { Effect } from "effect"
import { TeamId } from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(TeamId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type TeamId = typeof TeamId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L164)

Since v0.0.0

## UserId

User entity identifier.

**Example**

```ts
import { UserId } from "@beep/shared-domain/identity/Shared"

console.log(UserId.tableName)
```

**Signature**

```ts
declare const UserId: EntityId.EntityId<"shared", "user", "shared_user", "shared.user", "SharedUser", "SharedUserId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L65)

Since v0.0.0

## UserId (type alias)

Companion type for `UserId.Type`.

**Example**

```ts
import { Effect } from "effect"
import { UserId } from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(UserId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type UserId = typeof UserId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/Shared.ts#L88)

Since v0.0.0