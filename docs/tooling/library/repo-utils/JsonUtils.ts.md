---
title: JsonUtils.ts
nav_order: 40
parent: "@beep/repo-utils"
---

## JsonUtils.ts overview

Schema-based JSON utilities using Effect v4 SchemaGetter.

Provides effectful JSON serialization through the Schema ecosystem,
avoiding direct `JSON.parse` / `JSON.stringify` calls.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [jsonParse](#jsonparse)
  - [jsonStringifyCompact](#jsonstringifycompact)
  - [jsonStringifyPretty](#jsonstringifypretty)
---

# utilities

## jsonParse

Parse a JSON string into an unknown value using `SchemaGetter.parseJson`.
For typed parsing, prefer `Schema.decodeUnknown(Schema.fromJsonString(MySchema))`.

**Example**

```ts
import { Effect } from "effect"
import { jsonParse } from "@beep/repo-utils/JsonUtils"
const program = Effect.map(jsonParse("{\"ok\":true}"), (value) => typeof value)
console.log(program)
```

**Signature**

```ts
declare const jsonParse: (input: string) => Effect.Effect<unknown, DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JsonUtils.ts#L82)

Since v0.0.0

## jsonStringifyCompact

Serialize a value to a compact JSON string
using `SchemaGetter.stringifyJson`. Returns an Effect with `DomainError`
on serialization failure.

**Example**

```ts
import { Effect } from "effect"
import { jsonStringifyCompact } from "@beep/repo-utils/JsonUtils"
const program = Effect.map(jsonStringifyCompact({ ok: true }), (json) => json.length)
console.log(program)
```

**Signature**

```ts
declare const jsonStringifyCompact: (value: unknown) => Effect.Effect<string, DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JsonUtils.ts#L59)

Since v0.0.0

## jsonStringifyPretty

Serialize a value to a pretty-printed JSON string (2-space indent)
using `SchemaGetter.stringifyJson`. Returns an Effect with `DomainError`
on serialization failure.

**Example**

```ts
import { Effect } from "effect"
import { jsonStringifyPretty } from "@beep/repo-utils/JsonUtils"
const program = Effect.map(jsonStringifyPretty({ ok: true }), (json) => json.length)
console.log(program)
```

**Signature**

```ts
declare const jsonStringifyPretty: (value: unknown) => Effect.Effect<string, DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/JsonUtils.ts#L35)

Since v0.0.0