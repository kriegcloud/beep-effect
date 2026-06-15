---
title: proof.ts
nav_order: 10
parent: "@beep/agent-capability-use-cases"
---

## proof.ts overview

In-memory runtime SDK facade backed by deterministic proof fixtures.

**Example**

```ts
import { makeInMemoryProfessionalRuntimeSdk } from "@beep/agent-capability-use-cases/proof"

const sdk = makeInMemoryProfessionalRuntimeSdk([])
console.log(sdk)
```

Since v0.0.0

---
## Exports Grouped by Category
- [fixtures](#fixtures)
  - [RuntimeFixtureInput](#runtimefixtureinput)
  - [makeInMemoryProfessionalRuntimeSdk](#makeinmemoryprofessionalruntimesdk)
  - [runRuntimeFixture](#runruntimefixture)
- [use-cases](#use-cases)
  - ["./public.js" (namespace export)](#publicjs-namespace-export)
---

# fixtures

## RuntimeFixtureInput

Runtime fixture schema and deterministic runner used by proof harnesses.

**Example**

```ts
import { RuntimeFixtureInput, runRuntimeFixture } from "@beep/agent-capability-use-cases/proof"

console.log(RuntimeFixtureInput)
console.log(runRuntimeFixture)
```

**Signature**

```ts
declare const RuntimeFixtureInput: typeof RuntimeFixtureInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/proof.ts#L38)

Since v0.0.0

## makeInMemoryProfessionalRuntimeSdk

In-memory runtime SDK facade backed by deterministic proof fixtures.

**Example**

```ts
import { makeInMemoryProfessionalRuntimeSdk } from "@beep/agent-capability-use-cases/proof"

const sdk = makeInMemoryProfessionalRuntimeSdk([])
console.log(sdk)
```

**Signature**

```ts
declare const makeInMemoryProfessionalRuntimeSdk: (fixtures: ReadonlyArray<RuntimeFixtureInput>) => ProfessionalRuntimeSdk
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/proof.ts#L22)

Since v0.0.0

## runRuntimeFixture

Runtime fixture schema and deterministic runner used by proof harnesses.

**Example**

```ts
import { RuntimeFixtureInput, runRuntimeFixture } from "@beep/agent-capability-use-cases/proof"

console.log(RuntimeFixtureInput)
console.log(runRuntimeFixture)
```

**Signature**

```ts
declare const runRuntimeFixture: (input: RuntimeFixtureInput) => Effect<CandidateOutputSet, ProfessionalRuntimeValidationError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/proof.ts#L39)

Since v0.0.0

# use-cases

## "./public.js" (namespace export)

Re-exports all named exports from the "./public.js" module.

**Example**

```ts
import { RuntimeScope } from "@beep/agent-capability-use-cases/proof"

console.log(RuntimeScope)
```

**Signature**

```ts
export * from "./public.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/proof.ts#L54)

Since v0.0.0