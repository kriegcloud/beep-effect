---
title: OnePasswordCli.errors.ts
nav_order: 2
parent: "@beep/onepassword-cli"
---

## OnePasswordCli.errors.ts overview

Typed errors for the 1Password CLI driver.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [OnePasswordCliError (class)](#onepasswordclierror-class)
  - [OnePasswordCliErrorOptions (class)](#onepasswordclierroroptions-class)
---

# errors

## OnePasswordCliError (class)

Technical failure raised by the `@beep/onepassword-cli` driver boundary.

**Example**

```ts
import { OnePasswordCliError } from "@beep/onepassword-cli/OnePasswordCli.errors"

console.log(OnePasswordCliError)
```

**Signature**

```ts
declare class OnePasswordCliError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/onepassword-cli/src/OnePasswordCli.errors.ts#L56)

Since v0.0.0

## OnePasswordCliErrorOptions (class)

Options captured while normalizing unknown 1Password CLI failures.

**Example**

```ts
import { OnePasswordCliErrorOptions } from "@beep/onepassword-cli/OnePasswordCli.errors"

console.log(OnePasswordCliErrorOptions)
```

**Signature**

```ts
declare class OnePasswordCliErrorOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/onepassword-cli/src/OnePasswordCli.errors.ts#L30)

Since v0.0.0