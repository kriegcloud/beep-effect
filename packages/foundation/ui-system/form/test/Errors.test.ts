import { toFieldErrors } from "@beep/form/core/Errors";
import { describe, expect, it } from "vitest";

describe("@beep/form toFieldErrors", () => {
  it("keeps issues with string messages and bare string errors", () => {
    expect(toFieldErrors([{ message: "Required" }, "Too short"])).toEqual([
      { message: "Required" },
      { message: "Too short" },
    ]);
  });

  it("drops entries without a usable message", () => {
    expect(toFieldErrors([{ path: ["x"] }, null, undefined, 42, { message: 7 }])).toEqual([]);
  });

  it("returns an empty array for undefined", () => {
    expect(toFieldErrors(undefined)).toEqual([]);
  });
});
