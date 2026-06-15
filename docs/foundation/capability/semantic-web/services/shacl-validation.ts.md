---
title: shacl-validation.ts
nav_order: 22
parent: "@beep/semantic-web"
---

## shacl-validation.ts overview

SHACL validation service contract.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [ShaclValidationError (class)](#shaclvalidationerror-class)
- [models](#models)
  - [ShaclNodeShape (class)](#shaclnodeshape-class)
  - [ShaclPropertyShape (class)](#shaclpropertyshape-class)
  - [ShaclSeverity](#shaclseverity)
  - [ShaclValidationRequest (class)](#shaclvalidationrequest-class)
  - [ShaclValidationResult (class)](#shaclvalidationresult-class)
  - [ShaclValidationService (class)](#shaclvalidationservice-class)
  - [ShaclValidationServiceShape (interface)](#shaclvalidationserviceshape-interface)
  - [ShaclValidationViolation (class)](#shaclvalidationviolation-class)
---

# error-handling

## ShaclValidationError (class)

Typed SHACL validation error.

**Example**

```ts
import { ShaclValidationError } from "@beep/semantic-web/services/shacl-validation"

console.log(ShaclValidationError)
```

**Signature**

```ts
declare class ShaclValidationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/shacl-validation.ts#L202)

Since v0.0.0

# models

## ShaclNodeShape (class)

SHACL node shape used by the bounded service contract.

**Example**

```ts
import { ShaclNodeShape } from "@beep/semantic-web/services/shacl-validation"

console.log(ShaclNodeShape)
```

**Signature**

```ts
declare class ShaclNodeShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/shacl-validation.ts#L95)

Since v0.0.0

## ShaclPropertyShape (class)

SHACL property shape used by the bounded service contract.

**Example**

```ts
import { ShaclPropertyShape } from "@beep/semantic-web/services/shacl-validation"

console.log(ShaclPropertyShape)
```

**Signature**

```ts
declare class ShaclPropertyShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/shacl-validation.ts#L66)

Since v0.0.0

## ShaclSeverity

SHACL report severity.

**Example**

```ts
import { ShaclSeverity } from "@beep/semantic-web/services/shacl-validation"

console.log(ShaclSeverity)
```

**Signature**

```ts
declare const ShaclSeverity: AnnotatedSchema<LiteralKit<readonly ["info", "warning", "violation"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/shacl-validation.ts#L47)

Since v0.0.0

## ShaclValidationRequest (class)

SHACL validation request.

**Example**

```ts
import { ShaclValidationRequest } from "@beep/semantic-web/services/shacl-validation"

console.log(ShaclValidationRequest)
```

**Signature**

```ts
declare class ShaclValidationRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/shacl-validation.ts#L149)

Since v0.0.0

## ShaclValidationResult (class)

SHACL validation result.

**Example**

```ts
import { ShaclValidationResult } from "@beep/semantic-web/services/shacl-validation"

console.log(ShaclValidationResult)
```

**Signature**

```ts
declare class ShaclValidationResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/shacl-validation.ts#L177)

Since v0.0.0

## ShaclValidationService (class)

SHACL validation service tag.

**Example**

```ts
import { ShaclValidationService } from "@beep/semantic-web/services/shacl-validation"

console.log(ShaclValidationService)
```

**Signature**

```ts
declare class ShaclValidationService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/shacl-validation.ts#L245)

Since v0.0.0

## ShaclValidationServiceShape (interface)

SHACL validation service contract shape.

**Example**

```ts
import type { ShaclValidationServiceShape } from "@beep/semantic-web/services/shacl-validation"

const acceptShaclValidationServiceShape = (value: ShaclValidationServiceShape) => value
console.log(acceptShaclValidationServiceShape)
```

**Signature**

```ts
export interface ShaclValidationServiceShape {
  readonly validate: (request: ShaclValidationRequest) => Effect.Effect<ShaclValidationResult, ShaclValidationError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/shacl-validation.ts#L228)

Since v0.0.0

## ShaclValidationViolation (class)

SHACL validation violation.

**Example**

```ts
import { ShaclValidationViolation } from "@beep/semantic-web/services/shacl-validation"

console.log(ShaclValidationViolation)
```

**Signature**

```ts
declare class ShaclValidationViolation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/shacl-validation.ts#L123)

Since v0.0.0