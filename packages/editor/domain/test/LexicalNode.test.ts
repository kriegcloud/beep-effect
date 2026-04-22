import * as LN from "@beep/editor-domain/Domain/LexicalNode";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";
import { $createTextNode, createEditor } from "lexical";

describe("LexicalNode", () => {
  it("accepts runtime lexical nodes created inside an editor update", () => {
    const decodeLexicalNode = S.decodeUnknownSync(LN.LexicalNode);
    const editor = createEditor();
    let lexicalNode: unknown = undefined;

    editor.update(() => {
      lexicalNode = $createTextNode("hello from lexical");
    });

    expect(decodeLexicalNode(lexicalNode)).toBe(lexicalNode);
  });

  it("rejects structural lookalikes that are not real lexical nodes", () => {
    const isLexicalNode = S.is(LN.LexicalNode);
    const fakeLexicalNode = {
      __key: "node-key",
      __type: "text",
      constructor: Object,
      exportJSON: () => ({ type: "text", version: 1 }),
      getKey: () => "node-key",
      getLatest: () => "latest",
      getType: () => "text",
      getWritable: () => "writable",
    };

    expect(isLexicalNode(fakeLexicalNode)).toBe(false);
  });
});
