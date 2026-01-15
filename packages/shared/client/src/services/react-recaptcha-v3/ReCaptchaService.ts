/**
 * Effect-based ReCaptcha v3 service with proper dependency injection.
 * @module
 */
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import * as SynchronizedRef from "effect/SynchronizedRef";

import {
  ReCaptchaAlreadyLoadedError,
  ReCaptchaContainerNotFoundError,
  type ReCaptchaError,
  ReCaptchaExecutionError,
  ReCaptchaNotFoundError,
  ReCaptchaNotReadyError,
} from "./errors";
import {
  clearGRecaptchaGlobals,
  deleteClient,
  getReCaptchaInstance,
  getReCaptchaWindow,
  isBrowser,
  registerReadyCallback,
  setReadyFunction,
  setWindowCallback,
} from "./guards";
import type { ReCaptchaConfig } from "./schemas";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * ReCaptcha instance type from the Google ReCaptcha API.
 */
export type ReCaptchaInstance = {
  readonly execute?:
    | undefined
    | ((clientIdOrReCaptchaKey: number | string, options: { readonly action?: undefined | string }) => Promise<string>);
  readonly render?: undefined | ((container: string | HTMLElement, options: Record<string, unknown>) => number);
  readonly ready?: undefined | ((cb: () => void) => void);
};

/**
 * Internal state for the ReCaptcha manager.
 */
type ReCaptchaState = {
  readonly loadedUrl: O.Option<string>;
  readonly isLoaded: boolean;
  readonly instances: HashSet.HashSet<string>;
  readonly onLoadCallbacks: HashSet.HashSet<() => void>;
};

/**
 * Initial state for the ReCaptcha manager.
 */
const initialState: ReCaptchaState = {
  loadedUrl: O.none(),
  isLoaded: false,
  instances: HashSet.empty(),
  onLoadCallbacks: HashSet.empty(),
};

// -----------------------------------------------------------------------------
// Service Interface
// -----------------------------------------------------------------------------

/**
 * ReCaptcha service interface.
 */
export interface ReCaptchaService {
  /**
   * Register a new ReCaptcha instance.
   */
  readonly registerInstance: (
    instanceId: string,
    config: ReCaptchaConfig,
    onLoadCallback?: undefined | (() => void)
  ) => Effect.Effect<void, ReCaptchaError>;

  /**
   * Unregister a ReCaptcha instance and cleanup if no more instances.
   */
  readonly unregisterInstance: (instanceId: string) => Effect.Effect<void>;

  /**
   * Execute ReCaptcha verification for an action.
   */
  readonly execute: (
    clientIdOrKey: number | string,
    action?: undefined | string,
    useEnterprise?: undefined | boolean
  ) => Effect.Effect<string, ReCaptchaError>;

  /**
   * Get the current ReCaptcha instance.
   */
  readonly getInstance: (useEnterprise?: undefined | boolean) => Effect.Effect<O.Option<ReCaptchaInstance>>;

  /**
   * Check if ReCaptcha is loaded.
   */
  readonly isLoaded: Effect.Effect<boolean>;

  /**
   * Remove a client by ID.
   */
  readonly removeClient: (clientId: number) => Effect.Effect<void>;

  /**
   * Render ReCaptcha in a container.
   */
  readonly render: (
    container: string | HTMLElement,
    params: Record<string, unknown>,
    useEnterprise?: undefined | boolean
  ) => Effect.Effect<number, ReCaptchaError>;
}

/**
 * ReCaptcha service tag.
 */
export class ReCaptcha extends Context.Tag("@beep/shared-client/ReCaptcha")<ReCaptcha, ReCaptchaService>() {}

// -----------------------------------------------------------------------------
// Implementation Helpers
// -----------------------------------------------------------------------------

/**
 * Generate a random callback name to avoid conflicts.
 */
const generateCallbackName = () => F.pipe(Math.random().toString(36), Str.slice(2), (s) => `onLoadCallback_${s}`);

/**
 * Generate the Google ReCaptcha script URL.
 */
const generateScriptSrc = (
  render: string,
  onLoadCallbackName: string,
  opts: {
    readonly language?: undefined | string;
    readonly useEnterprise?: undefined | boolean;
    readonly useRecaptchaNet?: undefined | boolean;
  }
): string => {
  const host = opts.useRecaptchaNet === true ? "recaptcha.net" : "google.com";
  const script = opts.useEnterprise === true ? "enterprise.js" : "api.js";

  const params = new URLSearchParams({ render });
  params.set("onload", onLoadCallbackName);

  if (P.isNotUndefined(opts.language)) {
    params.set("hl", opts.language);
  }

  return `https://www.${host}/recaptcha/${script}?${params.toString()}`;
};

/**
 * Load a script element into the document.
 */
const loadScript = (props: {
  readonly src: string;
  readonly appendTo?: undefined | "head" | "body";
  readonly async?: undefined | boolean;
  readonly defer?: undefined | boolean;
  readonly id?: undefined | string;
  readonly nonce?: undefined | string;
}): Effect.Effect<void> =>
  Effect.sync(() => {
    if (!isBrowser) return;

    const script = document.createElement("script");
    script.src = props.src;

    if (props.async !== undefined) script.async = props.async;
    if (props.defer !== undefined) script.defer = props.defer;
    if (props.id !== undefined) script.id = props.id;
    if (props.nonce !== undefined) script.setAttribute("nonce", props.nonce);

    const target = props.appendTo === "head" ? document.head : document.body;
    target.appendChild(script);
  });

// -----------------------------------------------------------------------------
// Live Implementation
// -----------------------------------------------------------------------------

/**
 * Create the live ReCaptcha service implementation.
 */
const makeLive = Effect.gen(function* () {
  const stateRef = yield* SynchronizedRef.make(initialState);
  const callbackName = generateCallbackName();

  // Initialize grecaptcha globals on first use
  const initialize = Effect.sync(() => {
    if (!isBrowser) return;

    // Create ready function that manages callbacks using type-safe helper
    const readyFn = (cb: () => void) => {
      registerReadyCallback(cb);
    };

    // Set up ready function on grecaptcha and grecaptcha.enterprise
    setReadyFunction(readyFn);
  });

  // Mutable state for browser callback access (outside Effect runtime)
  let callbackState: ReCaptchaState = initialState;

  // Keep callback state in sync
  const syncCallbackState = Effect.gen(function* () {
    callbackState = yield* SynchronizedRef.get(stateRef);
  });

  // Setup the onload callback handler
  const setupOnLoadCallback = Effect.sync(() => {
    if (!isBrowser) return;

    setWindowCallback(callbackName, () => {
      // Execute callbacks synchronously in browser context
      for (const cb of HashSet.values(callbackState.onLoadCallbacks)) {
        cb();
      }
      // Update state via sync call
      callbackState = {
        ...callbackState,
        isLoaded: true,
        onLoadCallbacks: HashSet.empty(),
      };
      // Also update the ref (fire and forget)
      Effect.runSync(SynchronizedRef.set(stateRef, callbackState));
    });
  });

  // Load the ReCaptcha script
  const loadReCaptchaScript = (config: ReCaptchaConfig): Effect.Effect<void, ReCaptchaError> =>
    SynchronizedRef.updateEffect(stateRef, (state) =>
      Effect.gen(function* () {
        const render = config.container?.element !== undefined ? "explicit" : config.reCaptchaKey;

        const src = generateScriptSrc(render, callbackName, {
          language: config.language,
          useEnterprise: config.useEnterprise,
          useRecaptchaNet: config.useRecaptchaNet,
        });

        // Check if already loaded with different URL
        if (O.isSome(state.loadedUrl)) {
          if (state.loadedUrl.value !== src) {
            return yield* new ReCaptchaAlreadyLoadedError({
              message: "ReCaptcha has already been loaded with different parameters",
              existingUrl: state.loadedUrl.value,
              requestedUrl: src,
            });
          }
          // Already loaded with same URL, nothing to do
          return state;
        }

        // Load the script
        yield* loadScript({
          src,
          appendTo: config.scriptProps?.appendTo,
          async: config.scriptProps?.async ?? true,
          defer: config.scriptProps?.defer ?? true,
          id: config.scriptProps?.id ?? "google-recaptcha-v3",
          nonce: config.scriptProps?.nonce,
        });

        return {
          ...state,
          loadedUrl: O.some(src),
        };
      })
    );

  const service: ReCaptchaService = {
    registerInstance: (instanceId, config, onLoadCallback) =>
      Effect.gen(function* () {
        const state = yield* SynchronizedRef.get(stateRef);

        // Initialize on first instance
        if (HashSet.size(state.instances) === 0) {
          yield* initialize;
          yield* setupOnLoadCallback;
        }

        // Load script
        yield* loadReCaptchaScript(config);

        // Register instance and callback
        yield* SynchronizedRef.update(stateRef, (s) => ({
          ...s,
          instances: HashSet.add(s.instances, instanceId),
          onLoadCallbacks: P.isNotUndefined(onLoadCallback)
            ? HashSet.add(s.onLoadCallbacks, onLoadCallback)
            : s.onLoadCallbacks,
        }));

        // Sync callback state
        yield* syncCallbackState;

        // If already loaded, call the callback immediately
        const currentState = yield* SynchronizedRef.get(stateRef);
        if (currentState.isLoaded && P.isNotUndefined(onLoadCallback)) {
          yield* Effect.sync(onLoadCallback);
        }

        // Handle external onload callback name
        if (P.isNotUndefined(config.scriptProps?.onLoadCallbackName)) {
          const externalCallbackName = config.scriptProps.onLoadCallbackName;
          const callExternalCallback = () => {
            if (!isBrowser) return;
            F.pipe(
              getReCaptchaWindow(),
              O.flatMap((win) => O.fromNullable(win[externalCallbackName])),
              O.filter(P.isFunction),
              O.map((cb) => cb())
            );
          };

          if (currentState.isLoaded) {
            yield* Effect.sync(callExternalCallback);
          } else {
            yield* SynchronizedRef.update(stateRef, (s) => ({
              ...s,
              onLoadCallbacks: HashSet.add(s.onLoadCallbacks, callExternalCallback),
            }));
            yield* syncCallbackState;
          }
        }
      }),

    unregisterInstance: (instanceId) =>
      SynchronizedRef.updateEffect(stateRef, (state) =>
        Effect.sync(() => {
          const newInstances = HashSet.remove(state.instances, instanceId);

          // Cleanup if no more instances
          if (HashSet.size(newInstances) === 0 && isBrowser) {
            // Clear grecaptcha globals using type-safe helper
            clearGRecaptchaGlobals();

            // Remove DOM elements
            document.querySelector(".grecaptcha-badge")?.remove();

            if (O.isSome(state.loadedUrl)) {
              document.querySelector(`script[src="${state.loadedUrl.value}"]`)?.remove();
            }

            document.querySelector(`script[src^="https://www.gstatic.com/recaptcha/releases"]`)?.remove();

            return initialState;
          }

          return {
            ...state,
            instances: newInstances,
          };
        })
      ),

    execute: (clientIdOrKey, action, useEnterprise) =>
      Effect.gen(function* () {
        if (!isBrowser) {
          return yield* new ReCaptchaNotFoundError({
            message: "ReCaptcha is not available in non-browser environment",
          });
        }

        // Get instance using type-safe guard
        const instanceOpt = getReCaptchaInstance(useEnterprise === true);

        if (O.isNone(instanceOpt)) {
          return yield* new ReCaptchaNotFoundError({
            message: "reCAPTCHA not found",
          });
        }

        const instance = instanceOpt.value;

        if (!instance.execute) {
          return yield* new ReCaptchaNotReadyError({
            message: "reCAPTCHA execute function not available",
          });
        }

        return yield* Effect.tryPromise({
          try: () => instance.execute!(clientIdOrKey, { action }),
          catch: (cause) =>
            new ReCaptchaExecutionError({
              message: `Failed to execute reCAPTCHA for action: ${action ?? "unknown"}`,
              action,
              cause,
            }),
        });
      }),

    getInstance: (useEnterprise) => Effect.sync(() => getReCaptchaInstance(useEnterprise === true)),

    isLoaded: F.pipe(
      SynchronizedRef.get(stateRef),
      Effect.map((s) => s.isLoaded)
    ),

    removeClient: (clientId) =>
      Effect.sync(() => {
        deleteClient(clientId);
      }),

    render: (container, params, useEnterprise) =>
      Effect.gen(function* () {
        const instanceOpt = yield* service.getInstance(useEnterprise);

        if (O.isNone(instanceOpt)) {
          return yield* new ReCaptchaNotFoundError({
            message: "reCAPTCHA instance not found",
          });
        }

        const instance = instanceOpt.value;

        if (!instance.render) {
          return yield* new ReCaptchaNotReadyError({
            message: "reCAPTCHA render function not available",
          });
        }

        const actualContainer = P.isString(container) ? document.getElementById(container) : container;

        if (!actualContainer) {
          return yield* new ReCaptchaContainerNotFoundError({
            message: "reCAPTCHA container element not found",
            selector: P.isString(container) ? container : "HTMLElement",
          });
        }

        return instance.render(actualContainer, params);
      }),
  };

  return service;
});

/**
 * Live layer for the ReCaptcha service.
 */
export const ReCaptchaLive = Layer.effect(ReCaptcha, makeLive);
