---
title: Glob.schema.ts
nav_order: 101
parent: "@beep/schema"
---

## Glob.schema.ts overview

Branded schema for portable glob pattern strings accepted by Bun's current
glob parser.

This schema keeps Bun's parser acceptance rules while enforcing the repo's
forward-slash convention for portable patterns.

**Example**

```ts
```typescript
import * as S from "effect/Schema";
import { Glob } from "@beep/schema/Glob";

const pattern = S.decodeUnknownSync(Glob)("src/*.ts");
console.log(pattern);
```
```

Since v0.0.0

---
## Exports Grouped by Category
  - [Schema (type alias)](#schema-type-alias)
- [schemas](#schemas)
  - [Schema](#schema)
- [validation](#validation)
  - [Glob](#glob)
---

# models

## Glob (type alias)

Type for `Glob`.

**Signature**

```ts
type Glob = typeof Glob.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Glob/Glob.schema.ts#L130)

Since v0.0.0

## Schema (type alias)

Runtime type extracted from `Schema`.

**Example**

```ts
import type { Schema as GlobValue } from "@beep/schema/Glob"

const pattern = "src/*.ts" as GlobValue
console.log(pattern)
```

**Signature**

```ts
type Schema = Glob
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Glob/Glob.schema.ts#L161)

Since v0.0.0

# schemas

## Schema

Primary glob schema role alias.

**Example**

```ts
import { Schema } from "@beep/schema/Glob"

console.log(Schema.ast._tag)
```

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.brand<S.String, "Glob">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Glob/Glob.schema.ts#L145)

Since v0.0.0

# validation

## Glob

Branded schema for portable non-empty glob pattern strings.

The runtime validation mirrors the current Bun parser acceptance rules while
rejecting backslash separators so patterns remain portable across
environments and keeping the repo's defensive max-length limit.

**Example**

```ts
import * as S from "effect/Schema"
import { Glob } from "@beep/schema/Glob"

const pattern = S.decodeUnknownSync(Glob)("src/*.ts")
console.log(pattern)
```

**Signature**

```ts
declare const Glob: AnnotatedSchema<S.brand<S.String, "Glob">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Glob/Glob.schema.ts#L113)

Since v0.0.0