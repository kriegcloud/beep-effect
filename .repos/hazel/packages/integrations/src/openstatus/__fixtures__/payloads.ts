/**
 * Test payload fixtures for OpenStatus webhook embeds.
 * Used by demo pages and tests to ensure embed previews match production.
 */
import type { OpenStatusPayload } from "../payloads.ts"

// Base monitor fixtures
const apiMonitor = {
	id: "mon-api-123",
	name: "API Server",
	url: "https://api.example.com/health",
}

const webMonitor = {
	id: "mon-web-456",
	name: "Web Application",
	url: "https://app.example.com",
}

const databaseMonitor = {
	id: "mon-db-789",
	name: "Database",
	url: "https://db.example.com:5432",
}

/**
 * Test payloads for all OpenStatus event types.
 */
export const testPayloads = {
	// Recovered states
	recovered: {
		monitor: apiMonitor,
		cronTimestamp: Date.now(),
		status: "recovered",
		statusCode: 200,
		latency: 42,
	} satisfies OpenStatusPayload,

	recovered_slow: {
		monitor: webMonitor,
		cronTimestamp: Date.now(),
		status: "recovered",
		statusCode: 200,
		latency: 1250,
	} satisfies OpenStatusPayload,

	// Error states
	error_connection: {
		monitor: apiMonitor,
		cronTimestamp: Date.now(),
		status: "error",
		errorMessage: "Connection refused",
	} satisfies OpenStatusPayload,

	error_timeout: {
		monitor: databaseMonitor,
		cronTimestamp: Date.now(),
		status: "error",
		errorMessage: "Connection timed out after 30000ms",
	} satisfies OpenStatusPayload,

	error_5xx: {
		monitor: webMonitor,
		cronTimestamp: Date.now(),
		status: "error",
		statusCode: 503,
		errorMessage: "Service Unavailable",
	} satisfies OpenStatusPayload,

	// Degraded states
	degraded_slow: {
		monitor: apiMonitor,
		cronTimestamp: Date.now(),
		status: "degraded",
		statusCode: 200,
		latency: 5000,
		errorMessage: "Response time exceeded threshold (5000ms > 2000ms)",
	} satisfies OpenStatusPayload,

	degraded_partial: {
		monitor: webMonitor,
		cronTimestamp: Date.now(),
		status: "degraded",
		errorMessage: "Partial content returned, missing expected fields",
	} satisfies OpenStatusPayload,
}

export type TestPayloadKey = keyof typeof testPayloads
