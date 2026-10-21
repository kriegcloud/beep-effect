import { VERSION } from "@beep/walker";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("@beep/walker", () => {
  it.effect("exports the package version", () =>
    Effect.sync(() => {
      expect(VERSION).toBe("0.0.0");
    })
  );
});
