"use client"

import { type ReactNode, memo, useCallback, useEffect, useRef } from "react"
import { cx } from "~/utils/cx"
import type { AutocompleteOption } from "./types"

interface AutocompleteListBoxProps<T> {
	/** Items to display */
	items: AutocompleteOption<T>[]
	/** Currently active/focused index */
	activeIndex: number
	/** Callback when an item is selected (clicked) */
	onSelect: (index: number) => void
	/** Callback when mouse hovers over an item */
	onHover: (index: number) => void
	/** Custom render function for items */
	renderItem?: (props: { option: AutocompleteOption<T>; isFocused: boolean }) => ReactNode
	/** Message to show when no options */
	emptyMessage?: string
	/** Additional class names */
	className?: string
}

/**
 * Autocomplete listbox using simple index-based focus.
 *
 * This component renders the list items as plain divs with styling
 * based on whether `index === activeIndex`.
 *
 * Features:
 * - Focus stays in Slate editor (no hidden inputs)
 * - Simple index-based highlighting
 * - Hover to change active index
 * - Auto-scroll active items into view
 * - Click to select
 */
export function AutocompleteListBox<T>({
	items,
	activeIndex,
	onSelect,
	onHover,
	renderItem,
	emptyMessage = "No results found",
	className,
}: AutocompleteListBoxProps<T>) {
	if (items.length === 0) {
		return <div className="p-4 text-center text-muted-fg text-sm">{emptyMessage}</div>
	}

	return (
		<div className={cx("p-2 outline-none", className)}>
			{items.map((item, index) => (
				<Option
					key={item.id}
					item={item}
					index={index}
					isActive={index === activeIndex}
					onSelect={onSelect}
					onHover={onHover}
					renderItem={renderItem}
				/>
			))}
		</div>
	)
}

interface OptionProps<T> {
	item: AutocompleteOption<T>
	index: number
	isActive: boolean
	onSelect: (index: number) => void
	onHover: (index: number) => void
	renderItem?: (props: { option: AutocompleteOption<T>; isFocused: boolean }) => ReactNode
}

// Memoized Option component to prevent unnecessary re-renders
// When the list has many items, this prevents all items from re-rendering
// when only the active index changes
const Option = memo(function Option<T>({
	item,
	index,
	isActive,
	onSelect,
	onHover,
	renderItem,
}: OptionProps<T>) {
	const ref = useRef<HTMLDivElement>(null)

	// Scroll active item into view
	useEffect(() => {
		if (isActive && ref.current) {
			ref.current.scrollIntoView({ block: "nearest" })
		}
	}, [isActive])

	// Stable click handler
	const handleClick = useCallback(() => {
		onSelect(index)
	}, [onSelect, index])

	// Stable keydown handler
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault()
				onSelect(index)
			}
		},
		[onSelect, index],
	)

	// Stable hover handler
	const handleMouseEnter = useCallback(() => {
		onHover(index)
	}, [onHover, index])

	return (
		<div
			ref={ref}
			role="option"
			aria-selected={isActive}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			onMouseEnter={handleMouseEnter}
			className={cx(
				"flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm",
				"outline-none transition-colors",
				isActive && "bg-primary/10 text-primary",
				!isActive && "hover:bg-muted",
			)}
		>
			{renderItem ? (
				renderItem({ option: item, isFocused: isActive })
			) : (
				<DefaultItemContent option={item} />
			)}
		</div>
	)
}) as <T>(props: OptionProps<T>) => ReactNode

/**
 * Default item content renderer
 */
function DefaultItemContent<T>({ option }: { option: AutocompleteOption<T> }) {
	return (
		<>
			{option.icon && <span className="shrink-0">{option.icon}</span>}
			<div className="min-w-0 flex-1">
				<div className="truncate font-medium">{option.label}</div>
				{option.description && (
					<div className="truncate text-xs opacity-70">{option.description}</div>
				)}
			</div>
		</>
	)
}
