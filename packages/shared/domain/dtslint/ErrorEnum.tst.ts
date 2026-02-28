import { describe, expect, it } from "tstyche";
import { ErrorCodeFromKey } from "../src/errors/DbError/ErrorEnum.js";

describe("ErrorCodeFromKey", () => {
  it("narrows forward enum members to mapped codes", () => {
    expect(ErrorCodeFromKey.Enum.UNIQUE_VIOLATION).type.toBe<"23505">();
    expect(ErrorCodeFromKey.From.Enum.UNIQUE_VIOLATION).type.toBe<"23505">();
  });

  it("narrows reverse enum members to mapped keys", () => {
    expect(ErrorCodeFromKey.To.Enum["23505"]).type.toBe<"UNIQUE_VIOLATION">();
  });
});
