---
title: AIMetrics.errors.ts
nav_order: 6
parent: "@beep/repo-cli"
---

## AIMetrics.errors.ts overview

Tagged errors for the AIMetrics command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiMetricsCommandError (class)](#aimetricscommanderror-class)
  - [AiMetricsStatusExit (class)](#aimetricsstatusexit-class)
    - [[Runtime.errorExitCode] (property)](#runtimeerrorexitcode-property)
    - [[Runtime.errorReported] (property)](#runtimeerrorreported-property)
---

# errors

## AiMetricsCommandError (class)

Error raised by the AI metrics CLI.

**Example**

```ts
import { aiMetricsCommand } from "@beep/repo-cli/commands/AIMetrics/index"
console.log(aiMetricsCommand)
```

**Signature**

```ts
declare class AiMetricsCommandError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/AIMetrics/AIMetrics.errors.ts#L26)

Since v0.0.0

## AiMetricsStatusExit (class)

Silent non-zero status used after the status command has already rendered output.

**Example**

```ts
import { AiMetricsStatusExit } from "@beep/repo-cli/commands/AIMetrics/AIMetrics.errors"

const error = AiMetricsStatusExit.new("AI metrics status failed.")
console.log(error.message)
```

**Signature**

```ts
declare class AiMetricsStatusExit
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/AIMetrics/AIMetrics.errors.ts#L47)

Since v0.0.0

### [Runtime.errorExitCode] (property)

Process exit code reported when this status sentinel reaches the runtime boundary.

**Signature**

```ts
readonly [Runtime.errorExitCode]: 1
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/AIMetrics/AIMetrics.errors.ts#L57)

### [Runtime.errorReported] (property)

Suppress duplicate runtime reporting after command output has already been rendered.

**Signature**

```ts
readonly [Runtime.errorReported]: false
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/AIMetrics/AIMetrics.errors.ts#L60)