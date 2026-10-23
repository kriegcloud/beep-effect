// @effect-diagnostics strictEffectProvide:skip-file -- strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). Owner: @beep/scratchpad. Exit: effected-promotion graduates the module and ports this test to @effect/vitest layer() and Effect platform services.
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { CliInteractive } from "@beep/cli-kit/CliInteractive";
import { CliTheme } from "@beep/cli-kit/CliTheme";
import { CliUi } from "../../../effected/cli/ui/CliUi.ts";
import { Confirm } from "../../../effected/cli/ui/Confirm.ts";
import type { ConfirmResult } from "../../../effected/cli/ui/Confirm.ts";

describe("CliUi.prompt and CliUi.run are pipeable", () => {
	it.effect("a prompt configured once, data-last, answers each screen it is given with that screen's type", () =>
		Effect.gen(function* () {
			const promptWithDefaults = CliUi.prompt({ clear: true, otherwise: "fallback" as const });
			const answer: ConfirmResult<string> | "fallback" = yield* promptWithDefaults(Confirm.screen({ message: "Continue?" }));
			assert.strictEqual(answer, "fallback");
		}).pipe(Effect.provideService(CliInteractive, false), Effect.provide(CliTheme.layerTest())),
	);

	it.effect("a run configured once, data-last, fails as the data-first run does when nobody is there", () =>
		Effect.gen(function* () {
			const runCleared = CliUi.run({ clear: true });
			const piped = yield* Effect.flip(runCleared(Confirm.screen({ message: "Continue?" })));
			const direct = yield* Effect.flip(CliUi.run(Confirm.screen({ message: "Continue?" }), { clear: true }));
			assert.strictEqual(piped._tag, "NotInteractive");
			assert.strictEqual(direct._tag, piped._tag);
		}).pipe(Effect.provideService(CliInteractive, false), Effect.provide(CliTheme.layerTest())),
	);
});
