---
title: Init.ts
nav_order: 9
parent: "@beep/sandbox"
---

## Init.ts overview

Init scaffolding for sandbox configuration directories.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [initSandbox](#initsandbox)
- [models](#models)
  - [InitSandboxOptions (class)](#initsandboxoptions-class)
  - [InitSandboxResult (class)](#initsandboxresult-class)
  - [SandboxAgentEntry (class)](#sandboxagententry-class)
  - [SandboxAgentName (type alias)](#sandboxagentname-type-alias)
  - [SandboxInitProviderEntry (class)](#sandboxinitproviderentry-class)
  - [SandboxInitProviderName (type alias)](#sandboxinitprovidername-type-alias)
- [schemas](#schemas)
  - [SandboxAgentName](#sandboxagentname)
  - [SandboxInitProviderName](#sandboxinitprovidername)
- [utilities](#utilities)
  - [SANDBOX_CONFIG_DIR](#sandbox_config_dir)
  - [defaultSandboxImageName](#defaultsandboximagename)
  - [ensureSandboxConfigDir](#ensuresandboxconfigdir)
  - [getSandboxAgent](#getsandboxagent)
  - [getSandboxInitProvider](#getsandboxinitprovider)
  - [listSandboxAgents](#listsandboxagents)
  - [listSandboxInitProviders](#listsandboxinitproviders)
---

# constructors

## initSandbox

Scaffold the `.sandcastle` config directory for a repository.

**Example**

```ts
import { initSandbox, InitSandboxOptions } from "@beep/sandbox"

const program = initSandbox(InitSandboxOptions.make({ repoDir: process.cwd() }))
console.log(program)
```

**Signature**

```ts
declare const initSandbox: (options: InitSandboxOptions) => Effect.Effect<InitSandboxResult, InitError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L485)

Since v0.0.0

# models

## InitSandboxOptions (class)

Options for initializing a sandbox config directory.

**Example**

```ts
import { InitSandboxOptions } from "@beep/sandbox"

const options = InitSandboxOptions.make({ repoDir: process.cwd() })
console.log(options.templateName)
```

**Signature**

```ts
declare class InitSandboxOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L159)

Since v0.0.0

## InitSandboxResult (class)

Result returned after sandbox init scaffolding completes.

**Example**

```ts
import { InitSandboxResult } from "@beep/sandbox"

const result = InitSandboxResult.make({
  configDir: "/repo/.sandcastle",
  imageName: "beep-sandbox:repo",
  mainFilename: "main.ts",
  nextSteps: [],
  providerName: "docker",
  templateName: "blank"
})
console.log(result.configDir)
```

**Signature**

```ts
declare class InitSandboxResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L194)

Since v0.0.0

## SandboxAgentEntry (class)

Agent registry entry used by init scaffolding.

**Example**

```ts
import { listSandboxAgents } from "@beep/sandbox"

console.log(listSandboxAgents()[0]?.name)
```

**Signature**

```ts
declare class SandboxAgentEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L106)

Since v0.0.0

## SandboxAgentName (type alias)

Runtime type for `SandboxAgentName`.

**Signature**

```ts
type SandboxAgentName = typeof SandboxAgentName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L64)

Since v0.0.0

## SandboxInitProviderEntry (class)

Provider registry entry used by init scaffolding.

**Example**

```ts
import { listSandboxInitProviders } from "@beep/sandbox"

console.log(listSandboxInitProviders()[0]?.containerfileName)
```

**Signature**

```ts
declare class SandboxInitProviderEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L133)

Since v0.0.0

## SandboxInitProviderName (type alias)

Runtime type for `SandboxInitProviderName`.

**Signature**

```ts
type SandboxInitProviderName = typeof SandboxInitProviderName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L91)

Since v0.0.0

# schemas

## SandboxAgentName

Supported init-time agent choices.

**Example**

```ts
import { SandboxAgentName } from "@beep/sandbox/Init"

console.log(SandboxAgentName)
```

**Signature**

```ts
declare const SandboxAgentName: AnnotatedSchema<LiteralKit<readonly ["claude-code", "codex", "opencode", "pi"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L52)

Since v0.0.0

## SandboxInitProviderName

Supported local container providers for generated configuration.

**Example**

```ts
import { SandboxInitProviderName } from "@beep/sandbox/Init"

console.log(SandboxInitProviderName)
```

**Signature**

```ts
declare const SandboxInitProviderName: AnnotatedSchema<LiteralKit<readonly ["docker", "podman"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L79)

Since v0.0.0

# utilities

## SANDBOX_CONFIG_DIR

Config directory created by `initSandbox`.

**Example**

```ts
import { SANDBOX_CONFIG_DIR } from "@beep/sandbox/Init"

console.log(SANDBOX_CONFIG_DIR)
```

**Signature**

```ts
declare const SANDBOX_CONFIG_DIR: ".sandcastle"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L37)

Since v0.0.0

## defaultSandboxImageName

Derive the default local container image name for a repository.

**Example**

```ts
import { defaultSandboxImageName } from "@beep/sandbox"

console.log(defaultSandboxImageName("/workspace/example"))
```

**Signature**

```ts
declare const defaultSandboxImageName: (repoDir: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L360)

Since v0.0.0

## ensureSandboxConfigDir

Require an existing `.sandcastle` config directory.

**Example**

```ts
import { ensureSandboxConfigDir } from "@beep/sandbox"

const configDir = ensureSandboxConfigDir(process.cwd())
console.log(configDir)
```

**Signature**

```ts
declare const ensureSandboxConfigDir: (repoDir: string) => Effect.Effect<string, ConfigDirError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L451)

Since v0.0.0

## getSandboxAgent

Look up an init-time agent registry entry.

**Example**

```ts
import { getSandboxAgent } from "@beep/sandbox"
import * as O from "effect/Option"

console.log(O.isSome(getSandboxAgent("codex")))
```

**Signature**

```ts
declare const getSandboxAgent: (name: string) => O.Option<SandboxAgentEntry>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L402)

Since v0.0.0

## getSandboxInitProvider

Look up an init-time sandbox provider registry entry.

**Example**

```ts
import { getSandboxInitProvider } from "@beep/sandbox"
import * as O from "effect/Option"

console.log(O.isSome(getSandboxInitProvider("docker")))
```

**Signature**

```ts
declare const getSandboxInitProvider: (name: string) => O.Option<SandboxInitProviderEntry>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L434)

Since v0.0.0

## listSandboxAgents

List init-time agent registry entries.

**Example**

```ts
import { listSandboxAgents } from "@beep/sandbox"

console.log(listSandboxAgents().length)
```

**Signature**

```ts
declare const listSandboxAgents: () => ReadonlyArray<SandboxAgentEntry>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L386)

Since v0.0.0

## listSandboxInitProviders

List init-time sandbox provider registry entries.

**Example**

```ts
import { listSandboxInitProviders } from "@beep/sandbox"

console.log(listSandboxInitProviders().length)
```

**Signature**

```ts
declare const listSandboxInitProviders: () => ReadonlyArray<SandboxInitProviderEntry>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Init.ts#L418)

Since v0.0.0