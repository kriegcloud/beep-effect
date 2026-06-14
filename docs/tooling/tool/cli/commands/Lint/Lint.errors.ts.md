---
title: Lint.errors.ts
nav_order: 57
parent: "@beep/repo-cli"
---

## Lint.errors.ts overview

Tagged errors for the Lint command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [LintCircularAnalysisError (class)](#lintcircularanalysiserror-class)
  - [LintFileDiscoveryError (class)](#lintfilediscoveryerror-class)
---

# errors

## LintCircularAnalysisError (class)

Failure raised when circular dependency analysis cannot complete.

**Example**

```ts
import { LintCircularAnalysisError } from "@beep/repo-cli/commands/Lint/Lint.errors"

const error = LintCircularAnalysisError.new("Circular dependency analysis failed.")
console.log(error.message)
```

**Signature**

```ts
declare class LintCircularAnalysisError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/Lint.errors.ts#L32)

Since v0.0.0

## LintFileDiscoveryError (class)

Failure raised when lint file discovery cannot read a source root.

**Example**

```ts
import { LintFileDiscoveryError } from "@beep/repo-cli/commands/Lint/Lint.errors"

const error = LintFileDiscoveryError.new("src/index.ts", ".", "Could not discover TypeScript files.")
console.log(error.path)
```

**Signature**

```ts
declare class LintFileDiscoveryError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/Lint.errors.ts#L63)

Since v0.0.0