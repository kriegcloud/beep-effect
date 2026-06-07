/**
 * Pulumi orchestration surface for the public Storybook app.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $InfraId } from "@beep/identity/packages";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import { Struct } from "@beep/utils";
import * as O from "@beep/utils/Option";
import * as pulumi from "@pulumi/pulumi";
import * as vercel from "@pulumiverse/vercel";
import * as S from "effect/Schema";

const $I = $InfraId.create("Storybook");

const defaultBuildCommand = "cd ../.. && bun run storybook:build";
const defaultInstallCommand = "cd ../.. && bun install";
const defaultOutputDirectory = "storybook-static";
const defaultProductionBranch = "main";
const defaultProjectName = "beep-storybook";
const defaultRepository = "kriegcloud/beep-effect";
const defaultRootDirectory = "apps/storybook";
const defaultVercelAuthenticationDeploymentType: StorybookVercelAuthenticationDeploymentType = "none";

type StorybookPulumiConfigValues = {
  readonly buildCommand?: string | undefined;
  readonly installCommand?: string | undefined;
  readonly outputDirectory?: string | undefined;
  readonly productionBranch?: string | undefined;
  readonly projectName?: string | undefined;
  readonly repository?: string | undefined;
  readonly rootDirectory?: string | undefined;
  readonly vercelAuthenticationDeploymentType?: StorybookVercelAuthenticationDeploymentType | undefined;
  readonly vercelTeamId?: string | undefined;
};

const StorybookVercelAuthenticationDeploymentType = LiteralKit([
  "standardProtectionNew",
  "standardProtection",
  "allDeployments",
  "onlyPreviewDeployments",
  "none",
]);
type StorybookVercelAuthenticationDeploymentType = typeof StorybookVercelAuthenticationDeploymentType.Type;

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
    buildCommand: S.String,
    installCommand: S.String,
    outputDirectory: S.String,
    productionBranch: S.String,
    projectName: S.String,
    repository: S.String,
    rootDirectory: S.String,
    vercelAuthenticationDeploymentType: StorybookVercelAuthenticationDeploymentType,
    vercelTeamId: S.String,
  },
  $I.annote("StorybookPulumiConfigValues", {
    description: "Optional Pulumi config values before Storybook deploy defaults are applied.",
  })
).mapFields(Struct.map(S.optionalKey));

/**
 * Vercel project configuration for `@beep/storybook`.
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
    productionBranch: S.String.pipe(SchemaUtils.withKeyDefaults(defaultProductionBranch)),
    projectName: S.String.pipe(SchemaUtils.withKeyDefaults(defaultProjectName)),
    repository: S.String.pipe(SchemaUtils.withKeyDefaults(defaultRepository)),
    rootDirectory: S.String.pipe(SchemaUtils.withKeyDefaults(defaultRootDirectory)),
    teamId: S.optionalKey(S.String),
    vercelAuthenticationDeploymentType: StorybookVercelAuthenticationDeploymentType.pipe(
      SchemaUtils.withKeyDefaults(defaultVercelAuthenticationDeploymentType)
    ),
  },
  $I.annote("StorybookVercelProjectConfig", {
    description: "Vercel project configuration for @beep/storybook.",
  })
) {}

/**
 * Pulumi-facing args for the Storybook Vercel stack.
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
    vercel: StorybookVercelProjectConfig.pipe(SchemaUtils.withKeyDefaults(StorybookVercelProjectConfig.make())),
  },
  $I.annote("StorybookStackArgs", {
    description: "Pulumi-facing args for the Storybook Vercel stack.",
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
 *   projectName: "beep-storybook-preview",
 * })
 *
 * console.log(args.vercel.projectName)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeStorybookStackArgsFromConfigValues = ({
  buildCommand,
  installCommand,
  outputDirectory,
  productionBranch,
  projectName,
  repository,
  rootDirectory,
  vercelAuthenticationDeploymentType,
  vercelTeamId,
}: StorybookPulumiConfigValues = {}): StorybookStackArgs =>
  StorybookStackArgs.make({
    vercel: StorybookVercelProjectConfig.make(
      O.getSomesStruct({
        buildCommand: O.fromUndefinedOr(buildCommand),
        installCommand: O.fromUndefinedOr(installCommand),
        outputDirectory: O.fromUndefinedOr(outputDirectory),
        productionBranch: O.fromUndefinedOr(productionBranch),
        projectName: O.fromUndefinedOr(projectName),
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
 * console.log(loadStorybookStackArgs().vercel.projectName)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadStorybookStackArgs = (): StorybookStackArgs => {
  const config = new pulumi.Config("storybook");

  return makeStorybookStackArgsFromConfigValues({
    buildCommand: config.get("buildCommand"),
    installCommand: config.get("installCommand"),
    outputDirectory: config.get("outputDirectory"),
    productionBranch: config.get("productionBranch"),
    projectName: config.get("projectName"),
    repository: config.get("repository"),
    rootDirectory: config.get("rootDirectory"),
    vercelAuthenticationDeploymentType: config.get("vercelAuthenticationDeploymentType") as
      | StorybookVercelAuthenticationDeploymentType
      | undefined,
    vercelTeamId: config.get("vercelTeamId"),
  });
};

const optionalTeamArgs = (teamId: string | undefined) => (teamId === undefined ? {} : { teamId });

/**
 * Import-safe Pulumi component for the public Storybook Vercel project.
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
   * Vercel project name.
   *
   * @since 0.0.0
   */
  public readonly projectName: pulumi.Output<string>;

  /**
   * Vercel root directory for the Storybook app.
   *
   * @since 0.0.0
   */
  public readonly rootDirectory: pulumi.Output<string>;

  /**
   * Static output directory served by Vercel.
   *
   * @since 0.0.0
   */
  public readonly outputDirectory: pulumi.Output<string>;

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
          productionBranch: args.vercel.productionBranch,
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

    this.vercelProjectId = project.id;
    this.projectName = pulumi.output(args.vercel.projectName);
    this.rootDirectory = pulumi.output(args.vercel.rootDirectory);
    this.outputDirectory = pulumi.output(args.vercel.outputDirectory);

    this.registerOutputs({
      outputDirectory: this.outputDirectory,
      projectName: this.projectName,
      rootDirectory: this.rootDirectory,
      vercelProjectId: this.vercelProjectId,
    });
  }
}
