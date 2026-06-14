---
title: AgentCapability.ts
nav_order: 23
parent: "@beep/shared-domain"
---

## AgentCapability.ts overview

Agent-capability slice entity-id registry.

Since v0.0.0

---
## Exports Grouped by Category
- [entity-ids](#entity-ids)
  - [AgentId](#agentid)
  - [AgentId (type alias)](#agentid-type-alias)
  - [SkillId](#skillid)
  - [SkillId (type alias)](#skillid-type-alias)
---

# entity-ids

## AgentId

Agent entity identifier.

**Example**

```ts
import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability"

console.log(AgentCapability.AgentId.entityType)
```

**Signature**

```ts
declare const AgentId: EntityId.EntityId<"agent_capability", "agent", "agent_capability_agent", "agent_capability.agent", "AgentCapabilityAgent", "AgentCapabilityAgentId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/AgentCapability.ts#L27)

Since v0.0.0

## AgentId (type alias)

Runtime type for `AgentId`.

**Example**

```ts
import { Effect } from "effect"
import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: AgentCapability.AgentId = yield* S.decodeUnknownEffect(AgentCapability.AgentId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type AgentId = typeof AgentId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/AgentCapability.ts#L50)

Since v0.0.0

## SkillId

Skill entity identifier.

**Example**

```ts
import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability"

console.log(AgentCapability.SkillId.entityType)
```

**Signature**

```ts
declare const SkillId: EntityId.EntityId<"agent_capability", "skill", "agent_capability_skill", "agent_capability.skill", "AgentCapabilitySkill", "AgentCapabilitySkillId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/AgentCapability.ts#L65)

Since v0.0.0

## SkillId (type alias)

Runtime type for `SkillId`.

**Example**

```ts
import { Effect } from "effect"
import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: AgentCapability.SkillId = yield* S.decodeUnknownEffect(AgentCapability.SkillId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type SkillId = typeof SkillId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/AgentCapability.ts#L88)

Since v0.0.0