import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { logHookInput, logQueryEvent, logSdkMessage } from "./Events.js"
import type { HookInput } from "../Schema/Hooks.js"
import type { SDKMessage } from "../Schema/Message.js"
import type { QueryEvent } from "../QuerySupervisor.js"

export const tapSdkLogs = <E>(stream: Stream.Stream<SDKMessage, E>) =>
  stream.pipe(
    Stream.tap(logSdkMessage),
    Stream.tapErrorCause((cause) => Effect.logError(cause))
  )

export const logSdkStream = <E>(stream: Stream.Stream<SDKMessage, E>) =>
  Stream.runDrain(tapSdkLogs(stream))

export const tapQueryEvents = <E>(stream: Stream.Stream<QueryEvent, E>) =>
  stream.pipe(
    Stream.tap(logQueryEvent),
    Stream.tapErrorCause((cause) => Effect.logError(cause))
  )

export const logQueryEventStream = <E>(stream: Stream.Stream<QueryEvent, E>) =>
  Stream.runDrain(tapQueryEvents(stream))

export const tapHookInputs = <E>(stream: Stream.Stream<HookInput, E>) =>
  stream.pipe(
    Stream.tap(logHookInput),
    Stream.tapErrorCause((cause) => Effect.logError(cause))
  )

export const logHookInputStream = <E>(stream: Stream.Stream<HookInput, E>) =>
  Stream.runDrain(tapHookInputs(stream))
