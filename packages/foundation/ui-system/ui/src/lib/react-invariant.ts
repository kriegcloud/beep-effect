/**
 * React invariant helpers for UI composition boundaries.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $UiId } from "@beep/identity";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $UiId.create("lib/react-invariant");

/**
 * Options for a React context invariant check.
 *
 * @category models
 * @since 0.0.0
 */
export class ReactContextInvariantOptions extends S.Class<ReactContextInvariantOptions>(
  $I`ReactContextInvariantOptions`
)(
  {
    message: S.String,
  },
  $I.annote("ReactContextInvariantOptions", {
    description: "Options for a React context invariant check.",
  })
) {}

/**
 * Require that a React context hook has been called under its provider.
 *
 * @example
 * ```ts
 * import { requireReactContext } from "@beep/ui/lib/react-invariant"
 *
 * const value = requireReactContext("ok", { message: "missing provider" })
 * console.log(value) // "ok"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const requireReactContext: {
  <Value>(context: Value | null, options: ReactContextInvariantOptions): Value;
  (options: ReactContextInvariantOptions): <Value>(context: Value | null) => Value;
} = dual(2, <Value>(context: Value | null, options: ReactContextInvariantOptions): Value => {
  if (context === null) {
    throw new Error(options.message);
  }

  return context;
});
