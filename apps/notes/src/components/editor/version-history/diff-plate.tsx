import { EditorKit } from "@beep/notes/components/editor/editor-kit-app";

import { computeDiff } from "@platejs/diff";
import { NodeApi, type Value } from "platejs";
import { createPlateEditor, Plate, usePlateEditor } from "platejs/react";
import { memo, useMemo, useState } from "react";
import { useObjectVersion } from "@/hooks/useObjectVersion";
import { BaseEditorKit } from "@/registry/components/editor/editor-base-kit";
import { Editor } from "@/registry/ui/editor";

import { useResetEditorOnChange } from "../utils";
import { ChunkPlugin } from "./chunk-plugin";
import { collapseBlocksWithoutDiff } from "./collapseBlocksWithoutDiff";
import { DiffPlugin, hasDiff, textsAreComparable } from "./diff-plugin";

// Workaround to ignore ids in the diff
const removeIds = (nodes: any[]): any[] => {
  return nodes.map((node) => {
    const { id, ...rest } = node;

    if (rest.children) {
      rest.children = removeIds(rest.children);
    }

    return rest;
  });
};

export interface DiffViewerProps {
  current: Value;
  previous: Value | null;
  showDiff?: boolean;
}

export const DiffPlate = memo(({ current = [], previous = [], showDiff }: DiffViewerProps) => {
  const diffValue = useMemo(() => {
    if (!previous) return current;

    const tempEditor = createPlateEditor({
      plugins: [...BaseEditorKit, DiffPlugin],
    });

    const diff = computeDiff(removeIds(previous), removeIds(current), {
      ignoreProps: ["id"],
      isInline: tempEditor.api.isInline,
      lineBreakChar: "¶",
      elementsAreRelated: (element, nextElement) =>
        textsAreComparable(NodeApi.string(element), NodeApi.string(nextElement)),
    });

    return diff as Value;
  }, [previous, current]);

  const [expandedChunks, setExpandedChunks] = useState<number[]>([]);

  const collapsedDiffValue = useMemo(
    () =>
      collapseBlocksWithoutDiff(diffValue, {
        expandedChunks,
      }) as Value,
    [diffValue, expandedChunks]
  );

  const value = showDiff ? collapsedDiffValue : current;
  const key = useObjectVersion(value);

  const hasChangedBlocks = useMemo(() => diffValue.some(hasDiff), [diffValue]);

  const emptyDiff = showDiff && !hasChangedBlocks;

  const editor = usePlateEditor(
    {
      plugins: [...EditorKit, DiffPlugin, ChunkPlugin.configure({ options: { setExpandedChunks } })],
      readOnly: true,
      value,
    },
    [key]
  );

  useResetEditorOnChange(
    {
      editor: editor,
      value: collapsedDiffValue as any,
    },
    [key]
  );

  if (emptyDiff) {
    return (
      <div className="rounded-lg py-3 text-left text-muted-foreground select-none">
        No changes since the previous snapshot
      </div>
    );
  }

  return (
    <Plate readOnly editor={editor}>
      <Editor variant="update" className="pt-2 pb-3" autoFocus />
    </Plate>
  );
});
