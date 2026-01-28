"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import type { TableCellNode, TableDOMCell, TableMapType } from "@lexical/table";
import {
  $computeTableMapSkipCellCheck,
  $getTableNodeFromLexicalNodeOrThrow,
  $getTableRowIndexFromTableCellNode,
  $isTableCellNode,
  $isTableRowNode,
  getDOMCellFromTarget,
  getTableElement,
  TableNode,
} from "@lexical/table";
import { calculateZoomLevel, mergeRegister } from "@lexical/utils";
import type { LexicalEditor, NodeKey } from "lexical";
import { $getNearestNodeFromDOMNode, isHTMLElement, SKIP_SCROLL_INTO_VIEW_TAG } from "lexical";
import type { JSX } from "react";
import {
  type CSSProperties,
  type PointerEventHandler,
  type ReactPortal,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type PointerPosition = {
  readonly x: number;
  readonly y: number;
};

type PointerDraggingDirection = "right" | "bottom";

const MIN_ROW_HEIGHT = 33;
const MIN_COLUMN_WIDTH = 92;
const ACTIVE_RESIZER_COLOR = "#76b6ff";

function TableCellResizer({ editor }: { readonly editor: LexicalEditor }): JSX.Element {
  const targetRef = useRef<HTMLElement | null>(null);
  const resizerRef = useRef<HTMLDivElement | null>(null);
  const tableRectRef = useRef<ClientRect | null>(null);
  const [hasTable, setHasTable] = useState(false);

  const pointerStartPosRef = useRef<PointerPosition | null>(null);
  const [pointerCurrentPos, updatePointerCurrentPos] = useState<PointerPosition | null>(null);

  const [activeCell, updateActiveCell] = useState<TableDOMCell | null>(null);
  const [draggingDirection, updateDraggingDirection] = useState<PointerDraggingDirection | null>(null);
  const [hoveredDirection, updateHoveredDirection] = useState<PointerDraggingDirection | null>(null);

  const resetState = useCallback(() => {
    updateActiveCell(null);
    targetRef.current = null;
    updateDraggingDirection(null);
    updateHoveredDirection(null);
    pointerStartPosRef.current = null;
    tableRectRef.current = null;
  }, []);

  useEffect(() => {
    const tableKeys = new Set<NodeKey>();
    return mergeRegister(
      editor.registerMutationListener(TableNode, (nodeMutations) => {
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === "destroyed") {
            tableKeys.delete(nodeKey);
          } else {
            tableKeys.add(nodeKey);
          }
        }
        setHasTable(tableKeys.size > 0);
      }),
      editor.registerNodeTransform(TableNode, (tableNode) => {
        if (tableNode.getColWidths()) {
          return tableNode;
        }

        const numColumns = tableNode.getColumnCount();
        tableNode.setColWidths(Array(numColumns).fill(MIN_COLUMN_WIDTH));
        return tableNode;
      })
    );
  }, [editor]);

  useEffect(() => {
    if (!hasTable) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const target = event.target;
      if (!isHTMLElement(target)) {
        return;
      }

      if (draggingDirection) {
        event.preventDefault();
        event.stopPropagation();
        updatePointerCurrentPos({
          x: event.clientX,
          y: event.clientY,
        });
        return;
      }
      if (resizerRef.current?.contains(target)) {
        return;
      }

      if (targetRef.current !== target) {
        targetRef.current = target;
        const cell = getDOMCellFromTarget(target);

        if (cell && activeCell !== cell) {
          editor.getEditorState().read(
            () => {
              const tableCellNode = $getNearestNodeFromDOMNode(cell.elem);
              if (!tableCellNode) {
                return;
              }

              const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
              const tableElement = getTableElement(tableNode, editor.getElementByKey(tableNode.getKey()));

              if (!tableElement) {
                return;
              }

              targetRef.current = target;
              tableRectRef.current = tableElement.getBoundingClientRect();
              updateActiveCell(cell);
            },
            { editor }
          );
        } else if (cell == null) {
          resetState();
        }
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const isTouchEvent = event.pointerType === "touch";
      if (isTouchEvent) {
        onPointerMove(event);
      }
    };

    const resizerContainer = resizerRef.current;
    resizerContainer?.addEventListener("pointermove", onPointerMove, {
      capture: true,
    });

    const removeRootListener = editor.registerRootListener((rootElement, prevRootElement) => {
      prevRootElement?.removeEventListener("pointermove", onPointerMove);
      prevRootElement?.removeEventListener("pointerdown", onPointerDown);
      rootElement?.addEventListener("pointermove", onPointerMove);
      rootElement?.addEventListener("pointerdown", onPointerDown);
    });

    return () => {
      removeRootListener();
      resizerContainer?.removeEventListener("pointermove", onPointerMove);
    };
  }, [activeCell, draggingDirection, editor, resetState, hasTable]);

  const isHeightChanging = (direction: PointerDraggingDirection) => {
    if (direction === "bottom") {
      return true;
    }
    return false;
  };

  const updateRowHeight = useCallback(
    (heightChange: number) => {
      if (!activeCell) {
        return;
      }

      editor.update(
        () => {
          const tableCellNode = $getNearestNodeFromDOMNode(activeCell.elem);
          if (!$isTableCellNode(tableCellNode)) {
            return;
          }

          const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
          const baseRowIndex = $getTableRowIndexFromTableCellNode(tableCellNode);
          const tableRows = tableNode.getChildren();

          // Determine if this is a full row merge by checking colspan
          const isFullRowMerge = tableCellNode.getColSpan() === tableNode.getColumnCount();

          // For full row merges, apply to first row. For partial merges, apply to last row
          const tableRowIndex = isFullRowMerge ? baseRowIndex : baseRowIndex + tableCellNode.getRowSpan() - 1;

          if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
            return;
          }

          const tableRow = tableRows[tableRowIndex];

          if (!$isTableRowNode(tableRow)) {
            return;
          }

          let height = tableRow.getHeight();
          if (height === undefined) {
            const rowCells = tableRow.getChildren<TableCellNode>();
            height = Math.min(...rowCells.map((cell) => getCellNodeHeight(cell, editor) ?? Number.POSITIVE_INFINITY));
          }

          const newHeight = Math.max(height + heightChange, MIN_ROW_HEIGHT);
          tableRow.setHeight(newHeight);
        },
        { tag: SKIP_SCROLL_INTO_VIEW_TAG }
      );
    },
    [activeCell, editor]
  );

  const getCellNodeHeight = (cell: TableCellNode, activeEditor: LexicalEditor): number | undefined => {
    const domCellNode = activeEditor.getElementByKey(cell.getKey());
    return domCellNode?.clientHeight;
  };

  const getCellColumnIndex = (tableCellNode: TableCellNode, tableMap: TableMapType) => {
    for (let row = 0; row < tableMap.length; row++) {
      for (let column = 0; column < tableMap[row]!.length; column++) {
        if (tableMap[row]![column]!.cell === tableCellNode) {
          return column;
        }
      }
    }
  };

  const updateColumnWidth = useCallback(
    (widthChange: number) => {
      if (!activeCell) {
        return;
      }
      editor.update(
        () => {
          const tableCellNode = $getNearestNodeFromDOMNode(activeCell.elem);
          if (!$isTableCellNode(tableCellNode)) {
            return;
          }

          const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
          const [tableMap] = $computeTableMapSkipCellCheck(tableNode, null, null);
          const columnIndex = getCellColumnIndex(tableCellNode, tableMap);
          if (columnIndex === undefined) {
            return;
          }

          const colWidths = tableNode.getColWidths();
          if (!colWidths) {
            return;
          }
          const width = colWidths[columnIndex];
          if (width === undefined) {
            return;
          }
          const newColWidths = [...colWidths];
          const newWidth = Math.max(width + widthChange, MIN_COLUMN_WIDTH);
          newColWidths[columnIndex] = newWidth;
          tableNode.setColWidths(newColWidths);
        },
        { tag: SKIP_SCROLL_INTO_VIEW_TAG }
      );
    },
    [activeCell, editor]
  );

  const pointerUpHandler = useCallback(
    (direction: PointerDraggingDirection) => {
      const handler = (event: PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (!activeCell) {
          return;
        }

        if (pointerStartPosRef.current) {
          const { x, y } = pointerStartPosRef.current;

          if (activeCell === null) {
            return;
          }
          const targetElement = event.target instanceof Element ? event.target : activeCell.elem;
          const zoom = calculateZoomLevel(targetElement);

          if (isHeightChanging(direction)) {
            const heightChange = (event.clientY - y) / zoom;
            updateRowHeight(heightChange);
          } else {
            const widthChange = (event.clientX - x) / zoom;
            updateColumnWidth(widthChange);
          }

          resetState();
          document.removeEventListener("pointerup", handler);
        }
      };
      return handler;
    },
    [activeCell, resetState, updateColumnWidth, updateRowHeight]
  );

  const toggleResize = useCallback(
    (direction: PointerDraggingDirection): PointerEventHandler<HTMLDivElement> =>
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!activeCell) {
          return;
        }

        pointerStartPosRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
        updatePointerCurrentPos(pointerStartPosRef.current);
        updateDraggingDirection(direction);

        document.addEventListener("pointerup", pointerUpHandler(direction));
      },
    [activeCell, pointerUpHandler]
  );

  const getResizers = useCallback(() => {
    if (activeCell) {
      const { height, width, top, left } = activeCell.elem.getBoundingClientRect();
      const zoom = calculateZoomLevel(activeCell.elem);
      const zoneWidth = 16; // Pixel width of the zone where you can drag the edge
      const styles: Record<string, CSSProperties> = {
        bottom: {
          backgroundColor: "none",
          cursor: "row-resize",
          height: `${zoneWidth}px`,
          left: `${window.scrollX + left}px`,
          top: `${window.scrollY + top + height - zoneWidth / 2}px`,
          width: `${width}px`,
        },
        right: {
          backgroundColor: "none",
          cursor: "col-resize",
          height: `${height}px`,
          left: `${window.scrollX + left + width - zoneWidth / 2}px`,
          top: `${window.scrollY + top}px`,
          width: `${zoneWidth}px`,
        },
      };

      const tableRect = tableRectRef.current;

      if (draggingDirection && pointerCurrentPos && tableRect) {
        if (isHeightChanging(draggingDirection)) {
          styles[draggingDirection]!.left = `${window.scrollX + tableRect.left}px`;
          styles[draggingDirection]!.top = `${window.scrollY + pointerCurrentPos.y / zoom}px`;
          styles[draggingDirection]!.height = "3px";
          styles[draggingDirection]!.width = `${tableRect.width}px`;
        } else {
          styles[draggingDirection]!.top = `${window.scrollY + tableRect.top}px`;
          styles[draggingDirection]!.left = `${window.scrollX + pointerCurrentPos.x / zoom}px`;
          styles[draggingDirection]!.width = "3px";
          styles[draggingDirection]!.height = `${tableRect.height}px`;
        }

        styles[draggingDirection]!.backgroundColor = "#adf";
        styles[draggingDirection]!.mixBlendMode = "unset";
      } else if (!draggingDirection && hoveredDirection === "right") {
        const halfZoneWidth = zoneWidth / 2;
        const highlightWidth = 2;
        const highlightStart = halfZoneWidth - highlightWidth / 2;
        styles.right!.background = `linear-gradient(90deg, transparent ${highlightStart}px, ${ACTIVE_RESIZER_COLOR} ${highlightStart}px, ${ACTIVE_RESIZER_COLOR} ${
          highlightStart + highlightWidth
        }px, transparent ${highlightStart + highlightWidth}px)`;
        styles.right!.mixBlendMode = "unset";
        if (tableRect) {
          styles.right!.top = `${window.scrollY + tableRect.top}px`;
          styles.right!.height = `${tableRect.height}px`;
        }
      }

      return styles;
    }

    return {
      bottom: null,
      left: null,
      right: null,
      top: null,
    };
  }, [activeCell, draggingDirection, hoveredDirection, pointerCurrentPos]);

  const handlePointerEnter = useCallback(
    (direction: PointerDraggingDirection): PointerEventHandler<HTMLDivElement> =>
      () => {
        if (!draggingDirection) {
          updateHoveredDirection(direction);
        }
      },
    [draggingDirection]
  );

  const handlePointerLeave = useCallback(() => {
    if (!draggingDirection) {
      updateHoveredDirection(null);
    }
  }, [draggingDirection]);

  const resizerStyles = getResizers();

  return (
    <div ref={resizerRef}>
      {activeCell != null && (
        <>
          <div
            className="absolute touch-none pointer-coarse:bg-[#adf] pointer-coarse:mix-blend-color"
            style={resizerStyles.right || undefined}
            onPointerEnter={handlePointerEnter("right")}
            onPointerLeave={handlePointerLeave}
            onPointerDown={toggleResize("right")}
          />
          <div
            className="absolute touch-none pointer-coarse:bg-[#adf] pointer-coarse:mix-blend-color"
            style={resizerStyles.bottom || undefined}
            onPointerDown={toggleResize("bottom")}
          />
        </>
      )}
    </div>
  );
}

export default function TableCellResizerPlugin(): null | ReactPortal {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();

  return useMemo(
    () => (isEditable ? createPortal(<TableCellResizer editor={editor} />, document.body) : null),
    [editor, isEditable]
  );
}
