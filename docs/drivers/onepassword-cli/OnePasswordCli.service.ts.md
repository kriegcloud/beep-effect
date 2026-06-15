---
title: OnePasswordCli.service.ts
nav_order: 4
parent: "@beep/onepassword-cli"
---

## OnePasswordCli.service.ts overview

Effect service for the native 1Password CLI.

Since v0.0.0

---
## Exports Grouped by Category
- [services](#services)
  - [OnePasswordCli (class)](#onepasswordcli-class)
  - [OnePasswordCliRunner (type alias)](#onepasswordclirunner-type-alias)
---

# services

## OnePasswordCli (class)

Effect service for native `op` execution.

**Example**

```ts
import { OnePasswordCli } from "@beep/onepassword-cli/OnePasswordCli.service"

console.log(OnePasswordCli)
```

**Signature**

```ts
declare class OnePasswordCli
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/onepassword-cli/src/OnePasswordCli.service.ts#L156)

Since v0.0.0

## OnePasswordCliRunner (type alias)

Product-neutral process runner used by the 1Password CLI driver.

**Example**

```ts
import type { OnePasswordCliRunner } from "@beep/onepassword-cli/OnePasswordCli.service"

const value = {} as OnePasswordCliRunner
console.log(value)
```

**Signature**

```ts
type OnePasswordCliRunner = (
  command: string,
  args: ReadonlyArray<string>
) => Effect.Effect<OnePasswordCliProcessResult, OnePasswordCliError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/onepassword-cli/src/OnePasswordCli.service.ts#L43)

Since v0.0.0