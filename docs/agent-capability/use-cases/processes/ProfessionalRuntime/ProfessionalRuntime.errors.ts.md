---
title: ProfessionalRuntime.errors.ts
nav_order: 4
parent: "@beep/agent-capability-use-cases"
---

## ProfessionalRuntime.errors.ts overview

SDK errors for the Agentic Professional Runtime proof.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [ProfessionalRuntimeValidationError (class)](#professionalruntimevalidationerror-class)
---

# errors

## ProfessionalRuntimeValidationError (class)

Validation failure for runtime SDK requests and candidate proposals.

**Example**

```ts
import { ProfessionalRuntimeValidationError } from "@beep/agent-capability-use-cases/public"

console.log(ProfessionalRuntimeValidationError.make({ message: "invalid runtime proposal" }))
```

**Signature**

```ts
declare class ProfessionalRuntimeValidationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/agent-capability/use-cases/src/processes/ProfessionalRuntime/ProfessionalRuntime.errors.ts#L28)

Since v0.0.0