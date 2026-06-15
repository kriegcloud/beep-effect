---
title: Layer.ts
nav_order: 12
parent: "@beep/architecture-lab-server"
---

## Layer.ts overview

Architecture lab server layer.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [ArchitectureLabServerLive](#architecturelabserverlive)
---

# layers

## ArchitectureLabServerLive

Live architecture lab server layer.

**Example**

```ts
import { ArchitectureLabServerLive } from "@beep/architecture-lab-server/layer"

console.log(ArchitectureLabServerLive)
```

**Signature**

```ts
declare const ArchitectureLabServerLive: Layer.Layer<WorkItemServer | WorkerServer, ConfigError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/architecture-lab/server/src/Layer.ts#L27)

Since v0.0.0