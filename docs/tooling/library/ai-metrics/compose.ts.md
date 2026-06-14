---
title: compose.ts
nav_order: 3
parent: "@beep/repo-ai-metrics"
---

## compose.ts overview

Local compose rendering for AI metrics backend smoke targets.

Since v0.0.0

---
## Exports Grouped by Category
- [services](#services)
  - [renderAiMetricsLocalPhoenixCompose](#renderaimetricslocalphoenixcompose)
---

# services

## renderAiMetricsLocalPhoenixCompose

Render a dedicated Docker Compose file for local Phoenix smoke tests.

**Example**

```ts
import { makeAiMetricsInstallSpec, renderAiMetricsLocalPhoenixCompose } from "@beep/repo-ai-metrics"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const spec = yield* makeAiMetricsInstallSpec()
  return yield* renderAiMetricsLocalPhoenixCompose(spec)
})
console.log(program)
```

**Signature**

```ts
declare const renderAiMetricsLocalPhoenixCompose: (spec: AiMetricsInstallSpec) => Effect.Effect<string, AiMetricsInstallConfigurationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/compose.ts#L46)

Since v0.0.0