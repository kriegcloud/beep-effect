---
title: AIMetrics.ts
nav_order: 1
parent: "@beep/infra"
---

## AIMetrics.ts overview

Pulumi orchestration surface for the repo AI metrics stack.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [loadAIMetricsStackArgs](#loadaimetricsstackargs)
  - [makeAIMetricsStackArgsFromConfigValues](#makeaimetricsstackargsfromconfigvalues)
- [models](#models)
  - [AIMetricsPulumiConfigValues](#aimetricspulumiconfigvalues)
  - [AIMetricsRemoteDeploymentConfig (class)](#aimetricsremotedeploymentconfig-class)
  - [AIMetricsRemoteSshConfig (class)](#aimetricsremotesshconfig-class)
  - [AIMetricsStackArgs (class)](#aimetricsstackargs-class)
- [resources](#resources)
  - [AIMetricsStack (class)](#aimetricsstack-class)
    - [installSpec (property)](#installspec-property)
    - [rawArchiveDir (property)](#rawarchivedir-property)
    - [duckDbPath (property)](#duckdbpath-property)
    - [stackName (property)](#stackname-property)
    - [services (property)](#services-property)
    - [defaultService (property)](#defaultservice-property)
    - [otlpEndpoint (property)](#otlpendpoint-property)
    - [otlpTraceUrl (property)](#otlptraceurl-property)
    - [phoenixPublicUrl (property)](#phoenixpublicurl-property)
    - [phoenixTailnetHttpsPort (property)](#phoenixtailnethttpsport-property)
    - [remoteConfigRoot (property)](#remoteconfigroot-property)
    - [remoteMirrorRoot (property)](#remotemirrorroot-property)
    - [remotePreflightStdout (property)](#remotepreflightstdout-property)
    - [remoteApplyStdout (property)](#remoteapplystdout-property)
    - [remoteHealthStdout (property)](#remotehealthstdout-property)
---

# constructors

## loadAIMetricsStackArgs

Load AI metrics args from Pulumi config.

**Example**

```ts
import { loadAIMetricsStackArgs } from "@beep/infra"

console.log(loadAIMetricsStackArgs)
```

**Signature**

```ts
declare const loadAIMetricsStackArgs: () => AIMetricsStackArgs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L427)

Since v0.0.0

## makeAIMetricsStackArgsFromConfigValues

Build AI metrics stack args from decoded Pulumi config values.

**Example**

```ts
import { makeAIMetricsStackArgsFromConfigValues } from "@beep/infra"

console.log(makeAIMetricsStackArgsFromConfigValues({ target: "local" }).install.target)
```

**Signature**

```ts
declare const makeAIMetricsStackArgsFromConfigValues: ({ dataRoot, defaultTool, hashSaltSecretRef, phoenixImage, phoenixTailnetHttpsPort, publicBaseUrl, rawArchiveKeySecretRef, remoteConfigRoot, remoteMirrorRoot, sshAgentSocketPath, sshHost, sshUser, tailnetFqdn, target, }?: AIMetricsPulumiConfigValues) => AIMetricsStackArgs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L366)

Since v0.0.0

# models

## AIMetricsPulumiConfigValues

Raw optional Pulumi config values before target-aware defaults are applied.

**Example**

```ts
import { AIMetricsPulumiConfigValues } from "@beep/infra"

console.log(AIMetricsPulumiConfigValues)
```

**Signature**

```ts
declare const AIMetricsPulumiConfigValues: S.Struct<{ readonly dataRoot: S.optionalKey<S.String>; readonly defaultTool: S.optionalKey<S.String>; readonly hashSaltSecretRef: S.optionalKey<S.String>; readonly phoenixImage: S.optionalKey<S.String>; readonly phoenixTailnetHttpsPort: S.optionalKey<S.Int>; readonly publicBaseUrl: S.optionalKey<S.String>; readonly rawArchiveKeySecretRef: S.optionalKey<S.String>; readonly remoteConfigRoot: S.optionalKey<S.String>; readonly remoteMirrorRoot: S.optionalKey<S.String>; readonly sshAgentSocketPath: S.optionalKey<S.String>; readonly sshHost: S.optionalKey<S.String>; readonly sshUser: S.optionalKey<S.String>; readonly tailnetFqdn: S.optionalKey<S.String>; readonly target: S.optionalKey<S.String>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L233)

Since v0.0.0

## AIMetricsRemoteDeploymentConfig (class)

Remote deployment inputs for the dankserver AI metrics Phoenix backend.

**Example**

```ts
import { AIMetricsRemoteDeploymentConfig } from "@beep/infra"

console.log(AIMetricsRemoteDeploymentConfig.make({}).phoenixTailnetHttpsPort)
```

**Signature**

```ts
declare class AIMetricsRemoteDeploymentConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L290)

Since v0.0.0

## AIMetricsRemoteSshConfig (class)

SSH connection inputs for native Pulumi command resources.

**Example**

```ts
import { AIMetricsRemoteSshConfig } from "@beep/infra"

console.log(AIMetricsRemoteSshConfig.make({}).host)
```

**Signature**

```ts
declare class AIMetricsRemoteSshConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L266)

Since v0.0.0

## AIMetricsStackArgs (class)

Pulumi-facing args for the AI metrics component.

**Example**

```ts
import { AIMetricsStackArgs } from "@beep/infra"

console.log(AIMetricsStackArgs)
```

**Signature**

```ts
declare class AIMetricsStackArgs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L318)

Since v0.0.0

# resources

## AIMetricsStack (class)

Import-safe Pulumi component for the AI metrics target contract.

**Example**

```ts
import { AIMetricsStack, AIMetricsStackArgs } from "@beep/infra"

console.log(AIMetricsStack)
console.log(AIMetricsStackArgs)
```

**Signature**

```ts
declare class AIMetricsStack { public constructor(
    name: string,
    args: AIMetricsStackArgs = AIMetricsStackArgs.new(),
    opts?: pulumi.ComponentResourceOptions
  ) }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L462)

Since v0.0.0

### installSpec (property)

Resolved install spec as a Pulumi output.

**Signature**

```ts
readonly installSpec: pulumi.Output<AiMetricsInstallSpec>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L468)

Since v0.0.0

### rawArchiveDir (property)

Raw transcript archive root.

**Signature**

```ts
readonly rawArchiveDir: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L475)

Since v0.0.0

### duckDbPath (property)

Derived DuckDB database path.

**Signature**

```ts
readonly duckDbPath: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L482)

Since v0.0.0

### stackName (property)

Resolved stack name.

**Signature**

```ts
readonly stackName: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L489)

Since v0.0.0

### services (property)

Backend service specs planned for the selected target.

**Signature**

```ts
readonly services: pulumi.Output<ReadonlyArray<AiMetricsServiceSpec>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L496)

Since v0.0.0

### defaultService (property)

Default backend service planned for the selected target.

**Signature**

```ts
readonly defaultService: pulumi.Output<AiMetricsServiceSpec>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L503)

Since v0.0.0

### otlpEndpoint (property)

Default trace-only OTLP endpoint planned for the selected target.

**Signature**

```ts
readonly otlpEndpoint: pulumi.Output<AiMetricsOtlpEndpointSpec>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L510)

Since v0.0.0

### otlpTraceUrl (property)

Default trace-only OTLP HTTP endpoint URL.

**Signature**

```ts
readonly otlpTraceUrl: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L517)

Since v0.0.0

### phoenixPublicUrl (property)

Public Phoenix UI and OTLP base URL for the selected target.

**Signature**

```ts
readonly phoenixPublicUrl: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L524)

Since v0.0.0

### phoenixTailnetHttpsPort (property)

Dedicated Tailscale Serve HTTPS port used for the remote Phoenix endpoint.

**Signature**

```ts
readonly phoenixTailnetHttpsPort: pulumi.OutputInstance<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L531)

Since v0.0.0

### remoteConfigRoot (property)

Remote root containing the managed compose and systemd unit artifacts.

**Signature**

```ts
readonly remoteConfigRoot: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L538)

Since v0.0.0

### remoteMirrorRoot (property)

Remote root reserved for sanitized P7 derived mirror bundles.

**Signature**

```ts
readonly remoteMirrorRoot: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L545)

Since v0.0.0

### remotePreflightStdout (property)

Captured stdout from the remote Phoenix preflight command.

**Signature**

```ts
readonly remotePreflightStdout: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L552)

Since v0.0.0

### remoteApplyStdout (property)

Captured stdout from the remote Phoenix apply command.

**Signature**

```ts
readonly remoteApplyStdout: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L559)

Since v0.0.0

### remoteHealthStdout (property)

Captured stdout from the remote Phoenix health command.

**Signature**

```ts
readonly remoteHealthStdout: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/AIMetrics.ts#L566)

Since v0.0.0