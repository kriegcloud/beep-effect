import {
  SerializedEditorStateEnvelope,
  SerializedElementNodeEnvelope,
  SerializedTextNodeEnvelope,
} from "@beep/workspaces-domain/value-objects/SerializedEditorState";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as S from "effect/Schema";

const decode = S.decodeUnknown(SerializedEditorStateEnvelope);
const decodeElement = S.decodeUnknown(SerializedElementNodeEnvelope);
const decodeText = S.decodeUnknown(SerializedTextNodeEnvelope);

describe("SerializedEditorStateEnvelope", () => {
  effect("valid Lexical JSON passes validation", () =>
    Effect.gen(function* () {
      const valid = {
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
                  detail: 0,
                  mode: "normal",
                  style: "",
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
        },
      };
      const result = yield* decode(valid);
      strictEqual(result.root.type, "root");
    })
  );

  effect("missing root fails validation", () =>
    Effect.gen(function* () {
      const invalid = { notRoot: {} };
      const exit = yield* Effect.exit(decode(invalid));
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("invalid direction fails validation", () =>
    Effect.gen(function* () {
      const invalid = {
        root: {
          type: "root",
          version: 1,
          children: [],
          direction: "invalid",
          format: "",
          indent: 0,
        },
      };
      const exit = yield* Effect.exit(decode(invalid));
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("invalid string format fails validation", () =>
    Effect.gen(function* () {
      const invalid = {
        root: {
          type: "root",
          version: 1,
          children: [],
          direction: "ltr",
          format: "invalid",
          indent: 0,
        },
      };
      const exit = yield* Effect.exit(decode(invalid));
      assertTrue(Exit.isFailure(exit));
    })
  );

  effect("numeric format is accepted on element nodes", () =>
    Effect.gen(function* () {
      const valid = {
        root: {
          type: "root",
          version: 1,
          children: [],
          direction: "ltr",
          format: 0,
          indent: 0,
        },
      };
      const result = yield* decode(valid);
      strictEqual(result.root.format, 0);
    })
  );

  effect("recursive children validation (deeply nested)", () =>
    Effect.gen(function* () {
      const valid = {
        root: {
          type: "root",
          version: 1,
          children: [
            {
              type: "blockquote",
              version: 1,
              children: [
                {
                  type: "paragraph",
                  version: 1,
                  children: [
                    {
                      type: "text",
                      version: 1,
                      text: "nested",
                      format: 0,
                      detail: 0,
                      mode: "normal",
                      style: "",
                    },
                  ],
                  direction: "ltr",
                  format: "",
                  indent: 0,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
        },
      };
      const result = yield* decode(valid);
      strictEqual(result.root.type, "root");
    })
  );

  effect("empty children array is valid", () =>
    Effect.gen(function* () {
      const valid = {
        root: {
          type: "root",
          version: 1,
          children: [],
          direction: null,
          format: "",
          indent: 0,
        },
      };
      const result = yield* decode(valid);
      strictEqual(result.root.type, "root");
      strictEqual(result.root.direction, null);
    })
  );
});

describe("SerializedTextNodeEnvelope", () => {
  effect("text node format bitmask is accepted", () =>
    Effect.gen(function* () {
      const valid = {
        type: "text",
        version: 1,
        text: "bold and italic",
        format: 3,
        detail: 0,
        mode: "normal" as const,
        style: "",
      };
      const result = yield* decodeText(valid);
      strictEqual(result.format, 3);
      strictEqual(result.text, "bold and italic");
    })
  );

  effect("text node with invalid mode fails", () =>
    Effect.gen(function* () {
      const invalid = {
        type: "text",
        version: 1,
        text: "bad mode",
        format: 0,
        detail: 0,
        mode: "invalid",
        style: "",
      };
      const exit = yield* Effect.exit(decodeText(invalid));
      assertTrue(Exit.isFailure(exit));
    })
  );
});

describe("SerializedElementNodeEnvelope", () => {
  effect("element node with optional $ state", () =>
    Effect.gen(function* () {
      const valid = {
        type: "paragraph",
        version: 1,
        children: [],
        direction: "ltr" as const,
        format: "" as const,
        indent: 0,
        $: { customKey: "customValue" },
      };
      const result = yield* decodeElement(valid);
      strictEqual(result.type, "paragraph");
    })
  );

  effect("element node with textFormat and textStyle", () =>
    Effect.gen(function* () {
      const valid = {
        type: "paragraph",
        version: 1,
        children: [],
        direction: null,
        format: "justify" as const,
        indent: 2,
        textFormat: 1,
        textStyle: "font-size: 16px",
      };
      const result = yield* decodeElement(valid);
      strictEqual(result.textFormat, 1);
      strictEqual(result.textStyle, "font-size: 16px");
    })
  );
});
