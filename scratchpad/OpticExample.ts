import { BunRuntime } from "@effect/platform-bun";
import { Effect, Optic } from "effect";

const program = Effect.gen(function* () {
  yield* Effect.logInfo("Starting Optic Example program...");

  yield* Effect.logInfo("Optic Example program finished.");
});

BunRuntime.runMain(program);
