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
 * console.log(XAI_API_URL)
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
 * console.log(XAI_MANAGEMENT_API_URL)
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
 * console.log(XAI_WEBSOCKET_URL)
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
 * import { XAiConfigInput } from "@beep/xai"
 *
 * const config = new XAiConfigInput({
 *   apiKey: "test-key",
 *   managementApiKey: "management-test-key"
 * })
 *
 * void config
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export class XAiConfigInput extends S.Class<XAiConfigInput>($I`XAiConfigInput`)(
  {
    apiKey: S.optionalKey(S.String),
    apiUrl: S.optionalKey(S.String),
    headers: S.optionalKey(S.Record(S.String, S.String)),
    managementApiKey: S.optionalKey(S.String),
    managementApiUrl: S.optionalKey(S.String),
    websocketUrl: S.optionalKey(S.String),
  },
  $I.annote("XAiConfigInput", {
    description: "Runtime configuration accepted by the xAI driver layer.",
  })
) {}
