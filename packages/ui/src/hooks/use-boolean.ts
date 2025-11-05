"use client";
import type { Dispatch, SetStateAction } from "react";

import { useCallback, useState } from "react";

/**
 * Custom hook to manage a boolean state with utility functions to set it to true, false, or toggle its value.
 *
 * @param {boolean} [defaultValue=false] - The initial value of the boolean state.
 *
 * @example
 * const { value, onTrue, onFalse, onToggle } = useBoolean(false);
 *
 * return (
 *   <div>
 *     <p>Value: {value.toString()}</p>
 *     <button onClick={onTrue}>Set True</button>
 *     <button onClick={onFalse}>Set False</button>
 *     <button onClick={onToggle}>Toggle</button>
 *   </div>
 * );
 */

export type UseBooleanReturn = {
  readonly value: boolean;
  readonly onTrue: () => void;
  readonly onFalse: () => void;
  readonly onToggle: () => void;
  readonly setValue: Dispatch<SetStateAction<boolean>>;
};

export function useBoolean(defaultValue = false): UseBooleanReturn {
  const [value, setValue] = useState(defaultValue);

  const onTrue = useCallback(() => {
    setValue(true);
  }, []);

  const onFalse = useCallback(() => {
    setValue(false);
  }, []);

  const onToggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return {
    value,
    onTrue,
    onFalse,
    onToggle,
    setValue,
  };
}
