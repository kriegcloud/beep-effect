import { assertTrue, deepStrictEqual, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as S from "effect/Schema";

import {
  SerializedAutoLinkNode,
  SerializedCodeHighlightNode,
  SerializedCodeNode,
  SerializedCollapsibleContainerNode,
  SerializedDateTimeNode,
  SerializedEmojiNode,
  SerializedEquationNode,
  SerializedExcalidrawNode,
  SerializedFigmaNode,
  SerializedHashtagNode,
  SerializedHeadingNode,
  SerializedLayoutContainerNode,
  SerializedLayoutItemNode,
  SerializedLexicalNodeUnion,
  SerializedLineBreakNode,
  SerializedLinkNode,
  SerializedListItemNode,
  SerializedListNode,
  SerializedMarkNode,
  SerializedMentionNode,
  SerializedOverflowNode,
  SerializedParagraphNode,
  SerializedQuoteNode,
  SerializedRootNode,
  SerializedTableCellNode,
  SerializedTableNode,
  SerializedTableRowNode,
  SerializedTextNodeTyped,
  SerializedTweetNode,
  SerializedYouTubeNode,
} from "../../../src/components/editor/schema/node-types.schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const decodeUnion = S.decodeUnknownEither(SerializedLexicalNodeUnion);

const baseNode = (type: string, extra: Record<string, unknown> = {}) => ({
  type,
  version: 1,
  ...extra,
});

const elementFields = (extra: Record<string, unknown> = {}) => ({
  children: [],
  direction: "ltr" as const,
  format: "" as const,
  indent: 0,
  ...extra,
});

const textFields = (extra: Record<string, unknown> = {}) => ({
  text: "hello",
  format: 0,
  detail: 0,
  mode: "normal" as const,
  style: "",
  ...extra,
});

// ---------------------------------------------------------------------------
// Block Element Nodes
// ---------------------------------------------------------------------------

describe("Block Element Nodes", () => {
  effect("SerializedHeadingNode encode/decode round-trip", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("heading"),
        ...elementFields(),
        tag: "h1" as const,
      };
      const decoded = yield* S.decodeUnknown(SerializedHeadingNode)(input);
      strictEqual(decoded.type, "heading");
      strictEqual(decoded.tag, "h1");
    })
  );

  effect("SerializedParagraphNode with optional textFormat", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("paragraph"),
        ...elementFields(),
        textFormat: 3,
        textStyle: "font-weight: bold",
      };
      const decoded = yield* S.decodeUnknown(SerializedParagraphNode)(input);
      strictEqual(decoded.type, "paragraph");
      strictEqual(decoded.textFormat, 3);
      strictEqual(decoded.textStyle, "font-weight: bold");
    })
  );

  effect("SerializedParagraphNode without optional fields", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("paragraph"),
        ...elementFields(),
      };
      const decoded = yield* S.decodeUnknown(SerializedParagraphNode)(input);
      strictEqual(decoded.type, "paragraph");
      strictEqual(decoded.textFormat, undefined);
      strictEqual(decoded.textStyle, undefined);
    })
  );

  effect("SerializedRootNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("root"),
        ...elementFields(),
      };
      const decoded = yield* S.decodeUnknown(SerializedRootNode)(input);
      strictEqual(decoded.type, "root");
    })
  );

  effect("SerializedQuoteNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("quote"),
        ...elementFields(),
      };
      const decoded = yield* S.decodeUnknown(SerializedQuoteNode)(input);
      strictEqual(decoded.type, "quote");
    })
  );

  effect("SerializedCodeNode with language", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("code"),
        ...elementFields(),
        language: "typescript",
      };
      const decoded = yield* S.decodeUnknown(SerializedCodeNode)(input);
      strictEqual(decoded.type, "code");
      strictEqual(decoded.language, "typescript");
    })
  );

  effect("SerializedCodeNode with null language", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("code"),
        ...elementFields(),
        language: null,
      };
      const decoded = yield* S.decodeUnknown(SerializedCodeNode)(input);
      strictEqual(decoded.language, null);
    })
  );
});

// ---------------------------------------------------------------------------
// List Nodes
// ---------------------------------------------------------------------------

describe("List Nodes", () => {
  effect("SerializedListNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("list"),
        ...elementFields(),
        listType: "bullet" as const,
        start: 1,
        tag: "ul" as const,
      };
      const decoded = yield* S.decodeUnknown(SerializedListNode)(input);
      strictEqual(decoded.type, "list");
      strictEqual(decoded.listType, "bullet");
      strictEqual(decoded.tag, "ul");
    })
  );

  effect("SerializedListNode with empty children", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("list"),
        ...elementFields({ children: [] }),
        listType: "number" as const,
        start: 1,
        tag: "ol" as const,
      };
      const decoded = yield* S.decodeUnknown(SerializedListNode)(input);
      deepStrictEqual(decoded.children, []);
    })
  );

  effect("SerializedListItemNode with checked", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("listitem"),
        ...elementFields(),
        checked: true,
        value: 1,
      };
      const decoded = yield* S.decodeUnknown(SerializedListItemNode)(input);
      strictEqual(decoded.checked, true);
      strictEqual(decoded.value, 1);
    })
  );

  effect("SerializedListItemNode without checked (optional)", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("listitem"),
        ...elementFields(),
        value: 2,
      };
      const decoded = yield* S.decodeUnknown(SerializedListItemNode)(input);
      strictEqual(decoded.checked, undefined);
      strictEqual(decoded.value, 2);
    })
  );
});

// ---------------------------------------------------------------------------
// Table Nodes
// ---------------------------------------------------------------------------

describe("Table Nodes", () => {
  effect("SerializedTableNode with optional fields", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("table"),
        ...elementFields(),
        colWidths: [100, 200, 150],
        rowStriping: true,
      };
      const decoded = yield* S.decodeUnknown(SerializedTableNode)(input);
      strictEqual(decoded.type, "table");
      deepStrictEqual(decoded.colWidths, [100, 200, 150]);
      strictEqual(decoded.rowStriping, true);
    })
  );

  effect("SerializedTableRowNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("tablerow"),
        ...elementFields(),
        height: 40,
      };
      const decoded = yield* S.decodeUnknown(SerializedTableRowNode)(input);
      strictEqual(decoded.type, "tablerow");
      strictEqual(decoded.height, 40);
    })
  );

  effect("SerializedTableCellNode with all optional fields", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("tablecell"),
        ...elementFields(),
        colSpan: 2,
        rowSpan: 1,
        headerState: 0,
        width: 120,
        backgroundColor: "#f0f0f0",
      };
      const decoded = yield* S.decodeUnknown(SerializedTableCellNode)(input);
      strictEqual(decoded.colSpan, 2);
      strictEqual(decoded.width, 120);
      strictEqual(decoded.backgroundColor, "#f0f0f0");
    })
  );

  effect("SerializedTableCellNode without optional fields", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("tablecell"),
        ...elementFields(),
        colSpan: 1,
        rowSpan: 1,
        headerState: 1,
      };
      const decoded = yield* S.decodeUnknown(SerializedTableCellNode)(input);
      strictEqual(decoded.width, undefined);
      strictEqual(decoded.backgroundColor, undefined);
    })
  );
});

// ---------------------------------------------------------------------------
// Inline Element Nodes
// ---------------------------------------------------------------------------

describe("Inline Element Nodes", () => {
  effect("SerializedLinkNode with optional fields", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("link"),
        ...elementFields(),
        url: "https://example.com",
        rel: "noopener",
        target: "_blank",
        title: "Example",
      };
      const decoded = yield* S.decodeUnknown(SerializedLinkNode)(input);
      strictEqual(decoded.url, "https://example.com");
      strictEqual(decoded.rel, "noopener");
      strictEqual(decoded.target, "_blank");
    })
  );

  effect("SerializedLinkNode with only required fields", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("link"),
        ...elementFields(),
        url: "https://example.com",
      };
      const decoded = yield* S.decodeUnknown(SerializedLinkNode)(input);
      strictEqual(decoded.url, "https://example.com");
      strictEqual(decoded.rel, undefined);
    })
  );

  effect("SerializedAutoLinkNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("autolink"),
        ...elementFields(),
        url: "https://detected.com",
        isUnlinked: false,
      };
      const decoded = yield* S.decodeUnknown(SerializedAutoLinkNode)(input);
      strictEqual(decoded.type, "autolink");
      strictEqual(decoded.isUnlinked, false);
    })
  );

  effect("SerializedMarkNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("mark"),
        ...elementFields(),
        ids: ["comment-1", "comment-2"],
      };
      const decoded = yield* S.decodeUnknown(SerializedMarkNode)(input);
      strictEqual(decoded.type, "mark");
      deepStrictEqual(decoded.ids, ["comment-1", "comment-2"]);
    })
  );

  effect("SerializedOverflowNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("overflow"),
        ...elementFields(),
      };
      const decoded = yield* S.decodeUnknown(SerializedOverflowNode)(input);
      strictEqual(decoded.type, "overflow");
    })
  );
});

// ---------------------------------------------------------------------------
// Text Nodes
// ---------------------------------------------------------------------------

describe("Text Nodes", () => {
  effect("SerializedTextNodeTyped basic decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("text"),
        ...textFields(),
      };
      const decoded = yield* S.decodeUnknown(SerializedTextNodeTyped)(input);
      strictEqual(decoded.type, "text");
      strictEqual(decoded.text, "hello");
    })
  );

  effect("Text format bitmask — bold+italic (3) accepted", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("text"),
        ...textFields({ format: 3 }),
      };
      const decoded = yield* S.decodeUnknown(SerializedTextNodeTyped)(input);
      strictEqual(decoded.format, 3);
    })
  );

  effect("SerializedCodeHighlightNode with highlightType", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("code-highlight"),
        ...textFields(),
        highlightType: "keyword",
      };
      const decoded = yield* S.decodeUnknown(SerializedCodeHighlightNode)(input);
      strictEqual(decoded.type, "code-highlight");
      strictEqual(decoded.highlightType, "keyword");
    })
  );

  effect("SerializedCodeHighlightNode with null highlightType", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("code-highlight"),
        ...textFields(),
        highlightType: null,
      };
      const decoded = yield* S.decodeUnknown(SerializedCodeHighlightNode)(input);
      strictEqual(decoded.highlightType, null);
    })
  );

  effect("SerializedHashtagNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("hashtag"),
        ...textFields({ text: "#trending" }),
      };
      const decoded = yield* S.decodeUnknown(SerializedHashtagNode)(input);
      strictEqual(decoded.type, "hashtag");
      strictEqual(decoded.text, "#trending");
    })
  );

  effect("SerializedMentionNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("mention"),
        ...textFields({ text: "@alice" }),
        mentionName: "alice",
      };
      const decoded = yield* S.decodeUnknown(SerializedMentionNode)(input);
      strictEqual(decoded.mentionName, "alice");
    })
  );

  effect("SerializedEmojiNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("emoji"),
        ...textFields({ text: "😊" }),
        className: "emoji-smile",
      };
      const decoded = yield* S.decodeUnknown(SerializedEmojiNode)(input);
      strictEqual(decoded.className, "emoji-smile");
    })
  );
});

// ---------------------------------------------------------------------------
// Leaf Nodes
// ---------------------------------------------------------------------------

describe("Leaf Nodes", () => {
  effect("SerializedLineBreakNode decode", () =>
    Effect.gen(function* () {
      const input = baseNode("linebreak");
      const decoded = yield* S.decodeUnknown(SerializedLineBreakNode)(input);
      strictEqual(decoded.type, "linebreak");
    })
  );

  effect("SerializedHorizontalRuleNode decode via union", () =>
    Effect.gen(function* () {
      const input = baseNode("horizontalrule");
      const result = decodeUnion(input);
      assertTrue(Either.isRight(result));
    })
  );
});

// ---------------------------------------------------------------------------
// Decorator Block Nodes
// ---------------------------------------------------------------------------

describe("Decorator Block Nodes", () => {
  effect("SerializedTweetNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("tweet"),
        format: "",
        id: "1234567890",
      };
      const decoded = yield* S.decodeUnknown(SerializedTweetNode)(input);
      strictEqual(decoded.type, "tweet");
      strictEqual(decoded.id, "1234567890");
    })
  );

  effect("SerializedYouTubeNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("youtube"),
        format: "",
        videoID: "dQw4w9WgXcQ",
      };
      const decoded = yield* S.decodeUnknown(SerializedYouTubeNode)(input);
      strictEqual(decoded.videoID, "dQw4w9WgXcQ");
    })
  );

  effect("SerializedFigmaNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("figma"),
        format: "",
        documentID: "abc123",
      };
      const decoded = yield* S.decodeUnknown(SerializedFigmaNode)(input);
      strictEqual(decoded.documentID, "abc123");
    })
  );
});

// ---------------------------------------------------------------------------
// Decorator Leaf Nodes
// ---------------------------------------------------------------------------

describe("Decorator Leaf Nodes", () => {
  effect("SerializedExcalidrawNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("excalidraw"),
        data: "[]",
        width: 800,
        height: 600,
      };
      const decoded = yield* S.decodeUnknown(SerializedExcalidrawNode)(input);
      strictEqual(decoded.data, "[]");
      strictEqual(decoded.width, 800);
    })
  );

  effect("SerializedExcalidrawNode without optional dimensions", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("excalidraw"),
        data: "[]",
      };
      const decoded = yield* S.decodeUnknown(SerializedExcalidrawNode)(input);
      strictEqual(decoded.width, undefined);
      strictEqual(decoded.height, undefined);
    })
  );

  effect("SerializedEquationNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("equation"),
        equation: "E = mc^2",
        inline: true,
      };
      const decoded = yield* S.decodeUnknown(SerializedEquationNode)(input);
      strictEqual(decoded.equation, "E = mc^2");
      strictEqual(decoded.inline, true);
    })
  );

  effect("SerializedDateTimeNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("datetime"),
        dateTime: "2024-01-15T10:30:00Z",
      };
      const decoded = yield* S.decodeUnknown(SerializedDateTimeNode)(input);
      strictEqual(decoded.dateTime, "2024-01-15T10:30:00Z");
    })
  );
});

// ---------------------------------------------------------------------------
// Collapsible Nodes
// ---------------------------------------------------------------------------

describe("Collapsible Nodes", () => {
  effect("SerializedCollapsibleContainerNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("collapsible-container"),
        ...elementFields(),
        open: true,
      };
      const decoded = yield* S.decodeUnknown(SerializedCollapsibleContainerNode)(input);
      strictEqual(decoded.open, true);
    })
  );
});

// ---------------------------------------------------------------------------
// Layout Nodes
// ---------------------------------------------------------------------------

describe("Layout Nodes", () => {
  effect("SerializedLayoutContainerNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("layout-container"),
        ...elementFields(),
        templateColumns: "1fr 1fr",
      };
      const decoded = yield* S.decodeUnknown(SerializedLayoutContainerNode)(input);
      strictEqual(decoded.templateColumns, "1fr 1fr");
    })
  );

  effect("SerializedLayoutItemNode decode", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("layout-item"),
        ...elementFields(),
      };
      const decoded = yield* S.decodeUnknown(SerializedLayoutItemNode)(input);
      strictEqual(decoded.type, "layout-item");
    })
  );
});

// ---------------------------------------------------------------------------
// Discriminated Union
// ---------------------------------------------------------------------------

describe("SerializedLexicalNodeUnion", () => {
  effect("dispatches heading JSON to heading type", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("heading"),
        ...elementFields(),
        tag: "h2",
      };
      const decoded = yield* S.decodeUnknown(SerializedLexicalNodeUnion)(input);
      strictEqual(decoded.type, "heading");
    })
  );

  effect("dispatches text JSON to text type", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("text"),
        ...textFields(),
      };
      const decoded = yield* S.decodeUnknown(SerializedLexicalNodeUnion)(input);
      strictEqual(decoded.type, "text");
    })
  );

  effect("dispatches linebreak JSON to linebreak type", () =>
    Effect.gen(function* () {
      const input = baseNode("linebreak");
      const decoded = yield* S.decodeUnknown(SerializedLexicalNodeUnion)(input);
      strictEqual(decoded.type, "linebreak");
    })
  );

  effect("unknown type is rejected by union", () =>
    Effect.gen(function* () {
      const input = baseNode("unknown-nonexistent-type");
      const result = decodeUnion(input);
      assertTrue(Either.isLeft(result));
    })
  );

  effect("null direction is valid for element nodes", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("paragraph"),
        ...elementFields({ direction: null }),
      };
      const decoded = yield* S.decodeUnknown(SerializedParagraphNode)(input);
      strictEqual(decoded.direction, null);
    })
  );

  effect("numeric format value accepted for element nodes", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("paragraph"),
        ...elementFields({ format: 0 }),
      };
      const decoded = yield* S.decodeUnknown(SerializedParagraphNode)(input);
      strictEqual(decoded.format, 0);
    })
  );

  effect("string format value accepted for element nodes", () =>
    Effect.gen(function* () {
      const input = {
        ...baseNode("paragraph"),
        ...elementFields({ format: "center" }),
      };
      const decoded = yield* S.decodeUnknown(SerializedParagraphNode)(input);
      strictEqual(decoded.format, "center");
    })
  );
});
