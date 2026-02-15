"use client";

import dynamic from "next/dynamic";

const PlaygroundApp = dynamic(
  () => import("@beep/todox/components/editor/App"),
  { ssr: false },
);

interface WorkspacePageProps {
  readonly params: Promise<{
    readonly id: string;
    readonly pageId: string;
  }>;
}

export default function WorkspacePage(_props: WorkspacePageProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <PlaygroundApp />
    </div>
  );
}
