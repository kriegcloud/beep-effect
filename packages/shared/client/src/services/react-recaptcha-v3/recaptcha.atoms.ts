"use client";
import { makeAtomRuntime } from "@beep/runtime-client/runtime";
/**
 * ReCaptcha v3 atoms using @effect-atom/atom-react.
 *
 * This replaces the React Context + Provider pattern with Effect atoms.
 * @module
 */
import { Atom, Registry } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

import {
  ReCaptchaAlreadyLoadedError,
  ReCaptchaClientNotMountedError,
  ReCaptchaExecutionError,
  ReCaptchaNotFoundError,
  ReCaptchaNotReadyError,
} from "./errors";
import { clearGRecaptchaGlobals, getReCaptchaInstance, isBrowser, isHTMLDivElement, setWindowCallback } from "./guards";
import type { ReCaptchaInstance } from "./types";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * ReCaptcha provider configuration for atoms.
 */
export type ReCaptchaProviderConfig = {
  readonly reCaptchaKey: string;
  readonly language?: string;
  readonly useEnterprise?: boolean;
  readonly useRecaptchaNet?: boolean;
  readonly container?: {
    readonly element?: string | HTMLElement;
    readonly parameters?: {
      readonly badge?: "inline" | "bottomleft" | "bottomright";
      readonly hidden?: boolean;
      readonly callback?: () => void;
      readonly errorCallback?: () => void;
      readonly expiredCallback?: () => void;
      readonly tabindex?: number;
      readonly theme?: "dark" | "light";
    };
  };
  readonly scriptProps?: {
    readonly appendTo?: "head" | "body";
    readonly async?: boolean;
    readonly defer?: boolean;
    readonly id?: string;
    readonly nonce?: string;
    readonly onLoadCallbackName?: string;
  };
};

/**
 * Internal state for the ReCaptcha atom system.
 */
type ReCaptchaState = {
  readonly loadedUrl: O.Option<string>;
  readonly isLoaded: boolean;
  readonly instances: HashSet.HashSet<string>;
  readonly onLoadCallbacks: HashSet.HashSet<() => void>;
  readonly reCaptchaInstance: O.Option<ReCaptchaInstance>;
  readonly clientId: O.Option<number>;
  readonly config: O.Option<ReCaptchaProviderConfig>;
};

const initialState: ReCaptchaState = {
  loadedUrl: O.none(),
  isLoaded: false,
  instances: HashSet.empty(),
  onLoadCallbacks: HashSet.empty(),
  reCaptchaInstance: O.none(),
  clientId: O.none(),
  config: O.none(),
};

// -----------------------------------------------------------------------------
// Browser helpers
// -----------------------------------------------------------------------------

const generateCallbackName = () => F.pipe(Math.random().toString(36), Str.slice(2), (s) => `onLoadCallback_${s}`);

/**
 * Normalizes a reCAPTCHA script URL for comparison by removing the `onload` callback parameter.
 * This is necessary because the callback name is randomly generated on each initialization,
 * but we only want to error if the actual reCAPTCHA parameters (key, language, etc.) differ.
 */
const normalizeUrlForComparison = (url: string): string => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("onload");
    return parsed.toString();
  } catch {
    return url;
  }
};

const generateScriptSrc = (
  render: string,
  onLoadCallbackName: string,
  language: string | undefined,
  useEnterprise: boolean,
  useRecaptchaNet: boolean
): string => {
  const host = useRecaptchaNet ? "recaptcha.net" : "google.com";
  const script = useEnterprise ? "enterprise.js" : "api.js";

  const params = new URLSearchParams({ render });
  params.set("onload", onLoadCallbackName);

  if (P.isNotUndefined(language)) {
    params.set("hl", language);
  }

  return `https://www.${host}/recaptcha/${script}?${params.toString()}`;
};

const loadScript = (
  src: string,
  appendTo: "head" | "body" | undefined,
  async_: boolean,
  defer: boolean,
  id: string,
  nonce: string | undefined
): Effect.Effect<void> =>
  Effect.sync(() => {
    if (!isBrowser) return;

    const script = document.createElement("script");
    script.src = src;
    script.async = async_;
    script.defer = defer;
    script.id = id;
    if (nonce !== undefined) script.setAttribute("nonce", nonce);

    const target = appendTo === "head" ? document.head : document.body;
    target.appendChild(script);
  });

// -----------------------------------------------------------------------------
// State Atom
// -----------------------------------------------------------------------------

/**
 * Core state atom for ReCaptcha.
 * This holds all the internal state that was previously managed by useState.
 */
export const reCaptchaStateAtom = Atom.make<ReCaptchaState>(initialState);

/**
 * Derived atom for isReady state.
 */
export const isReadyAtom = Atom.make((get) => {
  const state = get(reCaptchaStateAtom);
  return state.isLoaded && O.isSome(state.reCaptchaInstance);
});

/**
 * Derived atom for the reCAPTCHA instance.
 */
export const reCaptchaInstanceAtom = Atom.make((get) => {
  const state = get(reCaptchaStateAtom);
  return state.reCaptchaInstance;
});

/**
 * Derived atom for the container element.
 */
export const containerAtom = Atom.make((get) => {
  const state = get(reCaptchaStateAtom);
  return F.pipe(
    state.config,
    O.flatMap((c) => O.fromNullable(c.container?.element))
  );
});

// -----------------------------------------------------------------------------
// Config and Theme Atoms for Provider Pattern
// -----------------------------------------------------------------------------

/**
 * Config atom for ReCaptcha provider.
 * Set this to initialize the reCAPTCHA system.
 */
export const reCaptchaConfigAtom = Atom.make<O.Option<ReCaptchaProviderConfig>>(O.none());

/**
 * Theme configuration atom for reCAPTCHA.
 * Updates to this atom will reactively update the reCAPTCHA iframe styling.
 */
export type ReCaptchaThemeConfig = {
  readonly theme: "dark" | "light";
  readonly language: string | undefined;
};

export const reCaptchaThemeConfigAtom = Atom.make<ReCaptchaThemeConfig>({
  theme: "light",
  language: undefined,
});

/**
 * Internal helper to update reCAPTCHA iframe theme.
 */
const updateRecaptchaIframeTheme = (theme: "dark" | "light", language: string | undefined): void => {
  if (!isBrowser) return;
  const iframe = document.querySelector("iframe[title='reCAPTCHA']") as HTMLIFrameElement | null;
  if (iframe) {
    const iframeSrcUrl = new URL(iframe.src);
    iframeSrcUrl.searchParams.set("theme", theme);
    if (language !== undefined) {
      iframeSrcUrl.searchParams.set("hl", language);
    }
    iframe.src = iframeSrcUrl.toString();
  }
};

/**
 * ReCaptcha provider lifecycle atom.
 *
 * This atom handles the lifecycle of reCAPTCHA using proper atom patterns:
 * - Derives ready state from reCaptchaStateAtom
 * - Handles theme updates reactively (no useEffect needed)
 * - Registers cleanup via `get.addFinalizer()` (no useEffect cleanup needed)
 *
 * For initialization, use `initializeReCaptchaAtom` which has proper Registry access
 * for async state updates.
 *
 * Usage:
 * ```tsx
 * // Set theme config (drives reactive theme updates)
 * const setTheme = useAtomSet(reCaptchaThemeConfigAtom);
 * setTheme({ theme: "dark", language: "en" });
 *
 * // Read provider state - mounts the atom and registers cleanup
 * const { ready, initialized } = useAtomValue(reCaptchaProviderAtom);
 *
 * // Initialize via the function atom (still needs one-time call)
 * const initialize = useAtomSet(initializeReCaptchaAtom);
 * initialize(config);
 * ```
 */
export const reCaptchaProviderAtom = Atom.make((get) => {
  const state = get(reCaptchaStateAtom);
  const themeConfig = get(reCaptchaThemeConfigAtom);
  const isReady = get(isReadyAtom);

  // Register cleanup when atom has been initialized and is mounted
  // NOTE: We intentionally do NOT clear grecaptcha globals or remove scripts on cleanup.
  // This is because React Strict Mode and HMR can cause rapid unmount/remount cycles,
  // and clearing the globals while Google's script is still loading causes issues.
  // The grecaptcha object is managed by Google's script and should persist across mounts.
  // Only the badge element is cleaned up for visual consistency.
  if (O.isSome(state.loadedUrl) && isBrowser) {
    get.addFinalizer(() => {
      if (!isBrowser) return;

      // Only clean up the badge element, not the script or globals
      // The script and globals should persist for reuse
      document.querySelector(".grecaptcha-badge")?.remove();
    });
  }

  // Handle theme updates reactively when ready
  if (isReady && isBrowser) {
    updateRecaptchaIframeTheme(themeConfig.theme, themeConfig.language);
  }

  return { ready: isReady, initialized: O.isSome(state.config) };
});

// -----------------------------------------------------------------------------
// Runtime and Function Atoms
// -----------------------------------------------------------------------------

// Create runtime for ReCaptcha operations
const reCaptchaRuntime = makeAtomRuntime(Layer.empty);

// Module-level mutable state for browser callback access
let storedCallbackName = "";

/**
 * Initialize the ReCaptcha instance.
 * This should be called once when the app mounts.
 */
export const initializeReCaptchaAtom = reCaptchaRuntime.fn(
  Effect.fn(function* (config: ReCaptchaProviderConfig) {
    const registry = yield* Registry.AtomRegistry;

    if (!isBrowser) {
      return;
    }

    const instanceId = `recaptcha-${Date.now()}`;
    const callbackName = generateCallbackName();
    storedCallbackName = callbackName;

    // NOTE: We intentionally DO NOT pre-create the grecaptcha object.
    // Google's reCAPTCHA script creates window.grecaptcha itself.
    // Pre-creating it can interfere with Google's initialization.
    // The ___grecaptcha_cfg.fns array is used for queuing ready callbacks,
    // which Google's script will execute when it loads.

    // Setup onload callback
    setWindowCallback(callbackName, () => {
      const useEnterprise = config.useEnterprise ?? false;
      const instanceOpt = getReCaptchaInstance(useEnterprise);

      // Update state
      const currentState = registry.get(reCaptchaStateAtom);
      const newState: ReCaptchaState = {
        ...currentState,
        isLoaded: true,
        reCaptchaInstance: instanceOpt,
        onLoadCallbacks: HashSet.empty(),
      };

      // Execute pending callbacks
      for (const cb of HashSet.values(currentState.onLoadCallbacks)) {
        cb();
      }

      registry.set(reCaptchaStateAtom, newState);
    });

    // Generate script URL
    const render = config.container?.element !== undefined ? "explicit" : config.reCaptchaKey;
    const src = generateScriptSrc(
      render,
      callbackName,
      config.language,
      config.useEnterprise ?? false,
      config.useRecaptchaNet ?? false
    );

    // Check if already loaded (from atom state)
    // Compare URLs without the onload callback parameter since it's randomly generated
    const currentState = registry.get(reCaptchaStateAtom);
    if (O.isSome(currentState.loadedUrl)) {
      const existingNormalized = normalizeUrlForComparison(currentState.loadedUrl.value);
      const requestedNormalized = normalizeUrlForComparison(src);
      if (existingNormalized !== requestedNormalized) {
        return yield* new ReCaptchaAlreadyLoadedError({
          message: "ReCaptcha has already been loaded with different parameters",
          existingUrl: currentState.loadedUrl.value,
          requestedUrl: src,
        });
      }
      return;
    }

    // Also check if script element already exists in DOM (handles HMR/strict mode)
    const scriptId = config.scriptProps?.id ?? "google-recaptcha-v3";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      // Script exists - just update state and wait for grecaptcha to be ready
      const useEnterprise = config.useEnterprise ?? false;
      const instanceOpt = getReCaptchaInstance(useEnterprise);

      const newState: ReCaptchaState = {
        ...currentState,
        loadedUrl: O.some(src),
        instances: HashSet.add(currentState.instances, instanceId),
        config: O.some(config),
        isLoaded: O.isSome(instanceOpt),
        reCaptchaInstance: instanceOpt,
      };

      registry.set(reCaptchaStateAtom, newState);
      return;
    }

    // Load script
    yield* loadScript(
      src,
      config.scriptProps?.appendTo,
      config.scriptProps?.async ?? true,
      config.scriptProps?.defer ?? true,
      scriptId,
      config.scriptProps?.nonce
    );

    // Update state with config and loaded URL
    const newState: ReCaptchaState = {
      ...currentState,
      loadedUrl: O.some(src),
      instances: HashSet.add(currentState.instances, instanceId),
      config: O.some(config),
    };

    registry.set(reCaptchaStateAtom, newState);
  })
);

/**
 * Execute ReCaptcha verification and get a token.
 * Wraps the execute call in grecaptcha.ready() to ensure the API is fully initialized.
 */
export const executeReCaptchaAtom = reCaptchaRuntime.fn(
  Effect.fn(function* (action?: string) {
    const registry = yield* Registry.AtomRegistry;
    const state = registry.get(reCaptchaStateAtom);

    if (!isBrowser) {
      return yield* new ReCaptchaNotFoundError({
        message: "ReCaptcha is not available in non-browser environment",
      });
    }

    if (O.isNone(state.reCaptchaInstance)) {
      return yield* new ReCaptchaNotFoundError({
        message: "reCAPTCHA instance not found",
      });
    }

    const instance = state.reCaptchaInstance.value;

    if (!instance.execute) {
      return yield* new ReCaptchaNotReadyError({
        message: "reCAPTCHA execute function not available",
      });
    }

    const config = O.getOrNull(state.config);
    const shouldUseClientId = config?.container?.element !== undefined;
    const clientIdOrKey: string | number =
      shouldUseClientId && O.isSome(state.clientId) ? state.clientId.value : (config?.reCaptchaKey ?? "");

    if (shouldUseClientId && O.isNone(state.clientId)) {
      return yield* new ReCaptchaClientNotMountedError({
        message: "Client ID not mounted",
      });
    }

    // Wrap execute in the GLOBAL grecaptcha.ready() to ensure the API is fully initialized
    // This prevents "Cannot read properties of undefined (reading 'auto_render_clients')" errors
    // IMPORTANT: We must use the global grecaptcha.ready(), not the instance's ready method,
    // because we may have set our own ready function before Google's script loaded.
    const token = yield* Effect.tryPromise({
      try: () =>
        new Promise<string>((resolve, reject) => {
          // Get the current global grecaptcha object - it may have been replaced by Google's script
          const useEnterprise = O.isSome(state.config) && (state.config.value.useEnterprise ?? false);
          const currentInstanceOpt = getReCaptchaInstance(useEnterprise);

          if (O.isNone(currentInstanceOpt)) {
            reject(new Error("grecaptcha not available"));
            return;
          }

          const currentInstance = currentInstanceOpt.value;
          const readyFn = currentInstance.ready;

          if (P.isFunction(readyFn)) {
            readyFn(() => {
              currentInstance.execute!(clientIdOrKey, { action }).then(resolve).catch(reject);
            });
          } else {
            // Fallback: execute directly if ready is not available
            currentInstance.execute!(clientIdOrKey, { action }).then(resolve).catch(reject);
          }
        }),
      catch: (cause) =>
        new ReCaptchaExecutionError({
          message: `Failed to execute reCAPTCHA for action: ${action ?? "unknown"}`,
          action,
          cause,
        }),
    });

    return token;
  })
);

/**
 * Cleanup ReCaptcha instance.
 * Call this when unmounting the provider.
 */
export const cleanupReCaptchaAtom = reCaptchaRuntime.fn(
  Effect.fn(function* () {
    const registry = yield* Registry.AtomRegistry;

    if (!isBrowser) {
      return;
    }

    const state = registry.get(reCaptchaStateAtom);

    // Cleanup globals using type-safe helper
    clearGRecaptchaGlobals();
    if (storedCallbackName) {
      setWindowCallback(storedCallbackName, undefined);
    }

    // Remove DOM elements
    document.querySelector(".grecaptcha-badge")?.remove();

    if (O.isSome(state.loadedUrl)) {
      document.querySelector(`script[src="${state.loadedUrl.value}"]`)?.remove();
    }

    document.querySelector(`script[src^="https://www.gstatic.com/recaptcha/releases"]`)?.remove();

    // Reset state
    registry.set(reCaptchaStateAtom, initialState);
  })
);

/**
 * Render ReCaptcha in a container element.
 * Used for explicit rendering mode.
 */
export const renderReCaptchaAtom = reCaptchaRuntime.fn(
  Effect.fn(function* () {
    const registry = yield* Registry.AtomRegistry;
    const state = registry.get(reCaptchaStateAtom);

    if (!isBrowser) {
      return;
    }

    const config = O.getOrNull(state.config);
    if (!config?.container?.element || O.isNone(state.reCaptchaInstance)) {
      return;
    }

    const instance = state.reCaptchaInstance.value;
    if (!instance.render) {
      return;
    }

    const containerElement = config.container.element;
    const params = config.container.parameters ?? {};

    const renderParams = {
      "error-callback": params.errorCallback,
      "expired-callback": params.expiredCallback,
      badge: params.badge ?? "inline",
      callback: params.callback,
      sitekey: config.reCaptchaKey,
      size: "invisible",
      tabindex: params.tabindex,
      theme: params.theme,
    };

    const actualContainer =
      typeof containerElement === "string" ? document.getElementById(containerElement) : containerElement;

    if (!actualContainer) {
      console.error("reCAPTCHA container element not found");
      return;
    }

    const clientId = instance.render(actualContainer, renderParams);

    if (params.hidden === true) {
      const badge = actualContainer.querySelector(".grecaptcha-badge");
      if (isHTMLDivElement(badge)) {
        badge.style.setProperty("display", "none");
      }
    }

    // Update state with client ID
    const newState: ReCaptchaState = {
      ...state,
      clientId: O.some(clientId),
    };

    registry.set(reCaptchaStateAtom, newState);
  })
);
