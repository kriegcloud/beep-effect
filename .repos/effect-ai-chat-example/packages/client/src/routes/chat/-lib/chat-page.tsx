import type { ChatId, RunId } from "@app/domain/api/chat-rpc";
import { useAtomSet, useAtomSubscribe, useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { Loader2Icon } from "lucide-react";
import * as React from "react";
import { chatDataFamily, watchChatFamily } from "./chat-atoms.js";
import { ChatInput } from "./chat-input.js";
import { MessageList } from "./message-list.js";

export const ChatPage = ({ chatId }: { readonly chatId: ChatId; }) => {
  const chatAtom = chatDataFamily(chatId);
  const watchAtom = watchChatFamily(chatId);
  const chatResult = useAtomValue(chatAtom);
  const setWatchChat = useAtomSet(watchAtom);
  const latestChatRef = React.useRef<
    {
      readonly chatId: ChatId;
      readonly activeRunId: RunId | null;
    } | null
  >(null);
  const watchedChatRef = React.useRef<
    {
      readonly chatId: ChatId;
      readonly activeRunId: RunId | null;
    } | null
  >(null);
  const watchStartableRef = React.useRef(true);

  const startWatch = React.useCallback(() => {
    if (latestChatRef.current?.chatId !== chatId) {
      return;
    }
    if (
      watchedChatRef.current?.chatId === chatId
      && watchedChatRef.current.activeRunId === latestChatRef.current.activeRunId
    ) {
      return;
    }
    if (!watchStartableRef.current) {
      return;
    }
    watchedChatRef.current = latestChatRef.current;
    setWatchChat({ activeRunId: latestChatRef.current.activeRunId });
  }, [chatId, setWatchChat]);

  useAtomSubscribe(
    watchAtom,
    React.useCallback((nextWatchResult) => {
      watchStartableRef.current = AsyncResult.isInitial(nextWatchResult)
        || AsyncResult.isFailure(nextWatchResult);
      startWatch();
    }, [startWatch]),
    { immediate: true },
  );

  useAtomSubscribe(
    chatAtom,
    React.useCallback((nextChatResult) => {
      if (AsyncResult.isSuccess(nextChatResult)) {
        latestChatRef.current = {
          chatId,
          activeRunId: nextChatResult.value.activeRunId,
        };
        startWatch();
        return;
      }
      if (latestChatRef.current?.chatId === chatId) {
        latestChatRef.current = null;
      }
    }, [chatId, startWatch]),
    { immediate: true },
  );

  if (
    AsyncResult.isInitial(chatResult) || (chatResult.waiting && !AsyncResult.isSuccess(chatResult))
  ) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2Icon className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  if (AsyncResult.isFailure(chatResult)) {
    return (
      <div className="flex-1 flex items-center justify-center text-danger">
        <p>Failed to load chat</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <h1 className="text-sm font-medium truncate">{chatResult.value.title}</h1>
        <span className="text-xs text-muted bg-elevated px-2 py-0.5 rounded">
          {chatResult.value.model}
        </span>
      </div>
      <MessageList chatId={chatId} />
      <ChatInput chatId={chatId} />
    </div>
  );
};
