import * as Effect from "effect/Effect"
import { AgentLoggingConfig } from "./Config.js"
import { matchHookInput, matchQueryEvent, matchSdkMessage } from "./Match.js"
import type { HookInput } from "../Schema/Hooks.js"
import type { SDKMessage } from "../Schema/Message.js"
import type { QueryEvent } from "../QuerySupervisor.js"
import type { AgentLogCategory, AgentLogEvent } from "./Types.js"

const shouldLogCategory = (category: AgentLogCategory) =>
  Effect.map(AgentLoggingConfig, (config) => config.settings.categories[category])

const logAgentEvent = (event: AgentLogEvent) =>
  Effect.annotateLogs({
    event: event.event,
    category: event.category,
    ...event.annotations
  })(
    Effect.logWithLevel(
      event.level,
      event.data
        ? {
            event: event.event,
            message: event.message,
            data: event.data
          }
        : {
            event: event.event,
            message: event.message
          }
    )
  )

const logIfEnabled = (event: AgentLogEvent) =>
  Effect.flatMap(shouldLogCategory(event.category), (enabled) =>
    enabled
      ? Effect.whenLogLevel(logAgentEvent(event), event.level).pipe(Effect.asVoid)
      : Effect.void
  )

export const logSdkMessage = (message: SDKMessage) =>
  logIfEnabled(matchSdkMessage(message))

export const logQueryEvent = (event: QueryEvent) =>
  logIfEnabled(matchQueryEvent(event))

export const logHookInput = (input: HookInput) =>
  logIfEnabled(matchHookInput(input))
