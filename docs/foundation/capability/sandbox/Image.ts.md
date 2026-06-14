---
title: Image.ts
nav_order: 7
parent: "@beep/sandbox"
---

## Image.ts overview

Container image helpers for sandbox CLI setup.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ContainerImageBuildOptions (class)](#containerimagebuildoptions-class)
  - [ContainerImageRemoveOptions (class)](#containerimageremoveoptions-class)
  - [ContainerImageRuntime (type alias)](#containerimageruntime-type-alias)
  - [DockerImageBuildOptions (class)](#dockerimagebuildoptions-class)
  - [PodmanImageBuildOptions (class)](#podmanimagebuildoptions-class)
- [schemas](#schemas)
  - [ContainerImageRuntime](#containerimageruntime)
- [utilities](#utilities)
  - [buildContainerImage](#buildcontainerimage)
  - [buildDockerImage](#builddockerimage)
  - [buildPodmanImage](#buildpodmanimage)
  - [removeContainerImage](#removecontainerimage)
  - [removeDockerImage](#removedockerimage)
  - [removePodmanImage](#removepodmanimage)
---

# models

## ContainerImageBuildOptions (class)

Options for building a local sandbox image.

**Example**

```ts
import { ContainerImageBuildOptions } from "@beep/sandbox"

const options = ContainerImageBuildOptions.make({
  contextDir: ".sandcastle",
  imageName: "beep-sandbox:demo",
  runtime: "docker"
})
console.log(options.imageName)
```

**Signature**

```ts
declare class ContainerImageBuildOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L66)

Since v0.0.0

## ContainerImageRemoveOptions (class)

Options for removing a local sandbox image.

**Example**

```ts
import { ContainerImageRemoveOptions } from "@beep/sandbox"

const options = ContainerImageRemoveOptions.make({
  imageName: "beep-sandbox:demo",
  runtime: "podman"
})
console.log(options.runtime)
```

**Signature**

```ts
declare class ContainerImageRemoveOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L143)

Since v0.0.0

## ContainerImageRuntime (type alias)

Runtime type for `ContainerImageRuntime`.

**Signature**

```ts
type ContainerImageRuntime = typeof ContainerImageRuntime.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L46)

Since v0.0.0

## DockerImageBuildOptions (class)

Docker-specific image build options.

**Example**

```ts
import { DockerImageBuildOptions } from "@beep/sandbox"

const options = DockerImageBuildOptions.make({ contextDir: ".sandcastle" })
console.log(options.contextDir)
```

**Signature**

```ts
declare class DockerImageBuildOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L92)

Since v0.0.0

## PodmanImageBuildOptions (class)

Podman-specific image build options.

**Example**

```ts
import { PodmanImageBuildOptions } from "@beep/sandbox"

const options = PodmanImageBuildOptions.make({ contextDir: ".sandcastle" })
console.log(options.contextDir)
```

**Signature**

```ts
declare class PodmanImageBuildOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L116)

Since v0.0.0

# schemas

## ContainerImageRuntime

Container runtime used for local sandbox images.

**Example**

```ts
import { ContainerImageRuntime } from "@beep/sandbox/Image"

console.log(ContainerImageRuntime)
```

**Signature**

```ts
declare const ContainerImageRuntime: AnnotatedSchema<LiteralKit<readonly ["docker", "podman"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L34)

Since v0.0.0

# utilities

## buildContainerImage

Build a local Docker or Podman image for sandbox runs.

**Example**

```ts
import { buildContainerImage, ContainerImageBuildOptions } from "@beep/sandbox"

const program = buildContainerImage(
  ContainerImageBuildOptions.make({
    contextDir: ".sandcastle",
    imageName: "beep-sandbox:demo",
    runtime: "docker"
  })
)
console.log(program)
```

**Signature**

```ts
declare const buildContainerImage: (options: ContainerImageBuildOptions) => Effect.Effect<void, DockerError | PodmanError, Path.Path | SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L222)

Since v0.0.0

## buildDockerImage

Build a Docker image for sandbox runs.

**Example**

```ts
import { buildDockerImage, DockerImageBuildOptions } from "@beep/sandbox"

const program = buildDockerImage(
  "beep-sandbox:demo",
  DockerImageBuildOptions.make({ contextDir: ".sandcastle" })
)
console.log(program)
```

**Signature**

```ts
declare const buildDockerImage: { (imageName: string, options: DockerImageBuildOptions): Effect.Effect<void, DockerError | PodmanError, Path.Path | SandboxProcess>; (options: DockerImageBuildOptions): (imageName: string) => Effect.Effect<void, DockerError | PodmanError, Path.Path | SandboxProcess>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L284)

Since v0.0.0

## buildPodmanImage

Build a Podman image for sandbox runs.

**Example**

```ts
import { buildPodmanImage, PodmanImageBuildOptions } from "@beep/sandbox"

const program = buildPodmanImage(
  "beep-sandbox:demo",
  PodmanImageBuildOptions.make({ contextDir: ".sandcastle" })
)
console.log(program)
```

**Signature**

```ts
declare const buildPodmanImage: { (imageName: string, options: PodmanImageBuildOptions): Effect.Effect<void, DockerError | PodmanError, Path.Path | SandboxProcess>; (options: PodmanImageBuildOptions): (imageName: string) => Effect.Effect<void, DockerError | PodmanError, Path.Path | SandboxProcess>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L342)

Since v0.0.0

## removeContainerImage

Remove a local Docker or Podman sandbox image.

**Example**

```ts
import { removeContainerImage, ContainerImageRemoveOptions } from "@beep/sandbox"

const program = removeContainerImage(
  ContainerImageRemoveOptions.make({
    imageName: "beep-sandbox:demo",
    runtime: "docker"
  })
)
console.log(program)
```

**Signature**

```ts
declare const removeContainerImage: (options: ContainerImageRemoveOptions) => Effect.Effect<void, DockerError | PodmanError, SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L259)

Since v0.0.0

## removeDockerImage

Remove a Docker image used for sandbox runs.

**Example**

```ts
import { removeDockerImage } from "@beep/sandbox"

const program = removeDockerImage("beep-sandbox:demo")
console.log(program)
```

**Signature**

```ts
declare const removeDockerImage: (imageName: string) => Effect.Effect<void, DockerError | PodmanError, SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L317)

Since v0.0.0

## removePodmanImage

Remove a Podman image used for sandbox runs.

**Example**

```ts
import { removePodmanImage } from "@beep/sandbox"

const program = removePodmanImage("beep-sandbox:demo")
console.log(program)
```

**Signature**

```ts
declare const removePodmanImage: (imageName: string) => Effect.Effect<void, DockerError | PodmanError, SandboxProcess>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Image.ts#L375)

Since v0.0.0