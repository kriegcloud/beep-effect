import { describe, vi } from "bun:test";
import { accumulateEffectsAndReport } from "@beep/errors/server";
import { deepStrictEqual, scoped } from "@beep/testkit";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";

export class TestError extends Data.TaggedError("TestError")<{
  readonly cause: unknown;
}> {
  constructor(cause: unknown) {
    super({ cause });
  }
}

describe("errors/accumulateEffectsAndReport", () => {
  scoped(
    "collects successes/errors and logs cause",
    Effect.fn(function* () {
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      yield* Effect.addFinalizer(() => Effect.sync(() => errSpy.mockRestore()));

      const res = yield* accumulateEffectsAndReport([Effect.succeed(1), Effect.fail(new TestError("oops"))], {
        colors: false,
        concurrency: "unbounded",
        annotations: { service: "utils-test" },
      });

      deepStrictEqual(res.successes.length, 1);
      deepStrictEqual(res.errors.length, 1);

      // Verify that error details are printed to console.error
      // The output format varies: heading is only shown when stack frame parsing succeeds
      // (i.e., when error originates from project files, not node_modules/Effect internals)
      // The cause is always printed via Cause.pretty which includes the error tag
      const printed = errSpy.mock.calls.map((c) => String(c[0])).join("\n");
      deepStrictEqual(errSpy.mock.calls.length > 0, true);
      deepStrictEqual(printed.includes("TestError"), true);
    })
  );
});
