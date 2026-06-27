import { ChatId } from "@app/domain/api/chat-rpc";
import { createFileRoute } from "@tanstack/react-router";
import { ChatPage } from "./-lib/chat-page.js";

export const Route = createFileRoute("/chat/$chatId")({
  component: () => {
    const { chatId } = Route.useParams();
    return <ChatPage chatId={ChatId.make(chatId)} />;
  },
});
