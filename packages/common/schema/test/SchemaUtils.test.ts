import { pluck } from "@beep/schema/SchemaUtils/pluck";
import { split } from "@beep/schema/SchemaUtils/split";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("pluck", () => {
  it("decodes a one-property struct into the selected field value", () => {
    const schema = S.Struct({
      column1: S.NumberFromString,
      column2: S.String,
    }).pipe(pluck("column1"));

    expect(S.decodeUnknownSync(schema)({ column1: "1" })).toBe(1);
  });

  it("encodes the selected field value back into a one-property struct", () => {
    const schema = S.Struct({
      column1: S.NumberFromString,
      column2: S.String,
    }).pipe(pluck("column1"));

    expect(S.encodeSync(schema)(2)).toEqual({ column1: "2" });
  });
});

describe("split", () => {
  it("decodes delimited strings into readonly string arrays", () => {
    const schema = split(",");

    expect(S.decodeSync(schema)("red,green,blue")).toEqual(["red", "green", "blue"]);
  });

  it("encodes readonly string arrays back into delimited strings", () => {
    const schema = split(",");

    expect(S.encodeSync(schema)(["red", "green", "blue"])).toBe("red,green,blue");
  });

  it("preserves empty segments instead of normalizing them away", () => {
    const schema = split(",");

    expect(S.decodeSync(schema)("red,,blue")).toEqual(["red", "", "blue"]);
    expect(S.encodeSync(schema)(["red", "", "blue"])).toBe("red,,blue");
  });
});
