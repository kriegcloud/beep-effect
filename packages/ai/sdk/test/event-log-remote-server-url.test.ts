import { Sync } from "@beep/ai-sdk";
import { expect, test } from "@effect/vitest";
import type * as HttpServer from "effect/unstable/http/HttpServer";
import { runEffect } from "./effect-test.js";

test("toWebSocketUrlEffect maps 0.0.0.0 to 127.0.0.1", async () => {
  const address: HttpServer.Address = {
    _tag: "TcpAddress",
    hostname: "0.0.0.0",
    port: 8787,
  };

  const url = await runEffect(Sync.toWebSocketUrlEffect(address));
  expect(url).toBe("ws://127.0.0.1:8787/event-log");
});

test("toWebSocketUrlEffect maps :: to ::1", async () => {
  const address: HttpServer.Address = {
    _tag: "TcpAddress",
    hostname: "::",
    port: 8787,
  };

  const url = await runEffect(Sync.toWebSocketUrlEffect(address));
  expect(url).toBe("ws://[::1]:8787/event-log");
});

test("toWebSocketUrlEffect respects path and scheme overrides", async () => {
  const address: HttpServer.Address = {
    _tag: "TcpAddress",
    hostname: "localhost",
    port: 1234,
  };

  const url = await runEffect(Sync.toWebSocketUrlEffect(address, { path: "/custom", scheme: "wss" }));
  expect(url).toBe("wss://localhost:1234/custom");
});
