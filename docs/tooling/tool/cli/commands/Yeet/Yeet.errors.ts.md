---
title: Yeet.errors.ts
nav_order: 86
parent: "@beep/repo-cli"
---

## Yeet.errors.ts overview

Tagged errors for the Yeet command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [YeetCommandError (class)](#yeetcommanderror-class)
    - [[Runtime.errorExitCode] (property)](#runtimeerrorexitcode-property)
---

# errors

## YeetCommandError (class)

Operational error raised by the yeet command.

**Example**

```ts
import { YeetCommandError } from "@beep/repo-cli/commands/Yeet"

const error = YeetCommandError.make({ message: "failed" })
console.log(error.message)
```

**Signature**

```ts
declare class YeetCommandError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/Yeet.errors.ts#L40)

Since v0.0.0

### [Runtime.errorExitCode] (property)

Process exit code reported when this error reaches the runtime boundary.

**Signature**

```ts
readonly [Runtime.errorExitCode]: number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/Yeet.errors.ts#L54)