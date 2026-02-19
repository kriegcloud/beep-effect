import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { VERSION } from "../src/index.js";

describe("@beep/repo-utils", () => {
  it.effect("should export VERSION", () =>
    Effect.gen(function* () {
      expect(VERSION).toBe("0.0.0");
    })
  );
});
