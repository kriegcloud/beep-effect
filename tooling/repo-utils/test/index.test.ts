import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { VERSION } from "../src/index.js";

describe("@beep/repo-utils", () => {
  it.effect("should export VERSION", () =>
    Effect.sync(() => {
      expect(VERSION).toBe("0.0.0");
    })
  );
});
