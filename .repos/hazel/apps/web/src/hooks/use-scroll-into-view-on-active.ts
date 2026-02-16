import { useParams } from "@tanstack/react-router"
import { useCallback } from "react"

/**
 * Returns a ref callback that scrolls the element into view when it's active.
 * Uses route params to determine if the item is currently active.
 *
 * @param itemId - The ID of the item to check against the route param
 * @returns A ref callback to attach to the element
 */
export function useScrollIntoViewOnActive(itemId: string) {
	const params = useParams({ strict: false }) as { id?: string }
	const isActive = params.id === itemId

	const scrollRef = useCallback(
		(el: HTMLElement | null) => {
			if (el && isActive) {
				el.scrollIntoView({ block: "nearest", behavior: "instant" })
			}
		},
		[isActive],
	)

	return scrollRef
}
