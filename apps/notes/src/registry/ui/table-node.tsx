"use client";

import { cn } from "@beep/notes/lib/utils";
import { blockSelectionVariants } from "@beep/notes/registry/ui/block-selection";
import { ResizeHandle } from "@platejs/resizable";
import { useBlockSelected } from "@platejs/selection/react";
import {
  TablePlugin,
  TableProvider,
  useTableCellElement,
  useTableCellElementResizable,
  useTableElement,
} from "@platejs/table/react";
import { cva } from "class-variance-authority";
import { PlusIcon } from "lucide-react";
import { KEYS, type TTableCellElement } from "platejs";
import {
  PlateElement,
  type PlateElementProps,
  useEditorPlugin,
  useElementSelector,
  useReadOnly,
  useSelected,
  withHOC,
} from "platejs/react";
import type * as React from "react";

import { Button } from "./button";

export const TableElement = withHOC(TableProvider, function TableElement(props: PlateElementProps) {
  const { editor, element } = props;
  const { tf } = useEditorPlugin(TablePlugin);
  const readOnly = useReadOnly();
  const { isSelectingCell, marginLeft, props: tableProps } = useTableElement();

  const isSelectingTable = useBlockSelected(props.element.id as string);

  return (
    <PlateElement {...props} className="overflow-x-auto py-5" style={{ paddingLeft: marginLeft }}>
      <div className="group/table relative w-fit">
        <table
          className={cn(
            "mr-0 ml-px table h-px table-fixed border-collapse",
            isSelectingCell && "selection:bg-transparent"
          )}
          {...tableProps}
        >
          <tbody className="min-w-full">{props.children}</tbody>
        </table>

        {!readOnly && (
          <>
            <div
              className={cn(
                "absolute inset-x-0 bottom-[-18px] flex flex-row opacity-0 transition-opacity hover:opacity-100",
                "group-has-[tr:last-child:hover]/table:opacity-100 max-sm:group-has-[tr[data-selected]:last-child]/table:opacity-100"
              )}
            >
              <Button
                size="none"
                variant="ghost"
                className="flex h-4 w-full grow items-center justify-center bg-muted"
                onClick={() => tf.insert.tableRow({ at: editor.api.findPath(element) })}
                onMouseDown={(e) => e.preventDefault()}
                tooltip="Add a new row"
                tooltipContentProps={{ side: "bottom" }}
              >
                <PlusIcon className="!size-3.5 text-muted-foreground" />
              </Button>
            </div>

            <div
              className={cn(
                "absolute inset-y-0 right-[-18px] flex opacity-0 transition-opacity hover:opacity-100",
                "group-has-[td:last-child:hover,th:last-child:hover]/table:opacity-100 max-sm:group-has-[td[data-selected]:last-child,th[data-selected]:last-child]/table:opacity-100"
              )}
            >
              <Button
                size="none"
                variant="ghost"
                className="flex h-full w-4 grow items-center justify-center bg-muted"
                onClick={() =>
                  tf.insert.tableColumn({
                    at: editor.api.findPath(element),
                  })
                }
                onMouseDown={(e) => e.preventDefault()}
                tooltip="Add a new column"
                tooltipContentProps={{ side: "bottom" }}
              >
                <PlusIcon className="!size-3.5 text-muted-foreground" />
              </Button>
            </div>

            <div
              className={cn(
                "absolute right-[-18px] bottom-[-18px] flex flex-row opacity-0 transition-opacity hover:opacity-100",
                "group-has-[td:last-child:hover,th:last-child:hover]/table:group-has-[tr:last-child:hover]/table:opacity-100 max-sm:group-has-[td[data-selected]:last-child,th[data-selected]:last-child]/table:group-has-[tr[data-selected]:last-child]/table:opacity-100"
              )}
            >
              <Button
                size="none"
                variant="ghost"
                className="flex size-4 items-center justify-center rounded-full bg-muted"
                onClick={() => {
                  editor.tf.withoutNormalizing(() => {
                    tf.insert.tableRow({ at: editor.api.findPath(element) });
                    tf.insert.tableColumn({
                      at: editor.api.findPath(element),
                    });
                  });
                }}
                onMouseDown={(e) => e.preventDefault()}
                tooltip="Add a new row and column"
                tooltipContentProps={{ side: "bottom" }}
              >
                <PlusIcon className="!size-3.5 text-muted-foreground" />
              </Button>
            </div>
          </>
        )}

        {isSelectingTable && <div className={blockSelectionVariants()} contentEditable={false} />}
      </div>
    </PlateElement>
  );
});

export function TableRowElement(props: PlateElementProps) {
  const selected = useSelected();

  return <PlateElement {...props} as="tr" className="h-full" data-selected={selected ? "true" : undefined} />;
}

export function TableCellElement({
  isHeader,
  ...props
}: PlateElementProps<TTableCellElement> & {
  isHeader?: boolean;
}) {
  const { api } = useEditorPlugin(TablePlugin);
  const readOnly = useReadOnly();
  const element = props.element;

  const rowId = useElementSelector(([node]) => node.id as string, [], {
    key: KEYS.tr,
  });
  const isSelectingRow = useBlockSelected(rowId);

  const { borders, colIndex, colSpan, isSelectingCell, minHeight, rowIndex, selected, width } = useTableCellElement();

  const { bottomProps, hiddenLeft, leftProps, rightProps } = useTableCellElementResizable({
    colIndex,
    colSpan,
    rowIndex,
  });

  return (
    <PlateElement
      {...props}
      as={isHeader ? "th" : "td"}
      className={cn(
        "h-full overflow-visible border-none bg-background p-0",
        element.background ? "bg-(--cellBackground)" : "bg-background",
        isHeader && "text-left *:m-0",
        "before:size-full",
        selected && "before:z-10 before:bg-muted",
        "before:absolute before:box-border before:content-[''] before:select-none",
        borders.bottom?.size && `before:border-b before:border-b-border`,
        borders.right?.size && `before:border-r before:border-r-border`,
        borders.left?.size && `before:border-l before:border-l-border`,
        borders.top?.size && `before:border-t before:border-t-border`
      )}
      style={
        {
          "--cellBackground": element.background,
          maxWidth: width || 240,
          minWidth: width || 120,
        } as React.CSSProperties
      }
      attributes={{
        ...props.attributes,
        colSpan: api.table.getColSpan(element),
        rowSpan: api.table.getRowSpan(element),
      }}
    >
      <div className="relative z-20 box-border h-full px-4 py-2" style={{ minHeight }}>
        {props.children}
      </div>

      {!isSelectingCell && (
        <div
          className="group absolute top-0 size-full select-none"
          contentEditable={false}
          suppressContentEditableWarning={true}
        >
          {!readOnly && (
            <>
              <ResizeHandle {...rightProps} className="-top-2 -right-1 h-[calc(100%_+_8px)] w-2" data-col={colIndex} />
              <ResizeHandle {...bottomProps} className="-bottom-1 h-2" />
              {!hiddenLeft && (
                <ResizeHandle
                  {...leftProps}
                  className="top-0 -left-1 w-2"
                  data-resizer-left={colIndex === 0 ? "true" : undefined}
                />
              )}

              <div
                className={cn(
                  "absolute top-0 z-30 hidden h-full w-1 bg-ring",
                  "right-[-1.5px]",
                  columnResizeVariants({ colIndex: colIndex as any })
                )}
              />
              {colIndex === 0 && (
                <div
                  className={cn(
                    "absolute top-0 z-30 h-full w-1 bg-ring",
                    "left-[-1.5px]",
                    'hidden animate-in fade-in group-has-[[data-resizer-left]:hover]/table:block group-has-[[data-resizer-left][data-resizing="true"]]/table:block'
                  )}
                />
              )}
            </>
          )}
        </div>
      )}

      {isSelectingRow && <div className={blockSelectionVariants()} contentEditable={false} />}
    </PlateElement>
  );
}

export function TableCellHeaderElement(props: React.ComponentProps<typeof TableCellElement>) {
  return <TableCellElement {...props} isHeader />;
}

const columnResizeVariants = cva("hidden animate-in fade-in", {
  variants: {
    colIndex: {
      0: 'group-has-[[data-col="0"]:hover]/table:block group-has-[[data-col="0"][data-resizing="true"]]/table:block',
      1: 'group-has-[[data-col="1"]:hover]/table:block group-has-[[data-col="1"][data-resizing="true"]]/table:block',
      2: 'group-has-[[data-col="2"]:hover]/table:block group-has-[[data-col="2"][data-resizing="true"]]/table:block',
      3: 'group-has-[[data-col="3"]:hover]/table:block group-has-[[data-col="3"][data-resizing="true"]]/table:block',
      4: 'group-has-[[data-col="4"]:hover]/table:block group-has-[[data-col="4"][data-resizing="true"]]/table:block',
      5: 'group-has-[[data-col="5"]:hover]/table:block group-has-[[data-col="5"][data-resizing="true"]]/table:block',
      6: 'group-has-[[data-col="6"]:hover]/table:block group-has-[[data-col="6"][data-resizing="true"]]/table:block',
      7: 'group-has-[[data-col="7"]:hover]/table:block group-has-[[data-col="7"][data-resizing="true"]]/table:block',
      8: 'group-has-[[data-col="8"]:hover]/table:block group-has-[[data-col="8"][data-resizing="true"]]/table:block',
      9: 'group-has-[[data-col="9"]:hover]/table:block group-has-[[data-col="9"][data-resizing="true"]]/table:block',
      10: 'group-has-[[data-col="10"]:hover]/table:block group-has-[[data-col="10"][data-resizing="true"]]/table:block',
    },
  },
});
