---
title: DependencyProfile.model.ts
nav_order: 17
parent: "@beep/repo-utils"
---

## DependencyProfile.model.ts overview

Dependency profile and fan value model definitions.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DependencyProfile (class)](#dependencyprofile-class)
  - [FanValue](#fanvalue)
  - [FanValue (type alias)](#fanvalue-type-alias)
---

# models

## DependencyProfile (class)

Dependency direction profile. Used to validate classifications:
if something classified as domain logic has high fan-out, that is a
misclassification signal.

**Example**

```ts
import { DependencyProfile } from "@beep/repo-utils/JSDoc/models/DependencyProfile.model"

console.log(DependencyProfile)
```

**Signature**

```ts
declare class DependencyProfile
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/DependencyProfile.model.ts#L62)

Since v0.0.0

## FanValue

Fan-in / fan-out intensity classification.

**Example**

```ts
import { FanValue } from "@beep/repo-utils/JSDoc/models/DependencyProfile.model"

console.log(FanValue)
```

**Signature**

```ts
declare const FanValue: AnnotatedSchema<LiteralKit<readonly ["low", "medium", "high"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/DependencyProfile.model.ts#L26)

Since v0.0.0

## FanValue (type alias)

Inferred type for `FanValue`.

**Example**

```ts
import type { FanValue } from "@beep/repo-utils/JSDoc/models/DependencyProfile.model"

type Example = FanValue
const accept = <A extends Example>(value: A): A => value
console.log(accept)
```

**Signature**

```ts
type FanValue = typeof FanValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/DependencyProfile.model.ts#L46)

Since v0.0.0