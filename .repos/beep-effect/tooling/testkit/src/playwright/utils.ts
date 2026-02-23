import { Effect } from "effect";
import { wrapError } from "./errors";

/**
 * Check if Playwright is available in the current environment.
 * @since 0.1.0
 */
export const isPlaywrightAvailable = (): boolean => {
  try {
    require.resolve("playwright");
    return true;
  } catch {
    return false;
  }
};

/** @internal */
export const useHelper =
  <Wrap>(api: Wrap) =>
  <A>(userFunction: (api: Wrap) => Promise<A>) =>
    Effect.tryPromise(() => userFunction(api)).pipe(Effect.mapError(wrapError));
