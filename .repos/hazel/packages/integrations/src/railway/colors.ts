/**
 * Railway event colors for embed styling.
 * Based on Railway's event types and severities.
 */

// Railway event configuration with colors and labels
export const RAILWAY_EVENT_CONFIG: Record<string, { color: number; label: string }> = {
	// Deployment success states
	deployed: { color: 0x10b981, label: "Deployed" },
	redeployed: { color: 0x10b981, label: "Redeployed" },
	success: { color: 0x10b981, label: "Success" },
	succeeded: { color: 0x10b981, label: "Succeeded" },
	completed: { color: 0x10b981, label: "Completed" },

	// Deployment error states
	crashed: { color: 0xef4444, label: "Crashed" },
	oomkilled: { color: 0xef4444, label: "OOM Killed" },
	failed: { color: 0xef4444, label: "Failed" },
	error: { color: 0xef4444, label: "Error" },

	// Deployment progress states
	building: { color: 0x3b82f6, label: "Building" },
	deploying: { color: 0x3b82f6, label: "Deploying" },
	restarted: { color: 0x3b82f6, label: "Restarted" },
	resumed: { color: 0x3b82f6, label: "Resumed" },
	started: { color: 0x3b82f6, label: "Started" },

	// Deployment pending states
	queued: { color: 0x6366f1, label: "Queued" },
	waiting: { color: 0x6366f1, label: "Waiting" },
	needsapproval: { color: 0xf59e0b, label: "Needs Approval" },
	pending: { color: 0x6366f1, label: "Pending" },

	// Deployment neutral states
	removed: { color: 0x6b7280, label: "Removed" },
	slept: { color: 0x6b7280, label: "Slept" },
	deleted: { color: 0x6b7280, label: "Deleted" },
	cancelled: { color: 0x6b7280, label: "Cancelled" },

	// Monitor/Alert states
	triggered: { color: 0xf59e0b, label: "Triggered" },
	resolved: { color: 0x10b981, label: "Resolved" },
	recovered: { color: 0x10b981, label: "Recovered" },
	degraded: { color: 0xf59e0b, label: "Degraded" },
	warning: { color: 0xf59e0b, label: "Warning" },
} as const

// Default config for unknown events
export const DEFAULT_EVENT_CONFIG = { color: 0x3b82f6, label: "Unknown" }

/**
 * Get Railway event config based on action.
 */
export function getRailwayEventConfig(action: string, severity?: string): { color: number; label: string } {
	// Normalize action: handle camelCase (oomKilled -> oomkilled)
	const lowerAction = action.toLowerCase().replace(/[^a-z]/g, "")
	const eventConfig = RAILWAY_EVENT_CONFIG[lowerAction as keyof typeof RAILWAY_EVENT_CONFIG]
	if (eventConfig) {
		return eventConfig
	}
	// Fall back to severity-based config
	if (severity) {
		const lowerSeverity = severity.toLowerCase()
		if (lowerSeverity === "error" || lowerSeverity === "critical") {
			return { color: 0xef4444, label: action }
		}
		if (lowerSeverity === "warning") {
			return { color: 0xf59e0b, label: action }
		}
	}
	// Default for unknown events
	return { ...DEFAULT_EVENT_CONFIG, label: action }
}

/**
 * Get event category prefix from type (e.g., "Deployment", "Monitor", "VolumeAlert")
 */
export function getEventCategory(eventType: string): string {
	const [category] = eventType.split(".")
	// Format VolumeAlert -> "Volume Alert"
	return category?.replace(/([A-Z])/g, " $1").trim() ?? "Event"
}
