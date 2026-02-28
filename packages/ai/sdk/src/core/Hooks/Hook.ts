import { Duration, Effect } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import { HookError } from "../Errors.js";
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
  UserPromptSubmitHookInput,
} from "../Schema/Hooks.js";
import { type HookMap, mergeHookMaps } from "./utils.js";

/**
 * Context passed to hook handlers by the SDK.
 */
/**
 * @since 0.0.0
 */
export type HookContext = {
  readonly toolUseID: string | undefined;
  readonly signal: AbortSignal;
};

/**
 * Effectful hook handler that returns JSON-serializable output.
 */
/**
 * @since 0.0.0
 */
export type HookHandler<R> = (input: HookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>;

/**
 * @since 0.0.0
 */
export type HookHandlerFor<E extends HookEvent, R> = (
  input: Extract<HookInput, { hook_event_name: E }>,
  context: HookContext
) => Effect.Effect<HookJSONOutput, HookError, R>;

/**
 * @since 0.0.0
 */
export type HookTapHandler<R> = (input: HookInput, context: HookContext) => Effect.Effect<void, HookError, R>;

/**
 * @since 0.0.0
 */
export type HookMatcherOptions = {
  readonly matcher?: string | undefined;
  readonly timeout?: Duration.Input | undefined;
};

/**
 * Convert an Effect hook handler into the SDK callback shape.
 */
/**
 * @since 0.0.0
 */
export const callback = <R>(handler: HookHandler<R>) =>
  Effect.gen(function* () {
    const services = yield* Effect.services<R>();
    const runWithServices = Effect.runPromiseWith(services);
    return ((input, toolUseID, options) =>
      runWithServices(
        handler(input, { toolUseID, signal: options.signal }).pipe(
          Effect.mapError(
            (cause) =>
              new HookError({
                message: "Hook handler failed",
                cause,
              })
          )
        ),
        { signal: options.signal }
      )) satisfies HookCallback;
  });

/**
 * Build a HookCallbackMatcher for SDK hooks with optional matcher and timeout.
 */
/**
 * @since 0.0.0
 */
export const matcher = (options: {
  readonly matcher?: string | undefined;
  readonly timeout?: Duration.Input | undefined;
  readonly hooks: ReadonlyArray<HookCallback>;
}): HookCallbackMatcher => ({
  matcher: options.matcher,
  hooks: A.fromIterable(options.hooks),
  timeout: options.timeout ? Duration.toMillis(options.timeout) / 1000 : undefined,
});

const toHookMap = (events: ReadonlyArray<HookEvent>, hookMatcher: HookCallbackMatcher): HookMap => {
  const map: Partial<Record<HookEvent, HookCallbackMatcher[]>> = {};
  for (const event of events) {
    map[event] = [hookMatcher];
  }
  return map as HookMap;
};

const toMatcherEffect = <R>(
  handler: HookHandler<R>,
  options?: undefined | HookMatcherOptions
): Effect.Effect<HookCallbackMatcher, HookError, R> =>
  Effect.gen(function* () {
    const hookCallback = yield* callback(handler);
    return matcher({
      matcher: options?.matcher,
      timeout: options?.timeout,
      hooks: [hookCallback],
    });
  });

/**
 * @since 0.0.0
 */
export const hook = <E extends HookEvent, R>(
  event: E,
  handler: HookHandlerFor<E, R>,
  options?: undefined | HookMatcherOptions
): Effect.Effect<HookMap, HookError, R> =>
  toMatcherEffect(handler as HookHandler<R>, options).pipe(
    Effect.map((hookMatcher) => toHookMap([event], hookMatcher))
  );

/**
 * @since 0.0.0
 */
export const tap = <R>(
  events: HookEvent | ReadonlyArray<HookEvent>,
  handler: HookTapHandler<R>,
  options?: undefined | HookMatcherOptions
): Effect.Effect<HookMap, HookError, R> =>
  toMatcherEffect((input, context) => handler(input, context).pipe(Effect.as({})), options).pipe(
    Effect.map((hookMatcher) => toHookMap(P.isString(events) ? [events] : events, hookMatcher))
  );

/**
 * @since 0.0.0
 */
export const onPreToolUse = <R>(
  handler: (input: PreToolUseHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("PreToolUse", handler, options);

/**
 * @since 0.0.0
 */
export const onPostToolUse = <R>(
  handler: (input: PostToolUseHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("PostToolUse", handler, options);

/**
 * @since 0.0.0
 */
export const onPostToolUseFailure = <R>(
  handler: (input: PostToolUseFailureHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("PostToolUseFailure", handler, options);

/**
 * @since 0.0.0
 */
export const onNotification = <R>(
  handler: (input: NotificationHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("Notification", handler, options);

/**
 * @since 0.0.0
 */
export const onUserPromptSubmit = <R>(
  handler: (input: UserPromptSubmitHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("UserPromptSubmit", handler, options);

/**
 * @since 0.0.0
 */
export const onSessionStart = <R>(
  handler: (input: SessionStartHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("SessionStart", handler, options);

/**
 * @since 0.0.0
 */
export const onSessionEnd = <R>(
  handler: (input: SessionEndHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("SessionEnd", handler, options);

/**
 * @since 0.0.0
 */
export const onStop = <R>(
  handler: (input: StopHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("Stop", handler, options);

/**
 * @since 0.0.0
 */
export const onSubagentStart = <R>(
  handler: (input: SubagentStartHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("SubagentStart", handler, options);

/**
 * @since 0.0.0
 */
export const onSubagentStop = <R>(
  handler: (input: SubagentStopHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("SubagentStop", handler, options);

/**
 * @since 0.0.0
 */
export const onPreCompact = <R>(
  handler: (input: PreCompactHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("PreCompact", handler, options);

/**
 * @since 0.0.0
 */
export const onPermissionRequest = <R>(
  handler: (input: PermissionRequestHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("PermissionRequest", handler, options);

/**
 * @since 0.0.0
 */
export const onSetup = <R>(
  handler: (input: SetupHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R>,
  options?: undefined | HookMatcherOptions
) => hook("Setup", handler, options);

/**
 * @since 0.0.0
 */
export class HookBuilder<R = never> {
  private readonly entries: ReadonlyArray<Effect.Effect<HookMap, HookError, R>>;

  constructor(entries: ReadonlyArray<Effect.Effect<HookMap, HookError, R>> = []) {
    this.entries = entries;
  }

  private append<R2>(effect: Effect.Effect<HookMap, HookError, R2>): HookBuilder<R | R2> {
    return new HookBuilder<R | R2>([...this.entries, effect]);
  }

  on<E extends HookEvent, R2>(
    event: E,
    handler: HookHandlerFor<E, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(hook(event, handler, options));
  }

  tap<R2>(
    events: HookEvent | ReadonlyArray<HookEvent>,
    handler: HookTapHandler<R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(tap(events, handler, options));
  }

  onPreToolUse<R2>(
    handler: (input: PreToolUseHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onPreToolUse(handler, options));
  }

  onPostToolUse<R2>(
    handler: (input: PostToolUseHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onPostToolUse(handler, options));
  }

  onPostToolUseFailure<R2>(
    handler: (input: PostToolUseFailureHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onPostToolUseFailure(handler, options));
  }

  onNotification<R2>(
    handler: (input: NotificationHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onNotification(handler, options));
  }

  onUserPromptSubmit<R2>(
    handler: (input: UserPromptSubmitHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onUserPromptSubmit(handler, options));
  }

  onSessionStart<R2>(
    handler: (input: SessionStartHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onSessionStart(handler, options));
  }

  onSessionEnd<R2>(
    handler: (input: SessionEndHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onSessionEnd(handler, options));
  }

  onStop<R2>(
    handler: (input: StopHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onStop(handler, options));
  }

  onSubagentStart<R2>(
    handler: (input: SubagentStartHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onSubagentStart(handler, options));
  }

  onSubagentStop<R2>(
    handler: (input: SubagentStopHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onSubagentStop(handler, options));
  }

  onPreCompact<R2>(
    handler: (input: PreCompactHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onPreCompact(handler, options));
  }

  onPermissionRequest<R2>(
    handler: (input: PermissionRequestHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onPermissionRequest(handler, options));
  }

  onSetup<R2>(
    handler: (input: SetupHookInput, context: HookContext) => Effect.Effect<HookJSONOutput, HookError, R2>,
    options?: undefined | HookMatcherOptions
  ): HookBuilder<R | R2> {
    return this.append(onSetup(handler, options));
  }

  build(): Effect.Effect<HookMap, HookError, R> {
    if (this.entries.length === 0) return Effect.succeed(mergeHookMaps());
    return Effect.forEach(this.entries, (entry) => entry, {
      concurrency: "unbounded",
    }).pipe(Effect.map((maps) => mergeHookMaps(...maps)));
  }
}

/**
 * @since 0.0.0
 */
export const builder = () => new HookBuilder();
