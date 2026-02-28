import { collectResultSuccess } from "@beep/ai-sdk/QueryResult";
import type { SDKMessage } from "@beep/ai-sdk/Schema/Message";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

const makeSuccessMessage = (result: string): SDKMessage => ({
  type: "result",
  subtype: "success",
  duration_ms: 1,
  duration_api_ms: 1,
  is_error: false,
  num_turns: 1,
  result,
  total_cost_usd: 0,
  usage: {},
  modelUsage: {},
  permission_denials: [],
  uuid: "00000000-0000-0000-0000-000000000000",
  session_id: "session-1",
});

const makeErrorMessage = (): SDKMessage => ({
  type: "result",
  subtype: "error_max_turns",
  duration_ms: 1,
  duration_api_ms: 1,
  is_error: true,
  num_turns: 1,
  total_cost_usd: 0,
  usage: {},
  modelUsage: {},
  permission_denials: [],
  errors: ["max turns reached"],
  uuid: "00000000-0000-0000-0000-000000000000",
  session_id: "session-1",
});

test("collectResultSuccess returns the final result", async () => {
  const stream = Stream.fromIterable<SDKMessage>([makeSuccessMessage("first"), makeSuccessMessage("final")]);
  const result = await Effect.runPromise(collectResultSuccess(stream));
  expect(result.result).toBe("final");
});

test("collectResultSuccess fails on error result", async () => {
  const stream = Stream.fromIterable<SDKMessage>([makeErrorMessage()]);
  const result = await Effect.runPromise(Effect.result(collectResultSuccess(stream)));
  expect(result._tag).toBe("Failure");
  if (result._tag === "Failure") {
    expect(result.failure._tag).toBe("DecodeError");
  }
});
