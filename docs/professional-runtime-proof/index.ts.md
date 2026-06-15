---
title: index.ts
nav_order: 1
parent: "@beep/professional-runtime-proof"
---

## index.ts overview

App-level proof harness package for the Agentic Professional Runtime.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ScenarioId (type alias)](#scenarioid-type-alias)
- [utilities](#utilities)
  - [toPlain](#toplain)
- [workflows](#workflows)
  - [runProfessionalRuntimeScenario](#runprofessionalruntimescenario)
---

# models

## ScenarioId (type alias)

Deterministic proof scenario identifiers.

**Example**

```ts
import type { ScenarioId } from "@beep/professional-runtime-proof"

const scenarioId: ScenarioId = "law-patent-intake"
console.log(scenarioId)
```

**Signature**

```ts
type ScenarioId = "law-patent-intake" | "wealth-cash-request"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/professional-runtime-proof/src/index.ts#L152)

Since v0.0.0

# utilities

## toPlain

Convert decoded Schema class instances into JSON-comparable plain data.

**Example**

```ts
import { toPlain } from "@beep/professional-runtime-proof"

console.log(toPlain({ ok: true }))
```

**Signature**

```ts
declare const toPlain: <A>(value: A) => unknown
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/professional-runtime-proof/src/index.ts#L185)

Since v0.0.0

# workflows

## runProfessionalRuntimeScenario

Run one deterministic professional-runtime proof scenario end to end.

**Example**

```ts
import { runProfessionalRuntimeScenario } from "@beep/professional-runtime-proof"

const result = await runProfessionalRuntimeScenario("law-patent-intake")
console.log(result.output.scenarioId)
```

**Signature**

```ts
declare const runProfessionalRuntimeScenario: (scenarioId: ScenarioId) => Promise<{ expectedApprovalGates: ExpectedApprovalGates; expectedClaims: ExpectedClaims; expectedContextPacket: { readonly [x: string]: unknown; }; expectedDrafts: ExpectedDrafts; expectedTasks: ExpectedTasks; output: CandidateOutputSet; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/professional-runtime-proof/src/index.ts#L517)

Since v0.0.0