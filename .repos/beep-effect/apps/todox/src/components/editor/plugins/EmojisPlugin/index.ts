"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { LexicalEditor } from "lexical";
import { TextNode } from "lexical";
import type { JSX } from "react";
import { useEffect } from "react";

import { $createEmojiNode, EmojiNode } from "../../nodes/EmojiNode";
import { NodeNotRegisteredError } from "../../schema/errors";

const emojiEntries: ReadonlyArray<readonly [string, readonly [string, string]]> = [
  [":)", ["emoji happysmile", "🙂"]] as const,
  [":D", ["emoji veryhappysmile", "😀"]] as const,
  [":(", ["emoji unhappysmile", "🙁"]] as const,
  ["<3", ["emoji heart", "❤"]] as const,
];

const emojis: HashMap.HashMap<string, readonly [string, string]> = HashMap.fromIterable(emojiEntries);

function $findAndTransformEmoji(node: TextNode): null | TextNode {
  const text = node.getTextContent();

  for (let i = 0; i < text.length; i++) {
    const singleChar = text[i];
    const twoChars = Str.slice(i, i + 2)(text);

    // Try single character first, then two characters
    const singleCharResult = singleChar !== undefined ? HashMap.get(emojis, singleChar) : O.none();
    const emojiDataOption = O.isSome(singleCharResult) ? singleCharResult : HashMap.get(emojis, twoChars);

    if (O.isSome(emojiDataOption)) {
      const [emojiStyle, emojiText] = emojiDataOption.value;
      let targetNode: TextNode | undefined;

      if (i === 0) {
        [targetNode] = node.splitText(i + 2);
      } else {
        [, targetNode] = node.splitText(i, i + 2);
      }

      if (targetNode === undefined) {
        return null;
      }

      const emojiNode = $createEmojiNode(emojiStyle, emojiText);
      targetNode.replace(emojiNode);
      return emojiNode;
    }
  }

  return null;
}

function $textNodeTransform(node: TextNode): void {
  let targetNode: TextNode | null = node;

  while (targetNode !== null) {
    if (!targetNode.isSimpleText()) {
      return;
    }

    targetNode = $findAndTransformEmoji(targetNode);
  }
}

function useEmojis(editor: LexicalEditor): void {
  useEffect(() => {
    if (!editor.hasNodes([EmojiNode])) {
      throw new NodeNotRegisteredError({
        message: "EmojisPlugin: EmojiNode not registered on editor",
        plugin: "EmojisPlugin",
        nodeType: "EmojiNode",
      });
    }

    return editor.registerNodeTransform(TextNode, $textNodeTransform);
  }, [editor]);
}

export default function EmojisPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  useEmojis(editor);
  return null;
}
