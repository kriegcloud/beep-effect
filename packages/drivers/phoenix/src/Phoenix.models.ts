/**
 * Schema-backed request and response models for the Phoenix driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PhoenixId } from "@beep/identity";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import { Effect } from "effect";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $PhoenixId.create("Phoenix.models");

/**
 * Driver health states returned by {@link Phoenix.doctor}.
 *
 * @example
 * ```ts
 * import { PhoenixDoctorStatus } from "@beep/phoenix"
 *
 * console.log(PhoenixDoctorStatus.Enum.passed)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PhoenixDoctorStatus = LiteralKit(["passed", "unavailable"]).pipe(
  $I.annoteSchema("PhoenixDoctorStatus", {
    description: "Phoenix driver health states returned by the doctor operation.",
  })
);

/**
 * Type for {@link PhoenixDoctorStatus}.
 *
 * @category models
 * @since 0.0.0
 */
export type PhoenixDoctorStatus = typeof PhoenixDoctorStatus.Type;

/**
 * Selector kinds used when addressing Phoenix datasets.
 *
 * @example
 * ```ts
 * import { PhoenixDatasetSelectorKind } from "@beep/phoenix"
 *
 * console.log(PhoenixDatasetSelectorKind.Enum["dataset-name"])
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PhoenixDatasetSelectorKind = LiteralKit(["dataset-id", "dataset-name"]).pipe(
  $I.annoteSchema("PhoenixDatasetSelectorKind", {
    description: "Selector kinds used when addressing Phoenix datasets.",
  })
);

/**
 * Type for {@link PhoenixDatasetSelectorKind}.
 *
 * @category models
 * @since 0.0.0
 */
export type PhoenixDatasetSelectorKind = typeof PhoenixDatasetSelectorKind.Type;

/**
 * Phoenix annotation target kind.
 *
 * @example
 * ```ts
 * import { PhoenixAnnotationTargetKind } from "@beep/phoenix"
 *
 * console.log(PhoenixAnnotationTargetKind.Enum.trace)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PhoenixAnnotationTargetKind = LiteralKit(["span", "session", "trace"]).pipe(
  $I.annoteSchema("PhoenixAnnotationTargetKind", {
    description: "Phoenix annotation target kinds supported by the driver.",
  })
);

/**
 * Type for {@link PhoenixAnnotationTargetKind}.
 *
 * @category models
 * @since 0.0.0
 */
export type PhoenixAnnotationTargetKind = typeof PhoenixAnnotationTargetKind.Type;

/**
 * Phoenix annotator kind.
 *
 * @example
 * ```ts
 * import { PhoenixAnnotatorKind } from "@beep/phoenix"
 *
 * console.log(PhoenixAnnotatorKind.Enum.CODE)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PhoenixAnnotatorKind = LiteralKit(["CODE", "HUMAN", "LLM"]).pipe(
  $I.annoteSchema("PhoenixAnnotatorKind", {
    description: "Phoenix annotator kinds supported by annotation writes.",
  })
);

/**
 * Type for {@link PhoenixAnnotatorKind}.
 *
 * @category models
 * @since 0.0.0
 */
export type PhoenixAnnotatorKind = typeof PhoenixAnnotatorKind.Type;

/**
 * Primitive annotation value accepted by repo-owned Phoenix annotations.
 *
 * @example
 * ```ts
 * import { PhoenixAnnotationValue } from "@beep/phoenix"
 *
 * console.log(PhoenixAnnotationValue)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PhoenixAnnotationValue = S.Union([S.Boolean, S.Finite, S.String]).pipe(
  $I.annoteSchema("PhoenixAnnotationValue", {
    description: "Primitive annotation value accepted by repo-owned Phoenix annotations.",
  })
);

/**
 * Type for {@link PhoenixAnnotationValue}.
 *
 * @category models
 * @since 0.0.0
 */
export type PhoenixAnnotationValue = typeof PhoenixAnnotationValue.Type;

/**
 * Prompt chat roles accepted by repo-owned Phoenix prompt templates.
 *
 * @example
 * ```ts
 * import { PhoenixPromptChatRole } from "@beep/phoenix"
 *
 * console.log(PhoenixPromptChatRole.Enum.system)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PhoenixPromptChatRole = LiteralKit([
  "ai",
  "assistant",
  "developer",
  "model",
  "system",
  "tool",
  "user",
]).pipe(
  $I.annoteSchema("PhoenixPromptChatRole", {
    description: "Prompt chat roles accepted by repo-owned Phoenix prompt templates.",
  })
);

/**
 * Type for {@link PhoenixPromptChatRole}.
 *
 * @category models
 * @since 0.0.0
 */
export type PhoenixPromptChatRole = typeof PhoenixPromptChatRole.Type;

/**
 * Prompt template format accepted by repo-owned Phoenix prompt templates.
 *
 * @example
 * ```ts
 * import { PhoenixPromptTemplateFormat } from "@beep/phoenix"
 *
 * console.log(PhoenixPromptTemplateFormat.Enum.MUSTACHE)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PhoenixPromptTemplateFormat = LiteralKit(["F_STRING", "MUSTACHE"]).pipe(
  $I.annoteSchema("PhoenixPromptTemplateFormat", {
    description: "Prompt template formats accepted by repo-owned Phoenix prompt templates.",
  })
);

/**
 * Type for {@link PhoenixPromptTemplateFormat}.
 *
 * @category models
 * @since 0.0.0
 */
export type PhoenixPromptTemplateFormat = typeof PhoenixPromptTemplateFormat.Type;

/**
 * Prompt model providers supported by the Phoenix SDK helper without extra invocation parameters.
 *
 * @example
 * ```ts
 * import { PhoenixPromptModelProvider } from "@beep/phoenix"
 *
 * console.log(PhoenixPromptModelProvider.Enum.GOOGLE)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PhoenixPromptModelProvider = LiteralKit([
  "OPENAI",
  "AZURE_OPENAI",
  "GOOGLE",
  "DEEPSEEK",
  "XAI",
  "OLLAMA",
  "AWS",
]).pipe(
  $I.annoteSchema("PhoenixPromptModelProvider", {
    description: "Prompt model providers supported by the Phoenix driver prompt creation path.",
  })
);

/**
 * Type for {@link PhoenixPromptModelProvider}.
 *
 * @category models
 * @since 0.0.0
 */
export type PhoenixPromptModelProvider = typeof PhoenixPromptModelProvider.Type;

/**
 * Phoenix driver doctor result.
 *
 * @example
 * ```ts
 * import { PhoenixDoctorResult } from "@beep/phoenix"
 *
 * const result = PhoenixDoctorResult.make({
 *   baseUrl: "https://phoenix.test",
 *   message: "Phoenix is reachable.",
 *   status: "passed",
 *   version: "1.2.3"
 * })
 * console.log(result.status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixDoctorResult extends S.Class<PhoenixDoctorResult>($I`PhoenixDoctorResult`)(
  {
    baseUrl: S.String,
    message: S.String,
    status: PhoenixDoctorStatus,
    version: S.NullOr(S.String),
  },
  $I.annote("PhoenixDoctorResult", {
    description: "Phoenix driver doctor result with sanitized connectivity status.",
  })
) {}

/**
 * Phoenix dataset selector.
 *
 * @example
 * ```ts
 * import { PhoenixDatasetSelector } from "@beep/phoenix"
 *
 * const selector = PhoenixDatasetSelector.make({ kind: "dataset-name", value: "agent-loop-health-v1" })
 * console.log(selector.value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixDatasetSelector extends S.Class<PhoenixDatasetSelector>($I`PhoenixDatasetSelector`)(
  {
    kind: PhoenixDatasetSelectorKind,
    splits: S.Array(S.String).pipe(S.optionalKey),
    value: S.String,
    versionId: S.optionalKey(S.String),
  },
  $I.annote("PhoenixDatasetSelector", {
    description: "Phoenix dataset selector by dataset id or dataset name.",
  })
) {}

/**
 * Phoenix dataset example.
 *
 * @example
 * ```ts
 * import { PhoenixDatasetExample } from "@beep/phoenix"
 *
 * const example = PhoenixDatasetExample.make({
 *   input: { task: "score-loop-health" },
 *   metadata: { suite: "agent-effectiveness" }
 * })
 * console.log(example.input)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixDatasetExample extends S.Class<PhoenixDatasetExample>($I`PhoenixDatasetExample`)(
  {
    id: S.optionalKey(S.String),
    input: S.Record(S.String, S.Unknown),
    metadata: S.Record(S.String, S.Unknown).pipe(
      S.withConstructorDefault(Effect.succeed({})),
      S.withDecodingDefaultKey(Effect.succeed({}))
    ),
    output: S.Record(S.String, S.Unknown).pipe(S.NullOr, S.optionalKey),
    spanId: S.String.pipe(S.NullOr, S.optionalKey),
    splits: S.Union([S.String, S.Array(S.String)]).pipe(S.NullOr, S.optionalKey),
  },
  $I.annote("PhoenixDatasetExample", {
    description: "Phoenix dataset example with sanitized input, output, metadata, and optional span linkage.",
  })
) {}

/**
 * Input for creating or replacing a Phoenix dataset.
 *
 * @example
 * ```ts
 * import { PhoenixDatasetCreateInput, PhoenixDatasetExample } from "@beep/phoenix"
 *
 * const input = PhoenixDatasetCreateInput.make({
 *   description: "Agent loop health examples.",
 *   examples: [PhoenixDatasetExample.make({ input: { task: "loop-health" } })],
 *   name: "agent-loop-health-v1"
 * })
 * console.log(input.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixDatasetCreateInput extends S.Class<PhoenixDatasetCreateInput>($I`PhoenixDatasetCreateInput`)(
  {
    description: S.String,
    examples: S.Array(PhoenixDatasetExample),
    name: S.String,
  },
  $I.annote("PhoenixDatasetCreateInput", {
    description: "Input for creating or idempotently replacing a Phoenix dataset.",
  })
) {}

/**
 * Result from creating a Phoenix dataset.
 *
 * @example
 * ```ts
 * import { PhoenixDatasetCreateResult } from "@beep/phoenix"
 *
 * const result = PhoenixDatasetCreateResult.make({ datasetId: "dataset-id" })
 * console.log(result.datasetId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixDatasetCreateResult extends S.Class<PhoenixDatasetCreateResult>($I`PhoenixDatasetCreateResult`)(
  {
    datasetId: S.String,
  },
  $I.annote("PhoenixDatasetCreateResult", {
    description: "Result from creating or replacing a Phoenix dataset.",
  })
) {}

/**
 * Input for appending examples to a Phoenix dataset.
 *
 * @example
 * ```ts
 * import { PhoenixDatasetAppendInput, PhoenixDatasetExample, PhoenixDatasetSelector } from "@beep/phoenix"
 *
 * const input = PhoenixDatasetAppendInput.make({
 *   dataset: PhoenixDatasetSelector.make({ kind: "dataset-name", value: "agent-outcomes-v1" }),
 *   examples: [PhoenixDatasetExample.make({ input: { task: "outcome" } })]
 * })
 * console.log(input.dataset.kind)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixDatasetAppendInput extends S.Class<PhoenixDatasetAppendInput>($I`PhoenixDatasetAppendInput`)(
  {
    dataset: PhoenixDatasetSelector,
    examples: S.Array(PhoenixDatasetExample),
  },
  $I.annote("PhoenixDatasetAppendInput", {
    description: "Input for appending examples to an existing Phoenix dataset.",
  })
) {}

/**
 * Result from appending Phoenix dataset examples.
 *
 * @example
 * ```ts
 * import { PhoenixDatasetAppendResult } from "@beep/phoenix"
 *
 * const result = PhoenixDatasetAppendResult.make({ datasetId: "dataset-id", versionId: "version-id" })
 * console.log(result.versionId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixDatasetAppendResult extends S.Class<PhoenixDatasetAppendResult>($I`PhoenixDatasetAppendResult`)(
  {
    datasetId: S.String,
    versionId: S.String,
  },
  $I.annote("PhoenixDatasetAppendResult", {
    description: "Result from appending examples to a Phoenix dataset.",
  })
) {}

/**
 * Readback summary for a Phoenix dataset.
 *
 * @example
 * ```ts
 * import { PhoenixDatasetInfoResult } from "@beep/phoenix"
 *
 * const result = PhoenixDatasetInfoResult.make({ datasetId: "dataset-id", name: "agent-outcomes-v1" })
 * console.log(result.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixDatasetInfoResult extends S.Class<PhoenixDatasetInfoResult>($I`PhoenixDatasetInfoResult`)(
  {
    datasetId: S.String,
    description: S.NullOr(S.String).pipe(SchemaUtils.withKeyDefaults(null)),
    metadata: S.Record(S.String, S.Unknown).pipe(SchemaUtils.withKeyDefaults(R.empty())),
    name: S.String,
  },
  $I.annote("PhoenixDatasetInfoResult", {
    description: "Readback summary for a Phoenix dataset.",
  })
) {}

/**
 * Readback result for Phoenix dataset examples.
 *
 * @example
 * ```ts
 * import { PhoenixDatasetExamplesResult } from "@beep/phoenix"
 *
 * const result = PhoenixDatasetExamplesResult.make({ examples: [], versionId: "version-id" })
 * console.log(result.examples.length)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixDatasetExamplesResult extends S.Class<PhoenixDatasetExamplesResult>(
  $I`PhoenixDatasetExamplesResult`
)(
  {
    examples: S.Array(PhoenixDatasetExample),
    versionId: S.String,
  },
  $I.annote("PhoenixDatasetExamplesResult", {
    description: "Readback result for Phoenix dataset examples.",
  })
) {}

/**
 * Phoenix prompt chat message.
 *
 * @example
 * ```ts
 * import { PhoenixPromptChatMessage } from "@beep/phoenix"
 *
 * const message = PhoenixPromptChatMessage.make({ content: "Score {{caseId}}", role: "user" })
 * console.log(message.role)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixPromptChatMessage extends S.Class<PhoenixPromptChatMessage>($I`PhoenixPromptChatMessage`)(
  {
    content: S.String,
    role: PhoenixPromptChatRole,
  },
  $I.annote("PhoenixPromptChatMessage", {
    description: "Phoenix prompt chat message used by repo-owned prompt templates.",
  })
) {}

/**
 * Input for creating a repo-owned Phoenix prompt version.
 *
 * @example
 * ```ts
 * import { PhoenixPromptChatMessage, PhoenixPromptCreateInput } from "@beep/phoenix"
 *
 * const input = PhoenixPromptCreateInput.make({
 *   modelName: "gpt-4o-mini",
 *   modelProvider: "OPENAI",
 *   name: "agent-effectiveness-review-evaluator-v1",
 *   template: [PhoenixPromptChatMessage.make({ content: "Review {{caseId}}", role: "user" })]
 * })
 * console.log(input.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixPromptCreateInput extends S.Class<PhoenixPromptCreateInput>($I`PhoenixPromptCreateInput`)(
  {
    description: S.optionalKey(S.String),
    metadata: S.Record(S.String, S.Unknown).pipe(SchemaUtils.withKeyDefaults(R.empty())),
    modelName: S.String,
    modelProvider: PhoenixPromptModelProvider.pipe(SchemaUtils.withKeyDefaults(PhoenixPromptModelProvider.Enum.OPENAI)),
    name: S.String,
    template: S.Array(PhoenixPromptChatMessage),
    templateFormat: PhoenixPromptTemplateFormat.pipe(
      SchemaUtils.withKeyDefaults(PhoenixPromptTemplateFormat.Enum.MUSTACHE)
    ),
    versionDescription: S.optionalKey(S.String),
  },
  $I.annote("PhoenixPromptCreateInput", {
    description: "Input for creating a repo-owned Phoenix prompt version.",
  })
) {}

/**
 * Result from creating a Phoenix prompt version.
 *
 * @example
 * ```ts
 * import { PhoenixPromptWriteResult } from "@beep/phoenix"
 *
 * const result = PhoenixPromptWriteResult.make({ name: "prompt", promptVersionId: "version-id" })
 * console.log(result.promptVersionId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixPromptWriteResult extends S.Class<PhoenixPromptWriteResult>($I`PhoenixPromptWriteResult`)(
  {
    name: S.String,
    promptVersionId: S.String,
  },
  $I.annote("PhoenixPromptWriteResult", {
    description: "Result from creating a Phoenix prompt version.",
  })
) {}

/**
 * Phoenix prompt selector by name, id, version id, or tag.
 *
 * @example
 * ```ts
 * import { PhoenixPromptSelector } from "@beep/phoenix"
 *
 * const selector = PhoenixPromptSelector.make({ name: "agent-effectiveness-review-evaluator-v1" })
 * console.log(selector.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixPromptSelector extends S.Class<PhoenixPromptSelector>($I`PhoenixPromptSelector`)(
  {
    name: S.optionalKey(S.String),
    promptId: S.optionalKey(S.String),
    tag: S.optionalKey(S.String),
    versionId: S.optionalKey(S.String),
  },
  $I.annote("PhoenixPromptSelector", {
    description: "Phoenix prompt selector by prompt id, name, version id, or name plus tag.",
  })
) {}

/**
 * Readback result for a Phoenix prompt selector.
 *
 * @example
 * ```ts
 * import { PhoenixPromptReadResult } from "@beep/phoenix"
 *
 * const result = PhoenixPromptReadResult.make({ exists: true, promptVersionId: "version-id" })
 * console.log(result.exists)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixPromptReadResult extends S.Class<PhoenixPromptReadResult>($I`PhoenixPromptReadResult`)(
  {
    exists: S.Boolean,
    promptVersionId: S.NullOr(S.String),
  },
  $I.annote("PhoenixPromptReadResult", {
    description: "Readback result for a Phoenix prompt selector.",
  })
) {}

/**
 * Input for creating a Phoenix experiment record.
 *
 * @example
 * ```ts
 * import { PhoenixExperimentCreateInput } from "@beep/phoenix"
 *
 * const input = PhoenixExperimentCreateInput.make({
 *   datasetId: "dataset-id",
 *   experimentName: "agent-effectiveness-deterministic-v1"
 * })
 * console.log(input.datasetId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixExperimentCreateInput extends S.Class<PhoenixExperimentCreateInput>(
  $I`PhoenixExperimentCreateInput`
)(
  {
    datasetId: S.String,
    datasetVersionId: S.optionalKey(S.String),
    experimentDescription: S.optionalKey(S.String),
    experimentMetadata: S.Record(S.String, S.Unknown).pipe(SchemaUtils.withKeyDefaults(R.empty())),
    experimentName: S.optionalKey(S.String),
    repetitions: S.Finite.pipe(SchemaUtils.withKeyDefaults(1)),
    splits: S.Array(S.String).pipe(S.optionalKey),
  },
  $I.annote("PhoenixExperimentCreateInput", {
    description: "Input for creating a Phoenix experiment record without running billable model work.",
  })
) {}

/**
 * Readback summary for a Phoenix experiment.
 *
 * @example
 * ```ts
 * import { PhoenixExperimentInfoResult } from "@beep/phoenix"
 *
 * const result = PhoenixExperimentInfoResult.make({
 *   datasetId: "dataset-id",
 *   datasetVersionId: "version-id",
 *   exampleCount: 1,
 *   experimentId: "experiment-id",
 *   failedRunCount: 0,
 *   missingRunCount: 1,
 *   repetitions: 1,
 *   successfulRunCount: 0
 * })
 * console.log(result.experimentId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixExperimentInfoResult extends S.Class<PhoenixExperimentInfoResult>($I`PhoenixExperimentInfoResult`)(
  {
    datasetId: S.String,
    datasetVersionId: S.String,
    exampleCount: S.Finite,
    experimentId: S.String,
    failedRunCount: S.Finite,
    metadata: S.Record(S.String, S.Unknown).pipe(SchemaUtils.withKeyDefaults(R.empty())),
    missingRunCount: S.Finite,
    projectName: S.NullOr(S.String).pipe(SchemaUtils.withKeyDefaults(null)),
    repetitions: S.Finite,
    successfulRunCount: S.Finite,
  },
  $I.annote("PhoenixExperimentInfoResult", {
    description: "Readback summary for a Phoenix experiment record.",
  })
) {}

/**
 * Input for writing one Phoenix annotation.
 *
 * @example
 * ```ts
 * import { PhoenixAnnotationInput } from "@beep/phoenix"
 *
 * const input = PhoenixAnnotationInput.make({
 *   label: "passed",
 *   name: "agent.outcome",
 *   targetId: "trace-id",
 *   targetKind: "trace"
 * })
 * console.log(input.targetKind)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixAnnotationInput extends S.Class<PhoenixAnnotationInput>($I`PhoenixAnnotationInput`)(
  {
    annotatorKind: PhoenixAnnotatorKind.pipe(SchemaUtils.withKeyDefaults(PhoenixAnnotatorKind.Enum.CODE)),
    explanation: S.optionalKey(S.String),
    identifier: S.optionalKey(S.String),
    label: S.optionalKey(S.String),
    metadata: S.Record(S.String, S.Unknown).pipe(SchemaUtils.withKeyDefaults(R.empty())),
    name: S.String,
    score: S.optionalKey(S.Finite),
    sync: S.Boolean.pipe(SchemaUtils.withKeyDefaults(true)),
    targetId: S.String,
    targetKind: PhoenixAnnotationTargetKind,
  },
  $I.annote("PhoenixAnnotationInput", {
    description: "Input for writing one Phoenix span, session, or trace annotation.",
  })
) {}

/**
 * Result from writing one Phoenix annotation.
 *
 * @example
 * ```ts
 * import { PhoenixAnnotationWriteResult } from "@beep/phoenix"
 *
 * const result = PhoenixAnnotationWriteResult.make({
 *   annotationId: "annotation-id",
 *   name: "agent.outcome",
 *   targetId: "trace-id",
 *   targetKind: "trace"
 * })
 * console.log(result.annotationId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixAnnotationWriteResult extends S.Class<PhoenixAnnotationWriteResult>(
  $I`PhoenixAnnotationWriteResult`
)(
  {
    annotationId: S.NullOr(S.String),
    name: S.String,
    targetId: S.String,
    targetKind: PhoenixAnnotationTargetKind,
  },
  $I.annote("PhoenixAnnotationWriteResult", {
    description: "Result from writing one Phoenix annotation.",
  })
) {}
