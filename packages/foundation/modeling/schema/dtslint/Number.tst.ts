import { describe, expect, it } from "tstyche";
import type { NonNegativeInt, NonNegNum } from "@beep/schema/Number";

describe("Number schemas", () => {
  it("keeps non-negative number and integer exports available from the Number subpath", () => {
    expect<NonNegNum>().type.toBe<number>();
    expect<NonNegativeInt>().type.toBeAssignableTo<number>();
  });
});
