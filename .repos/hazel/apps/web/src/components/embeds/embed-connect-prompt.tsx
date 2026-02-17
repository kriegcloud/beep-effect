"use client"

import { Link, useParams } from "@tanstack/react-router"
import { cn } from "~/lib/utils"

export interface EmbedConnectPromptProps {
	/** Provider name (e.g., "Linear", "GitHub") */
	providerName: string
	/** Provider icon URL */
	iconUrl: string
	/** Accent/brand color */
	accentColor: string
	/** Resource identifier to show (e.g., "ENG-123", "#456") */
	resourceLabel?: string
	/** Description text */
	description?: string
	/** Additional class names */
	className?: string
}

/**
 * Prompt shown when an integration is not connected.
 * Provides a link to the integrations settings page.
 */
export function EmbedConnectPrompt({
	providerName,
	iconUrl,
	accentColor,
	resourceLabel,
	description,
	className,
}: EmbedConnectPromptProps) {
	// Get orgSlug from any route that has it
	const params = useParams({ strict: false }) as { orgSlug?: string }
	const orgSlug = params.orgSlug

	return (
		<div
			className={cn(
				"mt-2 flex max-w-md items-center gap-3 overflow-hidden rounded-lg",
				"border border-dashed p-3 transition-colors",
				className,
			)}
			style={{
				borderColor: `${accentColor}40`,
				background: `linear-gradient(to right, ${accentColor}08, transparent)`,
			}}
		>
			<div
				className="flex size-10 shrink-0 items-center justify-center rounded-lg"
				style={{ backgroundColor: `${accentColor}15` }}
			>
				<img src={iconUrl} alt="" className="size-5" />
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="font-medium text-fg text-sm">Connect {providerName} to preview</p>
					{resourceLabel && (
						<span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-fg">
							{resourceLabel}
						</span>
					)}
				</div>
				<p className="mt-0.5 text-muted-fg text-xs">
					{description || `Link your ${providerName} account to see details inline`}
				</p>
			</div>

			{orgSlug && (
				<Link
					to="/$orgSlug/settings/integrations"
					params={{ orgSlug }}
					className="shrink-0 rounded-md px-3 py-1.5 font-medium text-white text-xs shadow-sm transition-all hover:shadow-md active:scale-95"
					style={{ backgroundColor: accentColor }}
				>
					Connect
				</Link>
			)}
		</div>
	)
}
