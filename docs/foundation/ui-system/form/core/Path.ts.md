---
title: Path.ts
nav_order: 10
parent: "@beep/form"
---

## Path.ts overview

Field path formatting, reading, writing, and dirty-path predicates.

Since v0.0.0

---
## Exports Grouped by Category
- [formatting](#formatting)
  - [schemaPathToFieldPath](#schemapathtofieldpath)
- [getters](#getters)
  - [getNestedValue](#getnestedvalue)
- [predicates](#predicates)
  - [isPathOrParentDirty](#ispathorparentdirty)
  - [isPathUnderRoot](#ispathunderroot)
- [setters](#setters)
  - [setNestedValue](#setnestedvalue)
---

# formatting

## schemaPathToFieldPath

Converts a schema issue path into dot-and-bracket form field notation.

**Example**

```ts
import { schemaPathToFieldPath } from "@beep/form/core/Path"

console.log(schemaPathToFieldPath(["items", 0, "name"])) // "items[0].name"
```

**Signature**

```ts
declare const schemaPathToFieldPath: (path: ReadonlyArray<PropertyKey | StandardPathSegment> | undefined) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Path.ts#L48)

Since v0.0.0

# getters

## getNestedValue

Reads a value from a dot-and-bracket path.

**Example**

```ts
import { pipe } from "effect"
import { getNestedValue } from "@beep/form/core/Path"

console.log(getNestedValue({ items: [{ name: "A" }] }, "items[0].name")) // "A"
console.log(pipe({ items: [{ name: "A" }] }, getNestedValue("items[0].name"))) // "A"
```

**Signature**

```ts
declare const getNestedValue: { (path: string): (obj: unknown) => unknown; (obj: unknown, path: string): unknown; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Path.ts#L151)

Since v0.0.0

# predicates

## isPathOrParentDirty

Tests whether a path or one of its parents is marked dirty.

**Example**

```ts
import { pipe } from "effect"
import { isPathOrParentDirty } from "@beep/form/core/Path"
import * as HashSet from "effect/HashSet"

console.log(isPathOrParentDirty(HashSet.make("user"), "user.name")) // true
console.log(pipe(HashSet.make("user"), isPathOrParentDirty("user.name"))) // true
```

**Signature**

```ts
declare const isPathOrParentDirty: { (path: string): (dirtyFields: HashSet.HashSet<string>) => boolean; (dirtyFields: HashSet.HashSet<string>, path: string): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Path.ts#L109)

Since v0.0.0

## isPathUnderRoot

Tests whether a path is equal to or nested below a root path.

**Example**

```ts
import { pipe } from "effect"
import { isPathUnderRoot } from "@beep/form/core/Path"

console.log(isPathUnderRoot("items[0].name", "items")) // true
console.log(pipe("items[0].name", isPathUnderRoot("items"))) // true
```

**Signature**

```ts
declare const isPathUnderRoot: { (rootPath: string): (path: string) => boolean; (path: string, rootPath: string): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Path.ts#L84)

Since v0.0.0

# setters

## setNestedValue

Sets a value at a dot-and-bracket path while copying touched containers.

**Example**

```ts
import { pipe } from "effect"
import { setNestedValue } from "@beep/form/core/Path"

const result = setNestedValue({ user: { name: "Ada" } }, { path: "user.name", value: "Grace" })
const piped = pipe({ user: { name: "Ada" } }, setNestedValue({ path: "user.name", value: "Grace" }))
console.log(result.user.name) // "Grace"
console.log(piped.user.name) // "Grace"
```

**Signature**

```ts
declare const setNestedValue: { (options: { readonly path: string; readonly value: unknown; }): <T>(obj: T) => T; <T>(obj: T, options: { readonly path: string; readonly value: unknown; }): T; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Path.ts#L182)

Since v0.0.0