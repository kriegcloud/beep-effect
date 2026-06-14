---
title: Quality.errors.ts
nav_order: 68
parent: "@beep/repo-cli"
---

## Quality.errors.ts overview

Tagged errors for the Quality command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [ChangesetGraphError (class)](#changesetgrapherror-class)
  - [QualityTaskConfigurationError (class)](#qualitytaskconfigurationerror-class)
  - [QualityTaskFailed (class)](#qualitytaskfailed-class)
    - [[Runtime.errorExitCode] (property)](#runtimeerrorexitcode-property)
  - [QualityTaskGroupFailed (class)](#qualitytaskgroupfailed-class)
    - [[Runtime.errorExitCode] (property)](#runtimeerrorexitcode-property-1)
  - [UnexpectedQualityTaskFailure (class)](#unexpectedqualitytaskfailure-class)
- [errors](#errors)
  - [QualityScriptCommandError (class)](#qualityscriptcommanderror-class)
    - [[Runtime.errorExitCode] (property)](#runtimeerrorexitcode-property-2)
---

# error-handling

## ChangesetGraphError (class)

Failure raised while validating changeset package references.

**Example**

```ts
import { ChangesetGraphError } from "@beep/repo-cli/commands/Quality/ChangesetGraph"

const error = new ChangesetGraphError({
  message: "Changeset graph validation failed."
})
console.log(error.message)
```

**Signature**

```ts
declare class ChangesetGraphError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.errors.ts#L43)

Since v0.0.0

## QualityTaskConfigurationError (class)

Error raised when a quality task cannot resolve its required configuration.

**Example**

```ts
import { QualityTaskConfigurationError } from "@beep/repo-cli/commands/Quality/Tasks"
const error = new QualityTaskConfigurationError({
  message: "Could not find package.json"
})
```

**Signature**

```ts
declare class QualityTaskConfigurationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.errors.ts#L245)

Since v0.0.0

## QualityTaskFailed (class)

Error raised when a quality task subprocess exits unsuccessfully.

**Example**

```ts
import { QualityTaskFailed } from "@beep/repo-cli/commands/Quality/Tasks"
const failure = new QualityTaskFailed({
  label: "lint",
  command: "bunx turbo run lint",
  exitCode: 1
})
```

**Signature**

```ts
declare class QualityTaskFailed
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.errors.ts#L144)

Since v0.0.0

### [Runtime.errorExitCode] (property)

Process exit code reported when this error reaches the runtime boundary.

**Signature**

```ts
readonly [Runtime.errorExitCode]: number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.errors.ts#L156)

## QualityTaskGroupFailed (class)

Error raised when a bounded quality task group completes with failed steps.

**Example**

```ts
import { QualityTaskGroupFailed, QualityTaskFailed } from "@beep/repo-cli/commands/Quality/Tasks"
const failure = new QualityTaskGroupFailed({
  label: "lint:policies",
  exitCode: 1,
  failures: [
    new QualityTaskFailed({
      label: "lint:spell",
      command: "bunx cspell .",
      exitCode: 1
    })
  ]
})
```

**Signature**

```ts
declare class QualityTaskGroupFailed
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.errors.ts#L198)

Since v0.0.0

### [Runtime.errorExitCode] (property)

Process exit code reported when this error reaches the runtime boundary.

**Signature**

```ts
readonly [Runtime.errorExitCode]: number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.errors.ts#L210)

## UnexpectedQualityTaskFailure (class)

Error raised when an unexpected quality task cause reaches the command boundary.

**Example**

```ts
import { UnexpectedQualityTaskFailure } from "@beep/repo-cli/commands/Quality/Tasks"
const error = new UnexpectedQualityTaskFailure({
  message: "Unexpected quality task failure"
})
```

**Signature**

```ts
declare class UnexpectedQualityTaskFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.errors.ts#L277)

Since v0.0.0

# errors

## QualityScriptCommandError (class)

Typed failure for repo operational commands.

**Example**

```ts
import { QualityScriptCommandError } from "@beep/repo-cli/commands/Quality/Quality.command"
const error = new QualityScriptCommandError({ message: "failed" })
```

**Signature**

```ts
declare class QualityScriptCommandError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.errors.ts#L88)

Since v0.0.0

### [Runtime.errorExitCode] (property)

Process exit code reported when this error reaches the runtime boundary.

**Signature**

```ts
readonly [Runtime.errorExitCode]: number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.errors.ts#L103)