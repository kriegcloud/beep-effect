---
title: Acp.models.ts
nav_order: 4
parent: "@beep/acp"
---

## Acp.models.ts overview

Generated ACP method metadata.

**Example**

```ts
import { AGENT_METHODS, PROTOCOL_VERSION } from "@beep/acp/schema"

console.log(AGENT_METHODS.initialize, PROTOCOL_VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - ["./_generated/meta.gen.ts" (namespace export)](#_generatedmetagents-namespace-export)
- [schemas](#schemas)
  - ["./_generated/schema.gen.ts" (namespace export)](#_generatedschemagents-namespace-export)
---

# constants

## "./_generated/meta.gen.ts" (namespace export)

Re-exports all named exports from the "./_generated/meta.gen.ts" module.

**Example**

```ts
import { AGENT_METHODS, PROTOCOL_VERSION } from "@beep/acp/schema"

console.log(AGENT_METHODS.initialize, PROTOCOL_VERSION)
```

**Signature**

```ts
export * from "./_generated/meta.gen.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.models.ts#L21)

Since v0.0.0

# schemas

## "./_generated/schema.gen.ts" (namespace export)

Re-exports all named exports from the "./_generated/schema.gen.ts" module.

**Example**

```ts
import { InitializeRequest } from "@beep/acp/schema"

const request = InitializeRequest.make({
  clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, terminal: false },
  clientInfo: { name: "beep", version: "0.0.0" },
  protocolVersion: 1
})
console.log(request.protocolVersion)
```

**Signature**

```ts
export * from "./_generated/schema.gen.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/acp/src/Acp.models.ts#L40)

Since v0.0.0