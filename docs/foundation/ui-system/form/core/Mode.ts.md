---
title: Mode.ts
nav_order: 9
parent: "@beep/form"
---

## Mode.ts overview

Form validation mode schemas and parsing helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [FormMode (type alias)](#formmode-type-alias)
  - [FormModeWithoutAutoSubmit (type alias)](#formmodewithoutautosubmit-type-alias)
  - [ParsedMode (class)](#parsedmode-class)
- [parsing](#parsing)
  - [parse](#parse)
---

# models

## FormMode (type alias)

User-facing form validation mode configuration.

**Example**

```ts
import type { FormMode } from "@beep/form/core/Mode"

const mode: FormMode = { validation: "onChange", debounce: "100 millis" }
console.log(mode.validation) // "onChange"
```

**Signature**

```ts
type FormMode = | { readonly validation?: "onSubmit"; readonly autoSubmit?: false; readonly debounce?: never }
  | { readonly validation: "onBlur"; readonly autoSubmit?: boolean; readonly debounce?: never }
  | { readonly validation: "onChange"; readonly debounce?: Duration.Input; readonly autoSubmit?: boolean }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Mode.ts#L27)

Since v0.0.0

## FormModeWithoutAutoSubmit (type alias)

Validation mode configuration with auto-submit disabled at the type level.

**Example**

```ts
import type { FormModeWithoutAutoSubmit } from "@beep/form/core/Mode"

const mode: FormModeWithoutAutoSubmit = { validation: "onBlur", autoSubmit: false }
console.log(mode.validation) // "onBlur"
```

**Signature**

```ts
type FormModeWithoutAutoSubmit = | { readonly validation?: "onSubmit"; readonly autoSubmit?: false; readonly debounce?: never }
  | { readonly validation: "onBlur"; readonly autoSubmit?: false; readonly debounce?: never }
  | { readonly validation: "onChange"; readonly debounce?: Duration.Input; readonly autoSubmit?: false }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Mode.ts#L46)

Since v0.0.0

## ParsedMode (class)

Normalized validation mode consumed by the atom runtime.

**Example**

```ts
import { ParsedMode } from "@beep/form/core/Mode"

const mode = ParsedMode.make({ validation: "onSubmit", debounce: null, autoSubmit: false })
console.log(mode.autoSubmit) // false
```

**Signature**

```ts
declare class ParsedMode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Mode.ts#L71)

Since v0.0.0

# parsing

## parse

Normalizes optional mode input into a parsed mode.

**Example**

```ts
import { parse } from "@beep/form/core/Mode"

const mode = parse({ validation: "onChange", debounce: "10 millis" })
console.log(mode.validation) // "onChange"
```

**Signature**

```ts
declare const parse: (mode?: FormMode) => ParsedMode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Mode.ts#L96)

Since v0.0.0