---
title: Ci.errors.ts
nav_order: 14
parent: "@beep/repo-cli"
---

## Ci.errors.ts overview

Tagged errors for the Ci command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [CiCommandError (class)](#cicommanderror-class)
---

# errors

## CiCommandError (class)

Typed failure for CI helper commands.

**Example**

```ts
import { CiCommandError } from "@beep/repo-cli/commands/Ci"
const error = new CiCommandError({ message: "failed" })
```

**Signature**

```ts
declare class CiCommandError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Ci/Ci.errors.ts#L26)

Since v0.0.0