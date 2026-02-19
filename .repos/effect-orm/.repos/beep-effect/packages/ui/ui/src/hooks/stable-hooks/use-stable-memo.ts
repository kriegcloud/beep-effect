"use client";
import type { StableHookOptions } from "@beep/ui/hooks/stable-hooks/types";
import { useEqMemoize } from "@beep/ui/hooks/stable-hooks/use-eq-memoize";
import type * as Equivalence from "effect/Equivalence";
import React from "react";

export const useStableMemo = <A extends ReadonlyArray<unknown>, T>(
  factory: () => T,
  dependencies: A,
  eq: Equivalence.Equivalence<A>,
  options?: StableHookOptions | undefined
): T => React.useMemo(factory, useEqMemoize(dependencies, eq, options));
