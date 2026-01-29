"use client";

import { Button } from "@beep/ui/components/button";
import { Input } from "@beep/ui/components/input";
import { Label } from "@beep/ui/components/label";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement } from "@lexical/utils";
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
    <>
      <div className="flex flex-row items-center mb-2.5 gap-3">
        <Label className="flex flex-1 text-muted-foreground text-sm" htmlFor={questionId}>
          Question
        </Label>
        <Input
          id={questionId}
          className="flex flex-[2]"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <div className="flex flex-row justify-end mt-5 gap-2">
        <Button variant="outline" disabled={question.trim() === ""} onClick={onClick}>
          Confirm
        </Button>
      </div>
    </>
  );
}

export default function PollPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (!editor.hasNodes([PollNode])) {
      throw new Error("PollPlugin: PollNode not registered on editor");
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
