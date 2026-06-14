---
title: createSandbox.ts
nav_order: 3
parent: "@beep/sandbox"
---

## createSandbox.ts overview

Programmatic sandbox creation helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [createSandbox](#createsandbox)
- [models](#models)
  - [CreateSandboxResult (class)](#createsandboxresult-class)
- [services](#services)
  - [CreateSandboxOptions (interface)](#createsandboxoptions-interface)
---

# constructors

## createSandbox

Create a sandbox handle from a provider.

**Example**

```ts
import { createSandbox } from "@beep/sandbox/createSandbox"

console.log(createSandbox)
```

**Signature**

```ts
declare const createSandbox: <R>(options: CreateSandboxOptions<R>) => Effect.Effect<SandboxHandle<R>, SandboxError, R | FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/createSandbox.ts#L78)

Since v0.0.0

# models

## CreateSandboxResult (class)

Result of direct sandbox creation.

**Example**

```ts
import { CreateSandboxResult } from "@beep/sandbox/createSandbox"

console.log(CreateSandboxResult)
```

**Signature**

```ts
declare class CreateSandboxResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/createSandbox.ts#L55)

Since v0.0.0

# services

## CreateSandboxOptions (interface)

Options for creating a sandbox handle directly.

**Example**

```ts
import type { CreateSandboxOptions } from "@beep/sandbox/createSandbox"

const value = {} as CreateSandboxOptions
console.log(value)
```

**Signature**

```ts
export interface CreateSandboxOptions<R = never> {
  readonly cwd: string;
  readonly env?: Readonly<Record<string, string>>;
  readonly mounts?: ReadonlyArray<MountEntry>;
  readonly sandbox: SandboxProvider<R>;
  readonly worktreePath: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/createSandbox.ts#L34)

Since v0.0.0