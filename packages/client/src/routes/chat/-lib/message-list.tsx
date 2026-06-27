import type { ChatId } from "@app/domain/api/chat-rpc";
import { useAtomValue } from "@effect/atom-react";
import { BotIcon } from "lucide-react";
import * as React from "react";
import { VList } from "virtua";
import type { VListHandle } from "virtua";
import { generatingFamily, messagesFamily } from "./chat-atoms.js";
import { AssistantMessage, UserBubble } from "./message-bubbles.js";

const SCROLL_THRESHOLD = 50;

const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-muted gap-4">
    <BotIcon className="size-12 text-dimmed" />
    <h2 className="text-xl font-medium text-foreground">Start a conversation</h2>
    <p className="text-sm">Send a message to begin chatting.</p>
  </div>
);

export const MessageList = ({ chatId }: { readonly chatId: ChatId; }) => {
  const messages = useAtomValue(messagesFamily(chatId));
  const isGenerating = useAtomValue(generatingFamily(chatId));
  const ref = React.useRef<VListHandle>(null);
  const shouldStickToBottom = React.useRef(true);

  React.useEffect(() => {
    if (!ref.current || messages.length === 0) return;
    if (shouldStickToBottom.current) {
      ref.current.scrollToIndex(messages.length - 1, { align: "end" });
    }
  }, [messages]);

  if (messages.length === 0) return <EmptyState />;

  return (
    <VList
      ref={ref}
      className="flex-1"
      style={{ overflowAnchor: "none" }}
      onScroll={(offset) => {
        if (!ref.current) return;
        const distanceFromBottom = ref.current.scrollSize - offset - ref.current.viewportSize;
        shouldStickToBottom.current = distanceFromBottom <= SCROLL_THRESHOLD;
      }}
    >
      {messages.map((message, index) => {
        const isLastAssistant = isGenerating && index === messages.length - 1
          && message.role === "assistant";

        return message.role === "user"
          ? <UserBubble key={message.id} message={message} />
          : <AssistantMessage key={message.id} message={message} isStreaming={isLastAssistant} />;
      })}
    </VList>
  );
};
