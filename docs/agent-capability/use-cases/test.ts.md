---
title: test.ts
nav_order: 12
parent: "@beep/agent-capability-use-cases"
---

## test.ts overview

Test-facing re-export of deterministic proof helpers.

**Example**

```ts
import { makeInMemoryProfessionalRuntimeSdk } from "@beep/agent-capability-use-cases/test"

const sdk = makeInMemoryProfessionalRuntimeSdk([])
console.log(sdk)
```

Since v0.0.0

---
## Exports Grouped by Category
- [fixtures](#fixtures)
  - ["./proof.js" (namespace export)](#proofjs-namespace-export)
---

# fixtures

## "./proof.js" (namespace export)

Re-exports all named exports from the "./proof.js" module.

**Example**

```ts
import { makeInMemoryProfessionalRuntimeSdk } from "@beep/agent-capability-use-cases/test"

const sdk = makeInMemoryProfessionalRuntimeSdk([])
console.log(sdk)
```

**Signature**

```ts
export * from "./proof.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/test.ts#L22)

Since v0.0.0