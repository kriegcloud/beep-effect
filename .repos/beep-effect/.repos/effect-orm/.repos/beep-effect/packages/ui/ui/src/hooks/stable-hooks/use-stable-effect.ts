"use client";
import type { StableHookOptions } from "@beep/ui/hooks/stable-hooks/types";
import { useEqMemoize } from "@beep/ui/hooks/stable-hooks/use-eq-memoize";
import type * as Equivalence from "effect/Equivalence";
import React from "react";

export const useStableEffect = <A extends ReadonlyArray<unknown>>(
  callback: React.EffectCallback,
  dependencies: A,
  eq: Equivalence.Equivalence<A>,
  options?: StableHookOptions | undefined
): ReturnType<typeof React.useEffect> => React.useEffect(callback, useEqMemoize(dependencies, eq, options));
