import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as Data from "effect/Data";
import { useCallback } from "react";
import { useWorkspaceHandle } from "../../context/workspace";
import type { Directory, File, Workspace } from "../../domain/workspace";

export declare namespace FileExplorerState {
  export type State = Data.TaggedEnum<{
    Idle: {};
    Creating: {
      parent: Directory;
      type: Workspace.FileType;
    };
    Editing: {
      node: Directory | File;
    };
  }>;
}

export const State = Data.taggedEnum<FileExplorerState.State>();
export const stateAtom = Atom.make<FileExplorerState.State>(State.Idle());

export const useExplorerState = () => useAtomValue(stateAtom);
export const useExplorerDispatch = () => useAtomSet(stateAtom);

export const useCreate = () => {
  const handle = useWorkspaceHandle();
  const create = useAtomSet(handle.createFile);
  const dispatch = useExplorerDispatch();
  return useCallback(
    (parent: Directory, name: string, type: Workspace.FileType) => {
      create([name, type, { parent }]);
      dispatch(State.Idle());
    },
    [create, dispatch]
  );
};

export const useRename = () => {
  const handle = useWorkspaceHandle();
  const rename = useAtomSet(handle.renameFile);
  const dispatch = useExplorerDispatch();
  return useCallback(
    (node: File | Directory, name: string) => {
      rename([node, name]);
      dispatch(State.Idle());
    },
    [rename, dispatch]
  );
};

export const useRemove = () => {
  const handle = useWorkspaceHandle();
  const remove = useAtomSet(handle.removeFile);
  const dispatch = useExplorerDispatch();
  return useCallback(
    (node: File | Directory) => {
      remove(node);
      dispatch(State.Idle());
    },
    [remove, dispatch]
  );
};
