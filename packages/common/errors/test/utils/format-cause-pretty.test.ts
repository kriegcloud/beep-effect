import { formatCausePretty } from "@beep/errors/utils";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual } from "@effect/vitest/utils";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";

describe("errors/formatCausePretty", () => {
  it("returns raw pretty output when colors=false and colored when colors=true", () =>
    Effect.sync(() => {
      const cause = Cause.fail(new Error("boom"));
      const raw = formatCausePretty(cause, false);
      const colored = formatCausePretty(cause, true);

      deepStrictEqual(typeof raw, "string");
      deepStrictEqual(raw.includes("boom"), true);
      deepStrictEqual(colored.includes("boom"), true);
      deepStrictEqual(colored === raw, false);
      deepStrictEqual(colored.includes("\u001b["), true); // ANSI color code
    }));
});
