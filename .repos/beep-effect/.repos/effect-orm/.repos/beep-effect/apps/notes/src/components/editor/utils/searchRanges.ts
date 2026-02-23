import { type EditorNodesOptions, NodeApi, type Path, type Point, type TElement, TextApi, type TRange } from "platejs";
import type { PlateEditor } from "platejs/react";

import { traverseTextNodes } from "./traverseTextNodes";

export const searchRange = (
  editor: PlateEditor,
  search: string | [string, string],
  {
    match,
    // from,
  }: {
    readonly from?: Point;
    readonly match?: EditorNodesOptions["match"];
  } = {}
): TRange | null => {
  if (Array.isArray(search) ? search[0].length === 0 || search[1].length === 0 : search.length === 0) return null;

  const [startSearch, endSearch] = Array.isArray(search)
    ? (search.map((s) => s.toLowerCase()) as [string, string])
    : ([search.toLowerCase(), ""] as [string, string]);

  const entries = Array.from(
    editor.api.nodes<TElement>({
      at: [],
      match:
        match ??
        ((_, p) => {
          return p.length === 1;
        }),
    })
  );

  for (const [node, path] of entries) {
    // if (from && Path.isBefore(path, from.path)) continue

    const combinedText = NodeApi.string(node).toLowerCase();

    let searchIndex = combinedText.indexOf(startSearch);

    while (searchIndex !== -1) {
      // if (from && Path.equals(path, from.path) && searchIndex < from.offset) {
      //   searchIndex = combinedText.indexOf(startSearch, searchIndex + 1)
      //   continue
      // }

      let globalOffset = 0;
      let anchorOffset: number | undefined;
      let endPath: Path | undefined;
      let focusOffset: number | undefined;
      let startPath: Path | undefined;

      traverseTextNodes(
        node.children,
        (childNode, childPath) => {
          if (editor.api.isVoid(childNode as TElement)) return undefined;

          const textLength = (TextApi.isText(childNode) ? childNode.text.length : 0) || 0;
          const newGlobalOffset = globalOffset + textLength;

          if (startPath === undefined && newGlobalOffset > searchIndex) {
            startPath = childPath;
            anchorOffset = searchIndex - globalOffset;
          }
          if (startPath !== undefined && newGlobalOffset >= searchIndex + startSearch.length) {
            const endSearchIndex = combinedText.indexOf(endSearch, searchIndex + startSearch.length);

            if (endSearchIndex !== -1) {
              endPath = childPath;
              focusOffset = endSearchIndex - globalOffset + endSearch.length;

              return true; // Found the complete range, stop traversing
            }
          }

          globalOffset = newGlobalOffset;
          return undefined;
        },
        path
      );

      if (startPath && endPath) {
        return {
          anchor: { offset: anchorOffset!, path: startPath },
          focus: { offset: focusOffset!, path: endPath },
        };
      }

      searchIndex = combinedText.indexOf(startSearch, searchIndex + 1);
    }
  }

  return null;
};

export const searchRanges = (
  editor: PlateEditor,
  search: string | [string, string],
  {
    match,
  }: {
    readonly match?: EditorNodesOptions["match"];
  } = {}
) => {
  const ranges: TRange[] = [];

  if (search.length === 0) return ranges;

  const [startSearch, endSearch] = Array.isArray(search)
    ? (search.map((s) => s.toLowerCase()) as [string, string])
    : ([search.toLowerCase(), ""] as [string, string]);

  const entries = Array.from(
    editor.api.nodes<TElement>({
      at: [],
      match:
        match ??
        ((_, p) => {
          return p.length === 1;
        }),
    })
  );

  for (const [node, path] of entries) {
    const combinedText = NodeApi.string(node).toLowerCase();

    let searchIndex = combinedText.indexOf(startSearch);

    while (searchIndex !== -1) {
      let globalOffset = 0;
      let anchorOffset: number | undefined;
      let endPath: Path | undefined;
      let focusOffset: number | undefined;
      let startPath: Path | undefined;

      traverseTextNodes(
        node.children,
        (childNode, childPath) => {
          if (editor.api.isVoid(childNode as TElement)) return undefined;

          const textLength = (TextApi.isText(childNode) ? childNode.text.length : 0) || 0;
          const newGlobalOffset = globalOffset + textLength;

          if (startPath === undefined && newGlobalOffset > searchIndex) {
            startPath = childPath;
            anchorOffset = searchIndex - globalOffset;
          }
          if (startPath !== undefined && newGlobalOffset >= searchIndex + startSearch.length) {
            const endSearchIndex = combinedText.indexOf(endSearch, searchIndex + startSearch.length);

            if (endSearchIndex !== -1) {
              endPath = childPath;
              focusOffset = endSearchIndex - globalOffset + endSearch.length;

              return true; // Found the complete range, stop traversing
            }
          }

          globalOffset = newGlobalOffset;
          return undefined;
        },
        path
      );

      if (startPath && endPath) {
        ranges.push({
          anchor: { offset: anchorOffset!, path: startPath },
          focus: { offset: focusOffset!, path: endPath },
        });
      }

      searchIndex = combinedText.indexOf(startSearch, searchIndex + 1);
    }
  }

  return ranges;
};
