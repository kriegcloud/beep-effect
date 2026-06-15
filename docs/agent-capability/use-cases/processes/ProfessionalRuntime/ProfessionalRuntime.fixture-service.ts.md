---
title: ProfessionalRuntime.fixture-service.ts
nav_order: 5
parent: "@beep/agent-capability-use-cases"
---

## ProfessionalRuntime.fixture-service.ts overview

Deterministic fixture SDK facade for the Agentic Professional Runtime proof.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeInMemoryProfessionalRuntimeSdk](#makeinmemoryprofessionalruntimesdk)
---

# constructors

## makeInMemoryProfessionalRuntimeSdk

Create an in-memory SDK facade over deterministic runtime fixture inputs.

**Example**

```ts
import { makeInMemoryProfessionalRuntimeSdk } from "@beep/agent-capability-use-cases/proof"

console.log(makeInMemoryProfessionalRuntimeSdk)
```

**Signature**

```ts
declare const makeInMemoryProfessionalRuntimeSdk: (fixtures: ReadonlyArray<RuntimeFixtureInput>) => ProfessionalRuntimeSdk
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.fixture-service.ts#L199)

Since v0.0.0