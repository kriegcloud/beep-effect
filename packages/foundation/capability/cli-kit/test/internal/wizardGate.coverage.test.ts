import { WizardDropped } from "@beep/cli-kit/internal/wizardGate";
import { assert, it } from "@effect/vitest";
import * as CliConfig from "effect/cli/CliConfig";
import * as Effect from "effect/Effect";

it.effect("wizard dropped reference defaults to absence and retains the provided config identity", () =>
  Effect.gen(function* () {
    assert.strictEqual(yield* WizardDropped, undefined);
    const config = CliConfig.make({});
    assert.strictEqual(yield* WizardDropped.pipe(Effect.provideService(WizardDropped, config)), config);
    assert.strictEqual(yield* WizardDropped, undefined);
  })
);
