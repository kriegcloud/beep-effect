/**
 * ReCaptcha v3 React integration with Effect atoms.
 *
 * This module provides an Effect-first implementation of Google ReCaptcha v3 for React applications
 * using @effect-atom/atom-react for state management.
 *
 * @example
 * ```tsx
 * import { useReCaptchaAtom } from "@beep/shared-client/services/react-recaptcha-v3";
 *
 * function App() {
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
 *   return <button onClick={handleSubmit} disabled={!isReady}>Submit</button>;
 * }
 * ```
 *
 * For components that don't need to initialize reCAPTCHA (child components), use:
 *
 * @example
 * ```tsx
 * import { useReCaptchaState } from "@beep/shared-client/services/react-recaptcha-v3";
 *
 * function ChildComponent() {
 *   const { executeRecaptcha, isReady } = useReCaptchaState();
 *   // ...
 * }
 * ```
 *
 * @module
 */

// React Components
import ReCaptcha from "./ReCaptcha";

// Errors
export {
  ReCaptchaAlreadyLoadedError,
  ReCaptchaClientNotMountedError,
  ReCaptchaContainerNotFoundError,
  type ReCaptchaError,
  ReCaptchaErrorSchema,
  ReCaptchaExecutionError,
  ReCaptchaNotFoundError,
  ReCaptchaNotReadyError,
  ReCaptchaScriptLoadError,
} from "./errors";
// Guards
export {
  clearGRecaptchaGlobals,
  deleteClient,
  ensureGRecaptcha,
  ensureGRecaptchaConfig,
  type GRecaptchaConfig,
  getGRecaptcha,
  getGRecaptchaConfig,
  getReCaptchaInstance,
  getReCaptchaWindow,
  getWindowCallback,
  isBrowser,
  isGRecaptchaConfig,
  isHTMLDivElement,
  isReCaptchaInstance,
  registerReadyCallback,
  setReadyFunction,
  setWindowCallback,
} from "./guards";
// Manager (Effect-first exports)
export {
  executeEffect,
  getInstanceEffect,
  isLoadedEffect,
  registerInstanceEffect,
  removeClientEffect,
  unregisterInstanceEffect,
} from "./manager";
// Effect Service
export {
  makeLive,
  ReCaptcha as ReCaptchaService,
  ReCaptchaLive,
  type ReCaptchaService as IReCaptchaService,
} from "./ReCaptchaService";
// Schemas
export {
  BadgePosition,
  ContainerConfig,
  ContainerParameters,
  ExecuteOptions,
  ReCaptchaConfig,
  ReCaptchaTheme,
  ReCaptchaToken,
  ScriptAppendTo,
  ScriptProps as ScriptPropsSchema,
} from "./schemas";
// Types
export type { ReCaptchaInstance } from "./types";
// Utils
export { generateRandomString, isBrowserEffect, loadScriptEffect } from "./utils";

// React component export
export { ReCaptcha, ReCaptcha as GoogleReCaptcha };

// -----------------------------------------------------------------------------
// Atom-based exports
// -----------------------------------------------------------------------------

// Atom-based hooks
import useReCaptchaAtom, { atomPromise, type UseReCaptchaAtomResult, useReCaptchaState } from "./useReCaptchaAtom";

// Atom exports
export {
  cleanupReCaptchaAtom,
  containerAtom,
  executeReCaptchaAtom,
  // Function atoms
  initializeReCaptchaAtom,
  isReadyAtom,
  // Types
  type ReCaptchaProviderConfig,
  type ReCaptchaThemeConfig,
  // Config atoms for provider pattern
  reCaptchaConfigAtom,
  reCaptchaInstanceAtom,
  // Lifecycle atom (handles cleanup and theme updates)
  reCaptchaProviderAtom,
  // State atoms
  reCaptchaStateAtom,
  reCaptchaThemeConfigAtom,
  renderReCaptchaAtom,
} from "./recaptcha.atoms";

// Hook exports
export { useReCaptchaAtom, useReCaptchaState, atomPromise, type UseReCaptchaAtomResult };
