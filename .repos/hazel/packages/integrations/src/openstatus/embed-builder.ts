import { WEBHOOK_BOT_CONFIGS } from "../common/bot-configs.ts"
import type { MessageEmbed, MessageEmbedField } from "../common/embed-types.ts"
import type { OpenStatusPayload } from "./payloads.ts"

const openStatusConfig = WEBHOOK_BOT_CONFIGS.openstatus

// Status colors using app theme semantic colors
const STATUS_COLORS = {
	recovered: 0x10b981, // Green - success
	error: 0xef4444, // Red - error
	degraded: 0xf59e0b, // Yellow/Orange - warning
} as const

// Status titles
const STATUS_TITLES = {
	recovered: "Monitor Recovered",
	error: "Monitor Down",
	degraded: "Monitor Degraded",
} as const

/**
 * Build embed for OpenStatus webhook event.
 * Supports monitor status events: recovered, error, degraded.
 */
export function buildOpenStatusEmbed(payload: OpenStatusPayload): MessageEmbed {
	const { monitor, cronTimestamp, status, statusCode, latency, errorMessage } = payload

	// Build fields based on status
	const fields: MessageEmbedField[] = []

	// Add monitor URL as a field
	fields.push({
		name: "URL",
		value: monitor.url,
		inline: false,
	})

	if (status === "recovered") {
		// Show status code and latency for recovered status
		if (statusCode !== undefined) {
			fields.push({
				name: "Status Code",
				value: String(statusCode),
				inline: true,
			})
		}
		if (latency !== undefined) {
			fields.push({
				name: "Latency",
				value: `${latency}ms`,
				inline: true,
			})
		}
	} else if (status === "error" || status === "degraded") {
		// Show error message for error/degraded status
		if (errorMessage) {
			fields.push({
				name: "Error",
				value: errorMessage,
				inline: false,
			})
		}
	}

	return {
		title: STATUS_TITLES[status],
		description: undefined,
		url: undefined,
		color: STATUS_COLORS[status],
		author: {
			name: monitor.name,
			url: undefined,
			iconUrl: openStatusConfig.avatarUrl,
		},
		footer: undefined,
		image: undefined,
		thumbnail: undefined,
		fields: fields.length > 0 ? fields : undefined,
		timestamp: new Date(cronTimestamp).toISOString(),
		badge: {
			text: status.charAt(0).toUpperCase() + status.slice(1),
			color: STATUS_COLORS[status],
		},
	}
}

// Re-export colors and titles for external use
export { STATUS_COLORS, STATUS_TITLES }
