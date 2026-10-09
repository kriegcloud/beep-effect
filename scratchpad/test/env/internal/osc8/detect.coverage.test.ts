import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { detect } from "../../../../effected/env/internal/osc8/detect.ts";

describe("OSC8 missing terminal version", () => {
  it.effect("a version-gated terminal without a version explains why links are disabled", () => Effect.sync(() => {
    const result = detect({ env: { TERM_PROGRAM: "iTerm.app" }, isStdoutTTY: true, isStderrTTY: true });
    assert.strictEqual(result.supported, false);
    assert.strictEqual(result.supportedForStderr, false);
    assert.strictEqual(result.reason, "terminal-known-too-old");
    assert.strictEqual(result.terminalVersion, null);
    assert.strictEqual(result.explanation, "detected iTerm.app ; below minimum version");
  }));
});
