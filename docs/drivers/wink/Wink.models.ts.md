---
title: Wink.models.ts
nav_order: 4
parent: "@beep/wink"
---

## Wink.models.ts overview

Wink custom-entity pattern models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CustomEntityExample (class)](#customentityexample-class)
    - [toWinkExample (method)](#towinkexample-method)
  - [EntityGroupName](#entitygroupname)
  - [EntityGroupName (type alias)](#entitygroupname-type-alias)
  - [WinkEngineCustomEntities (class)](#winkenginecustomentities-class)
    - [size (method)](#size-method)
    - [isEmpty (method)](#isempty-method)
    - [toArray (method)](#toarray-method)
    - [merge (method)](#merge-method)
    - [toWinkFormat (method)](#towinkformat-method)
---

# models

## CustomEntityExample (class)

One wink custom-entity training example expressed as bracket-pattern elements.

**Example**

```ts
import * as O from "effect/Option"
import { CustomEntityExample } from "@beep/wink"

const example = CustomEntityExample.make({
  mark: O.none(),
  name: "ProductName",
  patterns: ["[PROPN]", "[NOUN]"]
})

console.log(example.toWinkExample().patterns)
```

**Signature**

```ts
declare class CustomEntityExample
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.models.ts#L110)

Since v0.0.0

### toWinkExample (method)

Convert the example into the object shape accepted by `wink-nlp.learnCustomEntities`.

**Signature**

```ts
declare const toWinkExample: () => { readonly mark?: readonly [number, number] | undefined; readonly name: string; readonly patterns: ReadonlyArray<string>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.models.ts#L128)

## EntityGroupName

Branded identifier for a learned wink custom-entity group.

**Example**

```ts
import * as S from "effect/Schema"
import { EntityGroupName } from "@beep/wink"

const entityGroupName = S.decodeSync(EntityGroupName)("ProductName")
console.log(entityGroupName)
```

**Signature**

```ts
declare const EntityGroupName: AnnotatedSchema<S.brand<S.NonEmptyString, "EntityGroupName">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.models.ts#L66)

Since v0.0.0

## EntityGroupName (type alias)

Runtime TypeScript type produced by `EntityGroupName`.

**Example**

```ts
import { EntityGroupName } from "@beep/wink"
import type { EntityGroupName as EntityGroupNameType } from "@beep/wink"

const groupName: EntityGroupNameType = EntityGroupName.make("ProductName")
console.log(groupName)
```

**Signature**

```ts
type EntityGroupName = typeof EntityGroupName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.models.ts#L88)

Since v0.0.0

## WinkEngineCustomEntities (class)

Collection of custom-entity examples learned as one logical wink entity group.

**Example**

```ts
import * as O from "effect/Option"
import { CustomEntityExample, EntityGroupName, WinkEngineCustomEntities } from "@beep/wink"

const customEntities = WinkEngineCustomEntities.make({
  name: EntityGroupName.make("ProductName"),
  patterns: [
    CustomEntityExample.make({
      mark: O.none(),
      name: "ProductName",
      patterns: ["[PROPN]", "[NOUN]"]
    })
  ]
})

console.log(customEntities.toWinkFormat()[0]?.name)
```

**Signature**

```ts
declare class WinkEngineCustomEntities
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.models.ts#L166)

Since v0.0.0

### size (method)

Number of custom entity examples in the group.

**Signature**

```ts
declare const size: () => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.models.ts#L229)

### isEmpty (method)

Whether the collection contains no examples.

**Signature**

```ts
declare const isEmpty: () => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.models.ts#L238)

### toArray (method)

Convert to a readonly array for iteration.

**Signature**

```ts
declare const toArray: () => ReadonlyArray<CustomEntityExample>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.models.ts#L247)

### merge (method)

Merge two custom-entity collections, preserving unique examples by content.

**Signature**

```ts
declare const merge: (other: WinkEngineCustomEntities, newName?: EntityGroupName | string) => WinkEngineCustomEntities
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.models.ts#L258)

### toWinkFormat (method)

Convert to the array-of-example format accepted by `wink-nlp.learnCustomEntities`.

**Signature**

```ts
declare const toWinkFormat: () => ReadonlyArray<{ readonly mark?: readonly [number, number] | undefined; readonly name: string; readonly patterns: ReadonlyArray<string>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.models.ts#L276)