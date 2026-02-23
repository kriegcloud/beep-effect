/**
 * Type guards and safe accessors for ReCaptcha v3 browser globals.
 *
 * This module provides type-safe alternatives to `as` type assertions
 * for accessing window globals and DOM elements.
 *
 * @module
 */
import * as O from "effect/Option";
import * as P from "effect/Predicate";

import type { ReCaptchaInstance } from "./types";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** The key used by Google's ReCaptcha script to store config on window */
export const CONFIG_KEY = "___grecaptcha_cfg";

// -----------------------------------------------------------------------------
// Window Extension Types
// -----------------------------------------------------------------------------

/**
 * Shape of the grecaptcha config object stored on window.
 * This is managed by Google's ReCaptcha script.
 */
export type GRecaptchaConfig = {
  fns?: Array<() => void>;
  clients?: Record<string, unknown>;
};

/**
 * Mutable window type for ReCaptcha globals.
 * We use this internally instead of modifying global Window interface.
 */
type MutableGRecaptcha = {
  enterprise?: Record<string, unknown>;
  execute?: unknown;
  render?: unknown;
  ready?: unknown;
};

type ReCaptchaWindow = {
  grecaptcha?: MutableGRecaptcha | undefined;
  [CONFIG_KEY]?: GRecaptchaConfig | undefined;
  [key: string]: unknown;
};

/**
 * Get the window object cast to our internal ReCaptchaWindow type.
 *
 * This is the SINGLE place where we cast `window` to a custom type.
 * This cast is unavoidable because:
 * 1. TypeScript's Window type doesn't have a string index signature
 * 2. Google's ReCaptcha script adds globals that TypeScript doesn't know about
 * 3. We need to access these globals to integrate with ReCaptcha
 *
 * All other functions in this module use this accessor to avoid scattered casts.
 */
const getTypedWindow = (): ReCaptchaWindow =>
  // biome-ignore lint/suspicious/noExplicitAny: Intentional cast - see JSDoc above
  window as any;

// -----------------------------------------------------------------------------
// Browser Detection
// -----------------------------------------------------------------------------

/**
 * Check if we're running in a browser environment.
 */
export const isBrowser = typeof window !== "undefined";

// -----------------------------------------------------------------------------
// Type Guards
// -----------------------------------------------------------------------------

/**
 * Type guard for checking if a value is a ReCaptchaInstance.
 *
 * Validates that the object has the expected shape of the Google ReCaptcha API.
 * IMPORTANT: execute MUST be a function for the instance to be considered usable.
 * This prevents our pre-initialization placeholder grecaptcha object from being
 * mistakenly treated as a valid instance before Google's script fully loads.
 */
export const isReCaptchaInstance = (value: unknown): value is ReCaptchaInstance =>
  P.isObject(value) &&
  // execute MUST be a function - this is how we know Google's script has loaded
  P.hasProperty(value, "execute") &&
  P.isFunction(value.execute) &&
  // render is optional but if present must be a function
  (!P.hasProperty(value, "render") || P.isFunction(value.render) || value.render === undefined) &&
  // ready is optional but if present must be a function
  (!P.hasProperty(value, "ready") || P.isFunction(value.ready) || value.ready === undefined);

/**
 * Type guard for checking if a value is a GRecaptchaConfig.
 *
 * Validates that the object has the expected config shape.
 */
export const isGRecaptchaConfig = (value: unknown): value is GRecaptchaConfig =>
  P.isObject(value) &&
  // fns is optional but if present must be an array
  (!P.hasProperty(value, "fns") || Array.isArray(value.fns)) &&
  // clients is optional but if present must be an object
  (!P.hasProperty(value, "clients") || P.isObject(value.clients));

/**
 * Type guard for checking if an Element is an HTMLDivElement.
 */
export const isHTMLDivElement = (el: Element | null): el is HTMLDivElement =>
  el !== null && el instanceof HTMLDivElement;

/**
 * Type guard for checking if a value is a grecaptcha object with enterprise.
 */
export const hasEnterprise = (value: unknown): value is { enterprise: unknown } =>
  P.isObject(value) && P.hasProperty(value, "enterprise");

// -----------------------------------------------------------------------------
// Safe Window Accessors
// -----------------------------------------------------------------------------

/**
 * Get the ReCaptcha window safely as the augmented type.
 * Returns Option.none if not in browser.
 */
export const getReCaptchaWindow = (): O.Option<ReCaptchaWindow> => (isBrowser ? O.some(getTypedWindow()) : O.none());

/**
 * Get the grecaptcha config object from window safely.
 */
export const getGRecaptchaConfig = (): O.Option<GRecaptchaConfig> => {
  if (!isBrowser) return O.none();

  const win = getTypedWindow();
  const cfg = win[CONFIG_KEY];

  if (cfg === undefined || cfg === null) return O.none();

  return isGRecaptchaConfig(cfg) ? O.some(cfg) : O.none();
};

/**
 * Ensure the grecaptcha config object exists on window.
 * Creates it if it doesn't exist.
 *
 * @returns The config object, or Option.none if not in browser
 */
export const ensureGRecaptchaConfig = (): O.Option<GRecaptchaConfig> => {
  if (!isBrowser) return O.none();

  const win = getTypedWindow();

  if (!win[CONFIG_KEY]) {
    win[CONFIG_KEY] = {};
  }

  const cfg = win[CONFIG_KEY];
  return cfg !== undefined ? O.some(cfg) : O.none();
};

/**
 * Get the grecaptcha object from window safely.
 */
export const getGRecaptcha = (): O.Option<MutableGRecaptcha> => {
  if (!isBrowser) return O.none();

  const win = getTypedWindow();
  const grecaptcha = win.grecaptcha;

  return grecaptcha !== undefined ? O.some(grecaptcha) : O.none();
};

/**
 * Ensure the grecaptcha object exists on window.
 * Creates it if it doesn't exist.
 *
 * @returns The grecaptcha object, or Option.none if not in browser
 */
export const ensureGRecaptcha = (): O.Option<MutableGRecaptcha> => {
  if (!isBrowser) return O.none();

  const win = getTypedWindow();

  if (!win.grecaptcha) {
    win.grecaptcha = {};
  }

  const grecaptcha = win.grecaptcha;
  return grecaptcha !== undefined ? O.some(grecaptcha) : O.none();
};

/**
 * Get the ReCaptcha instance from the grecaptcha global.
 *
 * @param useEnterprise - Whether to get the enterprise instance
 * @returns Option containing the instance if found and valid
 */
export const getReCaptchaInstance = (useEnterprise: boolean): O.Option<ReCaptchaInstance> => {
  const grecaptchaOpt = getGRecaptcha();
  if (O.isNone(grecaptchaOpt)) return O.none();

  const grecaptcha = grecaptchaOpt.value;

  if (useEnterprise) {
    const enterprise = grecaptcha.enterprise;
    return isReCaptchaInstance(enterprise) ? O.some(enterprise) : O.none();
  }

  return isReCaptchaInstance(grecaptcha) ? O.some(grecaptcha) : O.none();
};

/**
 * Set a callback on the window object.
 *
 * @param name - The callback name
 * @param callback - The callback function (or undefined to clear)
 */
export const setWindowCallback = (name: string, callback: (() => void) | undefined): void => {
  if (!isBrowser) return;

  const win = getTypedWindow();
  win[name] = callback;
};

/**
 * Get a callback from the window object.
 *
 * @param name - The callback name
 * @returns Option containing the callback if found and is a function
 */
export const getWindowCallback = (name: string): O.Option<() => void> => {
  if (!isBrowser) return O.none();

  const win = getTypedWindow();
  const cb = win[name];

  return P.isFunction(cb) ? O.some(cb as () => void) : O.none();
};

/**
 * Register a ready callback with the grecaptcha config.
 * This matches Google's expected pattern for registering callbacks.
 *
 * @param cb - The callback to register
 */
export const registerReadyCallback = (cb: () => void): void => {
  const cfgOpt = ensureGRecaptchaConfig();
  if (O.isNone(cfgOpt)) return;

  const cfg = cfgOpt.value;

  if (!cfg.fns) {
    cfg.fns = [];
  }

  cfg.fns.push(cb);
};

/**
 * Set the ready function on the grecaptcha object and its enterprise variant.
 *
 * @param readyFn - The ready function to set
 */
export const setReadyFunction = (readyFn: (cb: () => void) => void): void => {
  const grecaptchaOpt = ensureGRecaptcha();
  if (O.isNone(grecaptchaOpt)) return;

  const grecaptcha = grecaptchaOpt.value;

  // Set on main object
  grecaptcha.ready = readyFn;

  // Ensure enterprise object exists and set ready on it
  if (!grecaptcha.enterprise) {
    grecaptcha.enterprise = {};
  }

  // Set ready on enterprise object
  grecaptcha.enterprise.ready = readyFn;
};

/**
 * Clear all grecaptcha globals from window.
 */
export const clearGRecaptchaGlobals = (): void => {
  if (!isBrowser) return;

  const win = getTypedWindow();
  win.grecaptcha = undefined;
  win[CONFIG_KEY] = undefined;
};

/**
 * Delete a client from the grecaptcha config.
 *
 * @param clientId - The client ID to delete
 */
export const deleteClient = (clientId: number): void => {
  const cfgOpt = getGRecaptchaConfig();
  if (O.isNone(cfgOpt)) return;

  const cfg = cfgOpt.value;
  if (cfg.clients) {
    delete cfg.clients[clientId.toString()];
  }
};
