/**
 * `@beep/nlp-mcp` public package entrypoint.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * @since 0.0.0
 * @category layers
 */
export * from "./Server.ts";
/**
 * @since 0.0.0
 * @category layers
 */
export { StreamingToolkitHandlersLive } from "./StreamingHandlers.ts";
/**
 * @since 0.0.0
 * @category toolkit
 */
export { StreamingToolkit } from "./StreamingTools.ts";
