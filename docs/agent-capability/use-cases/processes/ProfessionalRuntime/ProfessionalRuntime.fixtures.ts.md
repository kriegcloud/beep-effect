---
title: ProfessionalRuntime.fixtures.ts
nav_order: 6
parent: "@beep/agent-capability-use-cases"
---

## ProfessionalRuntime.fixtures.ts overview

Deterministic fixture runner for the P3 runtime data-loop proof.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [RuntimeFixtureInput (class)](#runtimefixtureinput-class)
- [testing](#testing)
  - [runRuntimeFixture](#runruntimefixture)
---

# models

## RuntimeFixtureInput (class)

Parsed fixture inputs for one runtime data-loop scenario.

**Example**

```ts
import { RuntimeFixtureInput } from "@beep/agent-capability-use-cases/proof"

console.log(RuntimeFixtureInput)
```

**Signature**

```ts
declare class RuntimeFixtureInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.fixtures.ts#L76)

Since v0.0.0

# testing

## runRuntimeFixture

Run one deterministic runtime data-loop fixture.

**Example**

```ts
import { runRuntimeFixture } from "@beep/agent-capability-use-cases/proof"

console.log(runRuntimeFixture)
```

**Signature**

```ts
declare const runRuntimeFixture: (input: RuntimeFixtureInput) => Effect.Effect<CandidateOutputSet, ProfessionalRuntimeValidationError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.fixtures.ts#L695)

Since v0.0.0