import { useWorkspaceTree } from "../context/workspace";
import { FileTree } from "./file-explorer/file-tree";

// Re-export state management for backwards compatibility
export {
  type FileExplorerState,
  State,
  stateAtom,
  useCreate,
  useExplorerDispatch,
  useExplorerState,
  useRemove,
  useRename,
} from "./file-explorer/state";

export function FileExplorer() {
  const tree = useWorkspaceTree();
  return (
    <aside className="min-h-full w-full overflow-auto bg-[var(--sl-color-bg-sidebar)]">
      <FileTree tree={tree} />
    </aside>
  );
}
