/**
 * Debounce implementation backing `Utils.debounce`, ensuring docs capture the
 * available options and return signature through the namespace.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const timingDebounceLogger = Utils.debounce(() => {}, 200);
 * timingDebounceLogger();
 * const timingDebouncePending: FooTypes.Prettify<boolean> = timingDebounceLogger.pending();
 * void timingDebouncePending;
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import * as Duration from "effect/Duration";

type AnyFunction = (this: unknown, ...args: readonly any[]) => unknown;

/**
 * Runtime type for functions returned by `debounce`.
 *
 * @example
 * import type { DebouncedFunc } from "@beep/utils/timing/debounce";
 * import { debounce } from "@beep/utils/timing/debounce";
 *
 * const timingDebounceHandler = function (this: unknown, ...args: ReadonlyArray<unknown>) {
 *   void args;
 * };
 * const fn: DebouncedFunc<typeof timingDebounceHandler> = debounce(timingDebounceHandler, 200);
 * void fn.pending();
 *
 * @category Timing/Debounce
 * @since 0.1.0
 */
export interface DebouncedFunc<T extends AnyFunction> {
  (...args: Parameters<T>): ReturnType<T>;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
  pending(): boolean;
}

/**
 * Options controlling when the debounced function fires.
 *
 * @example
 * import type { DebounceOptions } from "@beep/utils/timing/debounce";
 *
 * const options: DebounceOptions = { leading: true };
 *
 * @category Timing/Debounce
 * @since 0.1.0
 */
export interface DebounceOptions {
  readonly leading?: boolean | undefined;
  readonly trailing?: boolean | undefined;
  readonly maxWait?: Duration.DurationInput | undefined;
}

const defaultNow = () => Date.now();

const startTimer = (callback: () => void, wait: number) => globalThis.setTimeout(callback, wait);

const cancelTimer = (id: ReturnType<typeof setTimeout> | undefined) => {
  if (id !== undefined) {
    globalThis.clearTimeout(id);
  }
};

/**
 * Creates a debounced version of a function that delays invocation until after
 * a wait period passes (optional leading/trailing behavior).
 *
 * @example
 * import { debounce } from "@beep/utils/timing/debounce";
 *
 * const onResize = debounce(() => console.log("resize"), 200);
 *
 * @category Timing/Debounce
 * @since 0.1.0
 */
export const debounce = <T extends AnyFunction>(
  func: T,
  wait: Duration.DurationInput = 0,
  options: DebounceOptions = {}
): DebouncedFunc<T> => {
  const waitMs = Duration.toMillis(wait);
  const leading = options.leading ?? false;
  const trailing = options.trailing ?? true;
  const maxWaitMs = options.maxWait !== undefined ? Duration.toMillis(options.maxWait) : undefined;

  let timerId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: ThisParameterType<T> | undefined;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  let result: ReturnType<T> | undefined;

  const invokeFunc = (time: number) => {
    lastInvokeTime = time;
    const args = lastArgs;
    const thisArg = lastThis;
    lastArgs = undefined;
    lastThis = undefined;
    result = args ? (func.apply(thisArg, args) as ReturnType<T>) : result;
    return result;
  };

  const remainingWait = (time: number) => {
    const timeSinceLastCall = lastCallTime === undefined ? 0 : time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const waitRemaining = waitMs - timeSinceLastCall;
    if (maxWaitMs === undefined) {
      return waitRemaining;
    }
    const maxWaitRemaining = maxWaitMs - timeSinceLastInvoke;
    return maxWaitRemaining < waitRemaining ? maxWaitRemaining : waitRemaining;
  };

  const shouldInvoke = (time: number) => {
    if (lastCallTime === undefined) {
      return true;
    }
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    if (timeSinceLastCall >= waitMs) {
      return true;
    }
    if (timeSinceLastCall < 0) {
      return true;
    }
    return maxWaitMs !== undefined && timeSinceLastInvoke >= maxWaitMs;
  };

  const trailingEdge = (time: number) => {
    timerId = undefined;
    if (!trailing || lastArgs === undefined) {
      lastArgs = undefined;
      lastThis = undefined;
      return result;
    }
    return invokeFunc(time);
  };

  const timerExpired = () => {
    const time = defaultNow();
    if (shouldInvoke(time)) {
      trailingEdge(time);
    } else if (lastCallTime !== undefined) {
      timerId = startTimer(timerExpired, remainingWait(time));
    }
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;
    timerId = startTimer(timerExpired, waitMs);
    if (leading) {
      return invokeFunc(time);
    }
    return result;
  };

  const cancel = () => {
    cancelTimer(timerId);
    lastInvokeTime = 0;
    lastArgs = undefined;
    lastCallTime = undefined;
    lastThis = undefined;
    timerId = undefined;
  };

  const flush = () => {
    if (timerId === undefined) {
      return result;
    }
    return trailingEdge(defaultNow());
  };

  const pending = () => timerId !== undefined;

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
    const time = defaultNow();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return (leadingEdge(time) ?? result) as ReturnType<T>;
      }
      if (maxWaitMs !== undefined) {
        timerId = startTimer(timerExpired, waitMs);
        return invokeFunc(time) as ReturnType<T>;
      }
    }
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, waitMs);
    }
    return result as ReturnType<T>;
  } as DebouncedFunc<T>;

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced;
};
