"use client";
import * as F from "effect/Function";
import type { RefObject } from "react";
import { useRef } from "react";
/**
 * Typed generic callback function, used mostly internally
 * to defined callback setters
 */
export type SomeCallback<TArgs, TResult = void> = (...args: TArgs[]) => TResult;

/**
 * A callback setter is generally used to set the value of
 * a callback that will be used to perform updates
 */
export type CallbackSetter<TArgs> = (nextCallback: SomeCallback<TArgs>) => void;

/**
 * Returns an array where the first item is the [ref](https://reactjs.org/docs/hooks-reference.html#useref) to a
 * callback function and the second one is a reference to a function for can change the first ref.
 *
 * Although it looks quite similar to [useState](https://reactjs.org/docs/hooks-reference.html#usestate),
 * in this case the setter just makes sure the given callback is indeed a new function.
 * **Setting a callback ref does not force your component to re-render.**
 *
 * `createHandlerSetter` is meant to be used internally to abstracting other hooks.
 * Don't use this function to abstract hooks outside this library as it changes quite often
 */
export const createHandlerSetter = <TArgs, TResult = void>(callback?: SomeCallback<TArgs, TResult> | undefined) => {
  const handlerRef = useRef(callback);

  const setHandler = useRef((nextCallback: SomeCallback<TArgs, TResult>) => {
    if (!F.isFunction(nextCallback)) {
      throw new Error("the argument supplied to the 'setHandler' function should be of type function");
    }

    handlerRef.current = nextCallback;
  });

  return [handlerRef, setHandler.current] as [RefObject<SomeCallback<TArgs, TResult>>, CallbackSetter<TArgs>];
};
