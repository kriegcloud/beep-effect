---
title: Graphiti.errors.ts
nav_order: 38
parent: "@beep/repo-cli"
---

## Graphiti.errors.ts overview

Tagged errors for the Graphiti command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [GraphitiProxyOpsError (class)](#graphitiproxyopserror-class)
    - [[Runtime.errorExitCode] (property)](#runtimeerrorexitcode-property)
- [models](#models)
  - [GraphitiProxyConfigLoadError (class)](#graphitiproxyconfigloaderror-class)
---

# errors

## GraphitiProxyOpsError (class)

Typed failure for Graphiti proxy operational helpers.

**Example**

```ts
import { GraphitiProxyOpsError } from "@beep/repo-cli/commands/Graphiti/internal/ProxyOps"
const error = new GraphitiProxyOpsError({ message: "failed" })
```

**Signature**

```ts
declare class GraphitiProxyOpsError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Graphiti/Graphiti.errors.ts#L78)

Since v0.0.0

### [Runtime.errorExitCode] (property)

Process exit code reported when this error reaches the runtime boundary.

**Signature**

```ts
readonly [Runtime.errorExitCode]: number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Graphiti/Graphiti.errors.ts#L91)

# models

## GraphitiProxyConfigLoadError (class)

Raised when graphiti proxy configuration cannot be loaded.

**Example**

```ts
console.log("GraphitiProxyConfigLoadError")
```

**Signature**

```ts
declare class GraphitiProxyConfigLoadError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Graphiti/Graphiti.errors.ts#L35)

Since v0.0.0