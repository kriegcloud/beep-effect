/**
 * Runtime configuration models for the Runpod driver.
 *
 * @packageDocumentation
 * @since 0.1.0
 */

import { $RunpodId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $RunpodId.create("Runpod.config");

/**
 * Default Runpod REST API v1 base URL.
 *
 * @example
 * ```ts
 * import { RUNPOD_API_URL } from "@beep/runpod"
 *
 * console.log(RUNPOD_API_URL)
 * ```
 *
 * @category constants
 * @since 0.1.0
 */
export const RUNPOD_API_URL = "https://rest.runpod.io/v1";

/**
 * Default Runpod documentation index URL for LLM-oriented docs.
 *
 * @example
 * ```ts
 * import { RUNPOD_DOCS_INDEX_URL } from "@beep/runpod"
 *
 * console.log(RUNPOD_DOCS_INDEX_URL)
 * ```
 *
 * @category constants
 * @since 0.1.0
 */
export const RUNPOD_DOCS_INDEX_URL = "https://docs.runpod.io/llms.txt";

/**
 * Runtime configuration accepted by {@link Runpod.makeLayer}.
 *
 * @example
 * ```ts
 * import { RunpodConfigInput } from "@beep/runpod"
 *
 * const config = RunpodConfigInput.make({
 *   apiUrl: "https://rest.runpod.io/v1",
 *   headers: { "x-client": "beep" }
 * })
 * console.log(config.apiUrl)
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodConfigInput extends S.Class<RunpodConfigInput>($I`RunpodConfigInput`)(
  {
    apiKey: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
    apiUrl: S.String.pipe(SchemaUtils.withKeyDefaults(RUNPOD_API_URL)),
    headers: S.Record(S.String, S.String).pipe(SchemaUtils.withKeyDefaults(R.empty())),
  },
  $I.annote("RunpodConfigInput", {
    description: "Runtime configuration accepted by the Runpod REST API driver layer.",
  })
) {}

/**
 * Runtime configuration accepted by {@link RunpodDocs.makeLayer}.
 *
 * @example
 * ```ts
 * import { RunpodDocsConfigInput } from "@beep/runpod"
 *
 * const config = RunpodDocsConfigInput.make({
 *   indexUrl: "https://docs.runpod.io/llms.txt"
 * })
 * console.log(config.indexUrl)
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodDocsConfigInput extends S.Class<RunpodDocsConfigInput>($I`RunpodDocsConfigInput`)(
  {
    headers: S.Record(S.String, S.String).pipe(SchemaUtils.withKeyDefaults(R.empty())),
    indexUrl: S.String.pipe(SchemaUtils.withKeyDefaults(RUNPOD_DOCS_INDEX_URL)),
  },
  $I.annote("RunpodDocsConfigInput", {
    description: "Runtime configuration accepted by the Runpod documentation index driver layer.",
  })
) {}
