import { isOnePasswordReference, OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type { OnePasswordReference as OnePasswordReferenceType } from "@beep/shared-domain/values/OnePasswordReference";
import type { Effect } from "effect";

describe("OnePasswordReference", () => {
  it("preserves the branded reference type", () => {
    const decode = S.decodeUnknownEffect(OnePasswordReference);

    expect<OnePasswordReferenceType>().type.toBe<OnePasswordReference>();
    expect<typeof OnePasswordReference.Encoded>().type.toBe<string>();
    expect(decode("op://Private/Discord Bot/token")).type.toBe<
      Effect.Effect<OnePasswordReferenceType, S.SchemaError, never>
    >();
  });

  it("preserves the guard type", () => {
    expect(isOnePasswordReference("op://Private/Discord Bot/token")).type.toBe<boolean>();
  });
});
