import * as SchemaUtils from "@beep/schema/SchemaUtils/index";
import { pluck } from "@beep/schema/SchemaUtils/pluck";
import { split } from "@beep/schema/SchemaUtils/split";
import { toEquivalence } from "@beep/schema/SchemaUtils/toEquivalence";
import type { Effect } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("pluck", () => {
  const RecordSchema = S.Struct({
    column1: S.NumberFromString,
    column2: S.String,
  });
  const Column1 = RecordSchema.pipe(pluck("column1"));

  it("preserves the projected type and encoded struct surface", () => {
    expect<typeof Column1.Type>().type.toBe<number>();
    expect<typeof Column1.Encoded>().type.toBe<{ readonly column1: string }>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(Column1);
    const encode = S.encodeEffect(Column1);

    expect(decode({ column1: "1" })).type.toBe<Effect.Effect<number, S.SchemaError, never>>();
    expect(encode(1)).type.toBe<Effect.Effect<{ readonly column1: string }, S.SchemaError, never>>();
  });
});

describe("split", () => {
  const CsvCells = split(",");

  it("preserves the readonly string-array type and string encoded surface", () => {
    expect<typeof CsvCells.Type>().type.toBe<ReadonlyArray<string>>();
    expect<typeof CsvCells.Encoded>().type.toBe<string>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(CsvCells);
    const encode = S.encodeEffect(CsvCells);

    expect(decode("red,green,blue")).type.toBe<Effect.Effect<ReadonlyArray<string>, S.SchemaError, never>>();
    expect(encode(["red", "green", "blue"])).type.toBe<Effect.Effect<string, S.SchemaError, never>>();
  });
});

describe("toEquivalence", () => {
  const NumberEquivalence = toEquivalence(S.NumberFromString);
  const TagsEquivalence = SchemaUtils.toEquivalence(S.Array(S.String));

  it("derives data-first and data-last signatures from the decoded schema type", () => {
    expect(NumberEquivalence(1, 2)).type.toBe<boolean>();
    expect(NumberEquivalence(1)).type.toBe<(self: number) => boolean>();
  });

  it("is exported from the SchemaUtils barrel with readonly array inference", () => {
    expect(SchemaUtils.toEquivalence).type.toBe<typeof toEquivalence>();
    expect(TagsEquivalence(["docs", "tests"], ["docs", "tests"])).type.toBe<boolean>();
    expect(TagsEquivalence(["docs", "tests"])).type.toBe<(self: ReadonlyArray<string>) => boolean>();
  });
});

describe("withEmptyArrayDefaults", () => {
  const TagArray = S.Array(S.String);
  const Tags = TagArray.pipe(SchemaUtils.withEmptyArrayDefaults<string>());

  it("preserves the decoded readonly array type", () => {
    expect<typeof Tags.Type>().type.toBe<ReadonlyArray<string>>();
  });

  it("accepts the data-first signature", () => {
    expect(SchemaUtils.withEmptyArrayDefaults<string>).type.toBeCallableWith(TagArray);
  });

  it("is exported from the SchemaUtils barrel", () => {
    expect(SchemaUtils.withEmptyArrayDefaults).type.toBe<
      typeof import("@beep/schema/SchemaUtils/withKeyDefaults").withEmptyArrayDefaults
    >();
  });
});
