/**
 * Pulumi orchestration surface for the repo AI metrics stack.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $InfraId } from "@beep/identity/packages";
import {
  AiMetricsDeployTarget,
  AiMetricsInstallInput,
  type AiMetricsInstallSpec,
  AiMetricsTool,
  makeAiMetricsInstallSpec,
} from "@beep/repo-ai-metrics";
import * as pulumi from "@pulumi/pulumi";
import { Result } from "effect";
import * as S from "effect/Schema";

const $I = $InfraId.create("AIMetrics");

const schemaIssueToPulumiConfigError =
  (key: string, value: string) =>
  (cause: S.SchemaError["issue"]): pulumi.RunError =>
    new pulumi.RunError(`Invalid aiMetrics:${key} Pulumi config value "${value}": ${new S.SchemaError(cause).message}`);

const decodeAiMetricsDeployTarget = S.decodeUnknownResult(AiMetricsDeployTarget);
const decodeAiMetricsTool = S.decodeUnknownResult(AiMetricsTool);

const targetFromPulumiConfig = (value: string | undefined): AiMetricsDeployTarget =>
  value === undefined
    ? AiMetricsDeployTarget.Enum.local
    : Result.getOrThrowWith(decodeAiMetricsDeployTarget(value), schemaIssueToPulumiConfigError("target", value));

const toolFromPulumiConfig = (value: string | undefined): AiMetricsTool =>
  value === undefined
    ? AiMetricsTool.Enum.phoenix
    : Result.getOrThrowWith(decodeAiMetricsTool(value), schemaIssueToPulumiConfigError("defaultTool", value));

/**
 * Pulumi-facing args for the AI metrics component.
 *
 * @example
 * ```ts
 * import { AIMetricsStackArgs } from "@beep/infra"
 *
 * console.log(AIMetricsStackArgs)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AIMetricsStackArgs extends S.Class<AIMetricsStackArgs>($I`AIMetricsStackArgs`)(
  {
    install: AiMetricsInstallInput,
  },
  $I.annote("AIMetricsStackArgs", {
    description: "Pulumi-facing AI metrics install arguments resolved before component construction.",
  })
) {}

/**
 * Build Pulumi component args from a schema-first install input.
 *
 * @example
 * ```ts
 * import { makeAIMetricsStackArgs } from "@beep/infra"
 *
 * console.log(makeAIMetricsStackArgs().install.target)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeAIMetricsStackArgs = (
  install: AiMetricsInstallInput = new AiMetricsInstallInput({})
): AIMetricsStackArgs => new AIMetricsStackArgs({ install });

/**
 * Load AI metrics args from Pulumi config.
 *
 * @example
 * ```ts
 * import { loadAIMetricsStackArgs } from "@beep/infra"
 *
 * console.log(loadAIMetricsStackArgs)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const loadAIMetricsStackArgs = (): AIMetricsStackArgs => {
  const config = new pulumi.Config("aiMetrics");
  const dataRoot = config.get("dataRoot");
  const publicBaseUrl = config.get("publicBaseUrl");

  return makeAIMetricsStackArgs(
    new AiMetricsInstallInput({
      defaultTool: toolFromPulumiConfig(config.get("defaultTool")),
      ...(dataRoot === undefined ? {} : { dataRoot }),
      ...(publicBaseUrl === undefined ? {} : { publicBaseUrl }),
      target: targetFromPulumiConfig(config.get("target")),
    })
  );
};

/**
 * Import-safe Pulumi component for the AI metrics target contract.
 *
 * @example
 * ```ts
 * import { AIMetricsStack, makeAIMetricsStackArgs } from "@beep/infra"
 *
 * console.log(AIMetricsStack)
 * console.log(makeAIMetricsStackArgs)
 * ```
 *
 * @category resources
 * @since 0.0.0
 */
export class AIMetricsStack extends pulumi.ComponentResource {
  /**
   * Resolved install spec as a Pulumi output.
   *
   * @since 0.0.0
   */
  public readonly installSpec: pulumi.Output<AiMetricsInstallSpec>;

  /**
   * Raw transcript archive root.
   *
   * @since 0.0.0
   */
  public readonly rawArchiveDir: pulumi.Output<string>;

  /**
   * Derived DuckDB database path.
   *
   * @since 0.0.0
   */
  public readonly duckDbPath: pulumi.Output<string>;

  /**
   * Resolved stack name.
   *
   * @since 0.0.0
   */
  public readonly stackName: pulumi.Output<string>;

  public constructor(
    name: string,
    args: AIMetricsStackArgs = makeAIMetricsStackArgs(),
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("beep:infra:AIMetricsStack", name, {}, opts);

    const spec = makeAiMetricsInstallSpec(args.install);
    this.installSpec = pulumi.output(spec);
    this.rawArchiveDir = pulumi.output(spec.storage.rawArchiveDir);
    this.duckDbPath = pulumi.output(spec.storage.duckDbPath);
    this.stackName = pulumi.output(spec.stackName);

    this.registerOutputs({
      duckDbPath: this.duckDbPath,
      installSpec: this.installSpec,
      rawArchiveDir: this.rawArchiveDir,
      stackName: this.stackName,
    });
  }
}
