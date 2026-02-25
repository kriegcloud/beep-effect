"use client";

import { ChatPanel } from "@beep/web/components/chat/ChatPanel";
import { GraphPanel } from "@beep/web/components/graph/GraphPanel";

export default function AppPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex h-screen min-h-screen w-full flex-col lg:flex-row">
        <section className="h-[58vh] min-h-[360px] lg:h-full lg:w-3/5">
          <GraphPanel />
        </section>

        <section className="h-[42vh] min-h-[320px] lg:h-full lg:w-2/5">
          <ChatPanel />
        </section>
      </div>
    </main>
  );
}
