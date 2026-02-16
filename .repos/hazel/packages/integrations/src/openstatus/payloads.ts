/**
 * OpenStatus webhook payload types.
 * These types match the OpenStatus webhook format.
 */

export interface OpenStatusMonitor {
	id: string
	name: string
	url: string
}

export type OpenStatusStatus = "recovered" | "error" | "degraded"

export interface OpenStatusPayload {
	monitor: OpenStatusMonitor
	cronTimestamp: number
	status: OpenStatusStatus
	statusCode?: number
	latency?: number
	errorMessage?: string
}
