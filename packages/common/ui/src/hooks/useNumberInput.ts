import { $UiId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { flow, Match, pipe } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import { constVoid, dual, identity } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSpinner } from "./useSpinner";

const $I = $UiId.create("hooks/useNumberInput");

const NumberInputEventKey = LiteralKit([
  "ArrowDown",
  "ArrowUp",
  "ArrowLeft",
  "ArrowRight",
  "Enter",
  "Space",
  "Tab",
  "Backspace",
  "Control",
  "Meta",
  "Home",
  "End",
  "PageDown",
  "PageUp",
  "Delete",
  "Escape",
  " ",
  "Shift",
] as const).pipe(
  $I.annoteSchema("NumberInputEventKey", {
    description: "Normalized keyboard event keys recognized by the number input hook.",
  })
);

const numberInputTextPatternSource = "(-|\\+)?(0|[1-9]\\d*)?(\\.)?(\\d+)?";
const numberInputTextPattern = new RegExp(`^${numberInputTextPatternSource}$`);

type NumberInputEventKey = typeof NumberInputEventKey.Type;

type EventKeyMap = Partial<Record<NumberInputEventKey, () => void>>;

type KeyboardLikeEvent = {
  readonly key: string;
  readonly keyCode: number;
};

type ModifierKeyState = {
  readonly metaKey?: boolean | undefined;
  readonly ctrlKey?: boolean | undefined;
  readonly shiftKey?: boolean | undefined;
};

type InputHandlers = {
  readonly onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  readonly onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

type ButtonHandlers = {
  readonly onTouchStart: (event: React.TouchEvent<HTMLButtonElement>) => void;
  readonly onTouchEnd: (event: React.TouchEvent<HTMLButtonElement>) => void;
  readonly onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseUp: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseLeave: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const NumberInputText = S.String.check(
  S.isPattern(numberInputTextPattern, {
    identifier: $I`NumberInputTextPattern`,
    title: "Number Input Text",
    description: "A partial numeric string accepted while the user edits a number input.",
    message: "Number input text must be a valid editable numeric string.",
  })
).pipe(
  S.annotate(
    $I.annote("NumberInputText", {
      description: "Editable text accepted by the number input during typing.",
    })
  )
);

const isNumberInputText = S.is(NumberInputText);
const isNumberInputEventKey = S.is(NumberInputEventKey);

const NonNegativePrecision = S.Number.check(S.isInt(), S.isGreaterThanOrEqualTo(0)).pipe(
  S.annotate(
    $I.annote("NonNegativePrecision", {
      description: "A non-negative integer precision used for fixed-point formatting.",
    })
  )
);

const normalizeEventKey = (event: KeyboardLikeEvent): O.Option<NumberInputEventKey> =>
  pipe(
    event.keyCode >= 37 && event.keyCode <= 40 && !pipe(event.key, Str.startsWith("Arrow"))
      ? `Arrow${event.key}`
      : event.key,
    O.liftPredicate(isNumberInputEventKey)
  );

const isValidNumberValue = (value: number): boolean => !Number.isNaN(value);
const isVoidHandler = (value: unknown): value is () => void => P.isFunction(value);

const getMaxTouchPoints = (): number => {
  const runtimeNavigator = globalThis.navigator;

  if (P.isUndefined(runtimeNavigator)) {
    return 0;
  }

  const msMaxTouchPoints = Reflect.get(runtimeNavigator, "msMaxTouchPoints");

  return Math.max(runtimeNavigator.maxTouchPoints, P.isNumber(msMaxTouchPoints) ? msMaxTouchPoints : 0);
};

const isTouchDevice = (): boolean =>
  P.isNotUndefined(globalThis.window) && ("ontouchstart" in globalThis.window || getMaxTouchPoints() > 0);

const getNodeEnv = (): string | undefined => {
  const runtimeProcess = Reflect.get(globalThis, "process");

  if (!P.isObject(runtimeProcess) || !("env" in runtimeProcess) || !P.isObject(runtimeProcess.env)) {
    return undefined;
  }

  const nodeEnv = Reflect.get(runtimeProcess.env, "NODE_ENV");

  return P.isString(nodeEnv) ? nodeEnv : undefined;
};

const callAllHandlers =
  <T>(...handlers: ReadonlyArray<undefined | ((event: T) => void)>) =>
  (event: T) => {
    A.forEach(handlers, (handler) => {
      if (P.isFunction(handler)) {
        handler(event);
      }
    });
  };

const useIsFirstMount = () => {
  const isFirstMount = useRef(true);

  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  return isFirstMount.current;
};

/**
 * Lowest safe integer supported by the hook defaults.
 *
 * @category Constant
 * @since 0.0.0
 */
export const minSafeInteger = Number.MIN_SAFE_INTEGER ?? -9007199254740991;

/**
 * Highest safe integer supported by the hook defaults.
 *
 * @category Constant
 * @since 0.0.0
 */
export const maxSafeInteger = Number.MAX_SAFE_INTEGER ?? 9007199254740991;

/**
 * Schema describing optional numeric bounds and controlled values for number input hooks.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class BoundaryParams extends S.Class<BoundaryParams>($I`BoundaryParams`)(
  {
    defaultValue: S.optionalKey(S.Number),
    value: S.optionalKey(S.Number),
    min: S.optionalKey(S.Number),
    max: S.optionalKey(S.Number),
  },
  $I.annote("BoundaryParams", {
    description: "Optional numeric boundary settings accepted by number input hooks.",
  })
) {}

/**
 * Schema describing step and precision overrides for spinner changes.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class SpinParams extends S.Class<SpinParams>($I`SpinParams`)(
  {
    precision: S.optionalKey(NonNegativePrecision),
    step: S.optionalKey(S.Number),
  },
  $I.annote("SpinParams", {
    description: "Precision and step overrides accepted by number input increment and decrement actions.",
  })
) {}

/**
 * Convert editable number-input text into a number when the text is parseable.
 *
 * Empty strings and invalid numeric strings normalize to `undefined`.
 *
 * @example
 * ```typescript
 * import { toNumber } from "@beep/ui/hooks/useNumberInput"
 *
 * const parsed = toNumber("12.5")
 * const missing = toNumber("")
 *
 * console.log(parsed) // 12.5
 * console.log(missing) // undefined
 * ```
 *
 * @category Utility
 * @param value - Editable text from the input or parser.
 * @returns The parsed numeric value when available.
 * @since 0.0.0
 */
export const toNumber = (value: string | undefined): number | undefined =>
  pipe(
    O.fromUndefinedOr(value),
    O.filter((current) => Str.isNonEmpty(Str.trim(current))),
    O.map(Number),
    O.filter(isValidNumberValue),
    O.getOrUndefined
  );

/**
 * Format an optional numeric value using a fixed decimal precision.
 *
 * Invalid numeric values normalize to an empty string so the hook can safely render
 * controlled inputs.
 *
 * @example
 * ```typescript
 * import { numberToString } from "@beep/ui/hooks/useNumberInput"
 *
 * const formatted = numberToString(12.345, 2)
 * const empty = numberToString(undefined, 2)
 *
 * console.log(formatted) // "12.35"
 * console.log(empty) // ""
 * ```
 *
 * @category Utility
 * @param value - Numeric value to render for the input.
 * @param precision - Number of fractional digits to keep.
 * @returns The formatted text representation for the current input value.
 * @since 0.0.0
 */
export const numberToString = (value: number | undefined, precision = 0): string =>
  pipe(
    O.fromUndefinedOr(value),
    O.map((numberValue) => numberValue.toFixed(precision)),
    O.filter((result) => result !== "NaN"),
    O.getOrElse(() => "")
  );

/**
 * Compute the effective step multiplier for an increment or decrement gesture.
 *
 * Holding `meta` or `ctrl` applies a fine-grained `0.1x` multiplier, while `shift`
 * applies a coarse `10x` multiplier. The returned value is clamped so precision
 * rounding never produces a no-op step.
 *
 * @example
 * ```typescript
 * import { getStepFactor } from "@beep/ui/hooks/useNumberInput"
 *
 * const coarse = getStepFactor({ shiftKey: true }, 2, 0)
 * const fine = getStepFactor({ ctrlKey: true }, 2, 2)
 *
 * console.log(coarse) // 20
 * console.log(fine) // 0.2
 * ```
 *
 * @example
 * ```typescript
 * import { pipe } from "effect"
 * import { getStepFactor } from "@beep/ui/hooks/useNumberInput"
 *
 * const factor = pipe({ metaKey: true }, getStepFactor(5, 2))
 *
 * console.log(factor) // 0.5
 * ```
 *
 * @category Utility
 * @param event - Modifier-key state captured from the current gesture.
 * @param step - Base step configured for the number input.
 * @param precision - Decimal precision enforced by the number input.
 * @returns The effective step value for the current gesture.
 * @since 0.0.0
 */
export const getStepFactor: {
  (step: number, precision: number): (event: Partial<ModifierKeyState>) => number;
  (event: Partial<ModifierKeyState>, step: number, precision: number): number;
} = dual(3, (event: Partial<ModifierKeyState>, step: number, precision: number): number => {
  const ratio = Bool.match(event.shiftKey === true, {
    onTrue: () => 10,
    onFalse: () =>
      Bool.match(event.metaKey === true || event.ctrlKey === true, {
        onTrue: () => 0.1,
        onFalse: () => 1,
      }),
  });

  const stepFactor = ratio * step;

  return stepFactor < 1 / 10 ** precision ? step : stepFactor;
});

/**
 * Event types reported through the `onChange` metadata callback.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const NumberInputEventType = LiteralKit(["change", "blur"]).pipe(
  $I.annoteSchema("NumberInputEventType", {
    description: "The interaction that produced a number input change notification.",
  })
);

/**
 * Runtime type for {@link NumberInputEventType}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type NumberInputEventType = typeof NumberInputEventType.Type;

/**
 * Error states reported through the `onChange` metadata callback.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const NumberInputError = LiteralKit(["exceed-max", "below-min"]).pipe(
  $I.annoteSchema("NumberInputError", {
    description: "Range-validation outcomes surfaced by the number input hook.",
  })
);

/**
 * Runtime type for {@link NumberInputError}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type NumberInputError = typeof NumberInputError.Type;

/**
 * Metadata passed to `UseNumberInputOptions.onChange`.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class NumberInputChangeMetadata extends S.Class<NumberInputChangeMetadata>($I`NumberInputChangeMetadata`)(
  {
    error: S.NullOr(NumberInputError),
    eventType: S.optionalKey(NumberInputEventType),
    valueText: S.optionalKey(S.String),
  },
  $I.annote("NumberInputChangeMetadata", {
    description: "Context describing the latest number input change callback.",
  })
) {}

const getError = (value: number | undefined, min: number, max: number): NumberInputError | null => {
  if (!P.isNumber(value)) {
    return null;
  }

  return pipe(
    value,
    Match.type<number>().pipe(
      Match.when(
        (current) => current < min,
        () => NumberInputError.Enum["below-min"]
      ),
      Match.when(
        (current) => current > max,
        () => NumberInputError.Enum["exceed-max"]
      ),
      Match.orElse(() => null)
    )
  );
};

/**
 * Options accepted by {@link useNumberBoundary} and {@link useNumberInput}.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type UseNumberInputOptions = BoundaryParams &
  SpinParams & {
    /**
     * If true, the input's value will change based on mouse wheel.
     */
    readonly allowMouseWheel?: boolean | undefined;
    /**
     * When user types number directly into the input.
     * This controls the value update when you blur out of the input.
     * - If true and the value is greater than max, the value will be reset to max.
     * - Else, the value remains the same.
     */
    readonly clampValueOnBlur?: boolean | undefined;
    /**
     * This controls the value update behavior in general.
     * - If true and you use the stepper or up/down arrow keys, the value will not exceed the max or go lower than min.
     * - If false, the value will be allowed to go out of range.
     */
    readonly keepWithinRange?: boolean | undefined;
    /**
     * If true, the input will be focused as you increment or decrement the value with the stepper.
     */
    readonly focusInputOnChange?: boolean | undefined;
    readonly formatter?: ((value: string) => string) | undefined;
    readonly parser?: ((value: string) => string) | undefined;
    /**
     * Callback function invoked whenever the input value changes.
     */
    readonly onChange?: ((value: number | undefined, metadata: NumberInputChangeMetadata) => void) | undefined;
  };

/**
 * Low-level hook that manages string and numeric boundary state for a number input.
 *
 * Use this when you need number parsing, formatting, and range-aware increment/decrement
 * behavior but want to build your own DOM event handlers on top.
 *
 * @example
 * ```typescript
 * import React from "react"
 * import { useNumberBoundary } from "@beep/ui/hooks/useNumberInput"
 *
 * function Example() {
 *   const boundary = useNumberBoundary({ defaultValue: 1, step: 1 })
 *
 *   return React.createElement("input", {
 *     value: boundary.interfaceValue,
 *     onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
 *       boundary.setInterfaceValue(event.target.value),
 *   })
 * }
 *
 * void Example
 * ```
 *
 * @category React
 * @param options - Number-input boundary and formatting options.
 * @returns Managed numeric and interface state helpers.
 */
/**
 * Low-level number-input state hook for parsing, formatting, and boundary management.
 *
 * @since 0.0.0
 * @category React
 */
export const useNumberBoundary = (options: UseNumberInputOptions = {}) => {
  const {
    min = minSafeInteger,
    max = maxSafeInteger,
    defaultValue,
    value,
    precision = 0,
    step = 1,
    keepWithinRange = true,
    formatter = identity,
    parser = identity,
  } = options;

  const [interfaceValue, setInterfaceValueState] = useState<string>(() =>
    formatter(numberToString(defaultValue, precision))
  );

  const numberValue = pipe(interfaceValue, parser, toNumber);

  useEffect(() => {
    if (defaultValue === undefined && value !== numberValue) {
      setInterfaceValueState(formatter(numberToString(value, precision)));
    }
  }, [defaultValue, formatter, numberValue, precision, value]);

  const change = useCallback(
    (multiplier = 1, params: SpinParams = {}) => {
      setInterfaceValueState((current) => {
        const result = (pipe(current, parser, toNumber) ?? 0) + multiplier * (params.step ?? step);
        const digits = params.precision ?? precision;

        if (keepWithinRange) {
          if (result > max) {
            return formatter(max.toFixed(digits));
          }

          if (result < min) {
            return formatter(min.toFixed(digits));
          }
        }

        return formatter(result.toFixed(digits));
      });
    },
    [formatter, keepWithinRange, max, min, parser, precision, step]
  );

  const increment = useCallback(
    (params: SpinParams = {}) => {
      change(1, params);
    },
    [change]
  );

  const decrement = useCallback(
    (params: SpinParams = {}) => {
      change(-1, params);
    },
    [change]
  );

  return {
    numberValue,
    interfaceValue,
    setInterfaceValue: flow(formatter, setInterfaceValueState),
    increment,
    decrement,
  };
};

/**
 * Fully managed number-input hook with keyboard and spinner controls.
 *
 * @since 0.0.0
 * @category React
 */
export const useNumberInput = (options: UseNumberInputOptions = {}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    min = minSafeInteger,
    max = maxSafeInteger,
    step = 1,
    precision = 0,
    focusInputOnChange = true,
    keepWithinRange = true,
    clampValueOnBlur = true,
    allowMouseWheel = false,
    parser = identity,
    formatter = identity,
    onChange,
  } = options;

  const { interfaceValue, setInterfaceValue, numberValue, increment, decrement } = useNumberBoundary(options);

  useEffect(() => {
    if (getNodeEnv() !== "production" && focusInputOnChange && inputRef.current === null) {
      console.warn(`Cannot find inputRef, make sure to pass it to <input /> like this 👇

function NumberInput() {
  const { inputRef } = useNumberInput(options)

  return (
    <input ref={inputRef} />
  )
}
        `);
    }
  }, [focusInputOnChange, inputRef]);

  useEffect(() => {
    function handler(event: WheelEvent) {
      const isInputFocused = document.activeElement === inputRef.current;

      if (!allowMouseWheel || !isInputFocused) {
        return;
      }

      event.preventDefault();

      const stepFactor = getStepFactor(event, step, precision);
      const direction = Math.sign(event.deltaY);

      if (direction === -1) {
        increment({ step: stepFactor });
      } else if (direction === 1) {
        decrement({ step: stepFactor });
      }
    }

    const element = inputRef.current;

    if (element !== null && allowMouseWheel) {
      element.addEventListener("wheel", handler, { passive: false });

      return () => {
        element.removeEventListener("wheel", handler);
      };
    }
  }, [allowMouseWheel, decrement, increment, inputRef, precision, step]);

  const isFirstMount = useIsFirstMount();

  useEffect(() => {
    if (!isFirstMount) {
      onChange?.(numberValue, {
        valueText: interfaceValue,
        error: getError(numberValue, min, max),
        eventType: NumberInputEventType.Enum.change,
      });
    }
  }, [interfaceValue, isFirstMount, max, min, numberValue, onChange]);

  const tempInterfaceValue = useRef(interfaceValue);
  const spinner = useSpinner(increment, decrement);

  const spinUp = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    spinner.up({ step: getStepFactor(event, step, precision) });

    Bool.match(focusInputOnChange, {
      onTrue: () => inputRef.current?.focus(),
      onFalse: constVoid,
    });
  };

  const spinDown = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    spinner.down({ step: getStepFactor(event, step, precision) });

    Bool.match(focusInputOnChange, {
      onTrue: () => inputRef.current?.focus(),
      onFalse: constVoid,
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const stepFactor = getStepFactor(event, step, precision);
    const keyMap: EventKeyMap = {
      ArrowUp: () => increment({ step: stepFactor }),
      ArrowDown: () => decrement({ step: stepFactor }),
    };

    pipe(
      normalizeEventKey(event),
      O.flatMap((eventKey) => pipe(keyMap[eventKey], O.fromNullishOr, O.filter(isVoidHandler))),
      O.match({
        onNone: constVoid,
        onSome: (action) => {
          event.preventDefault();
          action();
        },
      })
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    tempInterfaceValue.current = interfaceValue;

    const result = parser(event.target.value);

    if (isNumberInputText(result)) {
      setInterfaceValue(result);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const parsedValue = parser(event.target.value);

    if (parsedValue !== "") {
      const nextNum = Number(parsedValue);
      let result = "";

      if (Number.isNaN(nextNum)) {
        result = tempInterfaceValue.current;
      } else {
        result = nextNum.toFixed(precision);

        if (clampValueOnBlur) {
          if (nextNum > max) {
            result = max.toFixed(precision);
          }

          if (nextNum < min) {
            result = min.toFixed(precision);
          }
        }
      }

      const resolvedValue = toNumber(result);

      setInterfaceValue(result);
      onChange?.(resolvedValue, {
        valueText: formatter(result),
        error: getError(resolvedValue, min, max),
        eventType: NumberInputEventType.Enum.blur,
      });
    } else {
      onChange?.(undefined, {
        valueText: "",
        error: null,
        eventType: NumberInputEventType.Enum.blur,
      });
    }
  };

  const incrementDisabled = keepWithinRange && P.isNumber(numberValue) && numberValue >= max;
  const decrementDisabled = keepWithinRange && P.isNumber(numberValue) && numberValue <= min;

  return {
    inputRef,
    getInputProps: (handlers?: Partial<InputHandlers>) => ({
      pattern: numberInputTextPatternSource,
      role: "spinbutton",
      "aria-valuemin": min,
      "aria-valuemax": max,
      autoComplete: "off",
      autoCorrect: "off",
      "aria-valuetext": interfaceValue,
      "aria-valuenow": numberValue,
      value: interfaceValue,
      onChange: handleChange,
      onBlur: callAllHandlers(handleBlur, handlers?.onBlur),
      onKeyDown: callAllHandlers(handleKeyDown, handlers?.onKeyDown),
    }),
    getIncrementProps: (handlers?: Partial<ButtonHandlers>) => ({
      tabIndex: -1,
      ...Bool.match(isTouchDevice(), {
        onTrue: () => ({
          onTouchStart: callAllHandlers(spinUp, handlers?.onTouchStart),
        }),
        onFalse: () => ({
          onMouseDown: callAllHandlers(spinUp, handlers?.onMouseDown),
        }),
      }),
      onMouseUp: callAllHandlers(spinner.stop, handlers?.onMouseUp),
      onMouseLeave: callAllHandlers(spinner.stop, handlers?.onMouseLeave),
      onTouchEnd: callAllHandlers(spinner.stop, handlers?.onTouchEnd),
      disabled: incrementDisabled,
      "aria-disabled": incrementDisabled ? true : undefined,
    }),
    getDecrementProps: (handlers?: Partial<ButtonHandlers>) => ({
      tabIndex: -1,
      ...Bool.match(isTouchDevice(), {
        onTrue: () => ({
          onTouchStart: callAllHandlers(spinDown, handlers?.onTouchStart),
        }),
        onFalse: () => ({
          onMouseDown: callAllHandlers(spinDown, handlers?.onMouseDown),
        }),
      }),
      onMouseUp: callAllHandlers(spinner.stop, handlers?.onMouseUp),
      onMouseLeave: callAllHandlers(spinner.stop, handlers?.onMouseLeave),
      onTouchEnd: callAllHandlers(spinner.stop, handlers?.onTouchEnd),
      disabled: decrementDisabled,
      "aria-disabled": decrementDisabled ? true : undefined,
    }),
  };
};
