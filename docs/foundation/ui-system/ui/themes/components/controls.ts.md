---
title: controls.ts
nav_order: 22
parent: "@beep/ui"
---

## controls.ts overview

---
## Exports Grouped by Category
- [themes](#themes)
  - [controlsTheme](#controlstheme)
---

# themes

## controlsTheme

Controls theme theme value.

**Example**

```ts
import { controlsTheme } from "@beep/ui/themes/components/controls"

console.log(controlsTheme)
```

**Signature**

```ts
declare const controlsTheme: Components<Omit<Theme, "palette" | "components"> & CssVarsTheme> | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/themes/components/controls.ts#L94)

Since v0.0.0