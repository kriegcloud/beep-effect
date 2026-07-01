/**
 * Runtime configuration models for the xAI driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $XaiId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $XaiId.create("XAi.config");

/**
 * Default xAI inference API base URL.
 *
 * @example
 * ```ts
 * import { XAI_API_URL } from "@beep/xai"
 *
 * const hostname = new URL(XAI_API_URL).hostname
 * console.log(hostname) // "api.x.ai"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const XAI_API_URL = "https://api.x.ai";

/**
 * Default xAI management API base URL.
 *
 * @example
 * ```ts
 * import { XAI_MANAGEMENT_API_URL } from "@beep/xai"
 *
 * const hostname = new URL(XAI_MANAGEMENT_API_URL).hostname
 * console.log(hostname) // "management-api.x.ai"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const XAI_MANAGEMENT_API_URL = "https://management-api.x.ai";

/**
 * Default xAI WebSocket API base URL.
 *
 * @example
 * ```ts
 * import { XAI_WEBSOCKET_URL } from "@beep/xai"
 *
 * const protocol = new URL(XAI_WEBSOCKET_URL).protocol
 * console.log(protocol) // "wss:"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const XAI_WEBSOCKET_URL = "wss://api.x.ai";

/**
 * Runtime configuration accepted by {@link XAi.makeLayer}.
 *
 * @example
 * ```ts
 * import { Redacted } from "effect"
 * import { XAiConfigInput } from "@beep/xai"
 *
 * const config = XAiConfigInput.make({
 *   apiKey: Redacted.make("test-key"),
 *   managementApiKey: Redacted.make("management-test-key")
 * })
 *
 * console.log(config)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export class XAiConfigInput extends S.Class<XAiConfigInput>($I`XAiConfigInput`)(
  {
    apiKey: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
    apiUrl: S.optionalKey(S.String),
    headers: S.optionalKey(S.Record(S.String, S.String)),
    managementApiKey: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
    managementApiUrl: S.optionalKey(S.String),
    websocketUrl: S.optionalKey(S.String),
  },
  $I.annote("XAiConfigInput", {
    description: "Runtime configuration accepted by the xAI driver layer.",
  })
) {}
