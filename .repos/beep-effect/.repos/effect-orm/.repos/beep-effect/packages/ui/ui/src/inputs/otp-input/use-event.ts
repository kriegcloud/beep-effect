import type { UnsafeTypes } from "@beep/types";
import React from "react";

export function useEvent<T extends UnsafeTypes.UnsafeFn>(callback?: undefined | T): T {
  const ref = React.useRef<UnsafeTypes.UnsafeFn | undefined>(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });

  React.useInsertionEffect(() => {
    ref.current = callback;
  });

  return React.useCallback<UnsafeTypes.UnsafeFn>((...args) => {
    return ref.current?.(...args);
  }, []) as T;
}
