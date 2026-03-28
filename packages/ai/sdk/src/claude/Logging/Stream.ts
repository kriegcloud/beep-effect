import { Effect, Stream } from "effect";
import type { QueryEvent } from "../QuerySupervisor.js";
import type { HookInput } from "../Schema/Hooks.js";
import type { SDKMessage } from "../Schema/Message.js";
import { logHookInput, logQueryEvent, logSdkMessage } from "./Events.js";

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const tapSdkLogs = <E>(stream: Stream.Stream<SDKMessage, E>) =>
  stream.pipe(
    Stream.tap(logSdkMessage),
    Stream.onError((cause) => Effect.logError(cause))
  );

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const logSdkStream = <E>(stream: Stream.Stream<SDKMessage, E>) => Stream.runDrain(tapSdkLogs(stream));

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const tapQueryEvents = <E>(stream: Stream.Stream<QueryEvent, E>) =>
  stream.pipe(
    Stream.tap(logQueryEvent),
    Stream.onError((cause) => Effect.logError(cause))
  );

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const logQueryEventStream = <E>(stream: Stream.Stream<QueryEvent, E>) => Stream.runDrain(tapQueryEvents(stream));

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const tapHookInputs = <E>(stream: Stream.Stream<HookInput, E>) =>
  stream.pipe(
    Stream.tap(logHookInput),
    Stream.onError((cause) => Effect.logError(cause))
  );

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const logHookInputStream = <E>(stream: Stream.Stream<HookInput, E>) => Stream.runDrain(tapHookInputs(stream));
