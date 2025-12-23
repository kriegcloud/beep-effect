"use client";

import { Layout } from "@beep/shared-ui/ai/layout";
import { MainContent } from "@beep/shared-ui/ai/MainContent";
import { Nav } from "@beep/shared-ui/ai/Nav";
import { Sidebar } from "@beep/shared-ui/ai/Sidebar";
import { TopNav } from "@beep/shared-ui/ai/TopNav";
import { Bot, Folder } from "lucide-react";
import { useState } from "react";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState("workspace");
  const [, setMessages] = useState<string[]>([]);

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [...prev, message]);
    console.log("Message sent:", message);
  };

  return (
    <Layout
      topNav={
        <TopNav
          logo={<Bot className="size-6 text-zinc-300" />}
          breadcrumbs={[
            { id: "workspace", label: "Workspace", icon: <Folder className="size-4" /> },
            { id: "app", label: "App Builder Studio", icon: <Bot className="size-4 text-amber-400" /> },
          ]}
        />
      }
      sidebar={
        <Sidebar
          title="App Builder Studio"
          description="Build your Taskade Genesis app powered by workspace DNA."
          onSendMessage={handleSendMessage}
          appName="App"
        />
      }
    >
      <MainContent
        toolbar={<Nav activeTab={activeTab} onTabChange={setActiveTab} />}
        centerText="What was formed now flows, seeking new shapes..."
      />
    </Layout>
  );
}
