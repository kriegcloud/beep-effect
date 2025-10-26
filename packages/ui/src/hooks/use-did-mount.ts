"use client";
import type { UnsafeTypes } from "@beep/types";
import type { Noop } from "@beep/ui-core/utils";
import { createHandlerSetter } from "@beep/ui-core/utils";
import * as F from "effect/Function";
import { useEffect, useRef } from "react";

/**
 * Returns a callback setter for a function to be performed when the component did mount.
 */
export const useDidMount = <TCallback extends UnsafeTypes.UnsafeFn = Noop>(callback?: TCallback) => {
  const mountRef = useRef(false);
  const [handler, setHandler] = createHandlerSetter<undefined>(callback);

  useEffect(() => {
    if (F.isFunction(handler?.current) && !mountRef.current) {
      handler.current();
      mountRef.current = true;
    }
  }, []);

  return setHandler;
};
