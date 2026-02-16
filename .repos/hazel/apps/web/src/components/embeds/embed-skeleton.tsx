"use client"

import { cn } from "~/lib/utils"
import { embedContainerStyles, embedSectionStyles } from "./embed"

export interface EmbedSkeletonProps {
	/** Accent color for the left border */
	accentColor?: string
	/** Whether to show the header section */
	showHeader?: boolean
	/** Whether to show the footer section */
	showFooter?: boolean
	/** Additional class names */
	className?: string
}

/**
 * Loading skeleton for embeds with animated pulse effect.
 */
export function EmbedSkeleton({
	accentColor,
	showHeader = true,
	showFooter = true,
	className,
}: EmbedSkeletonProps) {
	return (
		<div
			className={cn(embedContainerStyles({ variant: "skeleton" }), className)}
			style={{
				borderLeftColor: accentColor || "var(--color-border)",
			}}
		>
			{/* Header skeleton */}
			{showHeader && (
				<div className={cn(embedSectionStyles({ position: "top" }), "flex items-center gap-2")}>
					<div className="size-5 animate-pulse rounded bg-muted" />
					<div className="h-4 w-16 animate-pulse rounded bg-muted" />
					<div className="ml-auto h-5 w-16 animate-pulse rounded-full bg-muted" />
				</div>
			)}

			{/* Body skeleton */}
			<div className="space-y-2 p-3">
				<div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
				<div className="h-3 w-full animate-pulse rounded bg-muted" />
				<div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
			</div>

			{/* Footer skeleton */}
			{showFooter && (
				<div
					className={cn(
						embedSectionStyles({ position: "bottom" }),
						"flex items-center gap-3 bg-muted/10",
					)}
				>
					<div className="flex items-center gap-1.5">
						<div className="size-5 animate-pulse rounded-full bg-muted" />
						<div className="h-3 w-16 animate-pulse rounded bg-muted" />
					</div>
					<div className="h-4 w-12 animate-pulse rounded bg-muted" />
				</div>
			)}
		</div>
	)
}
