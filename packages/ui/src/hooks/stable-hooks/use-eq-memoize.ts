"use client";
import type * as Equivalence from "effect/Equivalence";
import React from "react";
import type { StableHookOptions } from "./types";

// Use effect prior art comes from
// https://github.com/kentcdodds/use-deep-compare-effect/blob/master/src/index.ts
export const useEqMemoize = <A extends ReadonlyArray<unknown>>(
  value: A,
  eq: Equivalence.Equivalence<A>,
  options?: StableHookOptions
) => {
  const ref = React.useRef<A>(null);
  const [signal, setSignal] = React.useState(0);

  if (ref.current == null) {
    ref.current = value;
  }

  if (!eq(value, ref.current)) {
    // https://stackoverflow.com/questions/35469836/detecting-production-vs-development-react-at-runtime
    if (options?.debug && process.env.NODE_ENV !== "production") {
      console.info("Stable hook update triggered:", {
        prev: ref.current,
        value,
      });
    }
    ref.current = value;
    setSignal((x) => x + 1);
  }

  return [signal];
};
