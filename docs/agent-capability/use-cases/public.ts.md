---
title: public.ts
nav_order: 11
parent: "@beep/agent-capability-use-cases"
---

## public.ts overview

Candidate output command contracts accepted by the runtime SDK.

**Example**

```ts
import { ProposeCandidateOutputSet } from "@beep/agent-capability-use-cases/public"

console.log(ProposeCandidateOutputSet)
```

Since v0.0.0

---
## Exports Grouped by Category
- [commands](#commands)
  - ["./processes/ProfessionalRuntime/ProfessionalRuntime.commands.js" (namespace export)](#processesprofessionalruntimeprofessionalruntimecommandsjs-namespace-export)
- [errors](#errors)
  - ["./processes/ProfessionalRuntime/ProfessionalRuntime.errors.js" (namespace export)](#processesprofessionalruntimeprofessionalruntimeerrorsjs-namespace-export)
- [protocols](#protocols)
  - ["./processes/ProfessionalRuntime/ProfessionalRuntime.contracts.js" (namespace export)](#processesprofessionalruntimeprofessionalruntimecontractsjs-namespace-export)
- [queries](#queries)
  - ["./processes/ProfessionalRuntime/ProfessionalRuntime.queries.js" (namespace export)](#processesprofessionalruntimeprofessionalruntimequeriesjs-namespace-export)
- [services](#services)
  - [ProfessionalRuntimeSdk](#professionalruntimesdk)
- [value-objects](#value-objects)
  - ["./processes/ProfessionalRuntime/ProfessionalRuntime.values.js" (namespace export)](#processesprofessionalruntimeprofessionalruntimevaluesjs-namespace-export)
---

# commands

## "./processes/ProfessionalRuntime/ProfessionalRuntime.commands.js" (namespace export)

Re-exports all named exports from the "./processes/ProfessionalRuntime/ProfessionalRuntime.commands.js" module.

**Example**

```ts
import { ProposeCandidateOutputSet } from "@beep/agent-capability-use-cases/public"

console.log(ProposeCandidateOutputSet)
```

**Signature**

```ts
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.commands.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/public.ts#L21)

Since v0.0.0

# errors

## "./processes/ProfessionalRuntime/ProfessionalRuntime.errors.js" (namespace export)

Re-exports all named exports from the "./processes/ProfessionalRuntime/ProfessionalRuntime.errors.js" module.

**Example**

```ts
import { ProfessionalRuntimeValidationError } from "@beep/agent-capability-use-cases/public"

console.log(ProfessionalRuntimeValidationError.make({ message: "invalid runtime proposal" }))
```

**Signature**

```ts
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.errors.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/public.ts#L49)

Since v0.0.0

# protocols

## "./processes/ProfessionalRuntime/ProfessionalRuntime.contracts.js" (namespace export)

Re-exports all named exports from the "./processes/ProfessionalRuntime/ProfessionalRuntime.contracts.js" module.

**Example**

```ts
import { CandidateOutputSet } from "@beep/agent-capability-use-cases/public"

console.log(CandidateOutputSet)
```

**Signature**

```ts
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.contracts.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/public.ts#L35)

Since v0.0.0

# queries

## "./processes/ProfessionalRuntime/ProfessionalRuntime.queries.js" (namespace export)

Re-exports all named exports from the "./processes/ProfessionalRuntime/ProfessionalRuntime.queries.js" module.

**Example**

```ts
import { GetContextPacket } from "@beep/agent-capability-use-cases/public"

console.log(GetContextPacket)
```

**Signature**

```ts
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.queries.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/public.ts#L63)

Since v0.0.0

# services

## ProfessionalRuntimeSdk

Client-safe SDK facade interface.

**Example**

```ts
import type { ProfessionalRuntimeSdk } from "@beep/agent-capability-use-cases/public"

declare const sdk: ProfessionalRuntimeSdk
console.log(sdk)
```

**Signature**

```ts
declare const ProfessionalRuntimeSdk: ProfessionalRuntimeSdk
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/public.ts#L92)

Since v0.0.0

# value-objects

## "./processes/ProfessionalRuntime/ProfessionalRuntime.values.js" (namespace export)

Re-exports all named exports from the "./processes/ProfessionalRuntime/ProfessionalRuntime.values.js" module.

**Example**

```ts
import { RuntimeCandidateLifecycle } from "@beep/agent-capability-use-cases/public"

console.log(RuntimeCandidateLifecycle)
```

**Signature**

```ts
export * from "./processes/ProfessionalRuntime/ProfessionalRuntime.values.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/public.ts#L77)

Since v0.0.0