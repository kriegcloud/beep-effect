---
title: typography.ts
nav_order: 41
parent: "@beep/ui"
---

## typography.ts overview

---
## Exports Grouped by Category
- [themes](#themes)
  - [typography](#typography)
  - [typographyTheme](#typographytheme)
---

# themes

## typography

Typography theme value.

**Example**

```ts
import { typography } from "@beep/ui/themes/typography"

console.log(typography)
```

**Signature**

```ts
declare const typography: TypographyVariantsOptions | ((palette: Palette) => TypographyVariantsOptions) | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/themes/typography.ts#L96)

Since v0.0.0

## typographyTheme

Typography theme theme value.

**Example**

```ts
import { typographyTheme } from "@beep/ui/themes/typography"

console.log(typographyTheme)
```

**Signature**

```ts
declare const typographyTheme: Components<Omit<Theme, "palette" | "components"> & CssVarsTheme> | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/themes/typography.ts#L127)

Since v0.0.0