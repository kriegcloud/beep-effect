import { renameSync } from "node:fs";
import { ModelsAtomicExchange } from "@beep/repo-cli/commands/Models/Models.apply.service";
import { ModelsLocatorError } from "@beep/repo-cli/commands/Models/Models.errors";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// Model one indivisible exchange at the Effect scheduler boundary. All three
// renames run synchronously, so injected competitors cannot observe a partial
// swap. Moving directory entries preserves inodes and symlinks; no bytes copy.
// This test-only simulation makes no production cross-process atomicity claim.
export const modelsTestExchange = ModelsAtomicExchange.of({
  supported: Effect.succeed(true),
  exchange: Effect.fn("ModelsTestExchange.exchange")((left, right) =>
    Effect.try({
      try: () => {
        const temporary = `${left}.test-exchange`;
        renameSync(left, temporary);
        renameSync(right, left);
        renameSync(temporary, right);
      },
      catch: () => ModelsLocatorError.make({ message: "Test atomic exchange failed." }),
    })
  ),
});

export const modelsTestExchangeLayer = Layer.succeed(ModelsAtomicExchange, modelsTestExchange);
