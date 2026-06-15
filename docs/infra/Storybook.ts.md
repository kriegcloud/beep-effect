---
title: Storybook.ts
nav_order: 4
parent: "@beep/infra"
---

## Storybook.ts overview

Pulumi orchestration surface for the public Storybook app.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [loadStorybookStackArgs](#loadstorybookstackargs)
  - [makeStorybookStackArgsFromConfigValues](#makestorybookstackargsfromconfigvalues)
- [models](#models)
  - [StorybookPulumiConfigValues](#storybookpulumiconfigvalues)
  - [StorybookPulumiConfigValues (type alias)](#storybookpulumiconfigvalues-type-alias)
  - [StorybookStackArgs (class)](#storybookstackargs-class)
  - [StorybookVercelAuthenticationDeploymentType](#storybookvercelauthenticationdeploymenttype)
  - [StorybookVercelAuthenticationDeploymentType (type alias)](#storybookvercelauthenticationdeploymenttype-type-alias)
  - [StorybookVercelProjectConfig (class)](#storybookvercelprojectconfig-class)
- [resources](#resources)
  - [StorybookStack (class)](#storybookstack-class)
    - [vercelProjectId (property)](#vercelprojectid-property)
    - [projectName (property)](#projectname-property)
    - [rootDirectory (property)](#rootdirectory-property)
    - [outputDirectory (property)](#outputdirectory-property)
---

# constructors

## loadStorybookStackArgs

Load Storybook stack args from Pulumi config.

**Example**

```ts
import { loadStorybookStackArgs } from "@beep/infra"

console.log(loadStorybookStackArgs().vercel.projectName)
```

**Signature**

```ts
declare const loadStorybookStackArgs: () => StorybookStackArgs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L271)

Since v0.0.0

## makeStorybookStackArgsFromConfigValues

Build Storybook stack args from decoded Pulumi config values.

**Example**

```ts
import { makeStorybookStackArgsFromConfigValues } from "@beep/infra"

const args = makeStorybookStackArgsFromConfigValues({
  projectName: "beep-storybook-preview",
})

console.log(args.vercel.projectName)
```

**Signature**

```ts
declare const makeStorybookStackArgsFromConfigValues: ({ buildCommand, installCommand, outputDirectory, productionBranch, projectName, repository, rootDirectory, vercelAuthenticationDeploymentType, vercelTeamId, }?: StorybookPulumiConfigInputValues) => StorybookStackArgs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L226)

Since v0.0.0

# models

## StorybookPulumiConfigValues

Optional Pulumi config values before Storybook deploy defaults are applied.

**Example**

```ts
import { StorybookPulumiConfigValues } from "@beep/infra"

console.log(StorybookPulumiConfigValues)
```

**Signature**

```ts
declare const StorybookPulumiConfigValues: S.Struct<{ readonly buildCommand: S.optionalKey<S.String>; readonly installCommand: S.optionalKey<S.String>; readonly outputDirectory: S.optionalKey<S.String>; readonly productionBranch: S.optionalKey<S.String>; readonly projectName: S.optionalKey<S.String>; readonly repository: S.optionalKey<S.String>; readonly rootDirectory: S.optionalKey<S.String>; readonly vercelAuthenticationDeploymentType: S.optionalKey<LiteralKit<readonly ["standardProtectionNew", "standardProtection", "allDeployments", "onlyPreviewDeployments", "none"], undefined> & SchemaStatics<LiteralKit<readonly ["standardProtectionNew", "standardProtection", "allDeployments", "onlyPreviewDeployments", "none"], undefined>>>; readonly vercelTeamId: S.optionalKey<S.String>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L120)

Since v0.0.0

## StorybookPulumiConfigValues (type alias)

Runtime type for `StorybookPulumiConfigValues`.

**Example**

```ts
import type { StorybookPulumiConfigValues } from "@beep/infra"

const values: StorybookPulumiConfigValues = {}
console.log(values)
```

**Signature**

```ts
type StorybookPulumiConfigValues = typeof StorybookPulumiConfigValues.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L151)

Since v0.0.0

## StorybookStackArgs (class)

Pulumi-facing args for the Storybook Vercel stack.

**Example**

```ts
import { StorybookStackArgs } from "@beep/infra"

console.log(StorybookStackArgs.make({}).vercel.projectName)
```

**Signature**

```ts
declare class StorybookStackArgs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L200)

Since v0.0.0

## StorybookVercelAuthenticationDeploymentType

Vercel deployment authentication modes accepted by the Storybook project.

**Example**

```ts
import { StorybookVercelAuthenticationDeploymentType } from "@beep/infra"

console.log(StorybookVercelAuthenticationDeploymentType.Enum.none)
```

**Signature**

```ts
declare const StorybookVercelAuthenticationDeploymentType: AnnotatedSchema<LiteralKit<readonly ["standardProtectionNew", "standardProtection", "allDeployments", "onlyPreviewDeployments", "none"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L60)

Since v0.0.0

## StorybookVercelAuthenticationDeploymentType (type alias)

Runtime type for `StorybookVercelAuthenticationDeploymentType`.

**Example**

```ts
import type { StorybookVercelAuthenticationDeploymentType } from "@beep/infra"

const deploymentType: StorybookVercelAuthenticationDeploymentType = "none"
console.log(deploymentType)
```

**Signature**

```ts
type StorybookVercelAuthenticationDeploymentType = typeof StorybookVercelAuthenticationDeploymentType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L86)

Since v0.0.0

## StorybookVercelProjectConfig (class)

Vercel project configuration for `@beep/storybook`.

**Example**

```ts
import { StorybookVercelProjectConfig } from "@beep/infra"

console.log(StorybookVercelProjectConfig.make({}).projectName)
```

**Signature**

```ts
declare class StorybookVercelProjectConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L166)

Since v0.0.0

# resources

## StorybookStack (class)

Import-safe Pulumi component for the public Storybook Vercel project.

**Example**

```ts
import { StorybookStack, makeStorybookStackArgsFromConfigValues } from "@beep/infra"

console.log(StorybookStack)
console.log(makeStorybookStackArgsFromConfigValues)
```

**Signature**

```ts
declare class StorybookStack { public constructor(
    name: string,
    args: StorybookStackArgs = StorybookStackArgs.make({}),
    opts?: pulumi.ComponentResourceOptions
  ) }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L303)

Since v0.0.0

### vercelProjectId (property)

Vercel project identifier.

**Example**

```ts
import type { StorybookStack } from "@beep/infra"

const readProjectId = (stack: StorybookStack) => stack.vercelProjectId
console.log(readProjectId)
```

**Signature**

```ts
readonly vercelProjectId: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L317)

Since v0.0.0

### projectName (property)

Vercel project name.

**Example**

```ts
import type { StorybookStack } from "@beep/infra"

const readProjectName = (stack: StorybookStack) => stack.projectName
console.log(readProjectName)
```

**Signature**

```ts
readonly projectName: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L332)

Since v0.0.0

### rootDirectory (property)

Vercel root directory for the Storybook app.

**Example**

```ts
import type { StorybookStack } from "@beep/infra"

const readRootDirectory = (stack: StorybookStack) => stack.rootDirectory
console.log(readRootDirectory)
```

**Signature**

```ts
readonly rootDirectory: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L347)

Since v0.0.0

### outputDirectory (property)

Static output directory served by Vercel.

**Example**

```ts
import type { StorybookStack } from "@beep/infra"

const readOutputDirectory = (stack: StorybookStack) => stack.outputDirectory
console.log(readOutputDirectory)
```

**Signature**

```ts
readonly outputDirectory: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/Storybook.ts#L362)

Since v0.0.0