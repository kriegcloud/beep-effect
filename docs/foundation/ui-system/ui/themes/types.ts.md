---
title: types.ts
nav_order: 40
parent: "@beep/ui"
---

## types.ts overview

---
## Exports Grouped by Category
- [type-level](#type-level)
  - [ThemeComponents (type alias)](#themecomponents-type-alias)
  - [ThemeOptions (type alias)](#themeoptions-type-alias)
---

# type-level

## ThemeComponents (type alias)

Theme components type.

**Example**

```ts
import type { ThemeComponents } from "@beep/ui/themes/types"

const value = {} as ThemeComponents
console.log(value)
```

**Signature**

```ts
type ThemeComponents = NonNullable<Parameters<typeof createTheme>[0]>["components"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/themes/types.ts#L33)

Since v0.0.0

## ThemeOptions (type alias)

Theme options type.

**Example**

```ts
import type { ThemeOptions } from "@beep/ui/themes/types"

const value = {} as ThemeOptions
console.log(value)
```

**Signature**

```ts
type ThemeOptions = NonNullable<Parameters<typeof createTheme>[0]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/themes/types.ts#L17)

Since v0.0.0