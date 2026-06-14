---
title: Agent.values.ts
nav_order: 2
parent: "@beep/agent-capability-domain"
---

## Agent.values.ts overview

Agent value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AgentMode (type alias)](#agentmode-type-alias)
- [schemas](#schemas)
  - [AgentMode](#agentmode)
---

# models

## AgentMode (type alias)

Runtime type for `AgentMode`.

**Example**

```ts
import type { AgentMode } from "@beep/agent-capability-domain"

const value: AgentMode = "deterministic_fixture"
console.log(value)
```

**Signature**

```ts
type AgentMode = typeof AgentMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/domain/src/entities/Agent/Agent.values.ts#L46)

Since v0.0.0

# schemas

## AgentMode

Agent mode used by the deterministic proof.

**Example**

```ts
import { AgentMode } from "@beep/agent-capability-domain"

console.log(AgentMode.is.deterministic_fixture("deterministic_fixture"))
```

**Signature**

```ts
declare const AgentMode: AnnotatedSchema<LiteralKit<readonly ["deterministic_fixture"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/domain/src/entities/Agent/Agent.values.ts#L26)

Since v0.0.0