/**
 * Utility functions for ReCaptcha v3 script loading.
 * @module
 */
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { ScriptProps } from "./schemas.js";

const isBrowser = typeof window !== "undefined";

/**
 * Load a script element into the document.
 * Effect-based version that safely handles SSR.
 */
export const loadScriptEffect = (props: ScriptProps): Effect.Effect<void> =>
  Effect.sync(() => {
    if (!isBrowser) return;

    const script = document.createElement("script");
    script.src = props.src;

    if (P.isNotUndefined(props.async)) {
      script.async = props.async;
    }

    if (P.isNotUndefined(props.defer)) {
      script.defer = props.defer;
    }

    O.fromNullable(props.id).pipe(
      O.map((id) => {
        script.id = id;
      })
    );

    O.fromNullable(props.nonce).pipe(
      O.map((nonce) => {
        script.setAttribute("nonce", nonce);
      })
    );

    const appendTarget = props.appendTo === "head" ? document.head : document.body;
    appendTarget.appendChild(script);
  });

/**
 * Generate a random string for callback names.
 */
export const generateRandomString = (): Effect.Effect<string> =>
  Effect.sync(() => Str.slice(2)(Math.random().toString(36)));

/**
 * Check if running in browser environment.
 */
export const isBrowserEffect: Effect.Effect<boolean> = Effect.sync(() => typeof window !== "undefined");
