import * as Md from "@beep/md/Md.model";
import { decodePandocJson, decodePandocJsonString } from "@beep/pandoc-ast/Pandoc.codec";
import { documentToPandoc, pandocToDocument } from "@beep/pandoc-ast/Pandoc.mapping";
import { A } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import type * as Pandoc from "@beep/pandoc-ast/Pandoc.model";

const fixture = (name: string): Effect.Effect<string> =>
  Effect.promise(() => Bun.file(new URL(`./fixtures/${name}`, import.meta.url)).text());
const text = (value: string): Md.Text => Md.Text.make({ value });
const inlineListPandocJson = () => ({
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

const inlineListDocument = (): Md.Document =>
  Md.Document.make({
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

const expectUl = (block: Md.Block | undefined): Md.Ul => {
  expect(block?._tag).toBe("ul");
  if (block?._tag !== "ul") {
    throw new Error("expected unordered list block");
  }
  return block;
};

const expectBulletList = (block: Pandoc.PandocBlock | undefined): Pandoc.BulletList => {
  expect(block?._tag).toBe("bulletlist");
  if (block?._tag !== "bulletlist") {
    throw new Error("expected Pandoc bullet list block");
  }
  return block;
};

const expectPlain = (block: Pandoc.PandocBlock | undefined): Pandoc.Plain => {
  expect(block?._tag).toBe("plain");
  if (block?._tag !== "plain") {
    throw new Error("expected Pandoc plain block");
  }
  return block;
};

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
        const pandoc = yield* decodePandocJson(inlineListPandocJson());
        const mappedMd = yield* pandocToDocument(pandoc);
        const list = expectUl(mappedMd.document.children[0]);

        expect(mappedMd.report.issues).toEqual([]);
        expect(A.map(list.children[0]?.children ?? [], (inline) => inline._tag)).toEqual([
          "text",
          "text",
          "em",
          "text",
          "a",
        ]);

        const document = inlineListDocument();
        const mappedPandoc = yield* documentToPandoc(document);
        const block = expectBulletList(mappedPandoc.pandoc.blocks[0]);

        expect(mappedPandoc.report.issues).toEqual([]);
        const firstItemBlock = expectPlain(block.items[0]?.[0]);

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

  it("maps Pandoc soft breaks as spaces while preserving hard line breaks", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const pandoc = yield* decodePandocJson({
          "pandoc-api-version": [1, 23, 1],
          blocks: [
            {
              c: [
                { c: "soft", t: "Str" },
                { t: "SoftBreak" },
                { c: "wrap", t: "Str" },
                { t: "LineBreak" },
                { c: "hard", t: "Str" },
              ],
              t: "Para",
            },
          ],
          meta: {},
        });
        const result = yield* pandocToDocument(pandoc);
        const paragraph = result.document.children[0];

        expect(result.report.issues).toEqual([]);
        expect(paragraph?._tag).toBe("p");
        if (paragraph?._tag !== "p") {
          return;
        }
        expect(A.map(paragraph.children, (inline) => inline._tag)).toEqual(["text", "text", "text", "br", "text"]);
        expect(paragraph.children[1]?._tag === "text" ? paragraph.children[1].value : "").toBe(" ");
      })
    ));
});
