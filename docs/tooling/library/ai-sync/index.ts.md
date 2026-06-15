---
title: index.ts
nav_order: 5
parent: "@beep/ai-sync"
---

## index.ts overview

Current package version.

**Example**

```ts
import { VERSION } from "@beep/ai-sync"
console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - ["./source-map.ts" (namespace export)](#source-mapts-namespace-export)
  - [VERSION](#version)
- [interop](#interop)
  - ["./transforms.ts" (namespace export)](#transformsts-namespace-export)
- [models](#models)
  - ["./models.ts" (namespace export)](#modelsts-namespace-export)
- [schemas](#schemas)
  - ["./schemas.ts" (namespace export)](#schemasts-namespace-export)
- [services](#services)
  - ["./drift.ts" (namespace export)](#driftts-namespace-export)
- [validation](#validation)
  - ["./validation.ts" (namespace export)](#validationts-namespace-export)
---

# constants

## "./source-map.ts" (namespace export)

Re-exports all named exports from the "./source-map.ts" module.

**Example**

```ts
import { V1_SCHEMA_COVERAGE } from "@beep/ai-sync"
console.log(V1_SCHEMA_COVERAGE.length)
```

**Signature**

```ts
export * from "./source-map.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/index.ts#L70)

Since v0.0.0

## VERSION

Current package version.

**Example**

```ts
import { VERSION } from "@beep/ai-sync"
console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/index.ts#L20)

Since v0.0.0

# interop

## "./transforms.ts" (namespace export)

Re-exports all named exports from the "./transforms.ts" module.

**Example**

```ts
import { codexMcpServersToClaudeMcpJson } from "@beep/ai-sync"
console.log(codexMcpServersToClaudeMcpJson)
```

**Signature**

```ts
export * from "./transforms.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/index.ts#L82)

Since v0.0.0

# models

## "./models.ts" (namespace export)

Re-exports all named exports from the "./models.ts" module.

**Example**

```ts
import { AiSyncAgentId } from "@beep/ai-sync"
console.log(AiSyncAgentId.Enum.codex)
```

**Signature**

```ts
export * from "./models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/index.ts#L46)

Since v0.0.0

# schemas

## "./schemas.ts" (namespace export)

Re-exports all named exports from the "./schemas.ts" module.

**Example**

```ts
import { CodexConfig } from "@beep/ai-sync"
console.log(CodexConfig.ast)
```

**Signature**

```ts
export * from "./schemas.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/index.ts#L58)

Since v0.0.0

# services

## "./drift.ts" (namespace export)

Re-exports all named exports from the "./drift.ts" module.

**Example**

```ts
import { checkGeneratedArtifacts } from "@beep/ai-sync"
console.log(checkGeneratedArtifacts)
```

**Signature**

```ts
export * from "./drift.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/index.ts#L33)

Since v0.0.0

# validation

## "./validation.ts" (namespace export)

Re-exports all named exports from the "./validation.ts" module.

**Example**

```ts
import { validateRepoConfig } from "@beep/ai-sync"
console.log(validateRepoConfig)
```

**Signature**

```ts
export * from "./validation.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/index.ts#L94)

Since v0.0.0