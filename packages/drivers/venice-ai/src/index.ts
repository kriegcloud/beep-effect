/**
 * @beep/venice-ai
 *
 * @since 0.0.0
 */

export {
  VENICE_API_URL,
  VENICE_CHAT_MODEL,
  VENICE_FAVORITE_JOKE_PROMPT,
  VeniceAiChat,
  VeniceAiChatError,
} from "./VeniceAI.service.ts";

/**
 * Current version of the `@beep/venice-ai` package.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/venice-ai"
 *
 * console.log(VERSION)
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;
