---
title: index.ts
nav_order: 66
parent: "@beep/repo-cli"
---

## index.ts overview

Public Fallow quality command export.

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - ["./Quality.errors.js" (namespace export)](#qualityerrorsjs-namespace-export)
  - [QualityHardwareProfile](#qualityhardwareprofile)
  - [QualityProfileConfig](#qualityprofileconfig)
  - [QualityProfileDetection](#qualityprofiledetection)
  - [qualityCommand](#qualitycommand)
  - [qualityFallowCommand](#qualityfallowcommand)
- [utilities](#utilities)
  - ["./internal/TurboConfigProof.js" (namespace export)](#internalturboconfigproofjs-namespace-export)
---

# cli-commands

## "./Quality.errors.js" (namespace export)

Re-exports all named exports from the "./Quality.errors.js" module.

**Signature**

```ts
export * from "./Quality.errors.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/index.ts#L40)

Since v0.0.0

## QualityHardwareProfile

Public quality command export.

**Signature**

```ts
declare const QualityHardwareProfile: AnnotatedSchema<LiteralKit<readonly ["current", "workstation", "ci"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/index.ts#L29)

Since v0.0.0

## QualityProfileConfig

Public quality command export.

**Signature**

```ts
declare const QualityProfileConfig: typeof QualityProfileConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/index.ts#L30)

Since v0.0.0

## QualityProfileDetection

Public quality command export.

**Signature**

```ts
declare const QualityProfileDetection: typeof QualityProfileDetection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/index.ts#L31)

Since v0.0.0

## qualityCommand

Public quality command export.

**Signature**

```ts
declare const qualityCommand: Command<"quality", {} | {}, {}, GithubCheckError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/index.ts#L32)

Since v0.0.0

## qualityFallowCommand

Public Fallow quality command export.

**Signature**

```ts
declare const qualityFallowCommand: Command<"fallow", {} | {}, {}, QualityScriptCommandError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/index.ts#L14)

Since v0.0.0

# utilities

## "./internal/TurboConfigProof.js" (namespace export)

Re-exports all named exports from the "./internal/TurboConfigProof.js" module.

**Signature**

```ts
export * from "./internal/TurboConfigProof.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/index.ts#L21)

Since v0.0.0