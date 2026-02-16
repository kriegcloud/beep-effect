import type { RenderElementProps } from "slate-react"
import { cx } from "~/utils/cx"
import type { TableCellElement as TableCellElementType, TableElement as TableElementType } from "./types"

export interface TableElementProps extends RenderElementProps {
	element: TableElementType
}

export function TableElement({ attributes, children, element }: TableElementProps) {
	// Determine if there's a header row (first row with header cells)
	const hasHeader = element.children[0]?.children.some((cell) => (cell as TableCellElementType).header)

	return (
		<div {...attributes} className="my-2 overflow-x-auto">
			<table className="w-full border-collapse text-sm">
				{hasHeader ? (
					<>
						<thead className="bg-muted">{children[0]}</thead>
						<tbody>{children.slice(1)}</tbody>
					</>
				) : (
					<tbody>{children}</tbody>
				)}
			</table>
		</div>
	)
}

export interface TableRowElementProps extends RenderElementProps {}

export function TableRowElement({ attributes, children }: TableRowElementProps) {
	return <tr {...attributes}>{children}</tr>
}

export interface TableCellElementProps extends RenderElementProps {
	element: TableCellElementType
}

export function TableCellElement({ attributes, children, element }: TableCellElementProps) {
	const alignClass =
		element.align === "center" ? "text-center" : element.align === "right" ? "text-right" : "text-left"

	const cellClasses = cx("border border-border px-3 py-2", alignClass)

	if (element.header) {
		return (
			<th {...attributes} className={cx(cellClasses, "font-medium")}>
				{children}
			</th>
		)
	}

	return (
		<td {...attributes} className={cellClasses}>
			{children}
		</td>
	)
}
