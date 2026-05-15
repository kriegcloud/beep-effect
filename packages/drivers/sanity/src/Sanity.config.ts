/**
 * Runtime configuration models for the Sanity driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SanityId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SanityId.create("Sanity.config");

/**
 * Default Sanity API version used by the OPIP web integration.
 *
 * @category constants
 * @since 0.0.0
 */
export const SANITY_API_VERSION = "2025-05-14";

/**
 * Runtime configuration accepted by {@link Sanity.makeLayer}.
 *
 * @category models
 * @since 0.0.0
 */
export class SanityConfigInput extends S.Class<SanityConfigInput>($I`SanityConfigInput`)(
  {
    apiHost: S.optionalKey(S.String),
    apiToken: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
    apiVersion: S.optionalKey(S.String),
    dataset: S.optionalKey(S.String),
    headers: S.optionalKey(S.Record(S.String, S.String)),
    projectId: S.optionalKey(S.String),
  },
  $I.annote("SanityConfigInput", {
    description: "Runtime configuration accepted by the Sanity API driver layer.",
  })
) {}
