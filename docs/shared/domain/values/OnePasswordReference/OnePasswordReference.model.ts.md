---
title: OnePasswordReference.model.ts
nav_order: 37
parent: "@beep/shared-domain"
---

## OnePasswordReference.model.ts overview

Shared 1Password reference value object.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isOnePasswordReference](#isonepasswordreference)
- [value-objects](#value-objects)
  - [OnePasswordReference](#onepasswordreference)
  - [OnePasswordReference (type alias)](#onepasswordreference-type-alias)
---

# guards

## isOnePasswordReference

Schema-derived guard for 1Password references.

**Example**

```ts
import { isOnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference/OnePasswordReference.model"

console.log(isOnePasswordReference)
```

**Signature**

```ts
declare const isOnePasswordReference: <I>(input: I) => input is I & string & Brand<"OnePasswordReference">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/OnePasswordReference/OnePasswordReference.model.ts#L72)

Since v0.0.0

# value-objects

## OnePasswordReference

Typed reference to a 1Password item field.

**Example**

```ts
import { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference/OnePasswordReference.model"

console.log(OnePasswordReference)
```

**Signature**

```ts
declare const OnePasswordReference: AnnotatedSchema<S.brand<S.String, "OnePasswordReference">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/OnePasswordReference/OnePasswordReference.model.ts#L42)

Since v0.0.0

## OnePasswordReference (type alias)

Runtime type for `OnePasswordReference`.

**Signature**

```ts
type OnePasswordReference = typeof OnePasswordReference.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/OnePasswordReference/OnePasswordReference.model.ts#L57)

Since v0.0.0