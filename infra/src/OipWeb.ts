/**
 * Pulumi orchestration surface for oip.law.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $InfraId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { A, Str, Struct } from "@beep/utils";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as vercel from "@pulumiverse/vercel";
import { Effect, pipe } from "effect";
import * as S from "effect/Schema";

const $I = $InfraId.create("OipWeb");

const defaultAwsRegion = "us-east-1";
const defaultAssetsBucketName = "assets.opip.law";
const defaultLegacyProductionDomain = "opip.law";
const defaultLegacyStagingDomain = "staging.opip.law";
const defaultLegacyWwwDomain = "www.opip.law";
const defaultProjectName = "oip-web";
const defaultProductionBranch = "main";
const defaultProductionDomain = "oip.law";
const defaultPulumiStateBucketName = "opip-law-pulumi-state";
const defaultRepository = "kriegcloud/beep-effect";
const defaultRootDirectory = "apps/oip-web";
const defaultStagingBranch = "staging";
const defaultStagingDomain = "staging.oip.law";
const defaultVercelApexTarget = "76.76.21.21";
const defaultVercelAuthenticationDeploymentType: VercelAuthenticationDeploymentType = "none";
const defaultVercelCnameTarget = "cname.vercel-dns.com";
const defaultWwwDomain = "www.oip.law";
const productionRedirectStatusCode = 308;
const stagingRedirectStatusCode = 307;

const defaultTags = {
  App: "oip-web",
  ManagedBy: "pulumi",
  Project: "oip-law",
};

type OipWebPulumiConfigValues = {
  readonly attachProductionDomains?: boolean | undefined;
  readonly attachStagingDomain?: boolean | undefined;
  readonly assetsBucketName?: string | undefined;
  readonly awsRegion?: string | undefined;
  readonly cloudflareZoneId?: string | undefined;
  readonly createDynamoDbLockTable?: boolean | undefined;
  readonly hubSpotAccountId?: string | undefined;
  readonly hubSpotFormGuid?: string | undefined;
  readonly legacyCloudflareZoneId?: string | undefined;
  readonly legacyProductionDnsRecordImportId?: string | undefined;
  readonly legacyProductionDomain?: string | undefined;
  readonly legacyStagingDomain?: string | undefined;
  readonly legacyWwwDnsRecordImportId?: string | undefined;
  readonly legacyWwwDomain?: string | undefined;
  readonly productionDnsRecordImportId?: string | undefined;
  readonly projectName?: string | undefined;
  readonly productionBranch?: string | undefined;
  readonly productionDomain?: string | undefined;
  readonly pulumiStateBucketName?: string | undefined;
  readonly repository?: string | undefined;
  readonly rootDirectory?: string | undefined;
  readonly sanityDataset?: string | undefined;
  readonly sanityProjectId?: string | undefined;
  readonly stagingBranch?: string | undefined;
  readonly stagingDomain?: string | undefined;
  readonly vercelApexTarget?: string | undefined;
  readonly vercelAuthenticationDeploymentType?: VercelAuthenticationDeploymentType | undefined;
  readonly vercelCnameTarget?: string | undefined;
  readonly vercelTeamId?: string | undefined;
  readonly wwwDomain?: string | undefined;
};

const VercelAuthenticationDeploymentType = LiteralKit([
  "standardProtectionNew",
  "standardProtection",
  "allDeployments",
  "onlyPreviewDeployments",
  "none",
]);
type VercelAuthenticationDeploymentType = typeof VercelAuthenticationDeploymentType.Type;

/**
 * Optional Pulumi config values before OIP deploy defaults are applied.
 *
 * @example
 * ```ts
 * import { OipWebPulumiConfigValues } from "@beep/infra"
 *
 * console.log(OipWebPulumiConfigValues)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const OipWebPulumiConfigValues = S.Class<OipWebPulumiConfigValues>($I`OipWebPulumiConfigValues`)(
  {
    attachProductionDomains: S.Boolean,
    attachStagingDomain: S.Boolean,
    assetsBucketName: S.String,
    awsRegion: S.String,
    cloudflareZoneId: S.String,
    createDynamoDbLockTable: S.Boolean,
    hubSpotAccountId: S.String,
    hubSpotFormGuid: S.String,
    legacyCloudflareZoneId: S.String,
    legacyProductionDnsRecordImportId: S.String,
    legacyProductionDomain: S.String,
    legacyStagingDomain: S.String,
    legacyWwwDnsRecordImportId: S.String,
    legacyWwwDomain: S.String,
    productionDnsRecordImportId: S.String,
    projectName: S.String,
    productionBranch: S.String,
    productionDomain: S.String,
    pulumiStateBucketName: S.String,
    repository: S.String,
    rootDirectory: S.String,
    sanityDataset: S.String,
    sanityProjectId: S.String,
    stagingBranch: S.String,
    stagingDomain: S.String,
    vercelApexTarget: S.String,
    vercelAuthenticationDeploymentType: VercelAuthenticationDeploymentType,
    vercelCnameTarget: S.String,
    vercelTeamId: S.String,
    wwwDomain: S.String,
  },
  $I.annote("OipWebPulumiConfigValues", {
    description: "Optional Pulumi config values before OIP deploy defaults are applied.",
  })
).mapFields(Struct.map(S.optionalKey));

/**
 * Pulumi DIY state backend settings for OIP.
 *
 * @example
 * ```ts
 * import { OipPulumiStateBackendConfig } from "@beep/infra"
 *
 * console.log(OipPulumiStateBackendConfig.make({}).bucketName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OipPulumiStateBackendConfig extends S.Class<OipPulumiStateBackendConfig>($I`OipPulumiStateBackendConfig`)(
  {
    bucketName: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultPulumiStateBucketName)),
      S.withDecodingDefaultKey(Effect.succeed(defaultPulumiStateBucketName))
    ),
    createDynamoDbLockTable: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    lockTableName: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(`${defaultPulumiStateBucketName}-locks`)),
      S.withDecodingDefaultKey(Effect.succeed(`${defaultPulumiStateBucketName}-locks`))
    ),
    protect: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(true)),
      S.withDecodingDefaultKey(Effect.succeed(true))
    ),
    region: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultAwsRegion)),
      S.withDecodingDefaultKey(Effect.succeed(defaultAwsRegion))
    ),
  },
  $I.annote("OipPulumiStateBackendConfig", {
    description: "Pulumi DIY state backend settings for OIP.",
  })
) {}

/**
 * S3 asset bucket resources for OIP-controlled media.
 *
 * @example
 * ```ts
 * import { OipAssetsBucketConfig } from "@beep/infra"
 *
 * console.log(OipAssetsBucketConfig.make({}).bucketName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OipAssetsBucketConfig extends S.Class<OipAssetsBucketConfig>($I`OipAssetsBucketConfig`)(
  {
    bucketName: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultAssetsBucketName)),
      S.withDecodingDefaultKey(Effect.succeed(defaultAssetsBucketName))
    ),
    protect: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(true)),
      S.withDecodingDefaultKey(Effect.succeed(true))
    ),
    region: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultAwsRegion)),
      S.withDecodingDefaultKey(Effect.succeed(defaultAwsRegion))
    ),
  },
  $I.annote("OipAssetsBucketConfig", {
    description: "S3 asset bucket resources for OIP-controlled media.",
  })
) {}

/**
 * DNS configuration for Cloudflare-managed OIP records.
 *
 * @example
 * ```ts
 * import { OipDnsConfig } from "@beep/infra"
 *
 * console.log(OipDnsConfig.make({}).productionDomain)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OipDnsConfig extends S.Class<OipDnsConfig>($I`OipDnsConfig`)(
  {
    attachProductionDomains: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    attachStagingDomain: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(true)),
      S.withDecodingDefaultKey(Effect.succeed(true))
    ),
    cloudflareZoneId: S.optionalKey(S.String),
    legacyCloudflareZoneId: S.optionalKey(S.String),
    legacyProductionDnsRecordImportId: S.optionalKey(S.String),
    legacyProductionDomain: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultLegacyProductionDomain)),
      S.withDecodingDefaultKey(Effect.succeed(defaultLegacyProductionDomain))
    ),
    legacyStagingDomain: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultLegacyStagingDomain)),
      S.withDecodingDefaultKey(Effect.succeed(defaultLegacyStagingDomain))
    ),
    legacyWwwDnsRecordImportId: S.optionalKey(S.String),
    legacyWwwDomain: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultLegacyWwwDomain)),
      S.withDecodingDefaultKey(Effect.succeed(defaultLegacyWwwDomain))
    ),
    productionDnsRecordImportId: S.optionalKey(S.String),
    productionDomain: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultProductionDomain)),
      S.withDecodingDefaultKey(Effect.succeed(defaultProductionDomain))
    ),
    stagingDomain: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultStagingDomain)),
      S.withDecodingDefaultKey(Effect.succeed(defaultStagingDomain))
    ),
    vercelApexTarget: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultVercelApexTarget)),
      S.withDecodingDefaultKey(Effect.succeed(defaultVercelApexTarget))
    ),
    vercelCnameTarget: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultVercelCnameTarget)),
      S.withDecodingDefaultKey(Effect.succeed(defaultVercelCnameTarget))
    ),
    wwwDomain: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultWwwDomain)),
      S.withDecodingDefaultKey(Effect.succeed(defaultWwwDomain))
    ),
  },
  $I.annote("OipDnsConfig", {
    description: "DNS configuration for Cloudflare-managed OIP records.",
  })
) {}

/**
 * Vercel project configuration for `@beep/oip-web`.
 *
 * @example
 * ```ts
 * import { OipVercelProjectConfig } from "@beep/infra"
 *
 * console.log(OipVercelProjectConfig.make({}).projectName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OipVercelProjectConfig extends S.Class<OipVercelProjectConfig>($I`OipVercelProjectConfig`)(
  {
    hubSpotAccountId: S.optionalKey(S.String),
    hubSpotFormGuid: S.optionalKey(S.String),
    projectName: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultProjectName)),
      S.withDecodingDefaultKey(Effect.succeed(defaultProjectName))
    ),
    productionBranch: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultProductionBranch)),
      S.withDecodingDefaultKey(Effect.succeed(defaultProductionBranch))
    ),
    repository: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultRepository)),
      S.withDecodingDefaultKey(Effect.succeed(defaultRepository))
    ),
    rootDirectory: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultRootDirectory)),
      S.withDecodingDefaultKey(Effect.succeed(defaultRootDirectory))
    ),
    sanityDataset: S.optionalKey(S.String),
    sanityProjectId: S.optionalKey(S.String),
    stagingBranch: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultStagingBranch)),
      S.withDecodingDefaultKey(Effect.succeed(defaultStagingBranch))
    ),
    teamId: S.optionalKey(S.String),
    vercelAuthenticationDeploymentType: VercelAuthenticationDeploymentType.pipe(
      S.withConstructorDefault(Effect.succeed(defaultVercelAuthenticationDeploymentType)),
      S.withDecodingDefaultKey(Effect.succeed(defaultVercelAuthenticationDeploymentType))
    ),
  },
  $I.annote("OipVercelProjectConfig", {
    description: "Vercel project configuration for @beep/oip-web.",
  })
) {}

/**
 * Secret runtime values for OIP deploy targets.
 *
 * @example
 * ```ts
 * import type { OipWebRuntimeSecrets } from "@beep/infra"
 * import * as pulumi from "@pulumi/pulumi"
 *
 * const secrets: OipWebRuntimeSecrets = {
 *   hubSpotServiceKey: pulumi.secret("hubspot-service-key"),
 *   sanityApiToken: pulumi.secret("sanity-api-token"),
 * }
 *
 * console.log(Object.keys(secrets)) // ["hubSpotServiceKey", "sanityApiToken"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OipWebRuntimeSecrets = {
  readonly hubSpotServiceKey?: pulumi.Input<string> | undefined;
  readonly sanityApiToken?: pulumi.Input<string> | undefined;
};

/**
 * Pulumi-facing args for the OIP web stack.
 *
 * @example
 * ```ts
 * import { OipWebStackArgs } from "@beep/infra"
 *
 * console.log(OipWebStackArgs.make({}).vercel.projectName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OipWebStackArgs extends S.Class<OipWebStackArgs>($I`OipWebStackArgs`)(
  {
    assets: OipAssetsBucketConfig.pipe(
      S.withConstructorDefault(Effect.succeed(OipAssetsBucketConfig.make({}))),
      S.withDecodingDefaultKey(Effect.succeed(OipAssetsBucketConfig.make({})))
    ),
    dns: OipDnsConfig.pipe(
      S.withConstructorDefault(Effect.succeed(OipDnsConfig.make({}))),
      S.withDecodingDefaultKey(Effect.succeed(OipDnsConfig.make({})))
    ),
    state: OipPulumiStateBackendConfig.pipe(
      S.withConstructorDefault(Effect.succeed(OipPulumiStateBackendConfig.make({}))),
      S.withDecodingDefaultKey(Effect.succeed(OipPulumiStateBackendConfig.make({})))
    ),
    vercel: OipVercelProjectConfig.pipe(
      S.withConstructorDefault(Effect.succeed(OipVercelProjectConfig.make({}))),
      S.withDecodingDefaultKey(Effect.succeed(OipVercelProjectConfig.make({})))
    ),
  },
  $I.annote("OipWebStackArgs", {
    description: "Pulumi-facing args for the OIP web stack.",
  })
) {}

/**
 * Build OIP web stack args from decoded Pulumi config values.
 *
 * @example
 * ```ts
 * import { makeOipWebStackArgsFromConfigValues } from "@beep/infra"
 *
 * const args = makeOipWebStackArgsFromConfigValues({
 *   attachStagingDomain: false,
 *   projectName: "oip-web-preview",
 *   stagingDomain: "preview.oip.law",
 * })
 *
 * console.log(args.vercel.projectName) // "oip-web-preview"
 * console.log(args.dns.attachStagingDomain) // false
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeOipWebStackArgsFromConfigValues = ({
  assetsBucketName,
  attachProductionDomains,
  attachStagingDomain,
  awsRegion,
  cloudflareZoneId,
  createDynamoDbLockTable,
  hubSpotAccountId,
  hubSpotFormGuid,
  legacyCloudflareZoneId,
  legacyProductionDnsRecordImportId,
  legacyProductionDomain,
  legacyStagingDomain,
  legacyWwwDnsRecordImportId,
  legacyWwwDomain,
  projectName,
  productionDnsRecordImportId,
  productionBranch,
  productionDomain,
  pulumiStateBucketName,
  repository,
  rootDirectory,
  sanityDataset,
  sanityProjectId,
  stagingBranch,
  stagingDomain,
  vercelApexTarget,
  vercelAuthenticationDeploymentType,
  vercelCnameTarget,
  vercelTeamId,
  wwwDomain,
}: OipWebPulumiConfigValues = {}): OipWebStackArgs =>
  OipWebStackArgs.make({
    assets: OipAssetsBucketConfig.make({
      ...(assetsBucketName === undefined ? {} : { bucketName: assetsBucketName }),
      ...(awsRegion === undefined ? {} : { region: awsRegion }),
    }),
    dns: OipDnsConfig.make({
      ...(attachProductionDomains === undefined ? {} : { attachProductionDomains }),
      ...(attachStagingDomain === undefined ? {} : { attachStagingDomain }),
      ...(cloudflareZoneId === undefined ? {} : { cloudflareZoneId }),
      ...(legacyCloudflareZoneId === undefined ? {} : { legacyCloudflareZoneId }),
      ...(legacyProductionDnsRecordImportId === undefined ? {} : { legacyProductionDnsRecordImportId }),
      ...(legacyProductionDomain === undefined ? {} : { legacyProductionDomain }),
      ...(legacyStagingDomain === undefined ? {} : { legacyStagingDomain }),
      ...(legacyWwwDnsRecordImportId === undefined ? {} : { legacyWwwDnsRecordImportId }),
      ...(legacyWwwDomain === undefined ? {} : { legacyWwwDomain }),
      ...(productionDnsRecordImportId === undefined ? {} : { productionDnsRecordImportId }),
      ...(productionDomain === undefined ? {} : { productionDomain }),
      ...(stagingDomain === undefined ? {} : { stagingDomain }),
      ...(vercelApexTarget === undefined ? {} : { vercelApexTarget }),
      ...(vercelCnameTarget === undefined ? {} : { vercelCnameTarget }),
      ...(wwwDomain === undefined ? {} : { wwwDomain }),
    }),
    state: OipPulumiStateBackendConfig.make({
      ...(awsRegion === undefined ? {} : { region: awsRegion }),
      ...(createDynamoDbLockTable === undefined ? {} : { createDynamoDbLockTable }),
      ...(pulumiStateBucketName === undefined ? {} : { bucketName: pulumiStateBucketName }),
      ...(pulumiStateBucketName === undefined ? {} : { lockTableName: `${pulumiStateBucketName}-locks` }),
    }),
    vercel: OipVercelProjectConfig.make({
      ...(hubSpotAccountId === undefined ? {} : { hubSpotAccountId }),
      ...(hubSpotFormGuid === undefined ? {} : { hubSpotFormGuid }),
      ...(projectName === undefined ? {} : { projectName }),
      ...(productionBranch === undefined ? {} : { productionBranch }),
      ...(repository === undefined ? {} : { repository }),
      ...(rootDirectory === undefined ? {} : { rootDirectory }),
      ...(sanityDataset === undefined ? {} : { sanityDataset }),
      ...(sanityProjectId === undefined ? {} : { sanityProjectId }),
      ...(stagingBranch === undefined ? {} : { stagingBranch }),
      ...(vercelAuthenticationDeploymentType === undefined ? {} : { vercelAuthenticationDeploymentType }),
      ...(vercelTeamId === undefined ? {} : { teamId: vercelTeamId }),
    }),
  });

/**
 * Load OIP web stack args from Pulumi config.
 *
 * @example
 * ```ts
 * import { loadOipWebStackArgs } from "@beep/infra"
 *
 * const args = loadOipWebStackArgs()
 *
 * console.log(args.vercel.projectName)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadOipWebStackArgs = (): OipWebStackArgs => {
  const config = new pulumi.Config("oipWeb");

  return makeOipWebStackArgsFromConfigValues({
    assetsBucketName: config.get("assetsBucketName"),
    attachProductionDomains: config.getBoolean("attachProductionDomains"),
    attachStagingDomain: config.getBoolean("attachStagingDomain"),
    awsRegion: config.get("awsRegion"),
    cloudflareZoneId: config.get("cloudflareZoneId"),
    createDynamoDbLockTable: config.getBoolean("createDynamoDbLockTable"),
    hubSpotAccountId: config.get("hubSpotAccountId"),
    hubSpotFormGuid: config.get("hubSpotFormGuid"),
    legacyCloudflareZoneId: config.get("legacyCloudflareZoneId"),
    legacyProductionDnsRecordImportId: config.get("legacyProductionDnsRecordImportId"),
    legacyProductionDomain: config.get("legacyProductionDomain"),
    legacyStagingDomain: config.get("legacyStagingDomain"),
    legacyWwwDnsRecordImportId: config.get("legacyWwwDnsRecordImportId"),
    legacyWwwDomain: config.get("legacyWwwDomain"),
    projectName: config.get("projectName"),
    productionDnsRecordImportId: config.get("productionDnsRecordImportId"),
    productionBranch: config.get("productionBranch"),
    productionDomain: config.get("productionDomain"),
    pulumiStateBucketName: config.get("pulumiStateBucketName"),
    repository: config.get("repository"),
    rootDirectory: config.get("rootDirectory"),
    sanityDataset: config.get("sanityDataset"),
    sanityProjectId: config.get("sanityProjectId"),
    stagingBranch: config.get("stagingBranch"),
    stagingDomain: config.get("stagingDomain"),
    vercelApexTarget: config.get("vercelApexTarget"),
    vercelAuthenticationDeploymentType: config.get("vercelAuthenticationDeploymentType") as
      | VercelAuthenticationDeploymentType
      | undefined,
    vercelCnameTarget: config.get("vercelCnameTarget"),
    vercelTeamId: config.get("vercelTeamId"),
    wwwDomain: config.get("wwwDomain"),
  });
};

/**
 * Load OIP web runtime secrets from Pulumi secret config.
 *
 * @example
 * ```ts
 * import { loadOipWebRuntimeSecrets } from "@beep/infra"
 *
 * const secrets = loadOipWebRuntimeSecrets()
 *
 * console.log(Object.keys(secrets))
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadOipWebRuntimeSecrets = (): OipWebRuntimeSecrets => {
  const config = new pulumi.Config("oipWeb");

  return {
    hubSpotServiceKey: config.getSecret("hubSpotServiceKey"),
    sanityApiToken: config.getSecret("sanityApiToken"),
  };
};

const secureBucketPolicy = (bucket: aws.s3.Bucket): pulumi.Output<string> =>
  bucket.arn.apply((arn) =>
    JSON.stringify({
      Statement: [
        {
          Action: "s3:*",
          Condition: {
            Bool: {
              "aws:SecureTransport": "false",
            },
          },
          Effect: "Deny",
          Principal: "*",
          Resource: [arn, `${arn}/*`],
          Sid: "DenyInsecureTransport",
        },
      ],
      Version: "2012-10-17",
    })
  );

const makeBucketBaseline = (
  name: string,
  bucket: aws.s3.Bucket,
  protect: boolean,
  parent: pulumi.ComponentResource
) => {
  const opts: pulumi.CustomResourceOptions = { parent, protect };

  new aws.s3.BucketPublicAccessBlock(
    `${name}-public-access-block`,
    {
      blockPublicAcls: true,
      blockPublicPolicy: true,
      bucket: bucket.id,
      ignorePublicAcls: true,
      restrictPublicBuckets: true,
    },
    opts
  );
  new aws.s3.BucketVersioning(
    `${name}-versioning`,
    {
      bucket: bucket.id,
      versioningConfiguration: {
        status: "Enabled",
      },
    },
    opts
  );
  new aws.s3.BucketServerSideEncryptionConfiguration(
    `${name}-encryption`,
    {
      bucket: bucket.id,
      rules: [
        {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: "AES256",
          },
        },
      ],
    },
    opts
  );
  new aws.s3.BucketPolicy(
    `${name}-deny-insecure-transport`,
    {
      bucket: bucket.id,
      policy: secureBucketPolicy(bucket),
    },
    opts
  );
};

const optionalTeamArgs = (teamId: string | undefined) => (teamId === undefined ? {} : { teamId });

const makeRuntimeEnvironmentVariableTargets = (sensitive: boolean): Array<"production" | "preview"> =>
  sensitive ? ["production"] : ["production", "preview"];

const makeRuntimeEnvironmentVariable = (
  name: string,
  project: vercel.Project,
  teamId: string | undefined,
  key: string,
  value: pulumi.Input<string> | undefined,
  sensitive: boolean,
  opts: pulumi.CustomResourceOptions
) =>
  value === undefined
    ? undefined
    : new vercel.ProjectEnvironmentVariable(
        `${name}-${pipe(key, Str.toLowerCase, Str.replaceAll("_", "-"))}`,
        {
          ...optionalTeamArgs(teamId),
          key,
          projectId: project.id,
          sensitive,
          targets: makeRuntimeEnvironmentVariableTargets(sensitive),
          value,
        },
        opts
      );

const makeDnsRecord = (
  name: string,
  zoneId: string | undefined,
  recordName: string,
  type: "A" | "CNAME",
  content: string,
  importId: string | undefined,
  opts: pulumi.CustomResourceOptions
) =>
  zoneId === undefined
    ? undefined
    : new cloudflare.DnsRecord(
        name,
        {
          comment: "Managed by Pulumi for oip.law Vercel routing.",
          content,
          name: recordName,
          proxied: false,
          ttl: 1,
          type,
          zoneId,
        },
        {
          ...opts,
          ...(importId === undefined ? {} : { import: importId }),
        }
      );

const makeARecord = (
  name: string,
  zoneId: string | undefined,
  recordName: string,
  content: string,
  importId: string | undefined,
  opts: pulumi.CustomResourceOptions
) => makeDnsRecord(name, zoneId, recordName, "A", content, importId, opts);

const makeCnameRecord = (
  name: string,
  zoneId: string | undefined,
  recordName: string,
  content: string,
  importId: string | undefined,
  opts: pulumi.CustomResourceOptions
) => makeDnsRecord(name, zoneId, recordName, "CNAME", content, importId, opts);

/**
 * Import-safe Pulumi component for OIP production web infrastructure.
 *
 * @example
 * ```ts
 * import { OipWebStack, makeOipWebStackArgsFromConfigValues } from "@beep/infra"
 *
 * console.log(OipWebStack)
 * console.log(makeOipWebStackArgsFromConfigValues)
 * ```
 *
 * @category resources
 * @since 0.0.0
 */
export class OipWebStack extends pulumi.ComponentResource {
  /**
   * Bootstrap-managed encrypted S3 bucket for Pulumi DIY backend state.
   *
   * @since 0.0.0
   */
  public readonly stateBucketName: pulumi.Output<string>;

  /**
   * Pulumi DIY backend URL for this stack family.
   *
   * @since 0.0.0
   */
  public readonly stateBackendUrl: pulumi.Output<string>;

  /**
   * Optional DynamoDB lock table name for Terraform-compatible tooling.
   *
   * @since 0.0.0
   */
  public readonly stateLockTableName: pulumi.Output<string | undefined>;

  /**
   * Encrypted S3 bucket reserved for OIP media assets.
   *
   * @since 0.0.0
   */
  public readonly assetsBucketName: pulumi.Output<string>;

  /**
   * Vercel project identifier.
   *
   * @since 0.0.0
   */
  public readonly vercelProjectId: pulumi.Output<string>;

  /**
   * Production domain attached to the Vercel project.
   *
   * @since 0.0.0
   */
  public readonly productionDomain: pulumi.Output<string>;

  /**
   * Staging domain attached to the Vercel project.
   *
   * @since 0.0.0
   */
  public readonly stagingDomain: pulumi.Output<string>;

  public constructor(
    name: string,
    args: OipWebStackArgs = OipWebStackArgs.make({}),
    secrets: OipWebRuntimeSecrets = {},
    opts?: pulumi.ComponentResourceOptions
  ) {
    super(
      "beep:infra:OipWebStack",
      name,
      {},
      {
        ...opts,
        aliases: [{ type: "beep:infra:OpipWebStack" }],
      }
    );

    const lockTable = args.state.createDynamoDbLockTable
      ? new aws.dynamodb.Table(
          `${name}-pulumi-locks`,
          {
            attributes: [
              {
                name: "LockID",
                type: "S",
              },
            ],
            billingMode: "PAY_PER_REQUEST",
            deletionProtectionEnabled: true,
            hashKey: "LockID",
            name: args.state.lockTableName,
            pointInTimeRecovery: {
              enabled: true,
            },
            region: args.state.region,
            serverSideEncryption: {
              enabled: true,
            },
            tags: {
              ...defaultTags,
              DataClass: "optional-lock-table",
            },
          },
          { parent: this, protect: args.state.protect }
        )
      : undefined;

    const assetsBucket = new aws.s3.Bucket(
      `${name}-assets`,
      {
        bucket: args.assets.bucketName,
        forceDestroy: false,
        region: args.assets.region,
        tags: {
          ...defaultTags,
          DataClass: "public-assets-origin",
        },
      },
      { parent: this, protect: args.assets.protect }
    );
    makeBucketBaseline(`${name}-assets`, assetsBucket, args.assets.protect, this);

    const project = new vercel.Project(
      `${name}-vercel-project`,
      {
        ...optionalTeamArgs(args.vercel.teamId),
        automaticallyExposeSystemEnvironmentVariables: true,
        buildCommand: "cd ../.. && bun run --cwd apps/oip-web build:pwa",
        framework: "nextjs",
        gitRepository: {
          repo: args.vercel.repository,
          type: "github",
        },
        installCommand: "cd ../.. && bun install",
        name: args.vercel.projectName,
        rootDirectory: args.vercel.rootDirectory,
        vercelAuthentication: {
          deploymentType: args.vercel.vercelAuthenticationDeploymentType,
        },
      },
      { parent: this }
    );

    const envOpts = { parent: this };
    makeRuntimeEnvironmentVariable(name, project, args.vercel.teamId, "NEXT_DISABLE_PWA", "0", false, envOpts);
    makeRuntimeEnvironmentVariable(
      name,
      project,
      args.vercel.teamId,
      "SANITY_PROJECT_ID",
      args.vercel.sanityProjectId,
      false,
      envOpts
    );
    makeRuntimeEnvironmentVariable(
      name,
      project,
      args.vercel.teamId,
      "SANITY_DATASET",
      args.vercel.sanityDataset,
      false,
      envOpts
    );
    makeRuntimeEnvironmentVariable(
      name,
      project,
      args.vercel.teamId,
      "SANITY_API_TOKEN",
      secrets.sanityApiToken,
      true,
      envOpts
    );
    makeRuntimeEnvironmentVariable(
      name,
      project,
      args.vercel.teamId,
      "CRM_HUBSPOT_ACCOUNT_ID",
      args.vercel.hubSpotAccountId,
      false,
      envOpts
    );
    makeRuntimeEnvironmentVariable(
      name,
      project,
      args.vercel.teamId,
      "CRM_HUBSPOT_FORM_GUID",
      args.vercel.hubSpotFormGuid,
      false,
      envOpts
    );
    makeRuntimeEnvironmentVariable(
      name,
      project,
      args.vercel.teamId,
      "CRM_HUBSPOT_SERVICE_KEY",
      secrets.hubSpotServiceKey,
      true,
      envOpts
    );

    const productionDomain = args.dns.attachProductionDomains
      ? new vercel.ProjectDomain(
          `${name}-oip-production-domain`,
          {
            ...optionalTeamArgs(args.vercel.teamId),
            domain: args.dns.productionDomain,
            projectId: project.id,
          },
          { parent: this }
        )
      : undefined;
    const legacyProductionDomain = args.dns.attachProductionDomains
      ? new vercel.ProjectDomain(
          `${name}-production-domain`,
          {
            ...optionalTeamArgs(args.vercel.teamId),
            domain: args.dns.legacyProductionDomain,
            projectId: project.id,
            redirect: args.dns.productionDomain,
            redirectStatusCode: productionRedirectStatusCode,
          },
          { parent: this }
        )
      : undefined;
    const stagingDomainBranchArgs =
      args.vercel.stagingBranch === args.vercel.productionBranch ? {} : { gitBranch: args.vercel.stagingBranch };
    const stagingDomain = args.dns.attachStagingDomain
      ? new vercel.ProjectDomain(
          `${name}-oip-staging-domain`,
          {
            ...optionalTeamArgs(args.vercel.teamId),
            domain: args.dns.stagingDomain,
            ...stagingDomainBranchArgs,
            projectId: project.id,
          },
          { parent: this }
        )
      : undefined;
    const legacyStagingDomain = args.dns.attachStagingDomain
      ? new vercel.ProjectDomain(
          `${name}-staging-domain`,
          {
            ...optionalTeamArgs(args.vercel.teamId),
            domain: args.dns.legacyStagingDomain,
            projectId: project.id,
            redirect: args.dns.stagingDomain,
            redirectStatusCode: stagingRedirectStatusCode,
          },
          { parent: this }
        )
      : undefined;
    const wwwDomain = args.dns.attachProductionDomains
      ? new vercel.ProjectDomain(
          `${name}-oip-www-domain`,
          {
            ...optionalTeamArgs(args.vercel.teamId),
            domain: args.dns.wwwDomain,
            projectId: project.id,
            redirect: args.dns.productionDomain,
            redirectStatusCode: productionRedirectStatusCode,
          },
          { parent: this }
        )
      : undefined;
    const legacyWwwDomain = args.dns.attachProductionDomains
      ? new vercel.ProjectDomain(
          `${name}-www-domain`,
          {
            ...optionalTeamArgs(args.vercel.teamId),
            domain: args.dns.legacyWwwDomain,
            projectId: project.id,
            redirect: args.dns.productionDomain,
            redirectStatusCode: productionRedirectStatusCode,
          },
          { parent: this }
        )
      : undefined;

    const dnsDependencies = A.filter(
      [productionDomain, stagingDomain, wwwDomain, legacyProductionDomain, legacyStagingDomain, legacyWwwDomain],
      (resource): resource is vercel.ProjectDomain => resource !== undefined
    );
    const dnsOpts: pulumi.CustomResourceOptions = {
      dependsOn: dnsDependencies,
      parent: this,
    };
    const legacyDnsOpts: pulumi.CustomResourceOptions = {
      dependsOn: A.filter(
        [legacyProductionDomain, legacyStagingDomain, legacyWwwDomain],
        (resource): resource is vercel.ProjectDomain => resource !== undefined
      ),
      parent: this,
    };
    if (args.dns.attachProductionDomains) {
      makeARecord(
        `${name}-dns-oip-apex`,
        args.dns.cloudflareZoneId,
        args.dns.productionDomain,
        args.dns.vercelApexTarget,
        args.dns.productionDnsRecordImportId,
        dnsOpts
      );
      makeCnameRecord(
        `${name}-dns-oip-www`,
        args.dns.cloudflareZoneId,
        args.dns.wwwDomain,
        args.dns.vercelCnameTarget,
        undefined,
        dnsOpts
      );
      makeARecord(
        `${name}-dns-apex`,
        args.dns.legacyCloudflareZoneId,
        args.dns.legacyProductionDomain,
        args.dns.vercelApexTarget,
        args.dns.legacyProductionDnsRecordImportId,
        legacyDnsOpts
      );
      makeCnameRecord(
        `${name}-dns-www`,
        args.dns.legacyCloudflareZoneId,
        args.dns.legacyWwwDomain,
        args.dns.vercelCnameTarget,
        args.dns.legacyWwwDnsRecordImportId,
        legacyDnsOpts
      );
    }
    if (args.dns.attachStagingDomain) {
      makeCnameRecord(
        `${name}-dns-oip-staging`,
        args.dns.cloudflareZoneId,
        args.dns.stagingDomain,
        args.dns.vercelCnameTarget,
        undefined,
        dnsOpts
      );
      makeCnameRecord(
        `${name}-dns-staging`,
        args.dns.legacyCloudflareZoneId,
        args.dns.legacyStagingDomain,
        args.dns.vercelCnameTarget,
        undefined,
        legacyDnsOpts
      );
    }

    this.stateBucketName = pulumi.output(args.state.bucketName);
    this.stateBackendUrl = pulumi.output(`s3://${args.state.bucketName}`);
    this.stateLockTableName = pulumi.output(lockTable?.name);
    this.assetsBucketName = assetsBucket.bucket;
    this.vercelProjectId = project.id;
    this.productionDomain = pulumi.output(productionDomain?.domain ?? args.dns.productionDomain);
    this.stagingDomain = pulumi.output(stagingDomain?.domain ?? args.dns.stagingDomain);

    this.registerOutputs({
      assetsBucketName: this.assetsBucketName,
      productionDomain: this.productionDomain,
      stagingDomain: this.stagingDomain,
      stateBackendUrl: this.stateBackendUrl,
      stateBucketName: this.stateBucketName,
      stateLockTableName: this.stateLockTableName,
      vercelProjectId: this.vercelProjectId,
    });
  }
}
