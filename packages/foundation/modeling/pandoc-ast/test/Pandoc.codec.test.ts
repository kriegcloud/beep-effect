import { decodePandocJsonString, encodePandocJsonString, PandocJsonFromString } from "@beep/pandoc-ast/Pandoc.codec";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const fixture = (name: string): Effect.Effect<string> =>
  Effect.promise(() => Bun.file(new URL(`./fixtures/${name}`, import.meta.url)).text());

describe("Pandoc.codec", () => {
  it("decodes committed Pandoc JSON fixtures without a pandoc executable", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const source = yield* fixture("green-core.pandoc.json");
        const document = yield* decodePandocJsonString(source);

        expect(document.apiVersion).toEqual([1, 23, 1]);
        expect(document.blocks.map((block) => block._tag)).toEqual([
          "header",
          "para",
          "blockquote",
          "codeblock",
          "bulletlist",
          "orderedlist",
          "horizontalrule",
        ]);
      })
    ));

  it("round-trips supported wire objects through the internal model", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const source = yield* fixture("green-core.pandoc.json");
        const document = yield* decodePandocJsonString(source);
        const encoded = yield* encodePandocJsonString(document);
        const roundTripped = yield* decodePandocJsonString(encoded);

        expect(roundTripped).toEqual(document);
      })
    ));

  it("keeps DOCX-style gap constructs decodable as explicit model nodes", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const source = yield* fixture("gap-docx-styles.pandoc.json");
        const document = yield* decodePandocJsonString(source);

        expect(document.blocks.map((block) => block._tag)).toEqual(["div", "table"]);
      })
    ));

  it("exposes a schema-owned JSON string boundary", () => {
    const decode = S.decodeUnknownSync(PandocJsonFromString);

    expect(decode(`{"pandoc-api-version":[1,23,1],"meta":{},"blocks":[]}`).blocks).toEqual([]);
  });
});
