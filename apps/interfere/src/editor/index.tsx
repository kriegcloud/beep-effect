import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@beep/ui/components/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beep/ui/components/tabs";
// import { Toaster } from "@bee"
import { Toaster } from "@beep/ui/components/toaster";
import { TooltipProvider } from "@beep/ui/components/tooltip";
import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as Hash from "effect/Hash";
import { ChartGanttIcon, SquareTerminalIcon } from "lucide-react";
import { Fragment, Suspense, useCallback } from "react";
import { importAtom } from "./atoms/import";
import { FileEditor } from "./components/file-editor";
import { FileExplorer } from "./components/file-explorer";
import { PlaygroundLoader } from "./components/loader";
import { Terminal } from "./components/terminal";
import { TraceViewer } from "./components/trace-viewer";
import { useWorkspaceHandle, useWorkspaceShells, WorkspaceProvider } from "./context/workspace";

export function CodeEditor() {
  return Result.builder(useAtomValue(importAtom))
    .onSuccess((workspace) => (
      <TooltipProvider>
        <PlaygroundLoader />
        <Suspense>
          <WorkspaceProvider workspace={workspace}>
            <CodeEditorPanels />
          </WorkspaceProvider>
        </Suspense>
        <Toaster />
      </TooltipProvider>
    ))
    .render();
}

function CodeEditorPanels() {
  const { terminalSize } = useWorkspaceHandle();
  const setSize = useAtomSet(terminalSize);
  const onResize = useCallback(
    (..._: any) => {
      setSize();
    },
    [setSize]
  );
  return (
    <ResizablePanelGroup>
      <ResizablePanel>
        <ResizablePanelGroup>
          <ResizablePanel defaultSize={20}>
            <FileExplorer />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <FileEditor />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={30} onResize={onResize}>
        <ResizablePanelGroup>
          <Tabs defaultValue="terminal" className="h-full w-full flex flex-col">
            <TabsList className="inline-flex items-center justify-start gap-2 p-0 bg-[--sl-color-bg] font-semibold border-b border-b-neutral-200 dark:border-b-neutral-700 rounded-none">
              <TabsTrigger
                value="terminal"
                className="h-full grid grid-cols-[16px_1fr] gap-1 py-0 px-2 bg-transparent text-[--sl-color-text] data-[state=active]:text-[--sl-color-white] data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-1px_0_var(--sl-color-white)] data-[state=active]:border-b-white rounded-none cursor-pointer transition-none"
              >
                <SquareTerminalIcon size={16} />
                <span>Terminal</span>
              </TabsTrigger>
              <TabsTrigger
                value="trace-viewer"
                className="h-full grid grid-cols-[16px_1fr] gap-1 py-0 px-2 bg-transparent text-[--sl-color-text] data-[state=active]:text-[--sl-color-white] data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-1px_0_var(--sl-color-white)] rounded-none cursor-pointer transition-none"
              >
                <ChartGanttIcon size={16} />
                <span>Trace Viewer</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="terminal"
              className="h-full w-full m-0 overflow-y-auto data-[state=inactive]:hidden"
              forceMount
            >
              <WorkspaceShells />
            </TabsContent>
            <TabsContent
              value="trace-viewer"
              className="h-full w-full m-0 overflow-y-auto data-[state=inactive]:hidden"
              forceMount
            >
              <TraceViewer />
            </TabsContent>
          </Tabs>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function WorkspaceShells() {
  const { terminalSize } = useWorkspaceHandle();
  const shells = useWorkspaceShells();
  const setSize = useAtomSet(terminalSize);
  const onResize = useCallback(
    (..._: any) => {
      setSize();
    },
    [setSize]
  );
  return (
    <Fragment>
      {shells.map((shell, index) => {
        const hash = Hash.hash(shell).toString();
        return (
          <Fragment key={hash}>
            {index > 0 && <ResizableHandle id={hash} />}
            <ResizablePanel id={hash} onResize={onResize} className="h-full">
              <Terminal shell={shell} />
            </ResizablePanel>
          </Fragment>
        );
      })}
    </Fragment>
  );
}
