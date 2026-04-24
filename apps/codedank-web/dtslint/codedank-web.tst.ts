import type { Metadata } from "next";
import { describe, expect, it } from "tstyche";
import { metadata } from "../src/app/layout.tsx";
import { VERSION } from "../src/index.ts";

describe("@beep/codedank-web", () => {
  it("exposes typed metadata and version", () => {
    expect(VERSION).type.toBe<"0.0.0">();
    expect(metadata).type.toBeAssignableTo<Metadata>();
  });
});
