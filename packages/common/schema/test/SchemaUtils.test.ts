import * as SchemaUtils from "@beep/schema/SchemaUtils/index";
import { pluck } from "@beep/schema/SchemaUtils/pluck";
import { split } from "@beep/schema/SchemaUtils/split";
import { toEquivalence } from "@beep/schema/SchemaUtils/toEquivalence";
import { describe, expect, it } from "@effect/vitest";
import { pipe } from "effect";
import * as A from "effect/Array";
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

describe("toEquivalence", () => {
  const Tags = S.Array(S.String);

  it("is exported from the SchemaUtils barrel", () => {
    expect(SchemaUtils.toEquivalence).toBe(toEquivalence);
  });

  it("compares decoded schema values with the data-first signature", () => {
    const sameTags = toEquivalence(Tags);

    expect(sameTags(["docs", "tests"], ["docs", "tests"])).toBe(true);
    expect(sameTags(["docs", "tests"], ["tests", "docs"])).toBe(false);
  });

  it("compares decoded schema values with the data-last signature", () => {
    const sameTask = SchemaUtils.toEquivalence(
      S.Struct({
        name: S.String,
        tags: Tags,
      })
    );
    const expected = {
      name: "document toEquivalence",
      tags: ["docs", "tests"],
    };
    const sameAsExpected = sameTask(expected);

    expect(pipe({ name: "document toEquivalence", tags: ["docs", "tests"] }, sameAsExpected)).toBe(true);
    expect(pipe({ name: "document toEquivalence", tags: ["tests", "docs"] }, sameAsExpected)).toBe(false);
  });
});

describe("withEmptyArrayDefaults", () => {
  it("defaults missing array fields to an empty readonly array", () => {
    const Settings = S.Struct({
      tags: S.Array(S.String).pipe(SchemaUtils.withEmptyArrayDefaults<string>()),
    });

    expect(A.isReadonlyArrayEmpty(S.decodeUnknownSync(Settings)({}).tags)).toBe(true);
  });

  it("supports the data-first call style", () => {
    const Tags = SchemaUtils.withEmptyArrayDefaults<string>(S.Array(S.String));
    const Settings = S.Struct({ tags: Tags });

    expect(A.isReadonlyArrayEmpty(S.decodeUnknownSync(Settings)({ tags: undefined }).tags)).toBe(true);
  });
});
