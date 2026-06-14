---
title: OipWeb.ts
nav_order: 3
parent: "@beep/infra"
---

## OipWeb.ts overview

Pulumi orchestration surface for oip.law.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [loadOipWebRuntimeSecrets](#loadoipwebruntimesecrets)
  - [loadOipWebStackArgs](#loadoipwebstackargs)
  - [makeOipWebStackArgsFromConfigValues](#makeoipwebstackargsfromconfigvalues)
- [models](#models)
  - [OipAssetsBucketConfig (class)](#oipassetsbucketconfig-class)
  - [OipDnsConfig (class)](#oipdnsconfig-class)
  - [OipPulumiStateBackendConfig (class)](#oippulumistatebackendconfig-class)
    - [make (static method)](#make-static-method)
  - [OipVercelProjectConfig (class)](#oipvercelprojectconfig-class)
  - [OipWebPulumiConfigValues](#oipwebpulumiconfigvalues)
  - [OipWebRuntimeSecrets (type alias)](#oipwebruntimesecrets-type-alias)
  - [OipWebStackArgs (class)](#oipwebstackargs-class)
- [resources](#resources)
  - [OipWebStack (class)](#oipwebstack-class)
    - [stateBucketName (property)](#statebucketname-property)
    - [stateBackendUrl (property)](#statebackendurl-property)
    - [stateLockTableName (property)](#statelocktablename-property)
    - [assetsBucketName (property)](#assetsbucketname-property)
    - [vercelProjectId (property)](#vercelprojectid-property)
    - [productionDomain (property)](#productiondomain-property)
    - [stagingDomain (property)](#stagingdomain-property)
---

# constructors

## loadOipWebRuntimeSecrets

Load OIP web runtime secrets from Pulumi secret config.

**Example**

```ts
import { loadOipWebRuntimeSecrets } from "@beep/infra"

const secrets = loadOipWebRuntimeSecrets()

console.log(Object.keys(secrets))
```

**Signature**

```ts
declare const loadOipWebRuntimeSecrets: () => OipWebRuntimeSecrets
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L509)

Since v0.0.0

## loadOipWebStackArgs

Load OIP web stack args from Pulumi config.

**Example**

```ts
import { loadOipWebStackArgs } from "@beep/infra"

const args = loadOipWebStackArgs()

console.log(args.vercel.projectName)
```

**Signature**

```ts
declare const loadOipWebStackArgs: () => OipWebStackArgs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L455)

Since v0.0.0

## makeOipWebStackArgsFromConfigValues

Build OIP web stack args from decoded Pulumi config values.

**Example**

```ts
import { makeOipWebStackArgsFromConfigValues } from "@beep/infra"

const args = makeOipWebStackArgsFromConfigValues({
  attachStagingDomain: false,
  projectName: "oip-web-preview",
  stagingDomain: "preview.oip.law",
})

console.log(args.vercel.projectName) // "oip-web-preview"
console.log(args.dns.attachStagingDomain) // false
```

**Signature**

```ts
declare const makeOipWebStackArgsFromConfigValues: ({ assetsBucketName, attachProductionDomains, attachStagingDomain, awsRegion, cloudflareZoneId, createDynamoDbLockTable, hubSpotAccountId, hubSpotFormGuid, legacyCloudflareZoneId, legacyProductionDnsRecordImportId, legacyProductionDomain, legacyStagingDomain, legacyWwwDnsRecordImportId, legacyWwwDomain, projectName, productionDnsRecordImportId, productionBranch, productionDomain, pulumiStateBucketName, repository, rootDirectory, sanityDataset, sanityProjectId, stagingBranch, stagingDomain, vercelApexTarget, vercelAuthenticationDeploymentType, vercelCnameTarget, vercelTeamId, wwwDomain, }?: OipWebPulumiConfigValues) => OipWebStackArgs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L354)

Since v0.0.0

# models

## OipAssetsBucketConfig (class)

S3 asset bucket resources for OIP-controlled media.

**Example**

```ts
import { OipAssetsBucketConfig } from "@beep/infra"

console.log(OipAssetsBucketConfig.make({}).bucketName)
```

**Signature**

```ts
declare class OipAssetsBucketConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L204)

Since v0.0.0

## OipDnsConfig (class)

DNS configuration for Cloudflare-managed OIP records.

**Example**

```ts
import { OipDnsConfig } from "@beep/infra"

console.log(OipDnsConfig.make({}).productionDomain)
```

**Signature**

```ts
declare class OipDnsConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L228)

Since v0.0.0

## OipPulumiStateBackendConfig (class)

Pulumi DIY state backend settings for OIP.

**Example**

```ts
import { OipPulumiStateBackendConfig } from "@beep/infra"

console.log(OipPulumiStateBackendConfig.make({}).bucketName)
```

**Signature**

```ts
declare class OipPulumiStateBackendConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L153)

Since v0.0.0

### make (static method)

**Signature**

```ts
declare const make: (input: void | { readonly bucketName?: string | undefined; readonly createDynamoDbLockTable?: boolean | undefined; readonly lockTableName?: string | undefined; readonly protect?: boolean | undefined; readonly region?: string | undefined; }, options?: S.MakeOptions) => OipPulumiStateBackendConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L165)

## OipVercelProjectConfig (class)

Vercel project configuration for `@beep/oip-web`.

**Example**

```ts
import { OipVercelProjectConfig } from "@beep/infra"

console.log(OipVercelProjectConfig.make({}).projectName)
```

**Signature**

```ts
declare class OipVercelProjectConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L264)

Since v0.0.0

## OipWebPulumiConfigValues

Optional Pulumi config values before OIP deploy defaults are applied.

**Example**

```ts
import { OipWebPulumiConfigValues } from "@beep/infra"

console.log(OipWebPulumiConfigValues)
```

**Signature**

```ts
declare const OipWebPulumiConfigValues: S.Struct<{ readonly attachProductionDomains: S.optionalKey<S.Boolean>; readonly attachStagingDomain: S.optionalKey<S.Boolean>; readonly assetsBucketName: S.optionalKey<S.String>; readonly awsRegion: S.optionalKey<S.String>; readonly cloudflareZoneId: S.optionalKey<S.String>; readonly createDynamoDbLockTable: S.optionalKey<S.Boolean>; readonly hubSpotAccountId: S.optionalKey<S.String>; readonly hubSpotFormGuid: S.optionalKey<S.String>; readonly legacyCloudflareZoneId: S.optionalKey<S.String>; readonly legacyProductionDnsRecordImportId: S.optionalKey<S.String>; readonly legacyProductionDomain: S.optionalKey<S.String>; readonly legacyStagingDomain: S.optionalKey<S.String>; readonly legacyWwwDnsRecordImportId: S.optionalKey<S.String>; readonly legacyWwwDomain: S.optionalKey<S.String>; readonly productionDnsRecordImportId: S.optionalKey<S.String>; readonly projectName: S.optionalKey<S.String>; readonly productionBranch: S.optionalKey<S.String>; readonly productionDomain: S.optionalKey<S.String>; readonly pulumiStateBucketName: S.optionalKey<S.String>; readonly repository: S.optionalKey<S.String>; readonly rootDirectory: S.optionalKey<S.String>; readonly sanityDataset: S.optionalKey<S.String>; readonly sanityProjectId: S.optionalKey<S.String>; readonly stagingBranch: S.optionalKey<S.String>; readonly stagingDomain: S.optionalKey<S.String>; readonly vercelApexTarget: S.optionalKey<S.String>; readonly vercelAuthenticationDeploymentType: S.optionalKey<LiteralKit<readonly ["standardProtectionNew", "standardProtection", "allDeployments", "onlyPreviewDeployments", "none"], undefined>>; readonly vercelCnameTarget: S.optionalKey<S.String>; readonly vercelTeamId: S.optionalKey<S.String>; readonly wwwDomain: S.optionalKey<S.String>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L102)

Since v0.0.0

## OipWebRuntimeSecrets (type alias)

Secret runtime values for OIP deploy targets.

**Example**

```ts
import type { OipWebRuntimeSecrets } from "@beep/infra"
import * as pulumi from "@pulumi/pulumi"

const secrets: OipWebRuntimeSecrets = {
  hubSpotServiceKey: pulumi.secret("hubspot-service-key"),
  sanityApiToken: pulumi.secret("sanity-api-token"),
}

console.log(Object.keys(secrets)) // ["hubSpotServiceKey", "sanityApiToken"]
```

**Signature**

```ts
type OipWebRuntimeSecrets = {
  readonly hubSpotServiceKey?: pulumi.Input<string> | undefined;
  readonly sanityApiToken?: pulumi.Input<string> | undefined;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L304)

Since v0.0.0

## OipWebStackArgs (class)

Pulumi-facing args for the OIP web stack.

**Example**

```ts
import { OipWebStackArgs } from "@beep/infra"

console.log(OipWebStackArgs.make({}).vercel.projectName)
```

**Signature**

```ts
declare class OipWebStackArgs
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L322)

Since v0.0.0

# resources

## OipWebStack (class)

Import-safe Pulumi component for OIP production web infrastructure.

**Example**

```ts
import { OipWebStack, makeOipWebStackArgsFromConfigValues } from "@beep/infra"

console.log(OipWebStack)
console.log(makeOipWebStackArgsFromConfigValues)
```

**Signature**

```ts
declare class OipWebStack { public constructor(
    name: string,
    args: OipWebStackArgs = OipWebStackArgs.make({}),
    secrets: OipWebRuntimeSecrets = {},
    opts?: pulumi.ComponentResourceOptions
  ) }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L681)

Since v0.0.0

### stateBucketName (property)

Bootstrap-managed encrypted S3 bucket for Pulumi DIY backend state.

**Signature**

```ts
readonly stateBucketName: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L687)

Since v0.0.0

### stateBackendUrl (property)

Pulumi DIY backend URL for this stack family.

**Signature**

```ts
readonly stateBackendUrl: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L694)

Since v0.0.0

### stateLockTableName (property)

Optional DynamoDB lock table name for Terraform-compatible tooling.

**Signature**

```ts
readonly stateLockTableName: pulumi.Output<string | undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L701)

Since v0.0.0

### assetsBucketName (property)

Encrypted S3 bucket reserved for OIP media assets.

**Signature**

```ts
readonly assetsBucketName: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L708)

Since v0.0.0

### vercelProjectId (property)

Vercel project identifier.

**Signature**

```ts
readonly vercelProjectId: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L715)

Since v0.0.0

### productionDomain (property)

Production domain attached to the Vercel project.

**Signature**

```ts
readonly productionDomain: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L722)

Since v0.0.0

### stagingDomain (property)

Staging domain attached to the Vercel project.

**Signature**

```ts
readonly stagingDomain: pulumi.Output<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/infra/src/OipWeb.ts#L729)

Since v0.0.0