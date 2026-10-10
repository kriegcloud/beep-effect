import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { headerNumber, headerString } from "../../../effected/github/internal/headers.ts";

it.effect("empty header text is absent rather than a numeric zero", () => Effect.sync(() => {
  assert.strictEqual(headerString({ value: "" }, "value"), undefined);
  assert.strictEqual(headerNumber({ value: "" }, "value"), undefined);
  assert.strictEqual(headerString({ value: "0" }, "value"), "0");
  assert.strictEqual(headerNumber({ value: "0" }, "value"), 0);
}));
