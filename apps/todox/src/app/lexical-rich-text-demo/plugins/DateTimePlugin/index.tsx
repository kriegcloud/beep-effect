"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import type * as DateTime from "effect/DateTime";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from "lexical";
import type { JSX } from "react";
import { useEffect } from "react";

import { $createDateTimeNode, DateTimeNode } from "../../nodes/DateTimeNode/DateTimeNode";

type CommandPayload = {
  readonly dateTime: DateTime.Utc;
};

export const INSERT_DATETIME_COMMAND: LexicalCommand<CommandPayload> = createCommand("INSERT_DATETIME_COMMAND");

export default function DateTimePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([DateTimeNode])) {
      throw new Error("DateTimePlugin: DateTimeNode not registered on editor");
    }

    return mergeRegister(
      editor.registerCommand<CommandPayload>(
        INSERT_DATETIME_COMMAND,
        (payload) => {
          const { dateTime } = payload;
          const dateTimeNode = $createDateTimeNode(dateTime);

          $insertNodes([dateTimeNode]);
          if ($isRootOrShadowRoot(dateTimeNode.getParentOrThrow())) {
            $wrapNodeInElement(dateTimeNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
}
