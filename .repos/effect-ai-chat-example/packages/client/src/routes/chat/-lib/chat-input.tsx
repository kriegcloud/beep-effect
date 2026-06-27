import type { ChatId } from "@app/domain/api/chat-rpc";
import { useAtom, useAtomSet, useAtomValue } from "@effect/atom-react";
import { ArrowUpIcon, StopCircleIcon } from "lucide-react";
import * as React from "react";
import { Button } from "react-aria-components";
import { generatingFamily, inputFamily, interruptFamily, sendMessageFamily } from "./chat-atoms.js";

export const ChatInput = ({ chatId }: { readonly chatId: ChatId; }) => {
  const [input, setInput] = useAtom(inputFamily(chatId));
  const isGenerating = useAtomValue(generatingFamily(chatId));
  const sendMessage = useAtomSet(sendMessageFamily(chatId));
  const interrupt = useAtomSet(interruptFamily(chatId));
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    sendMessage({ message: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  };

  React.useEffect(() => {
    if (input === "" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input]);

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto rounded-2xl bg-surface border border-border overflow-hidden">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          rows={1}
          className="w-full bg-transparent px-4 pt-3 pb-1 resize-none outline-none text-foreground placeholder:text-dimmed min-h-[44px] max-h-[200px]"
        />
        <div className="flex items-center justify-end px-3 pb-2">
          {isGenerating
            ? (
              <Button
                onPress={() => {
                  interrupt(undefined);
                }}
                aria-label="Stop generation"
                className="p-2 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-colors cursor-pointer"
              >
                <StopCircleIcon className="size-4" />
              </Button>
            )
            : (
              <Button
                onPress={handleSubmit}
                isDisabled={!input.trim()}
                aria-label="Send message"
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowUpIcon className="size-4" />
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};
