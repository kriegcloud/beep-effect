---
title: Text.ts
nav_order: 21
parent: "@beep/utils"
---

## Text.ts overview

Text formatting helpers for command and document output.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [formatNameWithAliases](#formatnamewithaliases)
  - [joinLines](#joinlines)
  - [splitCommaSeparatedTrimmed](#splitcommaseparatedtrimmed)
---

# utilities

## formatNameWithAliases

Renders a named list row with optional aliases.

Produces `"name (alias1, alias2): description"` when aliases are present,
or `"name: description"` when there are none.

**Example**

```ts
import { Text } from "@beep/utils"

const row = Text.formatNameWithAliases("ls", ["list", "dir"], { description: "List files" })
// "ls (list, dir): List files"

const noAlias = Text.formatNameWithAliases("rm", [], { description: "Remove files" })
// "rm: Remove files"

console.log(row)
console.log(noAlias)
```

**Signature**

```ts
declare const formatNameWithAliases: { (aliases: ReadonlyArray<string>, options: { readonly description: string; }): (name: string) => string; (name: string, aliases: ReadonlyArray<string>, options: { readonly description: string; }): string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Text.ts#L58)

Since v0.0.0

## joinLines

Joins text lines with a newline separator.

**Example**

```ts
import { Text } from "@beep/utils"

const block = Text.joinLines(["hello", "world"])
// "hello\nworld"

console.log(block)
```

**Signature**

```ts
declare const joinLines: (lines: ReadonlyArray<string>) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Text.ts#L89)

Since v0.0.0

## splitCommaSeparatedTrimmed

Splits comma-separated text, trims each entry, and drops empty values.

**Example**

```ts
import { Text } from "@beep/utils"

const tags = Text.splitCommaSeparatedTrimmed(" foo , bar , , baz ")
// ["foo", "bar", "baz"]

console.log(tags)
```

**Signature**

```ts
declare const splitCommaSeparatedTrimmed: (self: string) => Array<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Text.ts#L33)

Since v0.0.0