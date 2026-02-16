"use client"

import { cn } from "~/lib/utils"
import { embedSectionStyles } from "./embed"

export interface EmbedFooterProps {
	/** URL for the footer icon */
	iconUrl?: string
	/** Footer text (e.g., hostname, branch name) */
	text?: string
	/** Timestamp to display */
	timestamp?: Date
	/** Additional class names */
	className?: string
}

/**
 * Footer row for the embed - shows icon, text, and/or timestamp.
 */
export function EmbedFooter({ iconUrl, text, timestamp, className }: EmbedFooterProps) {
	const formattedTime = timestamp
		? new Intl.DateTimeFormat("en", {
				month: "short",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
			}).format(timestamp)
		: null

	if (!iconUrl && !text && !formattedTime) return null

	return (
		<div
			className={cn(
				embedSectionStyles({ position: "bottom", padding: "compact" }),
				"flex items-center gap-2 text-[11px] text-muted-fg",
				className,
			)}
		>
			{iconUrl && <img src={iconUrl} alt="" className="size-3.5 rounded-sm opacity-70" />}
			{text && <span className="truncate">{text}</span>}
			{text && formattedTime && <span className="opacity-50">•</span>}
			{formattedTime && <span>{formattedTime}</span>}
		</div>
	)
}
