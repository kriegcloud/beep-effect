import {Effect} from "effect";
import {PlaywrightError} from "./errors";
export const useHelper =
  <Wrap>(api: Wrap) =>
  <A>(userFunction: (api: Wrap) => Promise<A>) =>
    Effect.tryPromise(() => userFunction(api)).pipe(Effect.mapError(PlaywrightError.wrap));