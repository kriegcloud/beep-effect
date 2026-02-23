"use client";
import { useCallback, useState } from "react";

/**
 * Custom hook to manage state with utility functions to set state, set a specific field, and reset state.
 *
 * @param {T} initialState - The initial state value.
 *
 * @returns {UseSetStateReturn<T>} - An object containing:
 * - `state`: The current state.
 * - `resetState`: A function to reset the state to the initial value.
 * - `setState`: A function to update the state.
 * - `setField`: A function to update a specific field in the state.
 *
 * @example
 * const { state, setState, setField, resetState } = useSetState({ name: '', age: 0 });
 *
 * return (
 *   <div>
 *     <p>Name: {state.name}</p>
 *     <p>Age: {state.age}</p>
 *     <button onClick={() => setField('name', 'John')}>Set Name</button>
 *     <button onClick={resetState}>Reset</button>
 *   </div>
 * );
 */

export type UseSetStateReturn<T> = {
  readonly state: T;
  readonly resetState: (defaultState?: T | undefined) => void;
  readonly setState: (updateState: T | Partial<T>) => void;
  readonly setField: (name: keyof T, updateValue: T[keyof T]) => void;
};

export function useSetState<T>(initialState?: T | undefined): UseSetStateReturn<T> {
  const [state, setState] = useState<T | undefined>(initialState);

  const updateState = useCallback((newState: T | Partial<T>) => {
    setState((prevValue) => ({ ...prevValue, ...newState }) as T);
  }, []);

  const updateField = useCallback(
    (fieldName: keyof T, updateValue: T[keyof T]) => {
      updateState({ [fieldName]: updateValue } as Partial<T>);
    },
    [updateState]
  );

  const resetState = useCallback(
    (defaultState?: T | undefined) => {
      setState(defaultState ?? initialState);
    },
    [initialState]
  );

  return {
    state: state as T,
    setState: updateState,
    setField: updateField,
    resetState,
  };
}
