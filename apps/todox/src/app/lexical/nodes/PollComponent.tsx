"use client";

import { cn } from "@beep/todox/lib/utils";
import { Button } from "@beep/ui/components/button";
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  type BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  type NodeKey,
} from "lexical";
import type { JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { $isPollNode, createPollOption, type Option, type Options, type PollNodeInterface } from "./poll-utils";

function getTotalVotes(options: Options): number {
  return options.reduce((totalVotes, next) => {
    return totalVotes + next.votes.length;
  }, 0);
}

function PollOptionComponent({
  option,
  index,
  options,
  totalVotes,
  withPollNode,
}: {
  readonly index: number;
  readonly option: Option;
  readonly options: Options;
  readonly totalVotes: number;
  readonly withPollNode: (cb: (pollNode: PollNodeInterface) => void, onSelect?: undefined | (() => void)) => void;
}): JSX.Element {
  const { name: username } = useCollaborationContext();
  const checkboxRef = useRef(null);
  const votesArray = option.votes;
  const checkedIndex = votesArray.indexOf(username);
  const checked = checkedIndex !== -1;
  const votes = votesArray.length;
  const text = option.text;

  return (
    <div className="flex flex-row mb-2.5 items-center">
      <div
        className={cn(
          "relative flex w-[22px] h-[22px] border border-[#999] mr-2.5 rounded",
          checked &&
            "border-[rgb(61,135,245)] bg-[rgb(61,135,245)] after:content-[''] after:cursor-pointer after:border-white after:border-solid after:absolute after:block after:top-1 after:w-[5px] after:left-2 after:h-[9px] after:m-0 after:rotate-45 after:border-[0_2px_2px_0] after:pointer-events-none"
        )}
      >
        <input
          ref={checkboxRef}
          className="border-0 absolute block w-full h-full opacity-0 cursor-pointer"
          type="checkbox"
          onChange={(e) => {
            withPollNode((node) => {
              node.toggleVote(option, username);
            });
          }}
          checked={checked}
        />
      </div>
      <div className="flex flex-[10px] border border-[rgb(61,135,245)] rounded relative overflow-hidden cursor-pointer">
        <div
          className="bg-[rgb(236,243,254)] h-full absolute top-0 left-0 transition-[width] duration-1000 ease-out z-0"
          style={{ width: `${votes === 0 ? 0 : (votes / totalVotes) * 100}%` }}
        />
        <span className="text-[rgb(61,135,245)] absolute right-[15px] text-xs top-[5px]">
          {votes > 0 && (votes === 1 ? "1 vote" : `${votes} votes`)}
        </span>
        <input
          className="flex flex-[1px] border-0 p-[7px] text-[rgb(61,135,245)] bg-transparent font-bold outline-0 z-0 placeholder:font-normal placeholder:text-[#999]"
          type="text"
          value={text}
          onChange={(e) => {
            const target = e.target;
            const value = target.value;
            const selectionStart = target.selectionStart;
            const selectionEnd = target.selectionEnd;
            withPollNode(
              (node) => {
                node.setOptionText(option, value);
              },
              () => {
                target.selectionStart = selectionStart;
                target.selectionEnd = selectionEnd;
              }
            );
          }}
          placeholder={`Option ${index + 1}`}
        />
      </div>
      <button
        type={"button"}
        disabled={options.length < 3}
        className={cn(
          "relative flex w-7 h-7 ml-1.5 border-0 bg-transparent bg-[6px_6px] bg-no-repeat z-0 cursor-pointer rounded opacity-30",
          "before:absolute before:block before:content-[''] before:bg-[#999] before:w-0.5 before:h-[15px] before:top-1.5 before:left-[13px] before:-rotate-45",
          "after:absolute after:block after:content-[''] after:bg-[#999] after:w-0.5 after:h-[15px] after:top-1.5 after:left-[13px] after:rotate-45",
          "hover:opacity-100 hover:bg-[#eee]",
          options.length < 3 && "cursor-not-allowed hover:opacity-30 hover:bg-transparent"
        )}
        aria-label="Remove"
        onClick={() => {
          withPollNode((node) => {
            node.deleteOption(option);
          });
        }}
      />
    </div>
  );
}

export default function PollComponent({
  question,
  options,
  nodeKey,
}: {
  nodeKey: NodeKey;
  options: Options;
  question: string;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const totalVotes = useMemo(() => getTotalVotes(options), [options]);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const ref = useRef(null);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        setSelection(editorState.read(() => $getSelection()));
      }),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (payload) => {
          const event = payload;

          if (event.target === ref.current) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, isSelected, nodeKey, setSelected]);

  const withPollNode = (cb: (node: PollNodeInterface) => void, onUpdate?: undefined | (() => void)): void => {
    editor.update(
      () => {
        const node = $getNodeByKey(nodeKey);
        if ($isPollNode(node)) {
          cb(node);
        }
      },
      { onUpdate }
    );
  };

  const addOption = () => {
    withPollNode((node) => {
      node.addOption(createPollOption());
    });
  };

  const isFocused = $isNodeSelection(selection) && isSelected;

  return (
    <div
      className={cn(
        "border border-[#eee] bg-[#fcfcfc] rounded-[10px] max-w-[600px] min-w-[400px] cursor-pointer select-none",
        isFocused && "outline outline-2 outline-[rgb(60,132,244)]"
      )}
      ref={ref}
    >
      <div className="m-[15px] cursor-default">
        <h2 className="ml-0 mt-0 mr-0 mb-[15px] text-[#444] text-center text-lg">{question}</h2>
        {options.map((option, index) => {
          const key = option.uid;
          return (
            <PollOptionComponent
              key={key}
              withPollNode={withPollNode}
              option={option}
              index={index}
              options={options}
              totalVotes={totalVotes}
            />
          );
        })}
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={addOption}>
            Add Option
          </Button>
        </div>
      </div>
    </div>
  );
}
