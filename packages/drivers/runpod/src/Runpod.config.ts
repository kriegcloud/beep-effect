/**
 * Runtime configuration models for the Runpod driver.
 *
 * @packageDocumentation
 * @since 0.1.0
 */

import { $RunpodId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $RunpodId.create("Runpod.config");

/**
 * Default Runpod REST API v1 base URL.
 *
 * @category constants
 * @since 0.1.0
 */
export const RUNPOD_API_URL = "https://rest.runpod.io/v1";

/**
 * Default Runpod documentation index URL for LLM-oriented docs.
 *
 * @category constants
 * @since 0.1.0
 */
export const RUNPOD_DOCS_INDEX_URL = "https://docs.runpod.io/llms.txt";

/**
 * Runtime configuration accepted by {@link Runpod.makeLayer}.
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodConfigInput extends S.Class<RunpodConfigInput>($I`RunpodConfigInput`)(
  {
    apiKey: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
    apiUrl: S.optionalKey(S.String),
    headers: S.optionalKey(S.Record(S.String, S.String)),
  },
  $I.annote("RunpodConfigInput", {
    description: "Runtime configuration accepted by the Runpod REST API driver layer.",
  })
) {}

/**
 * Runtime configuration accepted by {@link RunpodDocs.makeLayer}.
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodDocsConfigInput extends S.Class<RunpodDocsConfigInput>($I`RunpodDocsConfigInput`)(
  {
    headers: S.optionalKey(S.Record(S.String, S.String)),
    indexUrl: S.optionalKey(S.String),
  },
  $I.annote("RunpodDocsConfigInput", {
    description: "Runtime configuration accepted by the Runpod documentation index driver layer.",
  })
) {}
