---
title: ExperimentalConfig.schema.ts
nav_order: 14
parent: "@beep/repo-configs"
---

## ExperimentalConfig.schema.ts overview

Schema for the public Next.js experimental configuration surface.

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [ExperimentalConfig (class)](#experimentalconfig-class)
---

# schemas

## ExperimentalConfig (class)

Public experimental configuration accepted by Next.js.

**Example**

```ts
import { ExperimentalConfig } from "@beep/repo-configs/next/models/ExperimentalConfig.schema"
const config = ExperimentalConfig.make({
  cssChunking: true,
  mcpServer: true
})
console.log(config)
```

**Signature**

```ts
declare class ExperimentalConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/models/ExperimentalConfig.schema.ts#L194)

Since v0.0.0