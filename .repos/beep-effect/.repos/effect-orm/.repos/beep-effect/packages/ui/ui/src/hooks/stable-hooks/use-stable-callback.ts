"use client";
import type { UnsafeTypes } from "@beep/types";
import type { StableHookOptions } from "@beep/ui/hooks/stable-hooks/types";
import { useEqMemoize } from "@beep/ui/hooks/stable-hooks/use-eq-memoize";
import type * as Equivalence from "effect/Equivalence";
import React from "react";

export const useStableCallback = <
  A extends ReadonlyArray<unknown>,
  T extends (...args: Array<UnsafeTypes.UnsafeAny>) => UnsafeTypes.UnsafeAny,
>(
  callback: T,
  dependencies: A,
  eq: Equivalence.Equivalence<A>,
  options?: StableHookOptions | undefined
): T => React.useCallback(callback, useEqMemoize(dependencies, eq, options));
