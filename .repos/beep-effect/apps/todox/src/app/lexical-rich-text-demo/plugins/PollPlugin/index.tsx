"use client";

import { Button } from "@beep/todox/components/ui/button";
import { Input } from "@beep/todox/components/ui/input";
import { Label } from "@beep/todox/components/ui/label";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
import * as Str from "effect/String";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
  type LexicalEditor,
} from "lexical";
import type { JSX } from "react";
import { useEffect, useId, useState } from "react";

import { $createPollNode, createPollOption, PollNode } from "../../nodes/PollNode";
import { NodeNotRegisteredError } from "../../schema/errors";

export const INSERT_POLL_COMMAND: LexicalCommand<string> = createCommand("INSERT_POLL_COMMAND");

export function InsertPollDialog({
  activeEditor,
  onClose,
}: {
  readonly activeEditor: LexicalEditor;
  readonly onClose: () => void;
}): JSX.Element {
  const [question, setQuestion] = useState("");
  const questionId = useId();

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_POLL_COMMAND, question);
    onClose();
  };

  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor={questionId}>Poll question</Label>
        <Input
          id={questionId}
          placeholder="What would you like to ask?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button variant="outline" disabled={Str.trim(question) === ""} onClick={onClick}>
          Confirm
        </Button>
      </div>
    </div>
  );
}

export default function PollPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([PollNode])) {
      throw new NodeNotRegisteredError({
        message: "PollPlugin: PollNode not registered on editor",
        plugin: "PollPlugin",
        nodeType: "PollNode",
      });
    }

    return editor.registerCommand<string>(
      INSERT_POLL_COMMAND,
      (payload) => {
        const pollNode = $createPollNode(payload, [createPollOption(), createPollOption()]);
        $insertNodes([pollNode]);
        if ($isRootOrShadowRoot(pollNode.getParentOrThrow())) {
          $wrapNodeInElement(pollNode, $createParagraphNode).selectEnd();
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);
  return null;
}
