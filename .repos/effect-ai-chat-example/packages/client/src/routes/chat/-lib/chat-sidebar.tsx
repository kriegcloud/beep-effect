import type { ModelFamily } from "@app/domain/ai-models";
import type { ChatId } from "@app/domain/api/chat-rpc";
import { useAtom, useAtomRefresh, useAtomSet, useAtomValue } from "@effect/atom-react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { AsyncResult } from "effect/unstable/reactivity";
import { ChevronDownIcon, Loader2Icon, MessageSquarePlusIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { Button, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";
import { chatListAtom, createChatAtom, deleteChatFamily, selectedModelAtom } from "./chat-atoms.js";

const MODEL_LABELS: Record<ModelFamily, string> = {
  "qwen3.6-uncensored:35b": "Qwen 3.6 35B",
  "llama3.2": "Llama 3.2",
};

export const ChatSidebar = () => {
  const chatListResult = useAtomValue(chatListAtom);
  const refreshChatList = useAtomRefresh(chatListAtom);
  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);
  const createChat = useAtomSet(createChatAtom, { mode: "promise" });
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const activeChatId = (params as { chatId?: string; }).chatId;

  const handleNewChat = () => {
    void createChat({ title: "New chat", model: selectedModel }).then((chat) => {
      refreshChatList();
      void navigate({ to: "/chat/$chatId", params: { chatId: chat.id } });
    });
  };

  return (
    <div className="w-64 h-full flex flex-col bg-surface border-r border-border">
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Select
            selectedKey={selectedModel}
            aria-label="Model"
            onSelectionChange={(key) => {
              setSelectedModel(key as ModelFamily);
            }}
            className="flex-1"
          >
            <Button className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-elevated text-sm text-foreground hover:border-border-hover border border-border cursor-pointer">
              <SelectValue />
              <ChevronDownIcon className="size-4 text-muted" />
            </Button>
            <Popover className="bg-elevated border border-border rounded-lg shadow-lg overflow-hidden min-w-[--trigger-width]">
              <ListBox className="outline-none p-1">
                {(Object.entries(MODEL_LABELS) as [ModelFamily, string][]).map(([id, label]) => (
                  <ListBoxItem
                    key={id}
                    id={id}
                    className="px-3 py-1.5 rounded text-sm cursor-pointer outline-none data-[focused]:bg-surface data-[selected]:text-primary"
                  >
                    {label}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Popover>
          </Select>
          <Button
            onPress={handleNewChat}
            aria-label="New chat"
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-elevated transition-colors cursor-pointer"
          >
            <MessageSquarePlusIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 px-2">
        {AsyncResult.isInitial(chatListResult) || chatListResult.waiting
          ? (
            <div className="flex justify-center py-4">
              <Loader2Icon className="size-5 animate-spin text-muted" />
            </div>
          )
          : AsyncResult.isFailure(chatListResult)
          ? <div className="px-3 py-2 text-sm text-danger">Failed to load chats</div>
          : (
            chatListResult.value.items.map((chat) => (
              <ChatListItem
                key={chat.id}
                activeChatId={activeChatId}
                chat={chat}
                onDeleted={refreshChatList}
                onNavigate={navigate}
              />
            ))
          )}
      </div>
    </div>
  );
};

const ChatListItem = ({
  chat,
  activeChatId,
  onDeleted,
  onNavigate,
}: {
  readonly chat: { readonly id: ChatId; readonly title: string; };
  readonly activeChatId: string | undefined;
  readonly onDeleted: () => void;
  readonly onNavigate: ReturnType<typeof useNavigate>;
}) => {
  const deleteChat = useAtomSet(deleteChatFamily(chat.id), { mode: "promise" });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void deleteChat(undefined).then(() => {
      onDeleted();
      if (activeChatId === chat.id) {
        void onNavigate({ to: "/chat" });
      }
    });
  };

  return (
    <Link
      to="/chat/$chatId"
      params={{ chatId: chat.id }}
      className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
        activeChatId === chat.id
          ? "bg-elevated text-foreground"
          : "text-muted hover:text-foreground hover:bg-elevated/50"
      }`}
    >
      <span className="truncate flex-1">{chat.title}</span>
      <button
        onClick={handleDelete}
        aria-label={`Delete ${chat.title}`}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted hover:text-danger transition-all cursor-pointer"
      >
        <Trash2Icon className="size-3.5" />
      </button>
    </Link>
  );
};
