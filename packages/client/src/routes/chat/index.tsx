import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareIcon } from "lucide-react";

export const Route = createFileRoute("/chat/")({
  component: () => (
    <div className="flex-1 flex flex-col items-center justify-center text-muted gap-4">
      <MessageSquareIcon className="size-12 text-dimmed" />
      <p className="text-lg">Select a chat or start a new one</p>
    </div>
  ),
});
