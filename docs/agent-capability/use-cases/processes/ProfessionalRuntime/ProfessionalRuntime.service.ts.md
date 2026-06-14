---
title: ProfessionalRuntime.service.ts
nav_order: 8
parent: "@beep/agent-capability-use-cases"
---

## ProfessionalRuntime.service.ts overview

Public SDK facade contract for the Agentic Professional Runtime proof.

Since v0.0.0

---
## Exports Grouped by Category
- [services](#services)
  - [ProfessionalRuntimeSdk (interface)](#professionalruntimesdk-interface)
---

# services

## ProfessionalRuntimeSdk (interface)

SDK facade shape exposed to clients and adapters.

**Example**

```ts
import type { ProfessionalRuntimeSdk } from "@beep/agent-capability-use-cases/public"

declare const sdk: ProfessionalRuntimeSdk
console.log(sdk)
```

**Signature**

```ts
export interface ProfessionalRuntimeSdk {
  readonly getContextPacket: (
    query: GetContextPacket
  ) => Effect.Effect<SdkContextPacket, ProfessionalRuntimeValidationError>;
  readonly proposeCandidateOutputSet: (
    command: ProposeCandidateOutputSet
  ) => Effect.Effect<CandidateOutputSet, ProfessionalRuntimeValidationError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.service.ts#L27)

Since v0.0.0