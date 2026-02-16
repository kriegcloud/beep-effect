import { useCallback, useSyncExternalStore } from "react"

export const useMediaQuery = (query: string) => {
	const subscribe = useCallback(
		(callback: () => void) => {
			const result = matchMedia(query)
			result.addEventListener("change", callback)
			return () => result.removeEventListener("change", callback)
		},
		[query],
	)

	const getSnapshot = useCallback(() => matchMedia(query).matches, [query])

	return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
