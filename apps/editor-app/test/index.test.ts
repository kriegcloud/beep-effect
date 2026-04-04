import { describe, expect, it } from "@effect/vitest";
import { VERSION } from "../src/index.ts";

describe("@beep/editor-app", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });
});
