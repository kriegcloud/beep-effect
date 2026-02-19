import { describe, vi } from "bun:test";
import { accumulateEffectsAndReport } from "@beep/errors/server";
import { deepStrictEqual, scoped } from "@beep/testkit";
import * as Effect from "effect/Effect";

describe("errors/accumulateEffectsAndReport", () => {
  scoped("collects successes/errors and logs a heading and cause", () =>
    Effect.gen(function* () {
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      yield* Effect.addFinalizer(() => Effect.sync(() => errSpy.mockRestore()));

      const res = yield* accumulateEffectsAndReport([Effect.succeed(1), Effect.fail(new Error("oops"))], {
        colors: false,
        concurrency: "unbounded",
        annotations: { service: "utils-test" },
      });

      deepStrictEqual(res.successes.length, 1);
      deepStrictEqual(res.errors.length, 1);

      const printed = errSpy.mock.calls.map((c) => String(c[0])).join("\n");
      deepStrictEqual(printed.includes("🗂 Path:"), true);
      deepStrictEqual(printed.includes("💬 Message: oops"), true);
    })
  );
});
