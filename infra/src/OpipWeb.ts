/**
 * Pulumi orchestration surface for opip.law.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $InfraId } from "@beep/identity/packages";
import { Struct } from "@beep/utils";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as vercel from "@pulumiverse/vercel";
import { Effect } from "effect";
import * as S from "effect/Schema";

const $I = $InfraId.create("OpipWeb");

const defaultAwsRegion = "us-east-1";
const defaultAssetsBucketName = "assets.opip.law";
const defaultProjectName = "opip-web";
const defaultProductionBranch = "main";
const defaultProductionDomain = "opip.law";
const defaultPulumiStateBucketName = "opip-law-pulumi-state";
const defaultRepository = "kriegcloud/beep-effect";
const defaultRootDirectory = "apps/opip-web";
const defaultStagingBranch = "staging";
const defaultStagingDomain = "staging.opip.law";
const defaultVercelAuthenticationDeploymentType: VercelAuthenticationDeploymentType = "none";
const defaultVercelCnameTarget = "cname.vercel-dns.com";
const defaultWwwDomain = "www.opip.law";

const defaultTags = {
  App: "opip-web",
  ManagedBy: "pulumi",
  Project: "opip-law",
};

type OpipWebPulumiConfigValues = {
  readonly attachProductionDomains?: boolean | undefined;
  readonly attachStagingDomain?: boolean | undefined;
  readonly assetsBucketName?: string | undefined;
  readonly awsRegion?: string | undefined;
  readonly cloudflareZoneId?: string | undefined;
  readonly createDynamoDbLockTable?: boolean | undefined;
  readonly hubSpotAccountId?: string | undefined;
  readonly hubSpotFormGuid?: string | undefined;
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
  readonly vercelAuthenticationDeploymentType?: VercelAuthenticationDeploymentType | undefined;
  readonly vercelCnameTarget?: string | undefined;
  readonly vercelTeamId?: string | undefined;
  readonly wwwDomain?: string | undefined;
};

const VercelAuthenticationDeploymentType = S.Union([
  S.Literal("standardProtectionNew"),
  S.Literal("standardProtection"),
  S.Literal("allDeployments"),
  S.Literal("onlyPreviewDeployments"),
  S.Literal("none"),
]);

type VercelAuthenticationDeploymentType = typeof VercelAuthenticationDeploymentType.Type;

/**
 * Optional Pulumi config values before OPIP deploy defaults are applied.
 *
 * @example
 * ```ts
 * import { OpipWebPulumiConfigValues } from "@beep/infra"
 *
 * console.log(OpipWebPulumiConfigValues)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const OpipWebPulumiConfigValues = S.Class<OpipWebPulumiConfigValues>($I`OpipWebPulumiConfigValues`)(
  {
    attachProductionDomains: S.Boolean,
    attachStagingDomain: S.Boolean,
    assetsBucketName: S.String,
    awsRegion: S.String,
    cloudflareZoneId: S.String,
    createDynamoDbLockTable: S.Boolean,
    hubSpotAccountId: S.String,
    hubSpotFormGuid: S.String,
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
    vercelAuthenticationDeploymentType: VercelAuthenticationDeploymentType,
    vercelCnameTarget: S.String,
    vercelTeamId: S.String,
    wwwDomain: S.String,
  },
  $I.annote("OpipWebPulumiConfigValues", {
    description: "Optional Pulumi config values before OPIP deploy defaults are applied.",
  })
).mapFields(Struct.map(S.optionalKey));

/**
 * Pulumi DIY state backend settings for OPIP.
 *
 * @example
 * ```ts
 * import { OpipPulumiStateBackendConfig } from "@beep/infra"
 *
 * console.log(new OpipPulumiStateBackendConfig({}).bucketName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpipPulumiStateBackendConfig extends S.Class<OpipPulumiStateBackendConfig>(
  $I`OpipPulumiStateBackendConfig`
)(
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
  $I.annote("OpipPulumiStateBackendConfig", {
    description: "Pulumi DIY state backend settings for OPIP.",
  })
) {}

/**
 * S3 asset bucket resources for OPIP-controlled media.
 *
 * @example
 * ```ts
 * import { OpipAssetsBucketConfig } from "@beep/infra"
 *
 * console.log(new OpipAssetsBucketConfig({}).bucketName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpipAssetsBucketConfig extends S.Class<OpipAssetsBucketConfig>($I`OpipAssetsBucketConfig`)(
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
  $I.annote("OpipAssetsBucketConfig", {
    description: "S3 asset bucket resources for OPIP-controlled media.",
  })
) {}

/**
 * DNS configuration for Cloudflare-managed OPIP records.
 *
 * @example
 * ```ts
 * import { OpipDnsConfig } from "@beep/infra"
 *
 * console.log(new OpipDnsConfig({}).productionDomain)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpipDnsConfig extends S.Class<OpipDnsConfig>($I`OpipDnsConfig`)(
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
    productionDomain: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultProductionDomain)),
      S.withDecodingDefaultKey(Effect.succeed(defaultProductionDomain))
    ),
    stagingDomain: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultStagingDomain)),
      S.withDecodingDefaultKey(Effect.succeed(defaultStagingDomain))
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
  $I.annote("OpipDnsConfig", {
    description: "DNS configuration for Cloudflare-managed OPIP records.",
  })
) {}

/**
 * Vercel project configuration for `@beep/opip-web`.
 *
 * @example
 * ```ts
 * import { OpipVercelProjectConfig } from "@beep/infra"
 *
 * console.log(new OpipVercelProjectConfig({}).projectName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpipVercelProjectConfig extends S.Class<OpipVercelProjectConfig>($I`OpipVercelProjectConfig`)(
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
  $I.annote("OpipVercelProjectConfig", {
    description: "Vercel project configuration for @beep/opip-web.",
  })
) {}

/**
 * Secret runtime values for OPIP deploy targets.
 *
 * @example
 * ```ts
 * import type { OpipWebRuntimeSecrets } from "@beep/infra"
 * import * as pulumi from "@pulumi/pulumi"
 *
 * const secrets: OpipWebRuntimeSecrets = {
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
export type OpipWebRuntimeSecrets = {
  readonly hubSpotServiceKey?: pulumi.Input<string> | undefined;
  readonly sanityApiToken?: pulumi.Input<string> | undefined;
};

/**
 * Pulumi-facing args for the OPIP web stack.
 *
 * @example
 * ```ts
 * import { OpipWebStackArgs } from "@beep/infra"
 *
 * console.log(new OpipWebStackArgs({}).vercel.projectName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpipWebStackArgs extends S.Class<OpipWebStackArgs>($I`OpipWebStackArgs`)(
  {
    assets: OpipAssetsBucketConfig.pipe(
      S.withConstructorDefault(Effect.succeed(new OpipAssetsBucketConfig({}))),
      S.withDecodingDefaultKey(Effect.succeed(new OpipAssetsBucketConfig({})))
    ),
    dns: OpipDnsConfig.pipe(
      S.withConstructorDefault(Effect.succeed(new OpipDnsConfig({}))),
      S.withDecodingDefaultKey(Effect.succeed(new OpipDnsConfig({})))
    ),
    state: OpipPulumiStateBackendConfig.pipe(
      S.withConstructorDefault(Effect.succeed(new OpipPulumiStateBackendConfig({}))),
      S.withDecodingDefaultKey(Effect.succeed(new OpipPulumiStateBackendConfig({})))
    ),
    vercel: OpipVercelProjectConfig.pipe(
      S.withConstructorDefault(Effect.succeed(new OpipVercelProjectConfig({}))),
      S.withDecodingDefaultKey(Effect.succeed(new OpipVercelProjectConfig({})))
    ),
  },
  $I.annote("OpipWebStackArgs", {
    description: "Pulumi-facing args for the OPIP web stack.",
  })
) {}

/**
 * Build OPIP web stack args from decoded Pulumi config values.
 *
 * @example
 * ```ts
 * import { makeOpipWebStackArgsFromConfigValues } from "@beep/infra"
 *
 * const args = makeOpipWebStackArgsFromConfigValues({
 *   attachStagingDomain: false,
 *   projectName: "opip-web-preview",
 *   stagingDomain: "preview.opip.law",
 * })
 *
 * console.log(args.vercel.projectName) // "opip-web-preview"
 * console.log(args.dns.attachStagingDomain) // false
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeOpipWebStackArgsFromConfigValues = ({
  assetsBucketName,
  attachProductionDomains,
  attachStagingDomain,
  awsRegion,
  cloudflareZoneId,
  createDynamoDbLockTable,
  hubSpotAccountId,
  hubSpotFormGuid,
  projectName,
  productionBranch,
  productionDomain,
  pulumiStateBucketName,
  repository,
  rootDirectory,
  sanityDataset,
  sanityProjectId,
  stagingBranch,
  stagingDomain,
  vercelAuthenticationDeploymentType,
  vercelCnameTarget,
  vercelTeamId,
  wwwDomain,
}: OpipWebPulumiConfigValues = {}): OpipWebStackArgs =>
  new OpipWebStackArgs({
    assets: new OpipAssetsBucketConfig({
      ...(assetsBucketName === undefined ? {} : { bucketName: assetsBucketName }),
      ...(awsRegion === undefined ? {} : { region: awsRegion }),
    }),
    dns: new OpipDnsConfig({
      ...(attachProductionDomains === undefined ? {} : { attachProductionDomains }),
      ...(attachStagingDomain === undefined ? {} : { attachStagingDomain }),
      ...(cloudflareZoneId === undefined ? {} : { cloudflareZoneId }),
      ...(productionDomain === undefined ? {} : { productionDomain }),
      ...(stagingDomain === undefined ? {} : { stagingDomain }),
      ...(vercelCnameTarget === undefined ? {} : { vercelCnameTarget }),
      ...(wwwDomain === undefined ? {} : { wwwDomain }),
    }),
    state: new OpipPulumiStateBackendConfig({
      ...(awsRegion === undefined ? {} : { region: awsRegion }),
      ...(createDynamoDbLockTable === undefined ? {} : { createDynamoDbLockTable }),
      ...(pulumiStateBucketName === undefined ? {} : { bucketName: pulumiStateBucketName }),
      ...(pulumiStateBucketName === undefined ? {} : { lockTableName: `${pulumiStateBucketName}-locks` }),
    }),
    vercel: new OpipVercelProjectConfig({
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
 * Load OPIP web stack args from Pulumi config.
 *
 * @example
 * ```ts
 * import { loadOpipWebStackArgs } from "@beep/infra"
 *
 * const args = loadOpipWebStackArgs()
 *
 * console.log(args.vercel.projectName)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadOpipWebStackArgs = (): OpipWebStackArgs => {
  const config = new pulumi.Config("opipWeb");

  return makeOpipWebStackArgsFromConfigValues({
    assetsBucketName: config.get("assetsBucketName"),
    attachProductionDomains: config.getBoolean("attachProductionDomains"),
    attachStagingDomain: config.getBoolean("attachStagingDomain"),
    awsRegion: config.get("awsRegion"),
    cloudflareZoneId: config.get("cloudflareZoneId"),
    createDynamoDbLockTable: config.getBoolean("createDynamoDbLockTable"),
    hubSpotAccountId: config.get("hubSpotAccountId"),
    hubSpotFormGuid: config.get("hubSpotFormGuid"),
    projectName: config.get("projectName"),
    productionBranch: config.get("productionBranch"),
    productionDomain: config.get("productionDomain"),
    pulumiStateBucketName: config.get("pulumiStateBucketName"),
    repository: config.get("repository"),
    rootDirectory: config.get("rootDirectory"),
    sanityDataset: config.get("sanityDataset"),
    sanityProjectId: config.get("sanityProjectId"),
    stagingBranch: config.get("stagingBranch"),
    stagingDomain: config.get("stagingDomain"),
    vercelAuthenticationDeploymentType: config.get("vercelAuthenticationDeploymentType") as
      | VercelAuthenticationDeploymentType
      | undefined,
    vercelCnameTarget: config.get("vercelCnameTarget"),
    vercelTeamId: config.get("vercelTeamId"),
    wwwDomain: config.get("wwwDomain"),
  });
};

/**
 * Load OPIP web runtime secrets from Pulumi secret config.
 *
 * @example
 * ```ts
 * import { loadOpipWebRuntimeSecrets } from "@beep/infra"
 *
 * const secrets = loadOpipWebRuntimeSecrets()
 *
 * console.log(Object.keys(secrets))
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadOpipWebRuntimeSecrets = (): OpipWebRuntimeSecrets => {
  const config = new pulumi.Config("opipWeb");

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
        `${name}-${key.toLowerCase().replaceAll("_", "-")}`,
        {
          ...optionalTeamArgs(teamId),
          key,
          projectId: project.id,
          sensitive,
          targets: ["production", "preview"],
          value,
        },
        opts
      );

const makeCnameRecord = (
  name: string,
  zoneId: string | undefined,
  recordName: string,
  content: string,
  opts: pulumi.CustomResourceOptions
) =>
  zoneId === undefined
    ? undefined
    : new cloudflare.DnsRecord(
        name,
        {
          comment: "Managed by Pulumi for opip.law Vercel routing.",
          content,
          name: recordName,
          proxied: false,
          ttl: 1,
          type: "CNAME",
          zoneId,
        },
        opts
      );

/**
 * Import-safe Pulumi component for OPIP production web infrastructure.
 *
 * @example
 * ```ts
 * import { OpipWebStack, makeOpipWebStackArgsFromConfigValues } from "@beep/infra"
 *
 * console.log(OpipWebStack)
 * console.log(makeOpipWebStackArgsFromConfigValues)
 * ```
 *
 * @category resources
 * @since 0.0.0
 */
export class OpipWebStack extends pulumi.ComponentResource {
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
   * Encrypted S3 bucket reserved for OPIP media assets.
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
    args: OpipWebStackArgs = new OpipWebStackArgs({}),
    secrets: OpipWebRuntimeSecrets = {},
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("beep:infra:OpipWebStack", name, {}, opts);

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
        buildCommand: "cd ../.. && bun run --cwd apps/opip-web build:pwa",
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
          `${name}-production-domain`,
          {
            ...optionalTeamArgs(args.vercel.teamId),
            domain: args.dns.productionDomain,
            projectId: project.id,
          },
          { parent: this }
        )
      : undefined;
    const stagingDomainBranchArgs =
      args.vercel.stagingBranch === args.vercel.productionBranch ? {} : { gitBranch: args.vercel.stagingBranch };
    const stagingDomain = args.dns.attachStagingDomain
      ? new vercel.ProjectDomain(
          `${name}-staging-domain`,
          {
            ...optionalTeamArgs(args.vercel.teamId),
            domain: args.dns.stagingDomain,
            ...stagingDomainBranchArgs,
            projectId: project.id,
          },
          { parent: this }
        )
      : undefined;
    const wwwDomain = args.dns.attachProductionDomains
      ? new vercel.ProjectDomain(
          `${name}-www-domain`,
          {
            ...optionalTeamArgs(args.vercel.teamId),
            domain: args.dns.wwwDomain,
            projectId: project.id,
            redirect: args.dns.productionDomain,
            redirectStatusCode: 308,
          },
          { parent: this }
        )
      : undefined;

    const dnsOpts: pulumi.CustomResourceOptions = {
      dependsOn: [productionDomain, stagingDomain].filter(
        (resource): resource is vercel.ProjectDomain => resource !== undefined
      ),
      parent: this,
    };
    if (args.dns.attachProductionDomains) {
      makeCnameRecord(
        `${name}-dns-apex`,
        args.dns.cloudflareZoneId,
        args.dns.productionDomain,
        args.dns.vercelCnameTarget,
        dnsOpts
      );
      makeCnameRecord(
        `${name}-dns-www`,
        args.dns.cloudflareZoneId,
        args.dns.wwwDomain,
        args.dns.vercelCnameTarget,
        dnsOpts
      );
    }
    if (args.dns.attachStagingDomain) {
      makeCnameRecord(
        `${name}-dns-staging`,
        args.dns.cloudflareZoneId,
        args.dns.stagingDomain,
        args.dns.vercelCnameTarget,
        dnsOpts
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
