import { expect, test } from "@effect/vitest";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Mcp from "../src/Mcp.ts";
import { runEffect } from "./effect-test.js";

test("ElicitationCapability normalizes empty objects to form support", async () => {
  const decoded = await runEffect(S.decodeUnknownEffect(Mcp.ElicitationCapability)({}));

  expect(O.isSome(decoded.form)).toBe(true);
  expect(O.isNone(decoded.url)).toBe(true);
});

test("ElicitationCapability validates loose JSON extras", async () => {
  const result = await runEffect(
    Effect.result(S.decodeUnknownEffect(Mcp.ElicitationCapability)({ extra: () => "not-json" }))
  );

  expect(Result.isFailure(result)).toBe(true);
});

test("Task decodes durations and encodes null ttl", async () => {
  const decoded = await runEffect(
    S.decodeUnknownEffect(Mcp.Task)({
      taskId: "task-1",
      status: "working",
      ttl: null,
      createdAt: "2026-03-28T12:00:00Z",
      lastUpdatedAt: "2026-03-28T12:01:00Z",
      pollInterval: 500,
      statusMessage: "still working",
    })
  );

  expect(O.isNone(decoded.ttl)).toBe(true);
  expect(O.isSome(decoded.pollInterval)).toBe(true);
  if (O.isSome(decoded.pollInterval)) {
    expect(Duration.toMillis(decoded.pollInterval.value)).toBe(500);
  }

  const encoded = await runEffect(S.encodeEffect(Mcp.Task)(decoded));
  expect(encoded.ttl).toBeNull();
  expect(encoded.pollInterval).toBe(500);
});

test("ElicitResult normalizes null content to Option.none", async () => {
  const decoded = await runEffect(
    S.decodeUnknownEffect(Mcp.ElicitResult)({
      action: "accept",
      content: null,
    })
  );

  expect(O.isNone(decoded.content)).toBe(true);
});

test("ClientRequest decodes method-tagged task requests", async () => {
  const decoded = await runEffect(
    S.decodeUnknownEffect(Mcp.ClientRequest)({
      method: "tasks/get",
      params: {
        taskId: "task-1",
      },
    })
  );

  expect(decoded.method).toBe("tasks/get");
  if (decoded.method === "tasks/get") {
    expect(decoded.params.taskId).toBe("task-1");
  }
});

test("getRequestSchema returns the matching request schema", async () => {
  const schema = Mcp.getRequestSchema("tasks/get");
  const decoded = await runEffect(
    S.decodeUnknownEffect(schema)({
      method: "tasks/get",
      params: {
        taskId: "task-42",
      },
    })
  );

  expect(decoded.method).toBe("tasks/get");
  if (decoded.method === "tasks/get") {
    expect(decoded.params.taskId).toBe("task-42");
  }
});

test("Root rejects non-file URIs", async () => {
  const result = await runEffect(Effect.result(S.decodeUnknownEffect(Mcp.Root)({ uri: "https://example.com/root" })));

  expect(Result.isFailure(result)).toBe(true);
});
