"use client";

import { getStorage, removeStorage, setStorage } from "@beep/ui-core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Custom hook to manage state with local storage.
 *
 * @param {string} key - The key for the local storage.
 * @param {T} initialState - The initial state value.
 * @param {Object} [options] - Optional settings.
 * @param {boolean} [options.initializeWithValue=true] - Whether to initialize the local storage with the initial state value.
 *
 * @returns {UseLocalStorageReturn<T>} - An object containing:
 * - `state`: The current state.
 * - `resetState`: A function to reset the state to the initial value and remove it from local storage.
 * - `setState`: A function to update the state and save it to local storage.
 * - `setField`: A function to update a specific field in the state and save it to local storage.
 *
 * @example
 * const { state, resetState, setState, setField } = useLocalStorage('settings', initialState);
 *
 * return (
 *   <div>
 *     <p>State: {JSON.stringify(state)}</p>
 *     <button onClick={() => setState({name: 'John', age: 20})}>Set State</button>
 *     <button onClick={() => setField('name', 'John')}>Set Name</button>
 *     <button onClick={resetState}>Reset</button>
 *   </div>
 * );
 */

export type UseLocalStorageOptions = {
  initializeWithValue?: boolean;
};

export type UseLocalStorageReturn<T> = {
  state: T;
  resetState: (defaultState?: T) => void;
  setState: (updateState: T | Partial<T>) => void;
  setField: (name: keyof T, updateValue: T[keyof T]) => void;
};

export function useLocalStorage<T>(
  key: string,
  initialState?: T,
  options?: UseLocalStorageOptions
): UseLocalStorageReturn<T> {
  const { initializeWithValue = true } = options ?? {};
  const isObjectState = initialState && typeof initialState === "object";

  const [state, setState] = useState<T | undefined>(initialState);

  useEffect(() => {
    const storedValue = getStorage<T>(key);

    if (storedValue) {
      if (isObjectState) {
        setState((prevState) => ({ ...prevState, ...storedValue }));
      } else {
        setState(storedValue);
      }
    } else if (initialState && initializeWithValue) {
      setStorage(key, initialState);
    }
  }, []);

  const updateState = useCallback(
    (newState: T | Partial<T>) => {
      if (isObjectState) {
        setState((prevValue) => {
          const updatedState = { ...prevValue, ...newState } as T;
          setStorage<T>(key, updatedState);
          return updatedState;
        });
      } else {
        setStorage<T>(key, newState as T);
        setState(newState as T);
      }
    },
    [key, isObjectState]
  );

  const updateField = useCallback(
    (fieldName: keyof T, updateValue: T[keyof T]) => {
      if (isObjectState) {
        updateState({ [fieldName]: updateValue } as Partial<T>);
      }
    },
    [isObjectState, updateState]
  );

  const resetState = useCallback(
    (defaultState?: T) => {
      setState(defaultState ?? initialState);
      removeStorage(key);
    },
    [initialState, key]
  );

  return useMemo(
    () => ({
      state: state as T,
      setState: updateState,
      setField: updateField,
      resetState,
    }),
    [resetState, updateField, updateState, state]
  );
}
