/**
 * Beep Graph client bridge.
 *
 * ManagedRuntime-based bridge for integrating Beep Graph Effect
 * services into React/browser applications.
 *
 * @module
 * @since 0.1.0
 */

/**
 * Runtime client helpers for Beep Graph consumers.
 *
 * @example
 * ```ts
 * import { BeepGraphClient } from "@beep/graph-client";
 *
 * const module = BeepGraphClient;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as BeepGraphClient from "./BeepGraphClient.ts";
/**
 * Managed runtime wiring for browser and app integrations.
 *
 * @example
 * ```ts
 * import { Runtime } from "@beep/graph-client";
 *
 * const module = Runtime;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Runtime from "./Runtime.ts";
