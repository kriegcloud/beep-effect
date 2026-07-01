/**
 * Runtime configuration models for the Phoenix driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PhoenixId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $PhoenixId.create("Phoenix.config");

/**
 * Default Phoenix HTTP API base URL.
 *
 * @example
 * ```ts
 * import { PHOENIX_API_URL } from "@beep/phoenix"
 *
 * console.log(PHOENIX_API_URL)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const PHOENIX_API_URL = "http://localhost:6006";

/**
 * Runtime configuration accepted by {@link Phoenix.makeLayer}.
 *
 * @example
 * ```ts
 * import { Redacted } from "effect"
 * import { PhoenixConfigInput } from "@beep/phoenix"
 *
 * const config = PhoenixConfigInput.make({
 *   apiKey: Redacted.make("test-key"),
 *   baseUrl: "https://phoenix.test"
 * })
 *
 * console.log(config.baseUrl)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PhoenixConfigInput extends S.Class<PhoenixConfigInput>($I`PhoenixConfigInput`)(
  {
    apiKey: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
    baseUrl: S.String.pipe(SchemaUtils.withKeyDefaults(PHOENIX_API_URL)),
    headers: S.Record(S.String, S.String).pipe(SchemaUtils.withKeyDefaults(R.empty())),
  },
  $I.annote("PhoenixConfigInput", {
    description: "Runtime configuration accepted by the Phoenix API driver layer.",
  })
) {}
