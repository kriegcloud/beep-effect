import type { RenderElementProps } from "slate-react"
import { cx } from "~/utils/cx"
import type { HeadingElement as HeadingElementType } from "./types"

export interface HeadingElementProps extends RenderElementProps {
	element: HeadingElementType
}

export function HeadingElement({ attributes, children, element }: HeadingElementProps) {
	const baseClasses = "font-semibold tracking-tight"

	switch (element.level) {
		case 1:
			return (
				<h1 {...attributes} className={cx(baseClasses, "mt-4 mb-2 text-2xl first:mt-0")}>
					{children}
				</h1>
			)
		case 2:
			return (
				<h2 {...attributes} className={cx(baseClasses, "mt-3 mb-1.5 text-xl first:mt-0")}>
					{children}
				</h2>
			)
		case 3:
			return (
				<h3 {...attributes} className={cx(baseClasses, "mt-2 mb-1 text-lg first:mt-0")}>
					{children}
				</h3>
			)
		default:
			return (
				<h3 {...attributes} className={cx(baseClasses, "mt-2 mb-1 text-lg first:mt-0")}>
					{children}
				</h3>
			)
	}
}
