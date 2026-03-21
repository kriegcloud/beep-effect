import { VERSION } from "@beep/ui";
import { cn } from "@beep/ui/lib/utils";
import { describe, expect, it } from "vitest";

describe("@beep/ui", () => {
  it("exports the package version constant", () => {
    expect(VERSION).toBe("0.0.0");
  });

  it("merges tailwind classes with conflict resolution", () => {
    expect(cn("px-2 py-1", "px-4", false && "hidden", ["text-sm"])).toBe("py-1 px-4 text-sm");
  });
});
