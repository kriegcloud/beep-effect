"use client";
/**
 * React hook for using ReCaptcha v3 with atoms.
 *
 * This replaces the context-based useReCaptcha hook with an atom-based approach.
 * @module
 */
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import type * as O from "effect/Option";
import { useCallback, useEffect } from "react";

import {
  cleanupReCaptchaAtom,
  containerAtom,
  executeReCaptchaAtom,
  initializeReCaptchaAtom,
  isReadyAtom,
  type ReCaptchaProviderConfig,
  reCaptchaInstanceAtom,
  renderReCaptchaAtom,
} from "./recaptcha.atoms";
import type { ReCaptchaInstance } from "./types";

/**
 * Mode option for useAtomSet to return a Promise.
 * Pass this as second argument to useAtomSet for function atoms.
 */
export const atomPromise = { mode: "promise" } as const;

/**
 * Return type for the useReCaptchaAtom hook.
 */
export type UseReCaptchaAtomResult = {
  /**
   * The container element for the reCAPTCHA widget if applicable.
   */
  readonly container: O.Option<string | HTMLElement>;

  /**
   * Execute reCAPTCHA verification and get a token.
   * Returns a Promise that resolves to the token string.
   */
  readonly executeRecaptcha: (action?: string) => Promise<string>;

  /**
   * The reCAPTCHA instance (if available).
   */
  readonly reCaptchaInstance: O.Option<ReCaptchaInstance>;

  /**
   * Whether reCAPTCHA is loaded and ready.
   */
  readonly isReady: boolean;
};

/**
 * Hook to initialize and use ReCaptcha with atoms.
 *
 * This replaces the ReCaptchaProvider + useReCaptcha pattern with a single hook.
 *
 * @param config - ReCaptcha configuration
 * @returns ReCaptcha context value with atom-based APIs
 *
 * @example
 * ```tsx
 * import { useReCaptchaAtom } from "@beep/shared-client/services/react-recaptcha-v3";
 *
 * function MyComponent() {
 *   const { executeRecaptcha, isReady } = useReCaptchaAtom({
 *     reCaptchaKey: "your-site-key",
 *   });
 *
 *   const handleSubmit = async () => {
 *     if (isReady) {
 *       const token = await executeRecaptcha("submit");
 *       // Use token for verification
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleSubmit} disabled={!isReady}>
 *       Submit
 *     </button>
 *   );
 * }
 * ```
 */
export function useReCaptchaAtom(config: ReCaptchaProviderConfig): UseReCaptchaAtomResult {
  // Read atom values
  const isReady = useAtomValue(isReadyAtom);
  const reCaptchaInstance = useAtomValue(reCaptchaInstanceAtom);
  const container = useAtomValue(containerAtom);

  // Get setters for function atoms - use atomPromise mode to get Promise<string>
  const initialize = useAtomSet(initializeReCaptchaAtom);
  const executeRecaptchaFn = useAtomSet(executeReCaptchaAtom, atomPromise);
  const cleanup = useAtomSet(cleanupReCaptchaAtom);
  const render = useAtomSet(renderReCaptchaAtom);

  // Initialize on mount
  useEffect(() => {
    initialize(config);

    return () => {
      cleanup();
    };
  }, [
    config.reCaptchaKey,
    config.language,
    config.useEnterprise,
    config.useRecaptchaNet,
    config.container?.element,
    config.scriptProps?.appendTo,
    config.scriptProps?.async,
    config.scriptProps?.defer,
    config.scriptProps?.id,
    config.scriptProps?.nonce,
    config.scriptProps?.onLoadCallbackName,
    initialize,
    cleanup,
  ]);

  // Render in container when ready (for explicit mode)
  useEffect(() => {
    if (isReady && config.container?.element) {
      render();
    }
  }, [isReady, config.container?.element, render]);

  // Stable callback for executeRecaptcha
  const executeRecaptcha = useCallback(
    (action?: string): Promise<string> => executeRecaptchaFn(action),
    [executeRecaptchaFn]
  );

  return {
    container,
    executeRecaptcha,
    reCaptchaInstance,
    isReady,
  };
}

/**
 * Simpler hook that just reads the current ReCaptcha state.
 * Use this when you don't need to initialize ReCaptcha (e.g., in child components).
 *
 * @example
 * ```tsx
 * import { useReCaptchaState } from "@beep/shared-client/services/react-recaptcha-v3";
 *
 * function ChildComponent() {
 *   const { executeRecaptcha, isReady } = useReCaptchaState();
 *
 *   const handleClick = async () => {
 *     const token = await executeRecaptcha("action");
 *   };
 * }
 * ```
 */
export function useReCaptchaState(): UseReCaptchaAtomResult {
  const isReady = useAtomValue(isReadyAtom);
  const reCaptchaInstance = useAtomValue(reCaptchaInstanceAtom);
  const container = useAtomValue(containerAtom);
  const executeRecaptchaFn = useAtomSet(executeReCaptchaAtom, atomPromise);

  const executeRecaptcha = useCallback(
    (action?: string): Promise<string> => executeRecaptchaFn(action),
    [executeRecaptchaFn]
  );

  return {
    container,
    executeRecaptcha,
    reCaptchaInstance,
    isReady,
  };
}

export default useReCaptchaAtom;
