"use client"

import { cn } from "~/lib/utils"

export interface EmbedThumbnailProps {
	/** Image source URL */
	src: string
	/** Alt text for the image */
	alt?: string
	/** Additional class names */
	className?: string
}

/**
 * Small thumbnail displayed on the right side of the embed body.
 */
export function EmbedThumbnail({ src, alt = "", className }: EmbedThumbnailProps) {
	return (
		<img
			src={src}
			alt={alt}
			className={cn("absolute top-3 right-3 size-16 rounded-lg object-cover", className)}
		/>
	)
}
