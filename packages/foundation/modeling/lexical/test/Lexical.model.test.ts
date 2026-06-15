import {
  EditorStateFromJson,
  editorStateToPlainText,
  LexicalNode,
  nodeToPlainText,
  SerializedEditorState,
} from "@beep/lexical-schema";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { FastCheck as fc } from "effect/testing";

const NodeArbitrary = S.toArbitrary(LexicalNode);
const StateArbitrary = S.toArbitrary(SerializedEditorState);

const element = {
  version: 1,
  direction: null,
  format: "",
  indent: 0,
} as const;

const text = (value: string, format = 0) =>
  ({
    type: "text",
    version: 1,
    detail: 0,
    format,
    mode: "normal",
    style: "",
    text: value,
  }) as const;

/**
 * Encoded fixture mirroring what Lexical 0.45 writes for an assistant turn:
 * heading, paragraph (with the 0.45 required paragraph fields), quote, code,
 * check list, link, and the package-owned artifact-ref block.
 */
const fixture = {
  root: {
    ...element,
    type: "root",
    children: [
      {
        ...element,
        type: "heading",
        tag: "h2",
        children: [text("Plan", 1)],
      },
      {
        ...element,
        type: "paragraph",
        textFormat: 0,
        textStyle: "",
        children: [
          text("See "),
          {
            ...element,
            type: "link",
            url: "https://example.com",
            children: [text("the docs")],
          },
          { type: "linebreak", version: 1 },
          text("inline", 16),
        ],
      },
      {
        ...element,
        type: "quote",
        children: [text("Measure twice.")],
      },
      {
        ...element,
        type: "code",
        language: "typescript",
        children: [text('console.log("beep")'), { type: "linebreak", version: 1 }, text("export {}")],
      },
      {
        type: "youtube",
        version: 1,
        videoID: "dQw4w9WgXcQ",
        format: "",
      },
      {
        ...element,
        type: "table",
        children: [
          {
            ...element,
            type: "tablerow",
            children: [
              {
                ...element,
                type: "tablecell",
                headerState: 1,
                children: [
                  {
                    ...element,
                    type: "paragraph",
                    children: [text("Name")],
                  },
                ],
              },
              {
                ...element,
                type: "tablecell",
                headerState: 1,
                children: [
                  {
                    ...element,
                    type: "paragraph",
                    children: [text("Value")],
                  },
                ],
              },
            ],
          },
          {
            ...element,
            type: "tablerow",
            children: [
              {
                ...element,
                type: "tablecell",
                headerState: 0,
                children: [
                  {
                    ...element,
                    type: "paragraph",
                    children: [text("Language")],
                  },
                ],
              },
              {
                ...element,
                type: "tablecell",
                headerState: 0,
                children: [
                  {
                    ...element,
                    type: "paragraph",
                    children: [text("ts", 16)],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        ...element,
        type: "list",
        listType: "check",
        start: 1,
        tag: "ul",
        children: [
          {
            ...element,
            type: "listitem",
            checked: true,
            value: 1,
            children: [text("ship schema")],
          },
          {
            ...element,
            type: "listitem",
            value: 2,
            children: [text("ship editor")],
          },
        ],
      },
      {
        type: "artifact-ref",
        version: 1,
        artifactId: "artifact-123",
        label: "Quarterly report",
      },
    ],
  },
};

describe("Lexical.model", () => {
  it("decodes the fixture editor state and captures nullish wire values as Options", () => {
    const state = S.decodeUnknownSync(SerializedEditorState)(fixture);

    expect(state.root.direction).toEqual(O.none());
    expect(state.root.textFormat).toEqual(O.none());
    expect(state.root.children.map((node) => node.type)).toEqual([
      "heading",
      "paragraph",
      "quote",
      "code",
      "youtube",
      "table",
      "list",
      "artifact-ref",
    ]);
    expect(state.root.children[1]).toMatchObject({ textFormat: O.some(0), textStyle: O.some("") });
    expect(state.root.children[3]).toMatchObject({ language: O.some("typescript"), theme: O.none() });
    expect(state.root.children[4]).toMatchObject({ videoID: "dQw4w9WgXcQ", format: "" });
    const table = state.root.children[5];
    expect(table?.type).toBe("table");
    if (table?.type !== "table") {
      expect.fail("Expected decoded table node");
    }
    expect(table.rowStriping).toEqual(O.none());
    const header = table.children[0];
    expect(header?.type).toBe("tablerow");
    if (header?.type !== "tablerow") {
      expect.fail("Expected decoded table header row");
    }
    expect(header.children[0]).toMatchObject({ headerState: 1 });
    expect(header.children[1]).toMatchObject({ headerState: 1 });
    expect(state.root.children[6]).toMatchObject({
      children: [{ checked: O.some(true) }, { checked: O.none() }],
    });
    expect(state.root.children[7]).toMatchObject({ artifactId: "artifact-123", label: O.some("Quarterly report") });
  });

  it("round-trips the fixture through decode/encode without wire drift", () => {
    const state = S.decodeUnknownSync(SerializedEditorState)(fixture);
    expect(S.encodeSync(SerializedEditorState)(state)).toEqual(fixture);
  });

  it("round-trips through the JSON string codec", () => {
    const json = JSON.stringify(fixture);
    const state = S.decodeUnknownSync(EditorStateFromJson)(json);
    expect(JSON.parse(S.encodeSync(EditorStateFromJson)(state))).toEqual(fixture);
  });

  it("round-trips schema-derived arbitrary nodes and states through encode/decode", () => {
    fc.assert(
      fc.property(NodeArbitrary, StateArbitrary, (node, state) => {
        expect(S.decodeUnknownSync(LexicalNode)(S.encodeSync(LexicalNode)(node))).toEqual(node);
        expect(S.decodeUnknownSync(SerializedEditorState)(S.encodeSync(SerializedEditorState)(state))).toEqual(state);
      }),
      { numRuns: 50 }
    );
  });

  it("rejects nodes outside the v1 union", () => {
    expect(() => S.decodeUnknownSync(LexicalNode)({ type: "mermaid", version: 1, source: "flowchart TD" })).toThrow();
  });

  it("projects plain text", () => {
    const state = S.decodeUnknownSync(SerializedEditorState)(fixture);
    const plain = editorStateToPlainText(state);
    expect(plain).toContain("Plan");
    expect(plain).toContain("See the docs");
    expect(plain).toContain('console.log("beep")');
    expect(plain).toContain("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(plain).toContain("Name");
    expect(plain).toContain("Language");
    expect(plain).toContain("[artifact:artifact-123]");

    const node = S.decodeUnknownSync(LexicalNode)({ type: "linebreak", version: 1 });
    expect(nodeToPlainText(node)).toBe("\n");
  });
});
