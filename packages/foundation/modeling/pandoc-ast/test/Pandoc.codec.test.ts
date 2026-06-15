import {
  decodePandocJson,
  decodePandocJsonString,
  encodePandocJsonString,
  PandocJsonFromString,
} from "@beep/pandoc-ast/Pandoc.codec";
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

  it("decodes table attributes and captions from Pandoc table payloads", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const document = yield* decodePandocJson({
          "pandoc-api-version": [1, 23, 1],
          blocks: [
            {
              c: [
                ["table-id", ["wide"], [["custom-style", "EvidenceTable"]]],
                [{ c: [{ c: "Evidence", t: "Str" }], t: "Plain" }],
                [],
                [],
                [],
                [],
              ],
              t: "Table",
            },
          ],
          meta: {},
        });
        const table = document.blocks[0];

        expect(table?._tag).toBe("table");
        if (table?._tag !== "table") {
          return;
        }

        expect(table.attr).toEqual({
          classes: ["wide"],
          id: "table-id",
          keyValues: [["custom-style", "EvidenceTable"]],
        });
        expect(table.caption[0]?._tag).toBe("str");
        if (table.caption[0]?._tag === "str") {
          expect(table.caption[0].text).toBe("Evidence");
        }
      })
    ));

  it("decodes Pandoc TableCaption constructor payloads", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const document = yield* decodePandocJson({
          "pandoc-api-version": [1, 23, 1],
          blocks: [
            {
              c: [
                ["", [], []],
                {
                  c: [
                    null,
                    [
                      {
                        c: [{ c: "Constructor caption", t: "Str" }],
                        t: "Plain",
                      },
                    ],
                  ],
                  t: "TableCaption",
                },
                [],
                [],
                [],
                [],
              ],
              t: "Table",
            },
          ],
          meta: {},
        });
        const table = document.blocks[0];

        expect(table?._tag).toBe("table");
        if (table?._tag !== "table") {
          return;
        }
        expect(table.caption[0]?._tag).toBe("str");
        if (table.caption[0]?._tag === "str") {
          expect(table.caption[0].text).toBe("Constructor caption");
        }
      })
    ));

  it("keeps unknown math explicit while preserving ordered-list item semantics", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const document = yield* decodePandocJson({
          "pandoc-api-version": [1, 23, 1],
          blocks: [
            {
              c: [{ c: [{ t: "FutureMath" }, "x"], t: "Math" }],
              t: "Para",
            },
            {
              c: [[1, { t: "FutureStyle" }, { t: "DefaultDelim" }], []],
              t: "OrderedList",
            },
          ],
          meta: {},
        });
        const paragraph = document.blocks[0];
        const list = document.blocks[1];

        expect(paragraph?._tag).toBe("para");
        if (paragraph?._tag === "para") {
          expect(paragraph.children[0]?._tag).toBe("unknownInline");
        }
        expect(list?._tag).toBe("orderedlist");
        if (list?._tag === "orderedlist") {
          expect(list.style).toBe("DefaultStyle");
          expect(list.delimiter).toBe("DefaultDelim");
        }
      })
    ));

  it("keeps ordered-list structure when nested item blocks are malformed", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const document = yield* decodePandocJson({
          "pandoc-api-version": [1, 23, 1],
          blocks: [
            {
              c: [[7, { t: "FutureStyle" }, { t: "FutureDelimiter" }], [[{ c: "not-inline-list", t: "Plain" }]]],
              t: "OrderedList",
            },
          ],
          meta: {},
        });
        const list = document.blocks[0];

        expect(list?._tag).toBe("orderedlist");
        if (list?._tag !== "orderedlist") {
          return;
        }

        expect(list.start).toBe(7);
        expect(list.style).toBe("DefaultStyle");
        expect(list.delimiter).toBe("DefaultDelim");
        expect(list.items[0]?.[0]?._tag).toBe("unknownBlock");
        if (list.items[0]?.[0]?._tag === "unknownBlock") {
          expect(list.items[0][0].constructor).toBe("MalformedBlock");
        }
      })
    ));

  it("keeps explicit table gap nodes when table metadata is malformed", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const document = yield* decodePandocJson({
          "pandoc-api-version": [1, 23, 1],
          blocks: [
            {
              c: ["not-an-attr", { c: "not-a-caption-shape", t: "FutureCaption" }, [], [], [], []],
              t: "Table",
            },
          ],
          meta: {},
        });
        const table = document.blocks[0];

        expect(table?._tag).toBe("table");
        if (table?._tag !== "table") {
          return;
        }

        expect(table.attr).toEqual({ classes: [], id: "", keyValues: [] });
        expect(table.caption).toEqual([]);
      })
    ));

  it("exposes a schema-owned JSON string boundary", () => {
    const decode = S.decodeUnknownSync(PandocJsonFromString);

    expect(decode(`{"pandoc-api-version":[1,23,1],"meta":{},"blocks":[]}`).blocks).toEqual([]);
  });
});
