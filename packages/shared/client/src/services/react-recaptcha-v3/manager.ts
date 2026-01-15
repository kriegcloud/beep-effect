/**
 * ReCaptcha instance manager - Effect-first API.
 * @module
 */
import * as Effect from "effect/Effect";
import { ReCaptcha } from "./ReCaptchaService";
import type { ReCaptchaConfig } from "./schemas";

// -----------------------------------------------------------------------------
// Effect-First Exports
// -----------------------------------------------------------------------------

/**
 * Register a ReCaptcha instance (Effect-based).
 */
export const registerInstanceEffect = (
  instanceId: string,
  config: ReCaptchaConfig,
  onLoadCallback?: undefined | (() => void)
) =>
  Effect.gen(function* () {
    const service = yield* ReCaptcha;
    yield* service.registerInstance(instanceId, config, onLoadCallback);
  });

/**
 * Unregister a ReCaptcha instance (Effect-based).
 */
export const unregisterInstanceEffect = (instanceId: string) =>
  Effect.gen(function* () {
    const service = yield* ReCaptcha;
    yield* service.unregisterInstance(instanceId);
  });

/**
 * Remove a ReCaptcha client (Effect-based).
 */
export const removeClientEffect = (clientId: number) =>
  Effect.gen(function* () {
    const service = yield* ReCaptcha;
    yield* service.removeClient(clientId);
  });

/**
 * Execute ReCaptcha verification (Effect-based).
 */
export const executeEffect = (
  clientIdOrKey: number | string,
  action?: undefined | string,
  useEnterprise?: undefined | boolean
) =>
  Effect.gen(function* () {
    const service = yield* ReCaptcha;
    return yield* service.execute(clientIdOrKey, action, useEnterprise);
  });

/**
 * Get ReCaptcha instance (Effect-based).
 */
export const getInstanceEffect = (useEnterprise?: undefined | boolean) =>
  Effect.gen(function* () {
    const service = yield* ReCaptcha;
    return yield* service.getInstance(useEnterprise);
  });

/**
 * Check if ReCaptcha is loaded (Effect-based).
 */
export const isLoadedEffect = Effect.gen(function* () {
  const service = yield* ReCaptcha;
  return yield* service.isLoaded;
});

// -----------------------------------------------------------------------------
// Re-exports
// -----------------------------------------------------------------------------

export { ReCaptcha, ReCaptchaLive, type ReCaptchaService } from "./ReCaptchaService";
