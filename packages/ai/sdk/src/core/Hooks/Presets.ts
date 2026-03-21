import { Clock, Effect, MutableHashMap } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { HookEvent, PermissionRequestHookInput } from "../Schema/Hooks.js";
import { onPermissionRequest, onPostToolUse, onPostToolUseFailure, onPreToolUse, tap } from "./Hook.js";
import { mergeHookMaps } from "./utils.js";

const allEvents: ReadonlyArray<HookEvent> = [
  "PreToolUse",
  "PostToolUse",
  "PostToolUseFailure",
  "Notification",
  "UserPromptSubmit",
  "SessionStart",
  "SessionEnd",
  "Stop",
  "SubagentStart",
  "SubagentStop",
  "PreCompact",
  "PermissionRequest",
  "Setup",
];

const encodeJson = S.encodeUnknownOption(S.UnknownFromJsonString);

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const consoleLogger = (options?: {
  readonly events?: ReadonlyArray<HookEvent>;
  readonly format?: "json" | "pretty";
}) =>
  tap(options?.events ?? allEvents, (input) =>
    Effect.sync(() => {
      if (options?.format === "json") {
        console.log(O.getOrElse(encodeJson(input), () => String(input)));
        return;
      }
      console.log(`[${input.hook_event_name}] ${input.session_id}`);
    })
  );

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const autoApprove = (tools: ReadonlyArray<string>) =>
  onPermissionRequest((input: PermissionRequestHookInput) =>
    tools.includes(input.tool_name)
      ? Effect.succeed({
          hookSpecificOutput: {
            hookEventName: "PermissionRequest",
            decision: { behavior: "allow" },
          },
        })
      : Effect.succeed({})
  );

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const autoDeny = (options: {
  readonly tools: ReadonlyArray<string>;
  readonly match?: string;
  readonly message?: string;
  readonly interrupt?: boolean;
}) =>
  onPermissionRequest((input: PermissionRequestHookInput) => {
    if (!options.tools.includes(input.tool_name)) {
      return Effect.succeed({});
    }
    if (options.match !== undefined) {
      const raw = O.getOrElse(encodeJson(input.tool_input ?? ""), () => String(input.tool_input ?? ""));
      if (!raw.includes(options.match)) {
        return Effect.succeed({});
      }
    }
    return Effect.succeed({
      hookSpecificOutput: {
        hookEventName: "PermissionRequest",
        decision: {
          behavior: "deny",
          ...(options.message === undefined ? {} : { message: options.message }),
          ...(options.interrupt !== undefined ? { interrupt: options.interrupt } : {}),
        },
      },
    });
  });

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const timing = <R>(onComplete: (toolName: string, durationMs: number) => Effect.Effect<void, never, R>) =>
  Effect.gen(function* () {
    const startTimes = MutableHashMap.empty<string, number>();
    const onStart = yield* onPreToolUse((input) =>
      Clock.currentTimeMillis.pipe(
        Effect.tap((now) =>
          Effect.sync(() => {
            MutableHashMap.set(startTimes, input.tool_use_id, now);
          })
        ),
        Effect.asVoid,
        Effect.as({})
      )
    );
    const onFinish = yield* onPostToolUse((input) =>
      Clock.currentTimeMillis.pipe(
        Effect.flatMap((now) => {
          const startedAt = MutableHashMap.get(startTimes, input.tool_use_id);
          if (O.isNone(startedAt)) return Effect.succeed({});
          MutableHashMap.remove(startTimes, input.tool_use_id);
          return onComplete(input.tool_name, Math.max(0, now - startedAt.value)).pipe(Effect.as({}));
        })
      )
    );
    const onFailure = yield* onPostToolUseFailure((input) =>
      Clock.currentTimeMillis.pipe(
        Effect.flatMap((now) => {
          const startedAt = MutableHashMap.get(startTimes, input.tool_use_id);
          if (O.isNone(startedAt)) return Effect.succeed({});
          MutableHashMap.remove(startTimes, input.tool_use_id);
          return onComplete(input.tool_name, Math.max(0, now - startedAt.value)).pipe(Effect.as({}));
        })
      )
    );
    return mergeHookMaps(onStart, onFinish, onFailure);
  });
