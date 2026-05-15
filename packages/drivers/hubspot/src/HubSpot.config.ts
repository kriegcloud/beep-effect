/**
 * Runtime configuration models for the HubSpot driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $HubspotId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $HubspotId.create("HubSpot.config");

/**
 * Default HubSpot Forms API base URL.
 *
 * @example
 * ```ts
 * import { HUBSPOT_FORMS_API_URL } from "@beep/hubspot"
 *
 * console.log(HUBSPOT_FORMS_API_URL) // "https://api.hsforms.com"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const HUBSPOT_FORMS_API_URL = "https://api.hsforms.com";

/**
 * Default HubSpot CRM API base URL.
 *
 * @example
 * ```ts
 * import { HUBSPOT_CRM_API_URL } from "@beep/hubspot"
 *
 * console.log(HUBSPOT_CRM_API_URL) // "https://api.hubapi.com"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const HUBSPOT_CRM_API_URL = "https://api.hubapi.com";

/**
 * Runtime configuration accepted by {@link HubSpot.makeLayer}.
 *
 * @example
 * ```ts
 * import { HubSpotConfigInput } from "@beep/hubspot"
 *
 * const config = new HubSpotConfigInput({
 *   accountId: "12345",
 *   formsApiUrl: "https://api.hsforms.com"
 * })
 *
 * console.log(config.accountId) // "12345"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HubSpotConfigInput extends S.Class<HubSpotConfigInput>($I`HubSpotConfigInput`)(
  {
    accountId: S.optionalKey(S.String),
    accessToken: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
    crmApiUrl: S.optionalKey(S.String),
    formsApiUrl: S.optionalKey(S.String),
    headers: S.optionalKey(S.Record(S.String, S.String)),
  },
  $I.annote("HubSpotConfigInput", {
    description: "Runtime configuration accepted by the HubSpot API driver layer.",
  })
) {}
