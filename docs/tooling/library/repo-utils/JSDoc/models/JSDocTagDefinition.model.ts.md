---
title: JSDocTagDefinition.model.ts
nav_order: 21
parent: "@beep/repo-utils"
---

## JSDocTagDefinition.model.ts overview

JSDoc metadata models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [JSDocTagDefinition (class)](#jsdoctagdefinition-class)
  - [JSDocTagDefinition (namespace)](#jsdoctagdefinition-namespace)
    - [Instance (interface)](#instance-interface)
    - [Encoded (type alias)](#encoded-type-alias)
  - [assertJsDoc](#assertjsdoc)
  - [make](#make)
---

# models

## JSDocTagDefinition (class)

Complete metadata for a single JSDoc/TSDoc tag.
Designed as a discriminated union member via `_tag`.

**Example**

```ts
import { JSDocTagDefinition } from "@beep/repo-utils/JSDoc/models/JSDocTagDefinition.model"

console.log(JSDocTagDefinition)
```

**Signature**

```ts
declare class JSDocTagDefinition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts#L39)

Since v0.0.0

## JSDocTagDefinition (namespace)

JSDoc model export.

**Example**

```ts
import { JSDocTagDefinition } from "@beep/repo-utils/JSDoc/models/JSDocTagDefinition.model"

console.log(JSDocTagDefinition)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts#L117)

Since v0.0.0

### Instance (interface)

JSDoc model export.

**Signature**

```ts
export interface Instance<Tag extends TagName, Def extends Encoded> extends Encoded {
    _tag: Tag;
    applicableTo: Def["applicableTo"];
    astDerivable: Def["astDerivable"];
    relatedTags: Def["relatedTags"];
    specifications: Def["specifications"];
    synonyms: Def["synonyms"];
    tagKind: Def["tagKind"];
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts#L131)

Since v0.0.0

### Encoded (type alias)

JSDoc model export.

**Signature**

```ts
type Encoded = typeof JSDocTagDefinition.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts#L124)

Since v0.0.0

## assertJsDoc

Asserts that a value matches the encoded JSDoc tag definition shape.

**Example**

```ts
import { assertJsDoc } from "@beep/repo-utils/JSDoc/models/JSDocTagDefinition.model"

console.log(assertJsDoc)
```

**Signature**

```ts
declare const assertJsDoc: <const Def extends JSDocTagDefinition.Encoded>(input: Def) => asserts input is Def
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts#L155)

Since v0.0.0

## make

Builds a JSDoc tag definition schema for a concrete tag payload.

**Example**

```ts
import { make } from "@beep/repo-utils/JSDoc/models/JSDocTagDefinition.model"

console.log(make)
```

**Signature**

```ts
declare const make: { <const Tag extends TagName, const Def extends typeof JSDocTagDefinition.Encoded>(meta: Omit<JSDocTagDefinition.Instance<Tag, Def>, "_tag">): (tag: Tag) => ReturnType<typeof JSDocTagDefinition.mapFields>; <const Tag extends TagName, const Def extends typeof JSDocTagDefinition.Encoded>(_tag: Tag, meta: Omit<JSDocTagDefinition.Instance<Tag, Def>, "_tag">): ReturnType<typeof JSDocTagDefinition.mapFields>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JSDoc/models/JSDocTagDefinition.model.ts#L176)

Since v0.0.0