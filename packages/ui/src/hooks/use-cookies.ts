"use client";
import type { CookieOptions } from "@beep/ui-core/utils";
import { getCookie, removeCookie, setCookie } from "@beep/ui-core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Custom hook to manage state with cookies.
 *
 * @template T
 * @param {string} key - The key for the cookie.
 * @param {T} initialState - The initial state value.
 * @param {UseCookiesOptions} [options] - Optional settings.
 *
 * @returns {UseCookiesReturn<T>} - An object containing:
 * - `state`: The current state.
 * - `resetState`: A function to reset the state to the initial value and remove the cookie.
 * - `setState`: A function to update the state and save it to the cookie.
 * - `setField`: A function to update a specific field in the state and save it to the cookie.
 *
 * @example
 * const { state, setState, setField, resetState } = useCookies('user', { name: '', age: 0 });
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
export type UseCookiesOptions = CookieOptions & {
  initializeWithValue?: boolean;
};

export type UseCookiesReturn<T> = {
  state: T;
  resetState: (defaultState?: T) => void;
  setState: (updateState: T | Partial<T>) => void;
  setField: (name: keyof T, updateValue: T[keyof T]) => void;
};

export function useCookies<T>(key: string, initialState?: T, options?: UseCookiesOptions): UseCookiesReturn<T> {
  const { initializeWithValue = true, ...cookieOptions } = options ?? {};
  const isObjectState = initialState && typeof initialState === "object";

  const [state, setState] = useState<T | undefined>(initialState);

  useEffect(() => {
    const storedValue = getCookie<T>(key);

    if (storedValue) {
      if (isObjectState) {
        setState((prevValue) => ({ ...prevValue, ...storedValue }));
      } else {
        setState(storedValue);
      }
    } else if (initialState && initializeWithValue) {
      // setCookie is async; intentionally fire-and-forget with error handling inside
      void setCookie<T>(key, initialState as T, cookieOptions);
    }
  }, []);

  const updateState = useCallback(
    (newState: T | Partial<T>) => {
      if (isObjectState) {
        setState((prevValue) => {
          const updatedState = { ...prevValue, ...newState } as T;
          // setCookie is async; we deliberately do not await in state setter
          void setCookie<T>(key, updatedState, cookieOptions);
          return updatedState;
        });
      } else {
        // setCookie is async; fire-and-forget with internal error handling
        void setCookie<T>(key, newState as T, cookieOptions);
        setState(newState as T);
      }
    },
    [cookieOptions, isObjectState, key]
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
      removeCookie(key);
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
