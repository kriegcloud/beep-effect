import { $UiId } from "@beep/identity";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { Match, pipe } from "effect";
import * as Bool from "effect/Boolean";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import React, { useCallback, useRef, useState } from "react";

const $I = $UiId.create("hooks/useSpinner");

const SpinnerAction = LiteralKit(["increment", "decrement"]).pipe(
  $I.annoteSchema("SpinnerAction", {
    description: "Spinner directions supported by the number-input long-press hook.",
  })
);

type SpinnerAction = typeof SpinnerAction.Type;

class SpinnerSchedule extends S.Class<SpinnerSchedule>($I`SpinnerSchedule`)(
  {
    continuousChangeInterval: NonNegativeInt,
    continuousChangeDelay: NonNegativeInt,
  },
  $I.annote("SpinnerSchedule", {
    description: "Timing configuration used while a spinner button is held down.",
  })
) {}

const decodeSpinnerSchedule = S.decodeUnknownSync(SpinnerSchedule);

const spinnerSchedule = decodeSpinnerSchedule({
  continuousChangeInterval: 50,
  continuousChangeDelay: 300,
});

const noopVoid = (): void => {};

function canUseDOM(): boolean {
  return (
    typeof window !== "undefined" &&
    window.document !== undefined &&
    P.isNotNull(window.document) &&
    P.isFunction(window.document.createElement)
  );
}

const isBrowser = canUseDOM();

const useSafeLayoutEffect = isBrowser ? React.useLayoutEffect : React.useEffect;

function useCallbackRef<TArgs extends ReadonlyArray<unknown>, TResult>(
  fn: (...args: TArgs) => TResult,
  deps: React.DependencyList = []
): (...args: TArgs) => TResult {
  const ref = React.useRef(fn);

  useSafeLayoutEffect(() => {
    ref.current = fn;
  });

  return React.useCallback((...args: TArgs) => ref.current(...args), deps);
}

function useInterval(callback: () => void, delay: number | null) {
  const fn = useCallbackRef(callback);

  React.useEffect(() => {
    if (delay === null) {
      return;
    }

    const intervalId = window.setInterval(fn, delay);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [delay, fn]);
}

function useUnmountEffect(fn: () => void, deps: React.DependencyList = []) {
  React.useEffect(
    () => () => {
      fn();
    },
    deps
  );
}

/**
 * React hook used by spinner buttons to repeatedly increment or decrement a value
 * while the button remains pressed.
 *
 * The hook performs one immediate step on press, waits for the configured hold delay,
 * and then repeats the selected action at a fixed interval until `stop` is called.
 *
 * @example
 * ```tsx
 * import React from "react"
 * import { useSpinner } from "@beep/ui/hooks/useSpinner"
 *
 * function Example() {
 *   const [value, setValue] = React.useState(0)
 *   const spinner = useSpinner(
 *     () => setValue((current) => current + 1),
 *     () => setValue((current) => current - 1)
 *   )
 *
 *   return React.createElement(
 *     "button",
 *     { onMouseDown: () => spinner.up(), onMouseUp: spinner.stop },
 *     value
 *   )
 * }
 *
 * void Example
 * ```
 *
 * @category React
 * @param increment {(params?: T) => void} - Callback invoked for upward spinner movement.
 * @param decrement {(params?: T) => void} - Callback invoked for downward spinner movement.
 * @returns {{ up: (params?: T) => void; down: (params?: T) => void; stop: () => void }} - Spinner controls for starting and stopping repeated actions.
 * @since 0.0.0
 */
export function useSpinner<T>(increment: (params?: T) => void, decrement: (params?: T) => void) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [action, setAction] = useState<O.Option<SpinnerAction>>(O.none());
  const [runOnce, setRunOnce] = useState(true);

  const paramsRef = useRef<T | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const removeTimeout = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const runAction = useCallback(
    (nextAction: SpinnerAction, params?: T) => {
      pipe(
        nextAction,
        Match.type<SpinnerAction>().pipe(
          Match.when("increment", () => increment(params)),
          Match.when("decrement", () => decrement(params)),
          Match.exhaustive
        )
      );
    },
    [decrement, increment]
  );

  useInterval(
    () => {
      pipe(
        action,
        O.match({
          onNone: noopVoid,
          onSome: (nextAction) => runAction(nextAction, paramsRef.current),
        })
      );
    },
    isSpinning ? spinnerSchedule.continuousChangeInterval : null
  );

  const scheduleSpin = useCallback(
    (nextAction: SpinnerAction, params?: T) => {
      paramsRef.current = params;

      Bool.match(runOnce, {
        onTrue: () => runAction(nextAction, params),
        onFalse: noopVoid,
      });

      timeoutRef.current = setTimeout(() => {
        setRunOnce(false);
        setIsSpinning(true);
        setAction(O.some(nextAction));
      }, spinnerSchedule.continuousChangeDelay);
    },
    [runAction, runOnce]
  );

  const up = useCallback(
    (params?: T) => {
      scheduleSpin("increment", params);
    },
    [scheduleSpin]
  );

  const down = useCallback(
    (params?: T) => {
      scheduleSpin("decrement", params);
    },
    [scheduleSpin]
  );

  const stop = useCallback(() => {
    paramsRef.current = undefined;
    setRunOnce(true);
    setIsSpinning(false);
    setAction(O.none());
    removeTimeout();
  }, [removeTimeout]);

  useUnmountEffect(removeTimeout);

  return { up, down, stop };
}
