import type { RefObject } from "@react-types/shared"
import { useCallback, useEffect, useLayoutEffect, useRef } from "react"

/**
 * Stabilizes a callback reference without needing it in dependency arrays.
 * This is the "useEffectEvent" pattern - the callback always has access to
 * the latest props/state but maintains a stable reference.
 */
function useEffectEvent<T extends (...args: unknown[]) => unknown>(fn: T): T {
	const ref = useRef<T>(fn)
	useLayoutEffect(() => {
		ref.current = fn
	}, [fn])
	return useCallback((...args: Parameters<T>) => ref.current(...args), []) as T
}

/**
 * Checks if the ResizeObserver API is supported.
 * @returns True if the ResizeObserver API is supported, false otherwise.
 */
function hasResizeObserver() {
	return typeof window.ResizeObserver !== "undefined"
}

/**
 * The options for the useResizeObserver hook.
 */
type useResizeObserverOptionsType<T> = {
	/**
	 * The ref to the element to observe.
	 */
	ref: RefObject<T | undefined | null> | undefined
	/**
	 * The box to observe.
	 */
	box?: ResizeObserverBoxOptions
	/**
	 * The callback function to call when the size changes.
	 */
	onResize: () => void
}

/**
 * A hook that observes the size of an element and calls a callback function when the size changes.
 * @param options - The options for the hook.
 */
export function useResizeObserver<T extends Element>(options: useResizeObserverOptionsType<T>) {
	const { ref, box, onResize } = options

	// Stabilize callback reference to prevent effect re-runs when callback changes
	const onResizeEvent = useEffectEvent(onResize)

	useEffect(() => {
		const element = ref?.current
		if (!element) {
			return
		}

		if (!hasResizeObserver()) {
			window.addEventListener("resize", onResizeEvent, { passive: true })

			return () => {
				window.removeEventListener("resize", onResizeEvent)
			}
		} else {
			const resizeObserverInstance = new window.ResizeObserver((entries) => {
				if (!entries.length) {
					return
				}

				onResizeEvent()
			})

			resizeObserverInstance.observe(element, { box })

			return () => {
				if (element) {
					resizeObserverInstance.unobserve(element)
				}
			}
		}
	}, [onResizeEvent, ref, box])
}
