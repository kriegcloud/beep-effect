import * as TestKit from "@beep/testkit";
import { makeWebSocket } from "@beep/utils/effect/WebSocket.ts";
import { FetchHttpClient } from "@effect/platform";
import { Effect, Exit } from "effect";

TestKit.describe("WebSocket", () => {
  TestKit.scopedLive(
    "should create a WebSocket connection",
    Effect.fn(function* () {
      const exit = yield* makeWebSocket({ url: "ws://localhost:1000" }).pipe(Effect.timeout(500), Effect.exit);
      TestKit.expect(Exit.isFailure(exit)).toBe(true);
    }, Effect.provide(FetchHttpClient.layer))
  );
});
