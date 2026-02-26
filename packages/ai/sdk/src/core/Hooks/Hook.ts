import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Runtime from "effect/Runtime"
import { HookError } from "../Errors.js"
import type {
  HookCallback,
  HookCallbackMatcher,
  HookEvent,
  HookInput,
  HookJSONOutput,
  NotificationHookInput,
  PermissionRequestHookInput,
  PostToolUseFailureHookInput,
  PostToolUseHookInput,
  PreCompactHookInput,
  PreToolUseHookInput,
  SessionEndHookInput,
  SessionStartHookInput,
  SetupHookInput,
  StopHookInput,
  SubagentStartHookInput,
  SubagentStopHookInput,
  UserPromptSubmitHookInput
} from "../Schema/Hooks.js"
import { mergeHookMaps, type HookMap } from "./utils.js"

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

export type HookHandlerFor<E extends HookEvent, R> = (
  input: Extract<HookInput, { hook_event_name: E }>,
  context: HookContext
) => Effect.Effect<HookJSONOutput, HookError, R>

export type HookTapHandler<R> = (
  input: HookInput,
  context: HookContext
) => Effect.Effect<void, HookError, R>

export type HookMatcherOptions = {
  readonly matcher?: string | undefined
  readonly timeout?: Duration.DurationInput | undefined
}

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

const toHookMap = (
  events: ReadonlyArray<HookEvent>,
  hookMatcher: HookCallbackMatcher
): HookMap => {
  const map: Partial<Record<HookEvent, HookCallbackMatcher[]>> = {}
  for (const event of events) {
    map[event] = [hookMatcher]
  }
  return map as HookMap
}

const toMatcherEffect = <R>(handler: HookHandler<R>, options?: HookMatcherOptions) =>
  Effect.gen(function*() {
    const hookCallback = yield* callback(handler)
    return matcher({
      matcher: options?.matcher,
      timeout: options?.timeout,
      hooks: [hookCallback]
    })
  })

export const hook = <E extends HookEvent, R>(
  event: E,
  handler: HookHandlerFor<E, R>,
  options?: HookMatcherOptions
) =>
  toMatcherEffect(handler as HookHandler<R>, options).pipe(
    Effect.map((hookMatcher) => toHookMap([event], hookMatcher))
  )

export const tap = <R>(
  events: HookEvent | ReadonlyArray<HookEvent>,
  handler: HookTapHandler<R>,
  options?: HookMatcherOptions
) =>
  toMatcherEffect(
    (input, context) => handler(input, context).pipe(Effect.as({})),
    options
  ).pipe(
    Effect.map((hookMatcher) =>
      toHookMap(Array.isArray(events) ? events : [events], hookMatcher)
    )
  )

export const onPreToolUse = <R>(
  handler: (input: PreToolUseHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("PreToolUse", handler, options)

export const onPostToolUse = <R>(
  handler: (input: PostToolUseHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("PostToolUse", handler, options)

export const onPostToolUseFailure = <R>(
  handler: (input: PostToolUseFailureHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("PostToolUseFailure", handler, options)

export const onNotification = <R>(
  handler: (input: NotificationHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("Notification", handler, options)

export const onUserPromptSubmit = <R>(
  handler: (input: UserPromptSubmitHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("UserPromptSubmit", handler, options)

export const onSessionStart = <R>(
  handler: (input: SessionStartHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("SessionStart", handler, options)

export const onSessionEnd = <R>(
  handler: (input: SessionEndHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("SessionEnd", handler, options)

export const onStop = <R>(
  handler: (input: StopHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("Stop", handler, options)

export const onSubagentStart = <R>(
  handler: (input: SubagentStartHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("SubagentStart", handler, options)

export const onSubagentStop = <R>(
  handler: (input: SubagentStopHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("SubagentStop", handler, options)

export const onPreCompact = <R>(
  handler: (input: PreCompactHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("PreCompact", handler, options)

export const onPermissionRequest = <R>(
  handler: (input: PermissionRequestHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("PermissionRequest", handler, options)

export const onSetup = <R>(
  handler: (input: SetupHookInput, context: HookContext) => Effect.Effect<
    HookJSONOutput,
    HookError,
    R
  >,
  options?: HookMatcherOptions
) => hook("Setup", handler, options)

export class HookBuilder<R = never> {
  private readonly entries: ReadonlyArray<Effect.Effect<HookMap, HookError, R>>

  constructor(entries: ReadonlyArray<Effect.Effect<HookMap, HookError, R>> = []) {
    this.entries = entries
  }

  private append<R2>(
    effect: Effect.Effect<HookMap, HookError, R2>
  ): HookBuilder<R | R2> {
    return new HookBuilder<R | R2>([...this.entries, effect])
  }

  on<E extends HookEvent, R2>(
    event: E,
    handler: HookHandlerFor<E, R2>,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(hook(event, handler, options))
  }

  tap<R2>(
    events: HookEvent | ReadonlyArray<HookEvent>,
    handler: HookTapHandler<R2>,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(tap(events, handler, options))
  }

  onPreToolUse<R2>(
    handler: (input: PreToolUseHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onPreToolUse(handler, options))
  }

  onPostToolUse<R2>(
    handler: (input: PostToolUseHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onPostToolUse(handler, options))
  }

  onPostToolUseFailure<R2>(
    handler: (input: PostToolUseFailureHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onPostToolUseFailure(handler, options))
  }

  onNotification<R2>(
    handler: (input: NotificationHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onNotification(handler, options))
  }

  onUserPromptSubmit<R2>(
    handler: (input: UserPromptSubmitHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onUserPromptSubmit(handler, options))
  }

  onSessionStart<R2>(
    handler: (input: SessionStartHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onSessionStart(handler, options))
  }

  onSessionEnd<R2>(
    handler: (input: SessionEndHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onSessionEnd(handler, options))
  }

  onStop<R2>(
    handler: (input: StopHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onStop(handler, options))
  }

  onSubagentStart<R2>(
    handler: (input: SubagentStartHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onSubagentStart(handler, options))
  }

  onSubagentStop<R2>(
    handler: (input: SubagentStopHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onSubagentStop(handler, options))
  }

  onPreCompact<R2>(
    handler: (input: PreCompactHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onPreCompact(handler, options))
  }

  onPermissionRequest<R2>(
    handler: (input: PermissionRequestHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onPermissionRequest(handler, options))
  }

  onSetup<R2>(
    handler: (input: SetupHookInput, context: HookContext) => Effect.Effect<
      HookJSONOutput,
      HookError,
      R2
    >,
    options?: HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onSetup(handler, options))
  }

  build(): Effect.Effect<HookMap, HookError, R> {
    if (this.entries.length === 0) return Effect.succeed({})
    return Effect.forEach(this.entries, (entry) => entry, {
      concurrency: "unbounded"
    }).pipe(Effect.map((maps) => mergeHookMaps(...maps)))
  }
}

export const builder = () => new HookBuilder()
