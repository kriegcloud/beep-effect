import * as Model from "@beep/schema/Model";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";

describe("Model optional helpers", () => {
  it("decodes optional nullable JSON keys into Option values and encodes them back", () => {
    const Struct = S.Struct({
      value: Model.optionalOption(S.String),
    });

    expect(S.decodeUnknownSync(Struct)({}).value).toEqual(O.none());
    expect(S.decodeUnknownSync(Struct)({ value: null }).value).toEqual(O.none());
    expect(S.decodeUnknownSync(Struct)({ value: "kept" }).value).toEqual(O.some("kept"));

    expect(S.encodeSync(Struct)({ value: O.none() })).toEqual({});
    expect(S.encodeSync(Struct)({ value: O.some("encoded") })).toEqual({ value: "encoded" });
  });
});
