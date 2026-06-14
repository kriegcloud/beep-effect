---
title: Reuse.errors.ts
nav_order: 71
parent: "@beep/repo-cli"
---

## Reuse.errors.ts overview

Tagged errors for the Reuse command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CodexRunnerError (class)](#codexrunnererror-class)
  - [CodexRunnerStage](#codexrunnerstage)
  - [CodexRunnerStage (type alias)](#codexrunnerstage-type-alias)
---

# models

## CodexRunnerError (class)

Structured error emitted when the Codex SDK smoke path fails.

**Example**

```ts
import { CodexRunnerError } from "@beep/repo-cli/commands/Reuse"
console.log(CodexRunnerError)
```

**Signature**

```ts
declare class CodexRunnerError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/Reuse.errors.ts#L56)

Since v0.0.0

## CodexRunnerStage

Lifecycle stages surfaced by the Codex smoke runner.

**Example**

```ts
import { CodexRunnerStage } from "@beep/repo-cli/commands/Reuse"
console.log(CodexRunnerStage)
```

**Signature**

```ts
declare const CodexRunnerStage: AnnotatedSchema<LiteralKit<readonly ["findRepoRoot", "import", "construct", "startThread"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/Reuse.errors.ts#L31)

Since v0.0.0

## CodexRunnerStage (type alias)

Runtime type for `CodexRunnerStage`.

**Signature**

```ts
type CodexRunnerStage = typeof CodexRunnerStage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/Reuse.errors.ts#L43)

Since v0.0.0