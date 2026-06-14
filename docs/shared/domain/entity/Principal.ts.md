---
title: Principal.ts
nav_order: 20
parent: "@beep/shared-domain"
---

## Principal.ts overview

Canonical actor reference schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AgentPrincipal (class)](#agentprincipal-class)
  - [ConnectorAccountPrincipal (class)](#connectoraccountprincipal-class)
  - [Principal (type alias)](#principal-type-alias)
  - [Principal (namespace)](#principal-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [ServiceAccountPrincipal (class)](#serviceaccountprincipal-class)
  - [SystemComponent (type alias)](#systemcomponent-type-alias)
  - [SystemPrincipal (class)](#systemprincipal-class)
  - [UserPrincipal (class)](#userprincipal-class)
- [schemas](#schemas)
  - [Principal](#principal)
  - [SystemComponent](#systemcomponent)
---

# models

## AgentPrincipal (class)

Principal variant for an AI agent acting in the system.

**Example**

```ts
import type { AgentPrincipal } from "@beep/shared-domain/entity/Principal"

declare const principal: AgentPrincipal
console.log(principal.kind)
```

**Signature**

```ts
declare class AgentPrincipal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L113)

Since v0.0.0

## ConnectorAccountPrincipal (class)

Principal variant for a connector account.

**Example**

```ts
import type { ConnectorAccountPrincipal } from "@beep/shared-domain/entity/Principal"

declare const principal: ConnectorAccountPrincipal
console.log(principal.kind)
```

**Signature**

```ts
declare class ConnectorAccountPrincipal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L140)

Since v0.0.0

## Principal (type alias)

Runtime type for `Principal`.

**Example**

```ts
import type { Principal } from "@beep/shared-domain/entity/Principal"

const principal: Principal = {
  kind: "System",
  component: "Runtime",
}
console.log(principal.kind)
```

**Signature**

```ts
type Principal = typeof Principal.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L221)

Since v0.0.0

## Principal (namespace)

Encoded boundary type for `Principal`.

**Example**

```ts
import type { Principal } from "@beep/shared-domain/entity/Principal"

const encoded: Principal.Encoded = {
  kind: "System",
  component: "Runtime",
}
console.log(encoded.kind)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L240)

Since v0.0.0

### Encoded (type alias)

Encoded boundary companion type for `Principal`.

**Example**

```ts
import type { Principal } from "@beep/shared-domain/entity/Principal"

const encoded: Principal.Encoded = {
  kind: "System",
  component: "Runtime",
}
console.log(encoded)
```

**Signature**

```ts
type Encoded = typeof Principal.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L258)

Since v0.0.0

## ServiceAccountPrincipal (class)

Principal variant for a service account.

**Example**

```ts
import type { ServiceAccountPrincipal } from "@beep/shared-domain/entity/Principal"

declare const principal: ServiceAccountPrincipal
console.log(principal.kind)
```

**Signature**

```ts
declare class ServiceAccountPrincipal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L88)

Since v0.0.0

## SystemComponent (type alias)

Runtime type for `SystemComponent`.

**Example**

```ts
import type { SystemComponent } from "@beep/shared-domain/entity/Principal"

const component: SystemComponent = "Runtime"
console.log(component)
```

**Signature**

```ts
type SystemComponent = typeof SystemComponent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L48)

Since v0.0.0

## SystemPrincipal (class)

Principal variant for internal system work.

**Example**

```ts
import { SystemPrincipal } from "@beep/shared-domain/entity/Principal"

const principal = SystemPrincipal.make({
  kind: "System",
  component: "Runtime",
})
console.log(principal.component)
```

**Signature**

```ts
declare class SystemPrincipal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L168)

Since v0.0.0

## UserPrincipal (class)

Principal variant for a user actor.

**Example**

```ts
import type { UserPrincipal } from "@beep/shared-domain/entity/Principal"

declare const principal: UserPrincipal
console.log(principal.kind)
```

**Signature**

```ts
declare class UserPrincipal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L64)

Since v0.0.0

# schemas

## Principal

Tagged union used by every BaseEntity field that names an actor.

**Example**

```ts
import { Principal } from "@beep/shared-domain/entity/Principal"

console.log(Principal)
```

**Signature**

```ts
declare const Principal: S.toTaggedUnion<"kind", readonly [typeof UserPrincipal, typeof ServiceAccountPrincipal, typeof AgentPrincipal, typeof ConnectorAccountPrincipal, typeof SystemPrincipal]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L191)

Since v0.0.0

## SystemComponent

Shared system components that can author persisted rows.

**Example**

```ts
import { SystemComponent } from "@beep/shared-domain/entity/Principal"

console.log(SystemComponent.is.Runtime("Runtime"))
```

**Signature**

```ts
declare const SystemComponent: AnnotatedSchema<LiteralKit<readonly ["Runtime", "Sync", "Migration", "Policy", "Generator"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/Principal.ts#L28)

Since v0.0.0