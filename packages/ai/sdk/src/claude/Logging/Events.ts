import { Effect } from "effect";
import type { QueryEvent } from "../QuerySupervisor.js";
import type { HookInput } from "../Schema/Hooks.js";
import type { SDKMessage } from "../Schema/Message.js";
import { AgentLoggingConfig } from "./Config.js";
import { matchHookInput, matchQueryEvent, matchSdkMessage } from "./Match.js";
import type { AgentLogCategory, AgentLogEvent } from "./Types.js";

const shouldLogCategory = (category: AgentLogCategory) =>
  Effect.map(Effect.service(AgentLoggingConfig), (config) => config.settings.categories[category]);

const logAgentEvent = (event: AgentLogEvent) => {
  const payload =
    event.data !== undefined
      ? {
          event: event.event,
          message: event.message,
          data: event.data,
        }
      : {
          event: event.event,
          message: event.message,
        };

  return Effect.logWithLevel(event.level)(payload).pipe(
    Effect.annotateLogs({
      event: event.event,
      category: event.category,
      ...event.annotations,
    })
  );
};

const logIfEnabled = (event: AgentLogEvent) =>
  Effect.flatMap(shouldLogCategory(event.category), (enabled) =>
    enabled ? logAgentEvent(event).pipe(Effect.asVoid) : Effect.void
  );

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const logSdkMessage = (message: SDKMessage) => logIfEnabled(matchSdkMessage(message));

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const logQueryEvent = (event: QueryEvent) => logIfEnabled(matchQueryEvent(event));

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const logHookInput = (input: HookInput) => logIfEnabled(matchHookInput(input));
