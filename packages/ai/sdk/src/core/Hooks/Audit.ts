import { Clock, type Duration, Effect, HashMap, pipe, Ref, type ServiceMap, Struct } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { HookError } from "../Errors.js";
import type { HookCallback, HookEvent, HookInput, HookJSONOutput } from "../Schema/Hooks.js";
import { AuditEventStore, type StorageError } from "../Storage/index.js";
import type { HookContext } from "./Hook.js";
import { callback, matcher } from "./Hook.js";
import type { HookMap } from "./utils.js";

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export type AuditLoggingOptions = Readonly<{
  readonly strict?: undefined | boolean;
  readonly logHookOutcomes?: undefined | boolean;
  readonly logPermissionDecisions?: undefined | boolean;
  readonly matcher?: undefined | string;
  readonly timeout?: undefined | Duration.Input;
}>;

const hookEvents: ReadonlyArray<HookEvent> = [
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

const promptDecision = "prompt" as const;

type AuditEventStoreService = ServiceMap.Service.Shape<typeof AuditEventStore>;
type ResolvedPermissionDecision = {
  readonly decision: "allow" | "deny" | "prompt";
  readonly reason?: undefined | string;
};

const recordWrite = (strict: boolean, effect: Effect.Effect<void, StorageError>) =>
  strict ? effect : effect.pipe(Effect.catch(() => Effect.void));

const resolveHookToolUseId = (input: HookInput, toolUseId: string | undefined) =>
  O.fromNullishOr(toolUseId).pipe(
    O.match({
      onNone: () =>
        pipe(
          input,
          O.liftPredicate(
            (i: unknown): i is Omit<HookInput, "tool_use_id"> & { readonly tool_use_id: string } =>
              P.isNotNullish(i) && P.isObject(i) && P.hasProperty(i, "tool_use_id") && Str.isString(i.tool_use_id)
          ),
          O.map(Struct.get("tool_use_id"))
        ),
      onSome: O.some,
    })
  );

const recordHookOutcome = (
  store: AuditEventStoreService,
  strict: boolean,
  input: HookInput,
  toolUseId: string | undefined,
  outcome: "success" | "failure",
  sessionId: string
) => {
  const resolvedToolUseId = resolveHookToolUseId(input, toolUseId);
  return recordWrite(
    strict,
    store.write({
      event: "hook_event",
      payload: {
        sessionId,
        hook: input.hook_event_name,
        ...resolvedToolUseId.pipe(
          O.map((toolUseId) => ({ toolUseId })),
          O.getOrElse(() => ({}))
        ),
        outcome,
      },
    })
  );
};

const recordPermissionPrompt = (store: AuditEventStoreService, strict: boolean, input: HookInput, sessionId: string) =>
  input.hook_event_name === "PermissionRequest"
    ? recordWrite(
        strict,
        store.write({
          event: "permission_decision",
          payload: {
            sessionId,
            toolName: input.tool_name,
            decision: promptDecision,
          },
        })
      )
    : Effect.void;

const resolvePermissionDecision = (output: HookJSONOutput): ResolvedPermissionDecision | undefined => {
  if ("hookSpecificOutput" in output && output.hookSpecificOutput?.hookEventName === "PermissionRequest") {
    const decision = output.hookSpecificOutput.decision;
    const reason =
      P.hasProperty(decision, "message") && Str.isString(decision.message)
        ? decision.message
        : P.isObject(output) && P.hasProperty(output, "reason") && Str.isString(output.reason)
          ? output.reason
          : undefined;
    return {
      decision: decision.behavior,
      reason,
    };
  }

  const hookSpecific =
    P.isObject(output) && P.hasProperty(output, "hookSpecificOutput") ? output.hookSpecificOutput : undefined;
  if (hookSpecific !== undefined && P.isObject(hookSpecific) && P.hasProperty(hookSpecific, "permissionDecision")) {
    const permissionDecision = hookSpecific.permissionDecision;
    if (permissionDecision === "ask" || permissionDecision === "allow" || permissionDecision === "deny") {
      const decision = permissionDecision === "ask" ? "prompt" : permissionDecision;
      const reason =
        P.hasProperty(hookSpecific, "permissionDecisionReason") && Str.isString(hookSpecific.permissionDecisionReason)
          ? hookSpecific.permissionDecisionReason
          : P.hasProperty(output, "reason") && Str.isString(output.reason)
            ? output.reason
            : undefined;
      return {
        decision,
        ...(reason === undefined ? {} : { reason }),
      };
    }
  }

  if (P.hasProperty(output, "decision") && (output.decision === "approve" || output.decision === "block")) {
    const reason = P.hasProperty(output, "reason") && Str.isString(output.reason) ? output.reason : undefined;
    return {
      decision: output.decision === "approve" ? "allow" : "deny",
      ...(reason === undefined ? {} : { reason }),
    };
  }

  return undefined;
};

const wrapPermissionCallback =
  (hook: HookCallback, store: AuditEventStoreService, strict: boolean, sessionId: string): HookCallback =>
  async (input, toolUseId, options) => {
    const output = await hook(input, toolUseId, options);
    if (input.hook_event_name !== "PermissionRequest" && input.hook_event_name !== "PreToolUse") {
      return output;
    }

    const resolved = resolvePermissionDecision(output);
    if (resolved === undefined) return output;

    const resolvedSessionId = sessionId || input.session_id;
    const effect = store.write({
      event: "permission_decision",
      payload: {
        sessionId: resolvedSessionId,
        toolName: input.tool_name,
        decision: resolved.decision,
        ...(resolved.reason === undefined ? {} : { reason: resolved.reason }),
      },
    });

    await Effect.runPromise(recordWrite(strict, effect));
    return output;
  };

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const wrapPermissionHooks = Effect.fn("Hooks.wrapPermissionHooks")(function* (
  hooks: HookMap,
  sessionId: string,
  options?: undefined | AuditLoggingOptions
) {
  const logPermissionDecisions = options?.logPermissionDecisions ?? true;
  if (!logPermissionDecisions) return hooks;
  const store = yield* AuditEventStore;
  const strict = options?.strict ?? false;
  const matchers = hooks.PermissionRequest;
  const preToolMatchers = hooks.PreToolUse;
  if (
    (matchers === undefined || matchers.length === 0) &&
    (preToolMatchers === undefined || preToolMatchers.length === 0)
  ) {
    return hooks;
  }

  const wrapped: HookMap = {
    ...hooks,
    ...(matchers !== undefined && matchers.length > 0
      ? {
          PermissionRequest: matchers.map((matcherEntry) => ({
            matcher: matcherEntry.matcher,
            timeout: matcherEntry.timeout,
            hooks: matcherEntry.hooks.map((hook) => wrapPermissionCallback(hook, store, strict, sessionId)),
          })),
        }
      : {}),
    ...(preToolMatchers !== undefined && preToolMatchers.length > 0
      ? {
          PreToolUse: preToolMatchers.map((matcherEntry) => ({
            matcher: matcherEntry.matcher,
            timeout: matcherEntry.timeout,
            hooks: matcherEntry.hooks.map((hook) => wrapPermissionCallback(hook, store, strict, sessionId)),
          })),
        }
      : {}),
  };

  return wrapped;
});

const recordToolStart = (store: AuditEventStoreService, strict: boolean, input: HookInput, sessionId: string) =>
  input.hook_event_name === "PreToolUse"
    ? recordWrite(
        strict,
        store.write({
          event: "tool_use",
          payload: {
            sessionId,
            toolName: input.tool_name,
            toolUseId: input.tool_use_id,
            status: "start",
          },
        })
      )
    : Effect.void;

const recordToolFinish = (
  store: AuditEventStoreService,
  strict: boolean,
  input: HookInput,
  sessionId: string,
  status: "success" | "failure",
  durationMs?: undefined | number
) =>
  input.hook_event_name === "PostToolUse" || input.hook_event_name === "PostToolUseFailure"
    ? recordWrite(
        strict,
        store.write({
          event: "tool_use",
          payload: {
            sessionId,
            toolName: input.tool_name,
            toolUseId: input.tool_use_id,
            status,
            ...(durationMs !== undefined ? { durationMs } : {}),
          },
        })
      )
    : Effect.void;

const resolveDuration = (startRef: Ref.Ref<HashMap.HashMap<string, number>>, toolUseId: string) =>
  Ref.modify(startRef, (state) => {
    const start = HashMap.get(state, toolUseId);
    if (O.isNone(start)) return [undefined, state] as const;
    const next = HashMap.remove(state, toolUseId);
    return [start.value, next] as const;
  }).pipe(
    Effect.flatMap((start) =>
      start === undefined
        ? Effect.as(Effect.void, undefined)
        : Clock.currentTimeMillis.pipe(Effect.map((now) => now - start))
    )
  );

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const withAuditLogging = Effect.fn("Hooks.withAuditLogging")(function* (
  sessionId: string,
  options?: undefined | AuditLoggingOptions
) {
  const store = yield* AuditEventStore;
  const strict = options?.strict ?? false;
  const logHookOutcomes = options?.logHookOutcomes ?? true;
  const logPermissionDecisions = options?.logPermissionDecisions ?? true;
  const toolUseStarts = yield* Ref.make<HashMap.HashMap<string, number>>(HashMap.empty());

  const handler = (input: HookInput, context: HookContext) =>
    Effect.gen(function* () {
      const resolvedSessionId = sessionId || input.session_id;

      if (input.hook_event_name === "PreToolUse") {
        const now = yield* Clock.currentTimeMillis;
        yield* Ref.update(toolUseStarts, (state) => HashMap.set(state, input.tool_use_id, now));
        yield* recordToolStart(store, strict, input, resolvedSessionId);
      }

      if (input.hook_event_name === "PostToolUse") {
        const durationMs = yield* resolveDuration(toolUseStarts, input.tool_use_id);
        yield* recordToolFinish(store, strict, input, resolvedSessionId, "success", durationMs);
      }

      if (input.hook_event_name === "PostToolUseFailure") {
        const durationMs = yield* resolveDuration(toolUseStarts, input.tool_use_id);
        yield* recordToolFinish(store, strict, input, resolvedSessionId, "failure", durationMs);
      }

      if (logPermissionDecisions) {
        yield* recordPermissionPrompt(store, strict, input, resolvedSessionId);
      }

      if (logHookOutcomes) {
        yield* recordHookOutcome(store, strict, input, context.toolUseID, "success", resolvedSessionId);
      }

      return {} satisfies HookJSONOutput;
    }).pipe(
      Effect.catch((cause) => {
        const recordFailure = logHookOutcomes
          ? recordHookOutcome(store, false, input, context.toolUseID, "failure", sessionId || input.session_id)
          : Effect.void;
        return recordFailure.pipe(Effect.andThen(Effect.fail(cause)));
      }),
      Effect.mapError(
        (cause) =>
          new HookError({
            message: "Audit hook failed",
            cause,
          })
      )
    );

  const auditCallback = yield* callback(handler);
  const auditMatcher = matcher({
    matcher: options?.matcher,
    timeout: options?.timeout,
    hooks: [auditCallback],
  });

  const hooks: Partial<Record<HookEvent, HookMap[HookEvent]>> = {};
  for (const event of hookEvents) {
    hooks[event] = [auditMatcher];
  }

  return hooks as HookMap;
});
