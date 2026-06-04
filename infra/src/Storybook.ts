/**
 * Pulumi orchestration surface for the `@beep/ui` Storybook deployment.
 *
 * Deploys the static Storybook build to Vercel as a git-connected project and,
 * when a Cloudflare zone is configured, attaches `storybook.yeebois.com` through
 * a CNAME record. HTTP security headers for the deployment are owned by
 * `packages/foundation/ui-system/ui/vercel.json` (Vercel reads response headers
 * from `vercel.json`, not from the Pulumi project), tuned for an A+ Mozilla
 * Observatory score while keeping Storybook's same-origin preview iframe working.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $InfraId } from "@beep/identity/packages";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import { Struct } from "@beep/utils";
import * as O from "@beep/utils/Option";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as vercel from "@pulumiverse/vercel";
import { Config, Effect, Option } from "effect";
import * as S from "effect/Schema";

const $I = $InfraId.create("Storybook");

const defaultProjectName = "beep-storybook";
const defaultRepository = "kriegcloud/beep-effect";
const defaultRootDirectory = "packages/foundation/ui-system/ui";
const defaultProductionBranch = "main";
const defaultBuildCommand = "cd ../../../.. && bun run storybook:build";
const defaultInstallCommand = "cd ../../../.. && bun install";
const defaultOutputDirectory = "storybook-static";
const defaultDomain = "storybook.yeebois.com";
const defaultVercelCnameTarget = "cname.vercel-dns.com";
const defaultVercelAuthenticationDeploymentType: VercelAuthenticationDeploymentType = "none";

type StorybookPulumiConfigValues = {
  readonly attachDomain?: boolean | undefined;
  readonly buildCommand?: string | undefined;
  readonly cloudflareZoneId?: string | undefined;
  readonly dnsRecordImportId?: string | undefined;
  readonly domain?: string | undefined;
  readonly installCommand?: string | undefined;
  readonly outputDirectory?: string | undefined;
  readonly projectName?: string | undefined;
  readonly productionBranch?: string | undefined;
  readonly repository?: string | undefined;
  readonly rootDirectory?: string | undefined;
  readonly vercelApexTarget?: string | undefined;
  readonly vercelAuthenticationDeploymentType?: VercelAuthenticationDeploymentType | undefined;
  readonly vercelCnameTarget?: string | undefined;
  readonly vercelTeamId?: string | undefined;
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
 * Optional Pulumi config values before Storybook deploy defaults are applied.
 *
 * @example
 * ```ts
 * import { StorybookPulumiConfigValues } from "@beep/infra"
 *
 * console.log(StorybookPulumiConfigValues)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const StorybookPulumiConfigValues = S.Class<StorybookPulumiConfigValues>($I`StorybookPulumiConfigValues`)(
  {
    attachDomain: S.Boolean,
    buildCommand: S.String,
    cloudflareZoneId: S.String,
    dnsRecordImportId: S.String,
    domain: S.String,
    installCommand: S.String,
    outputDirectory: S.String,
    projectName: S.String,
    productionBranch: S.String,
    repository: S.String,
    rootDirectory: S.String,
    vercelAuthenticationDeploymentType: VercelAuthenticationDeploymentType,
    vercelCnameTarget: S.String,
    vercelTeamId: S.String,
  },
  $I.annote("StorybookPulumiConfigValues", {
    description: "Optional Pulumi config values before Storybook deploy defaults are applied.",
  })
).mapFields(Struct.map(S.optionalKey));

/**
 * Vercel project configuration for the `@beep/ui` Storybook build.
 *
 * @example
 * ```ts
 * import { StorybookVercelProjectConfig } from "@beep/infra"
 *
 * console.log(StorybookVercelProjectConfig.make({}).projectName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class StorybookVercelProjectConfig extends S.Class<StorybookVercelProjectConfig>(
  $I`StorybookVercelProjectConfig`
)(
  {
    buildCommand: S.String.pipe(SchemaUtils.withKeyDefaults(defaultBuildCommand)),
    installCommand: S.String.pipe(SchemaUtils.withKeyDefaults(defaultInstallCommand)),
    outputDirectory: S.String.pipe(SchemaUtils.withKeyDefaults(defaultOutputDirectory)),
    projectName: S.String.pipe(SchemaUtils.withKeyDefaults(defaultProjectName)),
    productionBranch: S.String.pipe(SchemaUtils.withKeyDefaults(defaultProductionBranch)),
    repository: S.String.pipe(SchemaUtils.withKeyDefaults(defaultRepository)),
    rootDirectory: S.String.pipe(SchemaUtils.withKeyDefaults(defaultRootDirectory)),
    teamId: S.optionalKey(S.String),
    vercelAuthenticationDeploymentType: VercelAuthenticationDeploymentType.pipe(
      SchemaUtils.withKeyDefaults(defaultVercelAuthenticationDeploymentType)
    ),
  },
  $I.annote("StorybookVercelProjectConfig", {
    description: "Vercel project configuration for the @beep/ui Storybook build.",
  })
) {}

/**
 * DNS configuration for the Cloudflare-managed Storybook record.
 *
 * @example
 * ```ts
 * import { StorybookDnsConfig } from "@beep/infra"
 *
 * console.log(StorybookDnsConfig.make({}).domain)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class StorybookDnsConfig extends S.Class<StorybookDnsConfig>($I`StorybookDnsConfig`)(
  {
    attachDomain: S.Boolean.pipe(SchemaUtils.withKeyDefaults(true)),
    cloudflareZoneId: S.optionalKey(S.String),
    dnsRecordImportId: S.optionalKey(S.String),
    domain: S.String.pipe(SchemaUtils.withKeyDefaults(defaultDomain)),
    vercelCnameTarget: S.String.pipe(SchemaUtils.withKeyDefaults(defaultVercelCnameTarget)),
  },
  $I.annote("StorybookDnsConfig", {
    description: "DNS configuration for the Cloudflare-managed Storybook record.",
  })
) {}

/**
 * Pulumi-facing args for the Storybook deployment stack.
 *
 * @example
 * ```ts
 * import { StorybookStackArgs } from "@beep/infra"
 *
 * console.log(StorybookStackArgs.make({}).vercel.projectName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class StorybookStackArgs extends S.Class<StorybookStackArgs>($I`StorybookStackArgs`)(
  {
    dns: StorybookDnsConfig.pipe(SchemaUtils.withKeyDefaults(StorybookDnsConfig.make())),
    vercel: StorybookVercelProjectConfig.pipe(SchemaUtils.withKeyDefaults(StorybookVercelProjectConfig.make())),
  },
  $I.annote("StorybookStackArgs", {
    description: "Pulumi-facing args for the Storybook deployment stack.",
  })
) {}

/**
 * Build Storybook stack args from decoded Pulumi config values.
 *
 * @example
 * ```ts
 * import { makeStorybookStackArgsFromConfigValues } from "@beep/infra"
 *
 * const args = makeStorybookStackArgsFromConfigValues({
 *   domain: "storybook.example.com",
 *   attachDomain: false,
 * })
 *
 * console.log(args.dns.domain) // "storybook.example.com"
 * console.log(args.dns.attachDomain) // false
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeStorybookStackArgsFromConfigValues = ({
  attachDomain,
  buildCommand,
  cloudflareZoneId,
  dnsRecordImportId,
  domain,
  installCommand,
  outputDirectory,
  projectName,
  productionBranch,
  repository,
  rootDirectory,
  vercelAuthenticationDeploymentType,
  vercelCnameTarget,
  vercelTeamId,
}: StorybookPulumiConfigValues = {}): StorybookStackArgs =>
  StorybookStackArgs.make({
    dns: StorybookDnsConfig.make(
      O.getSomesStruct({
        attachDomain: O.fromUndefinedOr(attachDomain),
        cloudflareZoneId: O.fromUndefinedOr(cloudflareZoneId),
        dnsRecordImportId: O.fromUndefinedOr(dnsRecordImportId),
        domain: O.fromUndefinedOr(domain),
        vercelCnameTarget: O.fromUndefinedOr(vercelCnameTarget),
      })
    ),
    vercel: StorybookVercelProjectConfig.make(
      O.getSomesStruct({
        buildCommand: O.fromUndefinedOr(buildCommand),
        installCommand: O.fromUndefinedOr(installCommand),
        outputDirectory: O.fromUndefinedOr(outputDirectory),
        projectName: O.fromUndefinedOr(projectName),
        productionBranch: O.fromUndefinedOr(productionBranch),
        repository: O.fromUndefinedOr(repository),
        rootDirectory: O.fromUndefinedOr(rootDirectory),
        teamId: O.fromUndefinedOr(vercelTeamId),
        vercelAuthenticationDeploymentType: O.fromUndefinedOr(vercelAuthenticationDeploymentType),
      })
    ),
  });

/**
 * Load Storybook stack args from Pulumi config.
 *
 * @example
 * ```ts
 * import { loadStorybookStackArgs } from "@beep/infra"
 *
 * const args = loadStorybookStackArgs()
 *
 * console.log(args.vercel.projectName)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadStorybookStackArgs = (): StorybookStackArgs => {
  const config = new pulumi.Config("storybook");

  return makeStorybookStackArgsFromConfigValues({
    attachDomain: config.getBoolean("attachDomain"),
    buildCommand: config.get("buildCommand"),
    // Prefer Pulumi config, but fall back to an env var so the zone id can be
    // injected from 1Password at deploy time (`op read`) without committing it.
    cloudflareZoneId: config.get("cloudflareZoneId") ?? readEnvOption("STORYBOOK_CLOUDFLARE_ZONE_ID"),
    dnsRecordImportId: config.get("dnsRecordImportId"),
    domain: config.get("domain"),
    installCommand: config.get("installCommand"),
    outputDirectory: config.get("outputDirectory"),
    projectName: config.get("projectName"),
    productionBranch: config.get("productionBranch"),
    repository: config.get("repository"),
    rootDirectory: config.get("rootDirectory"),
    vercelAuthenticationDeploymentType: config.get("vercelAuthenticationDeploymentType") as
      | VercelAuthenticationDeploymentType
      | undefined,
    vercelCnameTarget: config.get("vercelCnameTarget"),
    vercelTeamId: config.get("vercelTeamId"),
  });
};

const readEnvOption = (name: string): string | undefined =>
  Option.getOrUndefined(Effect.runSync(Config.option(Config.string(name))));

const optionalTeamArgs = (teamId: string | undefined) => (teamId === undefined ? {} : { teamId });

const makeCnameRecord = (
  name: string,
  zoneId: string | undefined,
  recordName: string,
  content: string,
  importId: string | undefined,
  opts: pulumi.CustomResourceOptions
) =>
  zoneId === undefined
    ? undefined
    : new cloudflare.DnsRecord(
        name,
        {
          comment: "Managed by Pulumi for storybook.yeebois.com Vercel routing.",
          content,
          name: recordName,
          proxied: false,
          ttl: 1,
          type: "CNAME",
          zoneId,
        },
        {
          ...opts,
          ...O.getSomesStruct({ import: O.fromUndefinedOr(importId) }),
        }
      );

/**
 * Import-safe Pulumi component for the `@beep/ui` Storybook deployment.
 *
 * @example
 * ```ts
 * import { StorybookStack, makeStorybookStackArgsFromConfigValues } from "@beep/infra"
 *
 * console.log(StorybookStack)
 * console.log(makeStorybookStackArgsFromConfigValues)
 * ```
 *
 * @category resources
 * @since 0.0.0
 */
export class StorybookStack extends pulumi.ComponentResource {
  /**
   * Vercel project identifier.
   *
   * @since 0.0.0
   */
  public readonly vercelProjectId: pulumi.Output<string>;

  /**
   * Custom domain attached to the Storybook Vercel project.
   *
   * @since 0.0.0
   */
  public readonly domain: pulumi.Output<string>;

  public constructor(
    name: string,
    args: StorybookStackArgs = StorybookStackArgs.make({}),
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("beep:infra:StorybookStack", name, {}, opts);

    const project = new vercel.Project(
      `${name}-vercel-project`,
      {
        ...optionalTeamArgs(args.vercel.teamId),
        automaticallyExposeSystemEnvironmentVariables: true,
        buildCommand: args.vercel.buildCommand,
        gitRepository: {
          repo: args.vercel.repository,
          type: "github",
        },
        installCommand: args.vercel.installCommand,
        name: args.vercel.projectName,
        outputDirectory: args.vercel.outputDirectory,
        rootDirectory: args.vercel.rootDirectory,
        vercelAuthentication: {
          deploymentType: args.vercel.vercelAuthenticationDeploymentType,
        },
      },
      { parent: this }
    );

    const projectDomain = args.dns.attachDomain
      ? new vercel.ProjectDomain(
          `${name}-storybook-domain`,
          {
            ...optionalTeamArgs(args.vercel.teamId),
            domain: args.dns.domain,
            projectId: project.id,
          },
          { parent: this }
        )
      : undefined;

    if (args.dns.attachDomain) {
      makeCnameRecord(
        `${name}-dns-storybook`,
        args.dns.cloudflareZoneId,
        args.dns.domain,
        args.dns.vercelCnameTarget,
        args.dns.dnsRecordImportId,
        {
          dependsOn: projectDomain === undefined ? [] : [projectDomain],
          parent: this,
        }
      );
    }

    this.vercelProjectId = project.id;
    this.domain = pulumi.output(projectDomain?.domain ?? args.dns.domain);

    this.registerOutputs({
      domain: this.domain,
      vercelProjectId: this.vercelProjectId,
    });
  }
}
