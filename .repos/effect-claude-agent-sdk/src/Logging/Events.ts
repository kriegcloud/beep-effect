import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import { AgentLoggingConfig } from "./Config.js"
import { matchHookInput, matchQueryEvent, matchSdkMessage } from "./Match.js"
import type { HookInput } from "../Schema/Hooks.js"
import type { SDKMessage } from "../Schema/Message.js"
import type { QueryEvent } from "../QuerySupervisor.js"
import type { AgentLogCategory, AgentLogEvent } from "./Types.js"

const shouldLogCategory = (category: AgentLogCategory) =>
  Effect.serviceOption(AgentLoggingConfig).pipe(
    Effect.map((config) =>
      Option.match(config, {
        onNone: () => true,
        onSome: (service) => service.settings.categories[category]
      })
    )
  )

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
