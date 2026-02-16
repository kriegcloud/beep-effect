"use client"

import { cn } from "~/lib/utils"
import { embedContainerStyles, embedSectionStyles } from "./embed"

export interface EmbedErrorProps {
	/** Icon URL for the provider (shows in error state) */
	iconUrl?: string
	/** Error message to display */
	message?: string
	/** Accent color for the left border */
	accentColor?: string
	/** Original URL that failed to load */
	url?: string
	/** Resource identifier to show (e.g., "ENG-123", "#456") */
	resourceLabel?: string
	/** Additional class names */
	className?: string
}

/**
 * Error state for embeds when content fails to load.
 */
export function EmbedError({
	iconUrl,
	message = "Could not load content",
	accentColor,
	url,
	resourceLabel,
	className,
}: EmbedErrorProps) {
	return (
		<div
			className={cn(embedContainerStyles({ variant: "default" }), className)}
			style={{
				borderLeftColor: accentColor || "var(--color-border)",
			}}
		>
			{/* Main error content */}
			<div className="flex items-center gap-3 p-3">
				{iconUrl && <img src={iconUrl} alt="" className="size-5 opacity-50" />}
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="text-muted-fg text-sm">{message}</span>
						{resourceLabel && (
							<span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-fg">
								{resourceLabel}
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Footer with URL */}
			{url && (
				<div
					className={cn(
						embedSectionStyles({ position: "bottom", padding: "compact" }),
						"text-[11px]",
					)}
				>
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="truncate text-muted-fg hover:text-fg hover:underline"
					>
						{url}
					</a>
				</div>
			)}
		</div>
	)
}
