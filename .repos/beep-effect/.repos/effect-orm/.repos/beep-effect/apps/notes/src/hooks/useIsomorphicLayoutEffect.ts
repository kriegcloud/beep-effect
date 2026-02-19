import { useEffect, useLayoutEffect } from "react";

/**
 * Determines the appropriate effect hook to use based on the environment. If
 * the code is running on the client-side (browser), it uses the
 * `useLayoutEffect` hook, otherwise, it uses the `useEffect` hook.
 */
export const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
