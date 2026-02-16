import type { UseEmblaCarouselType } from "embla-carousel-react"
import { useCallback, useEffect, useState } from "react"

// Extract the API type from the useEmblaCarousel return type
type EmblaCarouselApi = UseEmblaCarouselType[1]

export interface UseEmblaCarouselSyncOptions {
	/**
	 * Main carousel API instance
	 */
	mainApi: EmblaCarouselApi | undefined
	/**
	 * Thumbnail carousel API instance to sync with main
	 */
	thumbsApi?: EmblaCarouselApi | undefined
	/**
	 * Initial index to scroll to
	 */
	initialIndex?: number
	/**
	 * Whether to reset to initial index (useful when opening modals)
	 */
	shouldReset?: boolean
}

export interface UseEmblaCarouselSyncResult {
	/**
	 * Current selected index
	 */
	selectedIndex: number
	/**
	 * Scroll to previous slide
	 */
	scrollPrev: () => void
	/**
	 * Scroll to next slide
	 */
	scrollNext: () => void
	/**
	 * Scroll to specific index
	 */
	scrollTo: (index: number) => void
}

/**
 * Hook that manages Embla carousel state and synchronization between main and thumbnail carousels
 *
 * @example
 * const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: 0 })
 * const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({ containScroll: "keepSnaps" })
 *
 * const { selectedIndex, scrollPrev, scrollNext, scrollTo } = useEmblaCarouselSync({
 *   mainApi: emblaApi,
 *   thumbsApi: emblaThumbsApi,
 *   initialIndex: 0,
 *   shouldReset: isModalOpen
 * })
 */
export function useEmblaCarouselSync(options: UseEmblaCarouselSyncOptions): UseEmblaCarouselSyncResult {
	const { mainApi, thumbsApi, initialIndex = 0, shouldReset } = options
	const [selectedIndex, setSelectedIndex] = useState(initialIndex)

	// Update selected index when main carousel scrolls
	useEffect(() => {
		if (!mainApi) return

		const onSelect = () => {
			setSelectedIndex(mainApi.selectedScrollSnap())
		}

		mainApi.on("select", onSelect)
		onSelect()

		return () => {
			mainApi.off("select", onSelect)
		}
	}, [mainApi])

	// Sync thumbnail carousel with main carousel
	useEffect(() => {
		if (!mainApi || !thumbsApi) return

		const onSelect = () => {
			const index = mainApi.selectedScrollSnap()
			thumbsApi.scrollTo(index)
		}

		mainApi.on("select", onSelect)
		onSelect()

		return () => {
			mainApi.off("select", onSelect)
		}
	}, [mainApi, thumbsApi])

	// Reset to initial index when shouldReset changes (e.g., modal opens)
	useEffect(() => {
		if (shouldReset && mainApi) {
			mainApi.scrollTo(initialIndex, true)
			setSelectedIndex(initialIndex)
		}
	}, [shouldReset, initialIndex, mainApi])

	const scrollPrev = useCallback(() => mainApi?.scrollPrev(), [mainApi])
	const scrollNext = useCallback(() => mainApi?.scrollNext(), [mainApi])
	const scrollTo = useCallback((index: number) => mainApi?.scrollTo(index), [mainApi])

	return {
		selectedIndex,
		scrollPrev,
		scrollNext,
		scrollTo,
	}
}
