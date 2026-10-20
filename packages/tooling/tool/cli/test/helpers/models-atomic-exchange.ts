import { ModelsAtomicExchange } from "@beep/repo-cli/commands/Models/Models.apply.service";
import { ModelsLocatorError } from "@beep/repo-cli/commands/Models/Models.errors";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";

// Test competitors run only before or after this uninterruptible transaction.
// Moving directory entries preserves inodes and symlinks; no bytes are copied.
// This deterministic model is not a production cross-process exchange fallback.
export const modelsTestExchangeLayer = Layer.effect(
  ModelsAtomicExchange,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    return ModelsAtomicExchange.of({
      supported: Effect.succeed(true),
      exchange: Effect.fn("ModelsTestExchange.exchange")((left, right) =>
        Effect.gen(function* () {
          const temporary = `${left}.test-exchange`;
          yield* fs.rename(left, temporary);
          yield* fs.rename(right, left);
          yield* fs.rename(temporary, right);
        }).pipe(Effect.uninterruptible, ModelsLocatorError.mapError("Test atomic exchange failed."))
      ),
    });
  })
);
