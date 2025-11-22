import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { constLiteral } from "@beep/utils/const";
import * as Effect from "effect/Effect";

effect("constLiteral preserves literal inference", () =>
  Effect.gen(function* () {
    const literal = constLiteral("tenant");
    const numeric = constLiteral(5);

    expect(literal).toBe("tenant");
    expect(numeric).toBe(5);
  })
);
