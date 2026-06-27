import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ChatSidebar } from "./-lib/chat-sidebar.js";

export const Route = createFileRoute("/chat")({
  component: () => (
    <div className="h-full flex">
      <ChatSidebar />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  ),
});
