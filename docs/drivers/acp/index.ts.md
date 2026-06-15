---
title: index.ts
nav_order: 10
parent: "@beep/acp"
---

## index.ts overview

ACP driver error exports.

**Example**

```ts
import { Errors } from "@beep/acp"

const error = Errors.AcpRequestError.methodNotFound("x/test")
console.log(error.code)
```

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [Errors (namespace export)](#errors-namespace-export)
- [protocols](#protocols)
  - [Protocol (namespace export)](#protocol-namespace-export)
  - [Rpc (namespace export)](#rpc-namespace-export)
- [resources](#resources)
  - [Terminal (namespace export)](#terminal-namespace-export)
- [schemas](#schemas)
  - [Schema (namespace export)](#schema-namespace-export)
- [services](#services)
  - [Agent (namespace export)](#agent-namespace-export)
  - [Client (namespace export)](#client-namespace-export)
---

# errors

## Errors (namespace export)

Re-exports all named exports from the "./Acp.errors.ts" module as `Errors`.

**Example**

```ts
import { Errors } from "@beep/acp"

const error = Errors.AcpRequestError.methodNotFound("x/test")
console.log(error.code)
```

**Signature**

```ts
export * as Errors from "./Acp.errors.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/index.ts#L22)

Since v0.0.0

# protocols

## Protocol (namespace export)

Re-exports all named exports from the "./AcpProtocol.service.ts" module as `Protocol`.

**Example**

```ts
import { Protocol } from "@beep/acp"

const make = Protocol.makeAcpPatchedProtocol
console.log(make)
```

**Signature**

```ts
export * as Protocol from "./AcpProtocol.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/index.ts#L81)

Since v0.0.0

## Rpc (namespace export)

Re-exports all named exports from the "./AcpRpc.models.ts" module as `Rpc`.

**Example**

```ts
import { Rpc } from "@beep/acp"

const group = Rpc.AgentRpcs
console.log(group)
```

**Signature**

```ts
export * as Rpc from "./AcpRpc.models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/index.ts#L96)

Since v0.0.0

# resources

## Terminal (namespace export)

Re-exports all named exports from the "./AcpTerminal.models.ts" module as `Terminal`.

**Example**

```ts
import { Terminal } from "@beep/acp"

const make = Terminal.makeTerminal
console.log(make)
```

**Signature**

```ts
export * as Terminal from "./AcpTerminal.models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/index.ts#L111)

Since v0.0.0

# schemas

## Schema (namespace export)

Re-exports all named exports from the "./Acp.models.ts" module as `Schema`.

**Example**

```ts
import { Schema } from "@beep/acp"

console.log(Schema.PROTOCOL_VERSION)
```

**Signature**

```ts
export * as Schema from "./Acp.models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/index.ts#L36)

Since v0.0.0

# services

## Agent (namespace export)

Re-exports all named exports from the "./AcpAgent.service.ts" module as `Agent`.

**Example**

```ts
import { Agent } from "@beep/acp"

const layer = Agent.layer
console.log(layer)
```

**Signature**

```ts
export * as Agent from "./AcpAgent.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/index.ts#L51)

Since v0.0.0

## Client (namespace export)

Re-exports all named exports from the "./AcpClient.service.ts" module as `Client`.

**Example**

```ts
import { Client } from "@beep/acp"

const service = Client.AcpClient
console.log(service)
```

**Signature**

```ts
export * as Client from "./AcpClient.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/index.ts#L66)

Since v0.0.0