import { Chunk, Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";
import {
  addElements,
  applyPatch,
  BracketStringToEntityPatternElement,
  BracketStringToLiteralPatternElement,
  BracketStringToPOSPatternElement,
  combine,
  composePatches,
  drop,
  EntityPatternOption,
  elementAt,
  entity,
  filterElements,
  generalizeLiterals,
  getMark,
  hasMark,
  head,
  isEmpty,
  LiteralPatternOption,
  last,
  length,
  literal,
  make,
  mapElements,
  optionalLiteral,
  optionalPos,
  Pattern,
  type PatternElement,
  PatternFromString,
  POSPatternOption,
  patchReplaceAllLiterals,
  patchReplaceLiteralAt,
  pos,
  prependElements,
  take,
  withId,
  withMark,
} from "../src/Core/index.ts";

describe("Core Pattern", () => {
  it("creates element builders with optional values", () => {
    expect(pos("ADJ", "NOUN").value).toEqual(["ADJ", "NOUN"]);
    expect(entity("DATE").value).toEqual(["DATE"]);
    expect(literal("Apple", "", "Google").value).toEqual(["Apple", "Google"]);
    expect(optionalPos("DET").value).toEqual(["", "DET"]);
    expect(optionalLiteral("the").value).toEqual(["", "the"]);
  });

  it("supports pattern construction and inspection helpers", () => {
    const pattern = withMark(make("test", [pos("ADJ"), pos("NOUN"), literal("thing")]), [0, 1]);

    expect(length(pattern)).toBe(3);
    expect(isEmpty(pattern)).toBe(false);
    expect(hasMark(pattern)).toBe(true);
    expect(getMark(pattern)).toEqual([0, 1]);
    expect(head(pattern)?._tag).toBe("POSPatternElement");
    expect(last(pattern)?._tag).toBe("LiteralPatternElement");
    expect(elementAt(pattern, 1)?._tag).toBe("POSPatternElement");
  });

  it("supports structural transforms", () => {
    const base = make("base", [pos("ADJ"), pos("NOUN")]);
    const extended = prependElements(addElements(base, [literal("thing")]), [literal("the")]);
    const renamed = withId(extended, "renamed");
    const sliced = drop(take(renamed, 3), 1);

    expect(renamed.id).toBe("renamed");
    expect(length(extended)).toBe(4);
    expect(length(sliced)).toBe(2);
    expect(Chunk.isChunk(mapElements(base, () => pos("VERB")).elements)).toBe(true);
    expect(
      Chunk.isChunk(filterElements(extended, (item: PatternElement) => item._tag !== "LiteralPatternElement").elements)
    ).toBe(true);
    expect(hasMark(prependElements(withMark(base, [0, 1]), [literal("the")]))).toBe(false);
  });

  it("supports patch-based literal generalization", () => {
    const pattern = make("id", [literal("hello"), literal("2010"), pos("NOUN")]);
    const patched = applyPatch(
      pattern,
      composePatches(
        patchReplaceLiteralAt(0, () => entity("URL")),
        patchReplaceAllLiterals(() => pos("ADV"))
      )
    );
    const generalized = generalizeLiterals(pattern, (values) =>
      values[0]?.includes("2010") ? entity("DATE") : pos("NOUN")
    );
    const combined = combine(pattern, make("other", [pos("VERB")]), "combined");

    expect(elementAt(patched, 0)?._tag).toBe("EntityPatternElement");
    expect(elementAt(patched, 1)?._tag).toBe("POSPatternElement");
    expect(elementAt(generalized, 0)?._tag).toBe("POSPatternElement");
    expect(elementAt(generalized, 1)?._tag).toBe("EntityPatternElement");
    expect(combined.id).toBe("combined");
    expect(length(combined)).toBe(4);
  });

  it("encodes and decodes element schemas", async () => {
    const posResult = await Effect.runPromise(
      Schema.decodeUnknownEffect(BracketStringToPOSPatternElement)("[ADJ|NOUN]")
    );
    const entityResult = await Effect.runPromise(
      Schema.decodeUnknownEffect(BracketStringToEntityPatternElement)("[DATE|TIME]")
    );
    const literalResult = await Effect.runPromise(
      Schema.decodeUnknownEffect(BracketStringToLiteralPatternElement)("[|Apple|Google]")
    );

    expect(posResult.value).toEqual(["ADJ", "NOUN"]);
    expect(entityResult.value).toEqual(["DATE", "TIME"]);
    expect(literalResult.value).toEqual(["", "Apple", "Google"]);
    expect(Pattern.POS.toBracketString(posResult.value)).toBe("[ADJ|NOUN]");
    expect(Pattern.Entity.toBracketString(entityResult.value)).toBe("[DATE|TIME]");
    expect(Pattern.Literal.toBracketString(literalResult.value)).toBe("[|Apple|Google]");
  });

  it("parses mixed pattern strings in order", () => {
    const elements = PatternFromString(["[ADJ|NOUN]", "[DATE]", "[|the]"]);
    const nounElement = PatternFromString(["[NOUN]"]);

    expect(elements).toHaveLength(3);
    expect(elements[0]?._tag).toBe("POSPatternElement");
    expect(elements[1]?._tag).toBe("EntityPatternElement");
    expect(elements[2]?._tag).toBe("LiteralPatternElement");
    expect(nounElement[0]?._tag).toBe("POSPatternElement");
  });

  it("rejects all-empty pattern options at the schema boundary", () => {
    expect(() => Schema.decodeUnknownSync(POSPatternOption)([""])).toThrow();
    expect(() => Schema.decodeUnknownSync(EntityPatternOption)([""])).toThrow();
    expect(() => Schema.decodeUnknownSync(LiteralPatternOption)([""])).toThrow();
  });

  it("rejects reserved literal choices that would collide with typed bracket syntax", () => {
    expect(() => literal("DATE")).toThrow();
    expect(() => Schema.decodeUnknownSync(BracketStringToLiteralPatternElement)("[DATE]")).toThrow();
  });

  it("supports Pattern schema helpers", () => {
    const pattern = make("money-amount", [literal("$"), entity("CARDINAL"), literal("million", "billion")]);
    const encoded = Pattern.encode(pattern);
    const decoded = Pattern.decode(encoded);

    expect(Pattern.is(pattern)).toBe(true);
    expect(decoded.id).toBe("money-amount");
    expect(Chunk.size(decoded.elements)).toBe(3);
  });
});
