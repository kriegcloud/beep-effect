import * as Duration from "effect/Duration";

type AnyFunction = (this: unknown, ...args: readonly unknown[]) => unknown;

export interface DebouncedFunc<T extends AnyFunction> {
  (...args: Parameters<T>): ReturnType<T>;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
  pending(): boolean;
}

export interface DebounceOptions {
  readonly leading?: boolean;
  readonly trailing?: boolean;
  readonly maxWait?: Duration.DurationInput;
}

const defaultNow = () => Date.now();

const startTimer = (callback: () => void, wait: number) => globalThis.setTimeout(callback, wait);

const cancelTimer = (id: ReturnType<typeof setTimeout> | undefined) => {
  if (id !== undefined) {
    globalThis.clearTimeout(id);
  }
};

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
