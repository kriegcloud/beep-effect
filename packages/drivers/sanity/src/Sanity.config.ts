/**
 * Runtime configuration models for the Sanity driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SanityId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SanityId.create("Sanity.config");

const SanityProjectId = S.String.check(S.isPattern(/^[a-z0-9][a-z0-9-]*$/u)).pipe(
  $I.annoteSchema("SanityProjectId", {
    description: "Sanity project id safe for use as a first-party Sanity API subdomain.",
  })
);

const SanityDataset = S.String.check(S.isPattern(/^[A-Za-z0-9_-]+$/u)).pipe(
  $I.annoteSchema("SanityDataset", {
    description: "Sanity dataset name accepted in first-party API paths.",
  })
);

const SanityApiVersion = S.String.check(S.isPattern(/^\d{4}-\d{2}-\d{2}$/u)).pipe(
  $I.annoteSchema("SanityApiVersion", {
    description: "Date-shaped Sanity API version string.",
  })
);

/**
 * Default Sanity API version used when callers do not provide one.
 *
 * @example
 * ```ts
 * import { SANITY_API_VERSION } from "@beep/sanity"
 *
 * console.log(SANITY_API_VERSION) // "2025-05-14"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SANITY_API_VERSION = "2025-05-14";

/**
 * Runtime configuration accepted by {@link Sanity.makeLayer}.
 *
 * @example
 * ```ts
 * import { SANITY_API_VERSION, SanityConfigInput } from "@beep/sanity"
 *
 * const config = SanityConfigInput.make({
 *   apiVersion: SANITY_API_VERSION,
 *   dataset: "production",
 *   projectId: "content-project"
 * })
 *
 * console.log(config.dataset) // "production"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SanityConfigInput extends S.Class<SanityConfigInput>($I`SanityConfigInput`)(
  {
    apiHost: S.optionalKey(S.String),
    apiToken: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
    apiVersion: SanityApiVersion.pipe(SchemaUtils.withKeyDefaults(SANITY_API_VERSION)),
    dataset: S.optionalKey(SanityDataset),
    headers: S.optionalKey(S.Record(S.String, S.String)),
    projectId: S.optionalKey(SanityProjectId),
  },
  $I.annote("SanityConfigInput", {
    description: "Runtime configuration accepted by the Sanity API driver layer.",
  })
) {}
