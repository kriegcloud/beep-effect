import { EditorSurface, VERSION } from "@beep/editor-lexical";
import { describe, expect, it } from "@effect/vitest";

describe("@beep/editor-lexical", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });

  it("exports the editor surface component", () => {
    expect(typeof EditorSurface).toBe("function");
  });
});
