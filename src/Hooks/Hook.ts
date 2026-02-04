import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Runtime from "effect/Runtime"
import { HookError } from "../Errors.js"
import type {
  HookCallback,
  HookCallbackMatcher,
  HookInput,
  HookJSONOutput
} from "../Schema/Hooks.js"

/**
 * Context passed to hook handlers by the SDK.
 */
export type HookContext = {
  readonly toolUseID: string | undefined
  readonly signal: AbortSignal
}

/**
 * Effectful hook handler that returns JSON-serializable output.
 */
export type HookHandler<R> = (
  input: HookInput,
  context: HookContext
) => Effect.Effect<HookJSONOutput, HookError, R>

/**
 * Convert an Effect hook handler into the SDK callback shape.
 */
export const callback = <R>(handler: HookHandler<R>) =>
  Effect.gen(function*() {
    const runtime = yield* Effect.runtime<R>()
    return ((input, toolUseID, options) =>
      Runtime.runPromise(runtime)(
        handler(input, { toolUseID, signal: options.signal }).pipe(
          Effect.mapError((cause) =>
            HookError.make({
              message: "Hook handler failed",
              cause
            })
          )
        ),
        { signal: options.signal }
      )) satisfies HookCallback
  })

/**
 * Build a HookCallbackMatcher for SDK hooks with optional matcher and timeout.
 */
export const matcher = (options: {
  readonly matcher?: string | undefined
  readonly timeout?: Duration.DurationInput | undefined
  readonly hooks: ReadonlyArray<HookCallback>
}): HookCallbackMatcher => ({
  matcher: options.matcher,
  hooks: Array.from(options.hooks),
  timeout: options.timeout ? Duration.toSeconds(options.timeout) : undefined
})
