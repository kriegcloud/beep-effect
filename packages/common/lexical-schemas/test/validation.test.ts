/**
 * Validation tests for Lexical editor state schemas.
 *
 * @category Tests
 * @since 0.1.0
 */

import { describe, expect, test } from "bun:test";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as S from "effect/Schema";
import { decodeEditorStateUnknownSync, SerializedEditorState, SerializedLexicalNode } from "../src/index.js";
// Load test fixtures
import emptyEditorFixture from "./fixtures/empty-editor.json";
import extendedNodesFixture from "./fixtures/extended-nodes.json";
import formattedTextFixture from "./fixtures/formatted-text.json";
import nestedParagraphsFixture from "./fixtures/nested-paragraphs.json";
import simpleTextFixture from "./fixtures/simple-text.json";

describe("SerializedEditorState", () => {
  describe("Happy Path - Valid Fixtures", () => {
    test("validates empty editor state", () => {
      const result = decodeEditorStateUnknownSync(emptyEditorFixture);

      expect(result).toBeDefined();
      expect(result.root.type).toBe("root");
      expect(result.root.children).toHaveLength(0);
    });

    test("validates simple text editor state", () => {
      const result = decodeEditorStateUnknownSync(simpleTextFixture);

      expect(result).toBeDefined();
      expect(result.root.children).toHaveLength(1);

      const paragraph = result.root.children[0];
      expect(paragraph?.type).toBe("paragraph");

      if (paragraph?.type === "paragraph") {
        expect(paragraph.children).toHaveLength(1);

        const textNode = paragraph.children[0];
        expect(textNode?.type).toBe("text");

        if (textNode?.type === "text") {
          expect(textNode.text).toBe("Hello world");
          expect(textNode.format).toBe(0);
        }
      }
    });

    test("validates formatted text editor state", () => {
      const result = decodeEditorStateUnknownSync(formattedTextFixture);

      expect(result).toBeDefined();
      expect(result.root.children).toHaveLength(1);

      const paragraph = result.root.children[0];
      if (paragraph?.type === "paragraph") {
        expect(paragraph.children).toHaveLength(6);

        // Check bold text (format: 1)
        const boldText = paragraph.children[1];
        if (boldText?.type === "text") {
          expect(boldText.text).toBe("bold");
          expect(boldText.format).toBe(1);
        }

        // Check italic text (format: 2)
        const italicText = paragraph.children[3];
        if (italicText?.type === "text") {
          expect(italicText.text).toBe("italic");
          expect(italicText.format).toBe(2);
        }

        // Check bold+italic text (format: 3)
        const boldItalicText = paragraph.children[5];
        if (boldItalicText?.type === "text") {
          expect(boldItalicText.text).toBe("bold+italic");
          expect(boldItalicText.format).toBe(3);
        }
      }
    });

    test("validates nested paragraphs with linebreak", () => {
      const result = decodeEditorStateUnknownSync(nestedParagraphsFixture);

      expect(result).toBeDefined();
      expect(result.root.children).toHaveLength(3);

      // Check third paragraph has linebreak
      const thirdParagraph = result.root.children[2];
      if (thirdParagraph?.type === "paragraph") {
        expect(thirdParagraph.children).toHaveLength(3);

        const lineBreak = thirdParagraph.children[1];
        expect(lineBreak?.type).toBe("linebreak");
      }
    });

    test("validates extended nodes (headings, lists, code, links)", () => {
      const result = decodeEditorStateUnknownSync(extendedNodesFixture);

      expect(result).toBeDefined();
      expect(result.root.children).toHaveLength(6);

      // Check heading
      const heading = result.root.children[0];
      expect(heading?.type).toBe("heading");
      if (heading?.type === "heading") {
        expect(heading.tag).toBe("h1");
        expect(heading.children).toHaveLength(1);
      }

      // Check paragraph with link
      const paragraphWithLink = result.root.children[1];
      if (paragraphWithLink?.type === "paragraph") {
        const linkNode = paragraphWithLink.children[1];
        expect(linkNode?.type).toBe("link");
        if (linkNode?.type === "link") {
          expect(linkNode.url).toBe("https://example.com");
        }
      }

      // Check quote
      const quote = result.root.children[2];
      expect(quote?.type).toBe("quote");

      // Check list
      const list = result.root.children[3];
      expect(list?.type).toBe("list");
      if (list?.type === "list") {
        expect(list.listType).toBe("bullet");
        expect(list.tag).toBe("ul");
        expect(list.children).toHaveLength(2);

        const listItem = list.children[0];
        expect(listItem?.type).toBe("listitem");
      }

      // Check code block
      const codeBlock = result.root.children[4];
      expect(codeBlock?.type).toBe("code");
      if (codeBlock?.type === "code") {
        expect(codeBlock.language).toBe("javascript");
        expect(codeBlock.children).toHaveLength(3);

        const codeHighlight = codeBlock.children[0];
        expect(codeHighlight?.type).toBe("code-highlight");
        if (codeHighlight?.type === "code-highlight") {
          expect(codeHighlight.text).toBe("const");
          expect(codeHighlight.highlightType).toBe("keyword");
        }
      }

      // Check horizontal rule
      const horizontalRule = result.root.children[5];
      expect(horizontalRule?.type).toBe("horizontalrule");
    });
  });

  describe("Error Cases - Invalid Input", () => {
    test("rejects missing root property", () => {
      const input = {};

      expect(() => decodeEditorStateUnknownSync(input)).toThrow();
    });

    test("rejects invalid root type", () => {
      const input = {
        root: {
          type: "invalid-type",
          version: 1,
          children: [],
          direction: null,
          format: "",
          indent: 0,
        },
      };

      expect(() => decodeEditorStateUnknownSync(input)).toThrow();
    });

    test("rejects missing children array", () => {
      const input = {
        root: {
          type: "root",
          version: 1,
          direction: null,
          format: "",
          indent: 0,
        },
      };

      expect(() => decodeEditorStateUnknownSync(input)).toThrow();
    });

    test("rejects invalid text mode", () => {
      const input = {
        root: {
          type: "root",
          version: 1,
          children: [
            {
              type: "paragraph",
              version: 1,
              children: [
                {
                  type: "text",
                  version: 1,
                  text: "Hello",
                  format: 0,
                  mode: "invalid-mode", // Invalid!
                  style: "",
                  detail: 0,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
            },
          ],
          direction: null,
          format: "",
          indent: 0,
        },
      };

      expect(() => decodeEditorStateUnknownSync(input)).toThrow();
    });

    test("rejects invalid element format", () => {
      const input = {
        root: {
          type: "root",
          version: 1,
          children: [],
          direction: null,
          format: "invalid-format", // Invalid!
          indent: 0,
        },
      };

      expect(() => decodeEditorStateUnknownSync(input)).toThrow();
    });
  });

  describe("Round-trip Encoding/Decoding", () => {
    test("preserves structure through encode/decode cycle", () => {
      const original = decodeEditorStateUnknownSync(simpleTextFixture);
      const encoded = S.encodeSync(SerializedEditorState)(original);
      const decoded = decodeEditorStateUnknownSync(encoded);

      expect(decoded.root.type).toBe(original.root.type);
      expect(decoded.root.children).toHaveLength(original.root.children.length);

      if (decoded.root.children[0]?.type === "paragraph" && original.root.children[0]?.type === "paragraph") {
        const decodedPara = decoded.root.children[0];
        const originalPara = original.root.children[0];

        expect(decodedPara.children).toHaveLength(originalPara.children.length);
      }
    });

    test("preserves formatting through round-trip", () => {
      const original = decodeEditorStateUnknownSync(formattedTextFixture);
      const encoded = S.encodeSync(SerializedEditorState)(original);
      const decoded = decodeEditorStateUnknownSync(encoded);

      const originalPara = original.root.children[0];
      const decodedPara = decoded.root.children[0];

      if (originalPara?.type === "paragraph" && decodedPara?.type === "paragraph") {
        for (let i = 0; i < originalPara.children.length; i++) {
          const origChild = originalPara.children[i];
          const decChild = decodedPara.children[i];

          expect(decChild?.type).toBe(origChild!.type);
          if (origChild?.type === "text" && decChild?.type === "text") {
            expect(decChild.text).toBe(origChild.text);
            expect(decChild.format).toBe(origChild.format);
          }
        }
      }
    });
  });

  describe("SerializedLexicalNode Union", () => {
    test("decodes text node directly", () => {
      const input = {
        type: "text",
        version: 1,
        text: "Hello",
        format: 0,
        mode: "normal",
        style: "",
        detail: 0,
      };

      const result = SerializedLexicalNode.decodeUnknownSync(input);
      expect(result.type).toBe("text");
      if (result?.type === "text") {
        expect(result.text).toBe("Hello");
      }
    });

    test("decodes linebreak node directly", () => {
      const input = {
        type: "linebreak",
        version: 1,
      };

      const result = SerializedLexicalNode.decodeUnknownSync(input);
      expect(result.type).toBe("linebreak");
    });

    test("decodes paragraph node with children", () => {
      const input = {
        type: "paragraph",
        version: 1,
        children: [
          {
            type: "text",
            version: 1,
            text: "Hello",
            format: 0,
            mode: "normal",
            style: "",
            detail: 0,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
      };

      const result = SerializedLexicalNode.decodeUnknownSync(input);
      expect(result.type).toBe("paragraph");
      if (result?.type === "paragraph") {
        expect(result.children).toHaveLength(1);
        expect(result.children[0]?.type).toBe("text");
      }
    });
  });

  describe("Pattern Matching on Nodes", () => {
    test("can pattern match on node types", () => {
      const nodes = [
        { type: "text" as const, version: 1, text: "Hello", format: 0, mode: "normal" as const, style: "", detail: 0 },
        { type: "linebreak" as const, version: 1 },
        { type: "paragraph" as const, version: 1, children: [], direction: null, format: "" as const, indent: 0 },
      ];

      const descriptions = A.map(nodes, (node) =>
        Match.value(node).pipe(
          Match.when({ type: "text" }, (n) => `Text: "${n.text}"`),
          Match.when({ type: "linebreak" }, () => "Line Break"),
          Match.when({ type: "paragraph" }, (n) => `Paragraph with ${n.children.length} children`),
          Match.exhaustive
        )
      );

      expect(descriptions[0]).toBe('Text: "Hello"');
      expect(descriptions[1]).toBe("Line Break");
      expect(descriptions[2]).toBe("Paragraph with 0 children");
    });
  });
});

describe("Type Safety", () => {
  test("type narrowing works after decode", () => {
    const result = decodeEditorStateUnknownSync(simpleTextFixture);

    // TypeScript should narrow the type correctly
    const firstChild = result.root.children[0];

    if (firstChild?.type === "paragraph") {
      // TypeScript knows this is a paragraph node
      const paragraphChildren = firstChild.children;
      expect(paragraphChildren).toBeDefined();

      const textNode = paragraphChildren[0];
      if (textNode?.type === "text") {
        // TypeScript knows this is a text node
        expect(textNode.text).toBeDefined();
        expect(typeof textNode.format).toBe("number");
      }
    }
  });
});
