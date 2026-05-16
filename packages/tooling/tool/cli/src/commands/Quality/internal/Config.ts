/**
 * Internal configuration helpers shared by quality command adapters.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import { Config, Effect, pipe } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";

/**
 * Synchronously read an optional string config value.
 *
 * @internal
 * @param name - Config key to read.
 * @returns The configured string value when present.
 * @category configuration
 * @since 0.0.0
 */
export const configStringOptionSync = (name: string): O.Option<string> =>
  Effect.runSync(Config.option(Config.string(name)));

/**
 * Check whether an optional string config value equals the expected value.
 *
 * @internal
 * @param name - Config key to read.
 * @param expected - String value required for a match.
 * @returns Whether the configured value equals `expected`.
 * @category configuration
 * @since 0.0.0
 */
export const configStringEqualsSync: {
  (expected: string): (name: string) => boolean;
  (name: string, expected: string): boolean;
} = dual(2, (name: string, expected: string): boolean =>
  pipe(
    configStringOptionSync(name),
    O.exists((value) => value === expected)
  )
);

/**
 * Read an optional string config value inside an Effect workflow.
 *
 * @internal
 * @param name - Config key to read.
 * @returns An Effect that succeeds with the configured value when present.
 * @category configuration
 * @since 0.0.0
 */
export const configStringOption = (name: string): Effect.Effect<O.Option<string>> =>
  Config.option(Config.string(name)).pipe(Effect.orElseSucceed(O.none<string>));
