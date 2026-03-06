import { AgentLoggingConfig, type AgentLoggingSettings } from "@beep/ai-sdk/Logging/Config";
import { logQueryEvent, logSdkMessage } from "@beep/ai-sdk/Logging/Events";
import { matchQueryEvent, matchSdkMessage } from "@beep/ai-sdk/Logging/Match";
import { tapSdkLogs } from "@beep/ai-sdk/Logging/Stream";
import type { QueryEvent } from "@beep/ai-sdk/QuerySupervisor";
import type {
  SDKAuthStatusMessage,
  SDKResultError,
  SDKResultSuccess,
  SDKToolProgressMessage,
} from "@beep/ai-sdk/Schema/Message";
import { makeUnsafeUtc } from "@beep/utils/DateTime";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";

const baseSettings: AgentLoggingSettings = {
  format: "json",
  minLevel: "Trace",
  includeSpans: false,
  categories: {
    messages: true,
    queryEvents: true,
    hooks: true,
  },
};

const makeLoggingLayer = (overrides?: Partial<AgentLoggingSettings>) =>
  Layer.succeed(
    AgentLoggingConfig,
    AgentLoggingConfig.of({
      settings: {
        ...baseSettings,
        ...overrides,
      },
    })
  );

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
  session_id: "session-1",
};

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
  session_id: "session-1",
};

const toolProgress: SDKToolProgressMessage = {
  type: "tool_progress",
  tool_use_id: "tool-1",
  tool_name: "search",
  parent_tool_use_id: null,
  elapsed_time_seconds: 1.2,
  uuid: "uuid-1",
  session_id: "session-1",
};

const authStatusError: SDKAuthStatusMessage = {
  type: "auth_status",
  isAuthenticating: false,
  output: ["fail"],
  error: "bad",
  uuid: "uuid-1",
  session_id: "session-1",
};

test("matchSdkMessage maps result success to info", () => {
  const event = matchSdkMessage(resultSuccess);
  expect(event.level).toBe("Info");
  expect(event.event).toBe("sdk.message.result.success");
  expect(event.category).toBe("messages");
});

test("matchSdkMessage maps error result to error", () => {
  const event = matchSdkMessage(resultError);
  expect(event.level).toBe("Error");
  expect(event.event).toBe("sdk.message.result.error");
});

test("matchSdkMessage maps tool progress to debug", () => {
  const event = matchSdkMessage(toolProgress);
  expect(event.level).toBe("Debug");
  expect(event.event).toBe("sdk.message.tool_progress");
});

test("matchSdkMessage maps auth errors to warning", () => {
  const event = matchSdkMessage(authStatusError);
  expect(event.level).toBe("Warn");
  expect(event.event).toBe("sdk.message.auth_status.error");
});

test("matchQueryEvent maps failure completion to warning", () => {
  const queryEvent: QueryEvent = {
    _tag: "QueryCompleted",
    queryId: "query-1",
    completedAt: makeUnsafeUtc(42),
    status: "failure",
  };
  const event = matchQueryEvent(queryEvent);
  expect(event.level).toBe("Warn");
  expect(event.event).toBe("agent.query.completed");
});

test("logSdkMessage runs without failure when logging is enabled", async () => {
  await Effect.runPromise(logSdkMessage(resultSuccess).pipe(Effect.provide(makeLoggingLayer())));
  expect(true).toBe(true);
});

test("logQueryEvent runs without failure when queryEvents logging is disabled", async () => {
  await Effect.runPromise(
    logQueryEvent({
      _tag: "QueryQueued",
      queryId: "query-2",
      submittedAt: makeUnsafeUtc(10),
    }).pipe(
      Effect.provide(
        makeLoggingLayer({
          categories: {
            messages: true,
            queryEvents: false,
            hooks: true,
          },
        })
      )
    )
  );
  expect(true).toBe(true);
});

test("tapSdkLogs preserves stream items", async () => {
  const output = await Effect.runPromise(
    Stream.runCollect(tapSdkLogs(Stream.fromIterable([resultSuccess]))).pipe(Effect.provide(makeLoggingLayer()))
  );
  expect(output).toEqual([resultSuccess]);
});
