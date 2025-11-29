import { cn } from "@beep/notes/lib/utils";
import { BaseTablePlugin } from "@platejs/table";
import type { TTableCellElement, TTableElement } from "platejs";
import { SlateElement, type SlateElementProps } from "platejs/static";
import type * as React from "react";

export function TableElementStatic(props: SlateElementProps<TTableElement>) {
  const { disableMarginLeft } = props.editor.getOptions(BaseTablePlugin);
  const marginLeft = disableMarginLeft ? 0 : props.element.marginLeft;

  return (
    <SlateElement {...props} className="overflow-x-auto py-5" style={{ paddingLeft: marginLeft }}>
      <div className="group/table relative w-fit">
        <table className="mr-0 ml-px table h-px table-fixed border-collapse">
          <tbody className="min-w-full">{props.children}</tbody>
        </table>
      </div>
    </SlateElement>
  );
}

export function TableRowElementStatic(props: SlateElementProps) {
  return <SlateElement {...props} as="tr" className="h-full" />;
}

export function TableCellElementStatic({
  isHeader,
  ...props
}: SlateElementProps<TTableCellElement> & {
  isHeader?: boolean;
}) {
  const { editor, element } = props;
  const { api } = editor.getPlugin(BaseTablePlugin);

  const { minHeight, width } = api.table.getCellSize({ element });
  const borders = api.table.getCellBorders({ element });

  return (
    <SlateElement
      {...props}
      as={isHeader ? "th" : "td"}
      className={cn(
        "h-full overflow-visible border-none bg-background p-0",
        element.background ? "bg-(--cellBackground)" : "bg-background",
        isHeader && "text-left font-normal *:m-0",
        "before:size-full",
        "before:absolute before:box-border before:content-[''] before:select-none",
        "before:border before:border-border",
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
    </SlateElement>
  );
}

export function TableCellHeaderElementStatic(props: SlateElementProps) {
  return <TableCellElementStatic {...props} isHeader />;
}
