---
title: Sandbox.providers.ts
nav_order: 22
parent: "@beep/sandbox"
---

## Sandbox.providers.ts overview

Built-in local sandbox providers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [docker](#docker)
  - [noSandbox](#nosandbox)
  - [podman](#podman)
- [models](#models)
  - [ContainerProviderOptions (class)](#containerprovideroptions-class)
  - [NoSandboxOptions (class)](#nosandboxoptions-class)
---

# constructors

## docker

Create a Docker bind-mount sandbox provider.

**Example**

```ts
import { docker } from "@beep/sandbox/Sandbox.providers"

console.log(docker)
```

**Signature**

```ts
declare const docker: (options: ContainerProviderOptions) => BindMountSandboxProvider<SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.providers.ts#L368)

Since v0.0.0

## noSandbox

Create a host-local no-sandbox provider.

**Example**

```ts
import { noSandbox } from "@beep/sandbox/Sandbox.providers"

console.log(noSandbox)
```

**Signature**

```ts
declare const noSandbox: (options?: NoSandboxOptions) => NoSandboxProvider<SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.providers.ts#L302)

Since v0.0.0

## podman

Create a Podman bind-mount sandbox provider.

**Example**

```ts
import { podman } from "@beep/sandbox/Sandbox.providers"

console.log(podman)
```

**Signature**

```ts
declare const podman: (options: ContainerProviderOptions) => BindMountSandboxProvider<SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.providers.ts#L384)

Since v0.0.0

# models

## ContainerProviderOptions (class)

Options for Docker and Podman bind-mount providers.

**Example**

```ts
import { ContainerProviderOptions } from "@beep/sandbox/Sandbox.providers"

console.log(ContainerProviderOptions)
```

**Signature**

```ts
declare class ContainerProviderOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.providers.ts#L87)

Since v0.0.0

## NoSandboxOptions (class)

Options for the no-sandbox provider.

**Example**

```ts
import { NoSandboxOptions } from "@beep/sandbox/Sandbox.providers"

console.log(NoSandboxOptions)
```

**Signature**

```ts
declare class NoSandboxOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.providers.ts#L65)

Since v0.0.0