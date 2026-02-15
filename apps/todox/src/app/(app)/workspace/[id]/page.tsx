"use client";

interface WorkspaceOverviewProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export default function WorkspaceOverview(_props: WorkspaceOverviewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Select a page</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a page from the workspace sidebar to begin editing
        </p>
      </div>
    </div>
  );
}
