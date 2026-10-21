import { VERSION } from "@beep/jsonc";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("@beep/jsonc", () => {
  it.effect("exports the package version", () =>
    Effect.sync(() => {
      expect(VERSION).toBe("0.0.0");
    })
  );
});
