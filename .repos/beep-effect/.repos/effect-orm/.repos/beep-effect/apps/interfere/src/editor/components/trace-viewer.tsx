import { useAtomMount } from "@effect-atom/atom-react";
import { devToolsAtom } from "../atoms/devtools";
import { TraceSelector } from "./trace-viewer/trace-selector";
import { TraceSummary } from "./trace-viewer/trace-summary";
import { TraceWaterfall } from "./trace-viewer/trace-waterfall";

export function TraceViewer() {
  useAtomMount(devToolsAtom);

  return (
    <div className="h-full flex flex-col w-full p-2 bg-[--sl-color-bg-nav]">
      <div className="flex justify-between items-center">
        <div className="min-w-1/2 flex items-center shrink">
          <h1 className="mr-3 !text-3xl">Trace</h1>
          <div>
            <TraceSelector />
          </div>
        </div>
      </div>
      <TraceSummary />
      <TraceWaterfall />
    </div>
  );
}
