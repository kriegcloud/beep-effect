import { describe, expect, it } from "tstyche";
import { VERSION } from "../src/index.ts";

describe("@beep/codedank-web", () => {
  it("exposes the typed package version", () => {
    expect(VERSION).type.toBe<"0.0.0">();
  });
});
