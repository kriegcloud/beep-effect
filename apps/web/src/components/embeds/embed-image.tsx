"use client"

import { cn } from "~/lib/utils"
import { embedSectionStyles } from "./embed"

export interface EmbedImageProps {
	/** Image source URL */
	src: string
	/** Alt text for the image */
	alt?: string
	/** Additional class names */
	className?: string
}

/**
 * Full-width image for the embed - displayed at the bottom.
 */
export function EmbedImage({ src, alt = "", className }: EmbedImageProps) {
	return (
		<div className={cn(embedSectionStyles({ position: "bottom", padding: "none" }), className)}>
			<img src={src} alt={alt} className="aspect-video w-full object-cover" />
		</div>
	)
}
