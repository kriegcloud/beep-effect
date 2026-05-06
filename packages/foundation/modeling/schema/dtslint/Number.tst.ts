import type { NonNegativeInt, NonNegNum } from "@beep/schema/Number";
import { describe, expect, it } from "tstyche";

describe("Number schemas", () => {
  it("keeps non-negative number and integer exports available from the Number subpath", () => {
    expect<typeof NonNegNum.Type>().type.toBe<number>();
    expect<typeof NonNegativeInt.Type>().type.toBeAssignableTo<number>();
  });
});
