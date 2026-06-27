import { cn } from "@beep/ui/lib/utils";
import { describe, expect, it } from "vitest";

describe("@beep/ui", () => {
  it("merges tailwind classes with conflict resolution", () => {
    const optionalHiddenClass: false | string = false;

    expect(cn("px-2 py-1", "px-4", optionalHiddenClass, ["text-sm"])).toBe("py-1 px-4 text-sm");
  });
});
