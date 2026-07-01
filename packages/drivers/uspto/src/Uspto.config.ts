/**
 * Runtime configuration models for the USPTO Open Data Portal driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $UsptoId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $UsptoId.create("Uspto.config");

/**
 * Default USPTO Open Data Portal API base URL.
 *
 * @example
 * ```ts
 * import { USPTO_API_URL } from "@beep/uspto"
 *
 * console.log(USPTO_API_URL)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const USPTO_API_URL = "https://api.uspto.gov";

/**
 * Runtime configuration accepted by {@link Uspto.makeLayer}.
 *
 * @example
 * ```ts
 * import { Redacted } from "effect"
 * import { UsptoConfigInput } from "@beep/uspto"
 *
 * const config = UsptoConfigInput.make({ apiKey: Redacted.make("test-key") })
 * console.log(config)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export class UsptoConfigInput extends S.Class<UsptoConfigInput>($I`UsptoConfigInput`)(
  {
    apiKey: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
    apiUrl: S.String.pipe(SchemaUtils.withKeyDefaults(USPTO_API_URL)),
  },
  $I.annote("UsptoConfigInput", {
    description: "Typed configuration for the USPTO Open Data Portal driver: API key and base URL.",
  })
) {}
