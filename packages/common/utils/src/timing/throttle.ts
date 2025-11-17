/**
 * Throttle helpers layered on top of `Utils.debounce`, giving the namespace a
 * cohesive timing surface.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const throttleModuleLogger = Utils.throttle(() => {}, 100);
 * throttleModuleLogger();
 * const throttleModulePending: FooTypes.Prettify<boolean> = throttleModuleLogger.pending();
 * void throttleModulePending;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import * as Duration from "effect/Duration";

import type { DebouncedFunc } from "./debounce";
import { debounce } from "./debounce";

type AnyFunction = (this: unknown, ...args: readonly unknown[]) => unknown;

/**
 * Options controlling leading/trailing behavior for throttled functions.
 *
 * @example
 * import type { ThrottleOptions } from "@beep/utils/timing/throttle";
 *
 * const options: ThrottleOptions = { trailing: false };
 *
 * @category Timing/Throttle
 * @since 0.1.0
 */
export interface ThrottleOptions {
  readonly leading?: boolean | undefined;
  readonly trailing?: boolean | undefined;
}

/**
 * Creates a throttled version of a function using the debouncer under the
 * hood, ensuring at most one call per wait interval.
 *
 * @example
 * import { throttle } from "@beep/utils/timing/throttle";
 *
 * const handler = throttle(() => console.log("scroll"), 250);
 *
 * @category Timing/Throttle
 * @since 0.1.0
 */
export const throttle = <T extends AnyFunction>(
  func: T,
  wait: Duration.DurationInput = 0,
  options: ThrottleOptions = {}
): DebouncedFunc<T> => {
  const leading = options.leading ?? true;
  const trailing = options.trailing ?? true;
  const waitMs = Duration.toMillis(wait);

  return debounce(func, waitMs, {
    leading,
    trailing,
    maxWait: waitMs,
  });
};
