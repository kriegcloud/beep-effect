import { Array } from "effect";
import { useCallback, useMemo, useState } from "react";
import type { Directory, FileTree } from "../../domain/workspace";
import { FileInput } from "./file-input";
import { FileNode } from "./file-node";
import { useCreate, useExplorerState } from "./state";

export function DirectoryNode({
  depth,
  node,
  path,
}: {
  readonly node: Directory;
  readonly depth: number;
  readonly path: string;
}) {
  const [open, setOpen] = useState(true);
  const state = useExplorerState();
  const create = useCreate();
  const isCreating = state._tag === "Creating" && state.parent === node;

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <>
      <FileNode type="directory" node={node} depth={depth} path={path} isOpen={open} onClick={handleToggle} />
      {open && (
        <>
          {isCreating && state.type === "Directory" && (
            <FileInput type={state.type} depth={depth + 1} onSubmit={(name) => create(node, name, "Directory")} />
          )}
          <DirectoryChildren tree={node.children} depth={depth + 1} path={path} />
          {isCreating && state.type === "File" && (
            <FileInput type={state.type} depth={depth + 1} onSubmit={(name) => create(node, name, "File")} />
          )}
        </>
      )}
    </>
  );
}

/**
 * Renders directory children inline to avoid circular dependency with FileTree.
 * This is an internal component that handles the recursive rendering.
 */
function DirectoryChildren({
  tree,
  depth,
  path,
}: {
  readonly tree: FileTree;
  readonly depth: number;
  readonly path: string;
}) {
  const [files, directories] = useMemo(() => Array.partition(tree, (_) => _._tag === "Directory"), [tree]);

  return (
    <>
      {directories.map((node) => {
        const fullPath = `${path}/${node.name}`;
        return <DirectoryNode key={fullPath} node={node} depth={depth} path={fullPath} />;
      })}
      {files.map((node) => {
        const fullPath = `${path}/${node.name}`;
        return <FileNode key={fullPath} type="file" node={node} depth={depth} path={fullPath} />;
      })}
    </>
  );
}
