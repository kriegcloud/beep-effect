import { destructiveTransform } from "@beep/schema/Transformations";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("destructiveTransform", () => {
  it("infers target Type from callback result", () => {
    const LengthFromString = destructiveTransform(S.String, (value) => value.length);

    expect<typeof LengthFromString.Type>().type.toBe<number>();
    expect<typeof LengthFromString.Encoded>().type.toBe<unknown>();
  });

  it("exposes readonly transformed object types", () => {
    const ObjectFromString = destructiveTransform(S.String, (value) => ({
      length: value.length,
    }));

    expect<typeof ObjectFromString.Type>().type.toBe<Readonly<{ length: number }>>();
    expect<typeof ObjectFromString.Encoded>().type.toBe<unknown>();
  });

  it("supports data-last usage when callback input is explicit", () => {
    S.NumberFromString.pipe(
      destructiveTransform((value: number) => {
        expect(value).type.toBe<number>();
        return value.toString();
      })
    );
  });
});
