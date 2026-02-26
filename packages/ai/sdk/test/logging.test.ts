import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as HashMap from "effect/HashMap"
import * as Layer from "effect/Layer"
import * as LogLevel from "effect/LogLevel"
import * as Logger from "effect/Logger"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"
import { AgentLoggingConfig, type AgentLoggingSettings } from "../src/Logging/Config.js"
import { logSdkMessage, logQueryEvent } from "../src/Logging/Events.js"
import { matchQueryEvent, matchSdkMessage } from "../src/Logging/Match.js"
import { tapSdkLogs } from "../src/Logging/Stream.js"
import type {
  SDKAuthStatusMessage,
  SDKResultError,
  SDKResultSuccess,
  SDKToolProgressMessage
} from "../src/Schema/Message.js"
import type { QueryEvent } from "../src/QuerySupervisor.js"

const baseSettings: AgentLoggingSettings = {
  format: "json",
  minLevel: LogLevel.Trace,
  includeSpans: false,
  categories: {
    messages: true,
    queryEvents: true,
    hooks: true
  }
}

type LoggingOverrides =
  & Partial<Omit<AgentLoggingSettings, "categories">>
  & { readonly categories?: Partial<AgentLoggingSettings["categories"]> }

const makeLoggingLayer = (overrides: LoggingOverrides = {}) => {
  const logs: Array<Logger.Logger.Options<unknown>> = []
  const logger = Logger.make((options) => {
    logs.push(options)
  })
  const settings: AgentLoggingSettings = {
    ...baseSettings,
    ...overrides,
    categories: {
      ...baseSettings.categories,
      ...overrides.categories
    }
  }
  const layer = Layer.mergeAll(
    Logger.replace(Logger.defaultLogger, logger),
    Logger.minimumLogLevel(settings.minLevel),
    Layer.succeed(AgentLoggingConfig, AgentLoggingConfig.of({ settings }))
  )
  return { logs, layer, settings }
}

const resultSuccess: SDKResultSuccess = {
  type: "result",
  subtype: "success",
  duration_ms: 12,
  duration_api_ms: 10,
  is_error: false,
  num_turns: 1,
  result: "ok",
  total_cost_usd: 0,
  usage: {},
  modelUsage: {},
  permission_denials: [],
  uuid: "uuid-1",
  session_id: "session-1"
}

const resultError: SDKResultError = {
  type: "result",
  subtype: "error_max_turns",
  duration_ms: 12,
  duration_api_ms: 10,
  is_error: true,
  num_turns: 2,
  total_cost_usd: 0,
  usage: {},
  modelUsage: {},
  permission_denials: [],
  errors: ["boom"],
  uuid: "uuid-1",
  session_id: "session-1"
}

const toolProgress: SDKToolProgressMessage = {
  type: "tool_progress",
  tool_use_id: "tool-1",
  tool_name: "search",
  parent_tool_use_id: null,
  elapsed_time_seconds: 1.2,
  uuid: "uuid-1",
  session_id: "session-1"
}

const authStatusError: SDKAuthStatusMessage = {
  type: "auth_status",
  isAuthenticating: false,
  output: ["fail"],
  error: "bad",
  uuid: "uuid-1",
  session_id: "session-1"
}

test("matchSdkMessage maps result success to info", () => {
  const event = matchSdkMessage(resultSuccess)
  expect(event.level).toBe(LogLevel.Info)
  expect(event.event).toBe("sdk.message.result.success")
  expect(event.category).toBe("messages")
})

test("matchSdkMessage maps error result to error", () => {
  const event = matchSdkMessage(resultError)
  expect(event.level).toBe(LogLevel.Error)
  expect(event.event).toBe("sdk.message.result.error")
})

test("matchSdkMessage maps tool progress to debug", () => {
  const event = matchSdkMessage(toolProgress)
  expect(event.level).toBe(LogLevel.Debug)
  expect(event.event).toBe("sdk.message.tool_progress")
})

test("matchSdkMessage maps auth errors to warning", () => {
  const event = matchSdkMessage(authStatusError)
  expect(event.level).toBe(LogLevel.Warning)
  expect(event.event).toBe("sdk.message.auth_status.error")
})

test("matchQueryEvent maps failure completion to warning", () => {
  const queryEvent: QueryEvent = {
    _tag: "QueryCompleted",
    queryId: "query-1",
    completedAt: 42,
    status: "failure"
  }
  const event = matchQueryEvent(queryEvent)
  expect(event.level).toBe(LogLevel.Warning)
  expect(event.event).toBe("agent.query.completed")
})

test("logSdkMessage emits annotations", async () => {
  const { logs, layer } = makeLoggingLayer()

  await Effect.runPromise(logSdkMessage(resultSuccess).pipe(Effect.provide(layer)))

  expect(logs).toHaveLength(1)
  const entry = logs[0]!
  expect(entry.logLevel).toBe(LogLevel.Info)

  const payload = Array.isArray(entry.message)
    ? entry.message[0]
    : entry.message
  expect((payload as { event?: string }).event).toBe("sdk.message.result.success")

  const sessionId = Option.getOrUndefined(HashMap.get(entry.annotations, "session_id"))
  expect(sessionId).toBe("session-1")
  const category = Option.getOrUndefined(HashMap.get(entry.annotations, "category"))
  expect(category).toBe("messages")
})

test("logQueryEvent respects category toggles", async () => {
  const { logs, layer } = makeLoggingLayer({
    categories: { queryEvents: false }
  })

  await Effect.runPromise(
    logQueryEvent({
      _tag: "QueryQueued",
      queryId: "query-2",
      submittedAt: 10
    }).pipe(Effect.provide(layer))
  )

  expect(logs).toHaveLength(0)
})

test("tapSdkLogs logs stream items", async () => {
  const { logs, layer } = makeLoggingLayer()

  await Effect.runPromise(
    Stream.runDrain(tapSdkLogs(Stream.fromIterable([resultSuccess]))).pipe(
      Effect.provide(layer)
    )
  )

  expect(logs).toHaveLength(1)
})
