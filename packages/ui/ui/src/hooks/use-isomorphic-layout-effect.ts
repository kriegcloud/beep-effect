"use client";
import * as P from "effect/Predicate";
import { useEffect, useLayoutEffect } from "react";

export const useIsomorphicLayoutEffect = P.isNotUndefined(window) ? useLayoutEffect : useEffect;
