import { detect } from "@beep/runtime-env/internal/osc8/detect";
import * as Wrappers from "@beep/runtime-env/internal/osc8/wrappers";
import { assert, describe, it, vi } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { deliberatelyInvalid } from "../../support/deliberatelyInvalid.ts";

describe("OSC8 missing terminal version", () => {
  it.effect("rejects a collaborator's wrapper without a name instead of explaining it", () =>
    Effect.sync(() => {
      const spy = vi
        .spyOn(Wrappers, "detectWrapper")
        .mockReturnValue(O.some(deliberatelyInvalid<Wrappers.WrapperInfo>({ name: undefined, passesThrough: false })));
      try {
        assert.throws(() => detect({ env: {}, isStdoutTTY: true, isStderrTTY: true }));
      } finally {
        spy.mockRestore();
      }
    })
  );

  it.effect("a version-gated terminal without a version explains why links are disabled", () =>
    Effect.sync(() => {
      const result = detect({ env: { TERM_PROGRAM: "iTerm.app" }, isStdoutTTY: true, isStderrTTY: true });
      assert.strictEqual(result.supported, false);
      assert.strictEqual(result.supportedForStderr, false);
      assert.strictEqual(result.reason, "terminal-known-too-old");
      assert.deepStrictEqual(result.terminalVersion, O.none());
      assert.strictEqual(result.explanation, "detected iTerm.app ; below minimum version");
    })
  );
});
