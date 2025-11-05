import * as Duration from "effect/Duration";

import type { DebouncedFunc } from "./debounce";
import { debounce } from "./debounce";

type AnyFunction = (this: unknown, ...args: readonly unknown[]) => unknown;

export interface ThrottleOptions {
  readonly leading?: boolean | undefined;
  readonly trailing?: boolean | undefined;
}

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
