import { ModelsAtomicExchange, makeModelsAtomicExchange } from "@beep/repo-cli/commands/Models/Models.apply.service";
import { ModelsExchangeFault, ModelsExchangeProbeError } from "@beep/repo-cli/commands/Models/Models.errors";
import { ModelsExchangeFilesystemIdentity } from "@beep/repo-cli/commands/Models/Models.exchange.schemas";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type { ModelsExchangeSystemShape } from "@beep/repo-cli/commands/Models/Models.apply.service";

// Test competitors run only before or after this uninterruptible transaction.
// Moving directory entries preserves inodes and symlinks; no bytes are copied.
// This deterministic model is not a production cross-process exchange fallback.
export const makeModelsTestExchangeSystem = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem;
  return {
    identify: (directory) =>
      fs.stat(directory).pipe(
        Effect.map((info) =>
          ModelsExchangeFilesystemIdentity.make({ device: info.dev, filesystemType: O.some("test-rename") })
        ),
        ModelsExchangeProbeError.mapError("Test filesystem identity failed.", directory)
      ),
    exchange: Effect.fn("ModelsTestExchange.exchange")((left, right) =>
      Effect.gen(function* () {
        const temporary = `${left}.test-exchange`;
        yield* fs.rename(left, temporary);
        yield* fs.rename(right, left);
        yield* fs.rename(temporary, right);
      }).pipe(
        Effect.uninterruptible,
        Effect.mapError((error) =>
          ModelsExchangeFault.make({ reason: "unknown", message: `Test atomic exchange failed: ${error.message}` })
        )
      )
    ),
  } satisfies ModelsExchangeSystemShape;
});

export const modelsTestExchangeLayer = Layer.effect(
  ModelsAtomicExchange,
  makeModelsTestExchangeSystem().pipe(Effect.flatMap(makeModelsAtomicExchange))
);
