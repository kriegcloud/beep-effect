import { type MutableRefObject, type RefCallback, useEffect, useState } from "react";

export type RefPipe<T> = T | null;

type Ref<T> = MutableRefObject<T> | RefCallback<T>;

/** Creates a pair of React state and a ref for use in a custom pipe function. */
export const usePipeRefIn = <T>(): [Ref<T>, RefPipe<T>] => {
  const [refPipe, inputRef] = useState<T | null>(null);

  return [inputRef, refPipe];
};

/**
 * Updates the value of a reference based on another reference using a pipe
 * mechanism.
 */
export const usePipeRefOut = <T>(outputRef: Ref<T>, refPipe: RefPipe<T>) => {
  useEffect(() => {
    if (refPipe) {
      if (typeof outputRef === "function") {
        outputRef(refPipe);
      } else {
        outputRef.current = refPipe;
      }
    }
  }, [outputRef, refPipe]);
};
