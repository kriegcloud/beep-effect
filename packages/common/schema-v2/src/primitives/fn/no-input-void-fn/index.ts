/**
 * Re-export for the no-input void function schema helpers.
 *
 * @example
 * import { NoInputVoidFn } from "@beep/schema-v2/primitives/fn/no-input-void-fn";
 *
 * const handler = NoInputVoidFn.implement((_ignored: void) => undefined);
 *
 * handler(undefined);
 *
 * @category Primitives/Fn
 * @since 0.1.0
 */
export * as NoInputVoidFn from "./no-input-void-fn";
