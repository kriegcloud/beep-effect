import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit } from "effect";

describe("Server", () => {
  describe("Effect Operations", () => {
    it.effect("can perform basic Effect operations", () =>
      Effect.gen(function* () {
        // Arrange & Act: Create and yield a simple Effect
        const value = yield* Effect.succeed(42);

        // Assert: Verify the value
        expect(value).toBe(42);
      }),
    );

    it.effect("can chain Effect operations", () =>
      Effect.gen(function* () {
        // Arrange: Create effects that chain together
        const result = yield* Effect.succeed(10).pipe(
          Effect.map((n) => n * 2),
          Effect.flatMap((n) => Effect.succeed(n + 5)),
        );

        // Assert: Verify the chained result
        expect(result).toBe(25);
      }),
    );

    it.effect("can handle Effect failures as Exit", () =>
      Effect.gen(function* () {
        // Arrange: Create an effect that fails
        const failingEffect = Effect.fail("Test error");

        // Act: Capture the result as an Exit
        const result = yield* Effect.exit(failingEffect);

        // Assert: Verify the failure
        expect(result).toStrictEqual(Exit.fail("Test error"));
      }),
    );

    it.effect("can log messages", () =>
      Effect.gen(function* () {
        // Act: Run an effect that logs (logs are suppressed in test context)
        yield* Effect.log("Test log message");

        // Assert: Effect completes successfully
        expect(true).toBe(true);
      }),
    );
  });

  describe("Module Structure", () => {
    it.effect("can import domain types", () =>
      Effect.gen(function* () {
        // This test verifies that the server module structure is valid
        // by checking that required dependencies can be imported
        const apiModule = yield* Effect.promise(
          () => import("@repo/domain/Api"),
        );
        const rpcModule = yield* Effect.promise(
          () => import("@repo/domain/Rpc"),
        );
        const wsModule = yield* Effect.promise(
          () => import("@repo/domain/WebSocket"),
        );

        expect(apiModule).toBeDefined();
        expect(apiModule.Api).toBeDefined();
        expect(rpcModule).toBeDefined();
        expect(rpcModule.EventRpc).toBeDefined();
        expect(wsModule).toBeDefined();
        expect(wsModule.WebSocketRpc).toBeDefined();
      }),
    );
  });
});
