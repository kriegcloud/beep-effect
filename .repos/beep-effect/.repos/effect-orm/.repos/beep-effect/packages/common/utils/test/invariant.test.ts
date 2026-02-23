import { expect } from "bun:test";
import { invariant } from "@beep/invariant";
import { InvariantViolation } from "@beep/invariant/error";
import { effect } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("invariant formats circular args and BUG messages", () =>
  Effect.gen(function* () {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(() =>
      invariant(false, "BUG: circular", {
        file: "packages/common/utils/test/invariant.test.ts",
        line: 10,
        args: [circular],
      })
    ).toThrow(InvariantViolation);
  })
);

effect("invariant helpers propagate failures", () =>
  Effect.gen(function* () {
    expect(() =>
      invariant.unreachable("never" as never, "unreachable branch", { file: "file.ts", line: 20, args: [] })
    ).toThrow(InvariantViolation);

    expect(() => invariant.nonNull(null, "missing value", { file: "file.ts", line: 30, args: [] })).toThrow(
      InvariantViolation
    );
  })
);
