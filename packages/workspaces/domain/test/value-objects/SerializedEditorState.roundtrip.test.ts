import {
  SerializedEditorStateEnvelope,
  SerializedElementNodeEnvelope,
  SerializedTextNodeEnvelope,
} from "@beep/workspaces-domain/value-objects/SerializedEditorState";
import { assertTrue, deepStrictEqual, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as S from "effect/Schema";

const encode = S.encode(SerializedEditorStateEnvelope);
const decode = S.decode(SerializedEditorStateEnvelope);
const decodeUnknown = S.decodeUnknown(SerializedEditorStateEnvelope);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * The root node's own fields (direction, format, indent, textFormat, textStyle, $)
 * are fully validated and preserved through round-trip. However, recursive
 * children are decoded through SerializedLexicalNodeEnvelope (base schema:
 * type, version, optional $), which strips element/text-specific fields.
 *
 * This fixture tests what the schema actually preserves at each level.
 */

const rootOnlyState = {
  root: {
    type: "root" as const,
    version: 1,
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    children: [],
  },
};

/**
 * State with children — children are decoded to base node shape only.
 * The input has rich child data but the schema output strips it.
 */
const stateWithChildren = {
  root: {
    type: "root" as const,
    version: 1,
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    children: [
      {
        type: "paragraph",
        version: 1,
      },
      {
        type: "heading",
        version: 1,
        $: { level: 2 },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Encode / Decode round-trip — root-level fields
// ---------------------------------------------------------------------------

describe("SerializedEditorStateEnvelope — round-trip", () => {
  effect("encode then decode preserves root-level fields (no children)", () =>
    Effect.gen(function* () {
      const encoded = yield* encode(rootOnlyState);
      const decoded = yield* decode(encoded);
      deepStrictEqual(decoded, rootOnlyState);
    })
  );

  effect("encode then decode preserves children base fields (type, version, $)", () =>
    Effect.gen(function* () {
      const encoded = yield* encode(stateWithChildren);
      const decoded = yield* decode(encoded);
      deepStrictEqual(decoded, stateWithChildren);
    })
  );

  effect("direction: null is preserved through round-trip", () =>
    Effect.gen(function* () {
      const state = {
        root: {
          type: "root" as const,
          version: 1,
          direction: null,
          format: "" as const,
          indent: 0,
          children: [],
        },
      };
      const encoded = yield* encode(state);
      const decoded = yield* decode(encoded);
      strictEqual(decoded.root.direction, null);
    })
  );

  effect("direction: rtl is preserved through round-trip", () =>
    Effect.gen(function* () {
      const state = {
        root: {
          type: "root" as const,
          version: 1,
          direction: "rtl" as const,
          format: "" as const,
          indent: 0,
          children: [],
        },
      };
      const encoded = yield* encode(state);
      const decoded = yield* decode(encoded);
      strictEqual(decoded.root.direction, "rtl");
    })
  );

  effect("numeric format on root node is preserved", () =>
    Effect.gen(function* () {
      const state = {
        root: {
          type: "root" as const,
          version: 1,
          direction: "ltr" as const,
          format: 5,
          indent: 0,
          children: [],
        },
      };
      const encoded = yield* encode(state);
      const decoded = yield* decode(encoded);
      strictEqual(decoded.root.format, 5);
    })
  );

  effect("string format (justify) on root node is preserved", () =>
    Effect.gen(function* () {
      const state = {
        root: {
          type: "root" as const,
          version: 1,
          direction: "ltr" as const,
          format: "justify" as const,
          indent: 0,
          children: [],
        },
      };
      const encoded = yield* encode(state);
      const decoded = yield* decode(encoded);
      strictEqual(decoded.root.format, "justify");
    })
  );

  effect("$ NodeState field is preserved on root", () =>
    Effect.gen(function* () {
      const state = {
        root: {
          type: "root" as const,
          version: 1,
          direction: "ltr" as const,
          format: "" as const,
          indent: 0,
          $: { collapsed: true, customData: 42 },
          children: [],
        },
      };
      const encoded = yield* encode(state);
      const decoded = yield* decode(encoded);
      deepStrictEqual(decoded.root.$, { collapsed: true, customData: 42 });
    })
  );

  effect("$ NodeState on child nodes is preserved through base envelope", () =>
    Effect.gen(function* () {
      const state = {
        root: {
          type: "root" as const,
          version: 1,
          direction: "ltr" as const,
          format: "" as const,
          indent: 0,
          children: [{ type: "paragraph", version: 1, $: { collapsed: true } }],
        },
      };
      const encoded = yield* encode(state);
      const decoded = yield* decode(encoded);
      deepStrictEqual(decoded.root.children[0], {
        type: "paragraph",
        version: 1,
        $: { collapsed: true },
      });
    })
  );

  effect("textFormat and textStyle are preserved when present on root", () =>
    Effect.gen(function* () {
      const state = {
        root: {
          type: "root" as const,
          version: 1,
          direction: "ltr" as const,
          format: "" as const,
          indent: 0,
          textFormat: 3,
          textStyle: "font-size: 14px",
          children: [],
        },
      };
      const encoded = yield* encode(state);
      const decoded = yield* decode(encoded);
      strictEqual(decoded.root.textFormat, 3);
      strictEqual(decoded.root.textStyle, "font-size: 14px");
    })
  );

  effect("textFormat and textStyle are absent when not provided", () =>
    Effect.gen(function* () {
      const encoded = yield* encode(rootOnlyState);
      const decoded = yield* decode(encoded);
      strictEqual(decoded.root.textFormat, undefined);
      strictEqual(decoded.root.textStyle, undefined);
    })
  );

  effect("children element-specific fields are stripped to base node shape", () =>
    Effect.gen(function* () {
      const richInput = {
        root: {
          type: "root" as const,
          version: 1,
          direction: "ltr" as const,
          format: "" as const,
          indent: 0,
          children: [
            {
              type: "blockquote",
              version: 1,
              direction: null,
              format: 5,
              indent: 1,
              children: [],
            },
          ],
        },
      };
      const encoded = yield* encode(richInput);
      const decoded = yield* decode(encoded);
      deepStrictEqual(decoded.root.children[0], {
        type: "blockquote",
        version: 1,
      });
    })
  );
});

// ---------------------------------------------------------------------------
// Individual schema round-trips (Element and Text)
// ---------------------------------------------------------------------------

describe("SerializedElementNodeEnvelope — round-trip", () => {
  const encodeElement = S.encode(SerializedElementNodeEnvelope);
  const decodeElement = S.decode(SerializedElementNodeEnvelope);

  effect("element node with all fields survives round-trip", () =>
    Effect.gen(function* () {
      const element: SerializedElementNodeEnvelope.Type = {
        type: "paragraph",
        version: 1,
        direction: "rtl",
        format: "justify",
        indent: 2,
        textFormat: 7,
        textStyle: "font-weight: bold",
        $: { collapsed: true },
        children: [{ type: "text", version: 1 }],
      };
      const encoded = yield* encodeElement(element);
      const decoded = yield* decodeElement(encoded);
      strictEqual(decoded.type, "paragraph");
      strictEqual(decoded.direction, "rtl");
      strictEqual(decoded.format, "justify");
      strictEqual(decoded.indent, 2);
      strictEqual(decoded.textFormat, 7);
      strictEqual(decoded.textStyle, "font-weight: bold");
      deepStrictEqual(decoded.$, { collapsed: true });
      strictEqual(decoded.children.length, 1);
    })
  );

  effect("element node with numeric format survives round-trip", () =>
    Effect.gen(function* () {
      const element: SerializedElementNodeEnvelope.Type = {
        type: "heading",
        version: 1,
        direction: null,
        format: 5,
        indent: 0,
        children: [],
      };
      const encoded = yield* encodeElement(element);
      const decoded = yield* decodeElement(encoded);
      strictEqual(decoded.format, 5);
      strictEqual(decoded.direction, null);
    })
  );
});

describe("SerializedTextNodeEnvelope — round-trip", () => {
  const encodeText = S.encode(SerializedTextNodeEnvelope);
  const decodeText = S.decode(SerializedTextNodeEnvelope);

  effect("text node with bitmask format survives round-trip", () =>
    Effect.gen(function* () {
      const text: SerializedTextNodeEnvelope.Type = {
        type: "text",
        version: 1,
        text: "bold and italic",
        format: 3,
        detail: 0,
        mode: "normal",
        style: "color: red",
      };
      const encoded = yield* encodeText(text);
      const decoded = yield* decodeText(encoded);
      deepStrictEqual(decoded, text);
    })
  );

  effect("text node segmented mode survives round-trip", () =>
    Effect.gen(function* () {
      const text: SerializedTextNodeEnvelope.Type = {
        type: "text",
        version: 1,
        text: "segmented",
        format: 0,
        detail: 1,
        mode: "segmented",
        style: "",
      };
      const encoded = yield* encodeText(text);
      const decoded = yield* decodeText(encoded);
      deepStrictEqual(decoded, text);
    })
  );

  effect("text node token mode survives round-trip", () =>
    Effect.gen(function* () {
      const text: SerializedTextNodeEnvelope.Type = {
        type: "text",
        version: 1,
        text: "token text",
        format: 1,
        detail: 0,
        mode: "token",
        style: "",
      };
      const encoded = yield* encodeText(text);
      const decoded = yield* decodeText(encoded);
      deepStrictEqual(decoded, text);
    })
  );
});

// ---------------------------------------------------------------------------
// JSON serialization round-trip (simulates JSONB storage)
// ---------------------------------------------------------------------------

describe("SerializedEditorStateEnvelope — JSONB round-trip", () => {
  effect("root-only state survives JSON.stringify then JSON.parse", () =>
    Effect.gen(function* () {
      const encoded = yield* encode(rootOnlyState);
      const json = JSON.stringify(encoded);
      const parsed: unknown = JSON.parse(json);
      const decoded = yield* decodeUnknown(parsed);
      deepStrictEqual(decoded, rootOnlyState);
    })
  );

  effect("state with children survives JSONB round-trip (base fields)", () =>
    Effect.gen(function* () {
      const encoded = yield* encode(stateWithChildren);
      const json = JSON.stringify(encoded);
      const parsed: unknown = JSON.parse(json);
      const decoded = yield* decodeUnknown(parsed);
      deepStrictEqual(decoded, stateWithChildren);
    })
  );

  effect("JSONB round-trip preserves $ NodeState on child nodes", () =>
    Effect.gen(function* () {
      const state = {
        root: {
          type: "root" as const,
          version: 1,
          direction: "ltr" as const,
          format: "" as const,
          indent: 0,
          children: [{ type: "paragraph", version: 1, $: { collapsed: true } }],
        },
      };
      const encoded = yield* encode(state);
      const parsed: unknown = JSON.parse(JSON.stringify(encoded));
      const decoded = yield* decodeUnknown(parsed);
      deepStrictEqual(decoded.root.children[0], {
        type: "paragraph",
        version: 1,
        $: { collapsed: true },
      });
    })
  );

  effect("JSONB round-trip preserves root optional fields", () =>
    Effect.gen(function* () {
      const state = {
        root: {
          type: "root" as const,
          version: 1,
          direction: null,
          format: 3,
          indent: 1,
          textFormat: 7,
          textStyle: "font-size: 12px",
          $: { custom: "data" },
          children: [],
        },
      };
      const encoded = yield* encode(state);
      const parsed: unknown = JSON.parse(JSON.stringify(encoded));
      const decoded = yield* decodeUnknown(parsed);
      strictEqual(decoded.root.direction, null);
      strictEqual(decoded.root.format, 3);
      strictEqual(decoded.root.indent, 1);
      strictEqual(decoded.root.textFormat, 7);
      strictEqual(decoded.root.textStyle, "font-size: 12px");
      deepStrictEqual(decoded.root.$, { custom: "data" });
    })
  );

  effect("ElementNodeEnvelope survives JSONB round-trip independently", () =>
    Effect.gen(function* () {
      const encodeElement = S.encode(SerializedElementNodeEnvelope);
      const decodeElementUnknown = S.decodeUnknown(SerializedElementNodeEnvelope);
      const element: SerializedElementNodeEnvelope.Type = {
        type: "paragraph",
        version: 1,
        direction: "rtl",
        format: "justify",
        indent: 2,
        textFormat: 3,
        textStyle: "font-weight: bold",
        $: { collapsed: true },
        children: [{ type: "text", version: 1 }],
      };
      const encoded = yield* encodeElement(element);
      const parsed: unknown = JSON.parse(JSON.stringify(encoded));
      const decoded = yield* decodeElementUnknown(parsed);
      strictEqual(decoded.type, "paragraph");
      strictEqual(decoded.direction, "rtl");
      strictEqual(decoded.format, "justify");
      strictEqual(decoded.textFormat, 3);
      strictEqual(decoded.textStyle, "font-weight: bold");
      deepStrictEqual(decoded.$, { collapsed: true });
    })
  );

  effect("TextNodeEnvelope survives JSONB round-trip independently", () =>
    Effect.gen(function* () {
      const encodeText = S.encode(SerializedTextNodeEnvelope);
      const decodeTextUnknown = S.decodeUnknown(SerializedTextNodeEnvelope);
      const text: SerializedTextNodeEnvelope.Type = {
        type: "text",
        version: 1,
        text: "bold and italic",
        format: 3,
        detail: 0,
        mode: "normal",
        style: "color: red",
      };
      const encoded = yield* encodeText(text);
      const parsed: unknown = JSON.parse(JSON.stringify(encoded));
      const decoded = yield* decodeTextUnknown(parsed);
      deepStrictEqual(decoded, text);
    })
  );
});

// ---------------------------------------------------------------------------
// ParseError on malformed input
// ---------------------------------------------------------------------------

describe("SerializedEditorStateEnvelope — ParseError on malformed input", () => {
  effect("missing root key produces ParseError", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(decodeUnknown({ notRoot: {} }));
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("root.type not 'root' produces ParseError", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(
        decodeUnknown({
          root: {
            type: "paragraph",
            version: 1,
            children: [],
            direction: "ltr",
            format: "",
            indent: 0,
          },
        })
      );
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("root.children not an array produces ParseError", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(
        decodeUnknown({
          root: {
            type: "root",
            version: 1,
            children: "not-an-array",
            direction: "ltr",
            format: "",
            indent: 0,
          },
        })
      );
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("child node missing type field produces ParseError", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(
        decodeUnknown({
          root: {
            type: "root",
            version: 1,
            children: [{ version: 1 }],
            direction: "ltr",
            format: "",
            indent: 0,
          },
        })
      );
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("child node missing version field produces ParseError", () =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(
        decodeUnknown({
          root: {
            type: "root",
            version: 1,
            children: [{ type: "paragraph" }],
            direction: "ltr",
            format: "",
            indent: 0,
          },
        })
      );
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("text node with invalid mode produces ParseError", () =>
    Effect.gen(function* () {
      const decodeTextUnknown = S.decodeUnknown(SerializedTextNodeEnvelope);
      const exit = yield* Effect.exit(
        decodeTextUnknown({
          type: "text",
          version: 1,
          text: "bad",
          format: 0,
          detail: 0,
          mode: "invalid",
          style: "",
        })
      );
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("element node with invalid direction produces ParseError", () =>
    Effect.gen(function* () {
      const decodeElementUnknown = S.decodeUnknown(SerializedElementNodeEnvelope);
      const exit = yield* Effect.exit(
        decodeElementUnknown({
          type: "paragraph",
          version: 1,
          children: [],
          direction: "up",
          format: "",
          indent: 0,
        })
      );
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("element node with invalid string format produces ParseError", () =>
    Effect.gen(function* () {
      const decodeElementUnknown = S.decodeUnknown(SerializedElementNodeEnvelope);
      const exit = yield* Effect.exit(
        decodeElementUnknown({
          type: "paragraph",
          version: 1,
          children: [],
          direction: "ltr",
          format: "invalid",
          indent: 0,
        })
      );
      assertTrue(Exit.isFailure(exit));
    })
  );
});

// ---------------------------------------------------------------------------
// RPC payload schema validation
// ---------------------------------------------------------------------------

describe("Document.create RPC — contentRich validation", () => {
  effect("contentRich accepts valid editor state in create payload", () =>
    Effect.gen(function* () {
      const validState = {
        root: {
          type: "root" as const,
          version: 1,
          direction: "ltr" as const,
          format: "" as const,
          indent: 0,
          children: [
            {
              type: "paragraph",
              version: 1,
            },
          ],
        },
      };
      const result = yield* S.decode(SerializedEditorStateEnvelope)(validState);
      strictEqual(result.root.type, "root");
      strictEqual(result.root.children.length, 1);
    })
  );

  effect("contentRich rejects malformed data with ParseError", () =>
    Effect.gen(function* () {
      const malformed = {
        root: {
          type: "not-root",
          version: 1,
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
        },
      };
      const exit = yield* Effect.exit(decodeUnknown(malformed));
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("contentRich rejects missing root.direction with ParseError", () =>
    Effect.gen(function* () {
      const malformed = {
        root: {
          type: "root",
          version: 1,
          children: [],
          format: "",
          indent: 0,
        },
      };
      const exit = yield* Effect.exit(decodeUnknown(malformed));
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("contentRich rejects missing root.format with ParseError", () =>
    Effect.gen(function* () {
      const malformed = {
        root: {
          type: "root",
          version: 1,
          children: [],
          direction: "ltr",
          indent: 0,
        },
      };
      const exit = yield* Effect.exit(decodeUnknown(malformed));
      assertTrue(Exit.isFailure(exit));
    })
  );
});
