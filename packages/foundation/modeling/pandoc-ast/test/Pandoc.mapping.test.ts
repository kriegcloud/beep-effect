import * as Md from "@beep/md/Md.model";
import { decodePandocJson, decodePandocJsonString } from "@beep/pandoc-ast/Pandoc.codec";
import { documentToPandoc, pandocToDocument } from "@beep/pandoc-ast/Pandoc.mapping";
import { A } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

const fixture = (name: string): Effect.Effect<string> =>
  Effect.promise(() => Bun.file(new URL(`./fixtures/${name}`, import.meta.url)).text());
const text = (value: string): Md.Text => Md.Text.make({ value });

describe("Pandoc.mapping", () => {
  it("maps md-core Pandoc JSON to @beep/md with a supported report", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const source = yield* fixture("green-core.pandoc.json");
        const pandoc = yield* decodePandocJsonString(source);
        const result = yield* pandocToDocument(pandoc);

        expect(result.report.profile).toBe("supported");
        expect(result.report.issues).toEqual([]);
        expect(A.map(result.document.children, (block) => block._tag)).toEqual([
          "h1",
          "p",
          "blockquote",
          "pre",
          "ul",
          "ol",
          "hr",
        ]);
      })
    ));

  it("records DOCX-origin compatibility gaps while producing partial Md output", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const source = yield* fixture("gap-docx-styles.pandoc.json");
        const pandoc = yield* decodePandocJsonString(source);
        const result = yield* pandocToDocument(pandoc);
        const constructs = A.map(result.report.issues, (entry) => entry.construct);

        expect(result.report.profile).toBe("gap");
        expect(constructs).toEqual(expect.arrayContaining(["Div", "Span", "Math", "Note", "Table"]));
        expect(result.report.issues[0]?.pointer).toBe("/blocks/0/children/0/children/0");
        expect(A.map(result.document.children, (block) => block._tag)).toEqual(["blockquote", "p"]);
      })
    ));

  it("maps @beep/md documents to Pandoc with explicit lossiness for raw content and task lists", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const document = Md.Document.make({
          children: [
            Md.H2.make({ children: [text("Round trip")] }),
            Md.P.make({
              children: [
                text("before "),
                Md.RawMarkdown.make({ value: "**trusted**" }),
                Md.Br.make({}),
                Md.A.make({ children: [text("docs")], href: "https://example.com" }),
              ],
            }),
            Md.TaskList.make({
              children: [Md.TaskItem.make({ checked: true, children: [text("done")] })],
            }),
          ],
        });

        const result = yield* documentToPandoc(document);

        expect(result.pandoc.blocks.map((block) => block._tag)).toEqual(["header", "para", "bulletlist"]);
        expect(result.report.profile).toBe("gap");
        expect(A.map(result.report.issues, (entry) => entry.construct)).toEqual(
          expect.arrayContaining(["rawMarkdown", "TaskList"])
        );
      })
    ));

  it("preserves inline structure inside list items in both mapping directions", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const pandoc = yield* decodePandocJson({
          "pandoc-api-version": [1, 23, 1],
          blocks: [
            {
              c: [
                [
                  {
                    c: [
                      { c: "alpha", t: "Str" },
                      { t: "Space" },
                      { c: [{ c: "beta", t: "Str" }], t: "Emph" },
                      { t: "Space" },
                      { c: [["", [], []], [{ c: "docs", t: "Str" }], ["https://example.com", ""]], t: "Link" },
                    ],
                    t: "Plain",
                  },
                ],
              ],
              t: "BulletList",
            },
          ],
          meta: {},
        });
        const mappedMd = yield* pandocToDocument(pandoc);
        const list = mappedMd.document.children[0];

        expect(mappedMd.report.issues).toEqual([]);
        expect(list?._tag).toBe("ul");
        if (list?._tag !== "ul") {
          return;
        }
        expect(A.map(list.children[0]?.children ?? [], (inline) => inline._tag)).toEqual([
          "text",
          "text",
          "em",
          "text",
          "a",
        ]);

        const document = Md.Document.make({
          children: [
            Md.Ul.make({
              children: [
                Md.Li.make({
                  children: [
                    text("alpha "),
                    Md.Em.make({ children: [text("beta")] }),
                    text(" "),
                    Md.A.make({ children: [text("docs")], href: "https://example.com" }),
                  ],
                }),
              ],
            }),
          ],
        });
        const mappedPandoc = yield* documentToPandoc(document);
        const block = mappedPandoc.pandoc.blocks[0];

        expect(mappedPandoc.report.issues).toEqual([]);
        expect(block?._tag).toBe("bulletlist");
        if (block?._tag !== "bulletlist") {
          return;
        }
        const firstItemBlock = block.items[0]?.[0];

        expect(firstItemBlock?._tag).toBe("plain");
        if (firstItemBlock?._tag !== "plain") {
          return;
        }
        expect(A.map(firstItemBlock.children, (inline) => inline._tag)).toEqual(["str", "emph", "str", "link"]);
      })
    ));

  it("reports lossy Pandoc list item block flattening explicitly", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const pandoc = yield* decodePandocJson({
          "pandoc-api-version": [1, 23, 1],
          blocks: [
            {
              c: [
                [
                  { c: [{ c: "first", t: "Str" }], t: "Plain" },
                  { c: [{ c: "second", t: "Str" }], t: "Para" },
                ],
              ],
              t: "BulletList",
            },
          ],
          meta: {},
        });
        const result = yield* pandocToDocument(pandoc);

        expect(result.report.profile).toBe("gap");
        expect(A.map(result.report.issues, (entry) => entry.construct)).toContain("ListItem");
      })
    ));

  it("records unstyled Pandoc div wrappers instead of silently blockquoting them", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const pandoc = yield* decodePandocJson({
          "pandoc-api-version": [1, 23, 1],
          blocks: [
            {
              c: [["", [], []], [{ c: [{ c: "wrapped", t: "Str" }], t: "Para" }]],
              t: "Div",
            },
          ],
          meta: {},
        });
        const result = yield* pandocToDocument(pandoc);

        expect(result.report.profile).toBe("gap");
        expect(A.map(result.report.issues, (entry) => entry.construct)).toContain("Div");
        expect(A.map(result.document.children, (block) => block._tag)).toEqual(["blockquote"]);
      })
    ));
});
