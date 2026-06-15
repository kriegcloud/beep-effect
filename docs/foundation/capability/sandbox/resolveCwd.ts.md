---
title: resolveCwd.ts
nav_order: 15
parent: "@beep/sandbox"
---

## resolveCwd.ts overview

Host working-directory resolution helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [resolveCwd](#resolvecwd)
---

# combinators

## resolveCwd

Resolve an optional cwd to an absolute, validated host directory.

**Example**

```ts
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem"
import * as NodePath from "@effect/platform-node/NodePath"
import { resolveCwd } from "@beep/sandbox"
import { Effect, Layer } from "effect"

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)
const program = resolveCwd(".").pipe(Effect.provide(PlatformLayer))
```

**Signature**

```ts
declare const resolveCwd: (cwd: string | undefined) => Effect.Effect<string, CwdError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/resolveCwd.ts#L28)

Since v0.0.0