// @effect-diagnostics strictEffectProvide:skip-file -- strictEffectProvide because each test provides its test layers at its own entry point (operator ruling 2026-10-09). Owner: @beep/cli-kit. Exit: effected-promotion graduates the module and ports this test to @effect/vitest layer() and Effect platform services.

import { CliInteractive } from "@beep/cli-kit";
import { Audience, TerminalEnv } from "@beep/runtime-env";
import { assert, describe, it } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import type { AudienceKind } from "@beep/runtime-env";

const decide = (
  kind: AudienceKind,
  stdinIsTerminal: boolean,
  stdoutIsTerminal: boolean,
  env: Record<string, string> = {}
) =>
  CliInteractive.pipe(
    Effect.provide(
      CliInteractive.layer.pipe(
        Layer.provide(
          Layer.mergeAll(
            Audience.layerTest(kind),
            TerminalEnv.layerTest({ stdinIsTerminal, stdout: { isTerminal: stdoutIsTerminal } })
          )
        )
      )
    ),
    // The environment is fixed, never the host's, and provided outside the layer that reads it: TERM decides too.
    Effect.provideService(ConfigProvider.ConfigProvider, ConfigProvider.fromUnknown(env))
  );

describe("CliInteractive.layer", () => {
  const kinds: ReadonlyArray<AudienceKind> = ["human", "agent", "ci"];
  for (const kind of kinds) {
    for (const stdin of [true, false]) {
      for (const stdout of [true, false]) {
        // Only a human with a terminal on both ends is interactive.
        const expected = kind === "human" && stdin && stdout;
        it.effect(`${kind}, stdin TTY ${stdin}, stdout TTY ${stdout} => ${expected}`, () =>
          Effect.gen(function* () {
            assert.strictEqual(yield* decide(kind, stdin, stdout), expected);
          })
        );
      }
    }
  }

  it.effect("a human on two terminals is not interactive when TERM is dumb: it cannot move the cursor", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* decide("human", true, true, { TERM: "dumb" }), false);
      assert.strictEqual(yield* decide("human", true, true, { TERM: "xterm-256color" }), true, "control: a real TERM");
      assert.strictEqual(yield* decide("human", true, true, { TERM: "" }), true, "an empty TERM is unset");
    })
  );

  it.effect("defaults to non-interactive when no layer is provided", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* CliInteractive, false);
    })
  );
});

it.layer(CliInteractive.layerTest(true), { timeout: "30 seconds" })("CliInteractive.unless", (it) => {
  const read = CliInteractive;

  it.effect("unless(true) turns an interactive scope off", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* CliInteractive.unless(true)(read), false);
    })
  );

  it.effect("unless(false) leaves an interactive scope interactive", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* CliInteractive.unless(false)(read), true);
    })
  );

  it.effect("restores the outer value after the scope exits", () =>
    Effect.gen(function* () {
      const inside = yield* CliInteractive.unless(true)(read);
      const after = yield* read;
      assert.strictEqual(inside, false);
      assert.strictEqual(after, true);
    })
  );

  it.effect("narrowing nests: an inner unless(false) cannot undo an outer unless(true)", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* read.pipe(CliInteractive.unless(false), CliInteractive.unless(true)), false);
    })
  );

  it.effect("restores the outer value when the scoped effect fails", () =>
    Effect.gen(function* () {
      yield* Effect.fail("boom").pipe(CliInteractive.unless(true), Effect.ignore);
      assert.strictEqual(yield* read, true);
    })
  );

  it.effect("an interrupted unless scope still restores the outer value", () =>
    Effect.gen(function* () {
      const fiber = yield* Effect.never.pipe(CliInteractive.unless(true), Effect.forkChild);
      yield* Effect.yieldNow;
      yield* Fiber.interrupt(fiber);
      assert.strictEqual(yield* read, true);
    })
  );
});

it.layer(CliInteractive.layerTest(false), { timeout: "30 seconds" })(
  "CliInteractive.unless in a non-interactive scope",
  (it) => {
    const read = CliInteractive;

    it.effect("unless(false) never turns a non-interactive scope on", () =>
      Effect.gen(function* () {
        assert.strictEqual(yield* CliInteractive.unless(false)(read), false);
        assert.strictEqual(yield* CliInteractive.unless(true)(read), false);
      })
    );
  }
);
