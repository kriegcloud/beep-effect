---
title: Codex.errors.ts
nav_order: 19
parent: "@beep/repo-cli"
---

## Codex.errors.ts overview

Tagged errors for the Codex command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [CodexCommandError (class)](#codexcommanderror-class)
    - [[Runtime.errorExitCode] (property)](#runtimeerrorexitcode-property)
---

# errors

## CodexCommandError (class)

Typed failure for Codex helper commands.

**Example**

```ts
import { CodexCommandError } from "@beep/repo-cli/commands/Codex"
const error = new CodexCommandError({ message: "failed" })
```

**Signature**

```ts
declare class CodexCommandError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Codex/Codex.errors.ts#L35)

Since v0.0.0

### [Runtime.errorExitCode] (property)

Process exit code reported when this error reaches the runtime boundary.

**Signature**

```ts
readonly [Runtime.errorExitCode]: number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Codex/Codex.errors.ts#L47)