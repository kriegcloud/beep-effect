/**
 * Bot Health Server
 *
 * Lightweight HTTP health endpoint for bot process monitoring.
 * Reports status of subsystems (SSE command listener, shape stream subscriber).
 *
 * Enabled by default on port 9090. Set `healthPort: false` in config to disable.
 */

import { Context, Effect, Layer, Option, Runtime } from "effect"
import { SseCommandListener } from "./sse-command-listener.ts"
import { ShapeStreamSubscriber } from "./shape-stream-subscriber.ts"

// ============ Config ============

export interface BotHealthServerConfig {
	readonly port: number
}

export class BotHealthServerConfigTag extends Context.Tag("@hazel/bot-sdk/BotHealthServerConfig")<
	BotHealthServerConfigTag,
	BotHealthServerConfig
>() {}

// ============ Types ============

type SubsystemStatus = "healthy" | "degraded" | "unhealthy" | "unavailable"

interface SubsystemReport {
	readonly status: SubsystemStatus
	readonly details?: Record<string, unknown>
}

interface HealthResponse {
	readonly status: "healthy" | "degraded" | "unhealthy"
	readonly timestamp: string
	readonly uptime_ms: number
	readonly subsystems: Record<string, SubsystemReport>
}

// ============ Service ============

export class BotHealthServer extends Effect.Service<BotHealthServer>()("BotHealthServer", {
	accessors: true,
	scoped: Effect.gen(function* () {
		const config = yield* BotHealthServerConfigTag
		const sseOption = yield* Effect.serviceOption(SseCommandListener)
		const shapeOption = yield* Effect.serviceOption(ShapeStreamSubscriber)

		const startTime = Date.now()

		// Capture the runtime so we can run effects from Bun.serve's fetch handler
		const runtime = yield* Effect.runtime<never>()

		/**
		 * Collect health from SSE command listener
		 */
		const collectSseHealth: Effect.Effect<SubsystemReport> = Option.match(sseOption, {
			onNone: () => Effect.succeed({ status: "unavailable" as const }),
			onSome: (sse) =>
				Effect.gen(function* () {
					const connected = yield* sse.isRunning
					const queueSize = yield* sse.size
					return {
						status: connected ? ("healthy" as const) : ("unhealthy" as const),
						details: { connected, queue_size: queueSize },
					}
				}).pipe(
					Effect.catchAll(() =>
						Effect.succeed({ status: "unhealthy" as const, details: { error: "check_failed" } }),
					),
				),
		})

		/**
		 * Collect health from shape stream subscriber
		 */
		const collectShapeHealth: Effect.Effect<SubsystemReport> = Option.match(shapeOption, {
			onNone: () => Effect.succeed({ status: "unavailable" as const }),
			onSome: (shape) =>
				Effect.gen(function* () {
					const tableStatus = yield* shape.connectionStatus
					const tables: Record<string, boolean> = {}
					for (const [table, connected] of tableStatus) {
						tables[table] = connected
					}
					const allConnected = tableStatus.size > 0 && [...tableStatus.values()].every((v) => v)
					const someConnected = [...tableStatus.values()].some((v) => v)
					const status: SubsystemStatus =
						tableStatus.size === 0
							? "healthy" // No subscriptions started yet is fine
							: allConnected
								? "healthy"
								: someConnected
									? "degraded"
									: "unhealthy"
					return { status, details: { tables } }
				}).pipe(
					Effect.catchAll(() =>
						Effect.succeed({ status: "unhealthy" as const, details: { error: "check_failed" } }),
					),
				),
		})

		/**
		 * Collect full health response
		 */
		const collectHealth = Effect.gen(function* () {
			const [sse, shape] = yield* Effect.all([collectSseHealth, collectShapeHealth], {
				concurrency: "unbounded",
			})

			const subsystems: Record<string, SubsystemReport> = {}
			// Only include subsystems that are actually present (not unavailable)
			if (sse.status !== "unavailable") subsystems.sse_command_listener = sse
			if (shape.status !== "unavailable") subsystems.shape_stream_subscriber = shape

			// Overall status: unhealthy if any active subsystem is unhealthy, degraded if any is degraded
			const activeStatuses = Object.values(subsystems).map((s) => s.status)
			const overallStatus: HealthResponse["status"] = activeStatuses.includes("unhealthy")
				? "unhealthy"
				: activeStatuses.includes("degraded")
					? "degraded"
					: "healthy"

			return {
				status: overallStatus,
				timestamp: new Date().toISOString(),
				uptime_ms: Date.now() - startTime,
				subsystems,
			} satisfies HealthResponse
		})

		// Start the HTTP server
		const server = yield* Effect.acquireRelease(
			Effect.sync(() =>
				Bun.serve({
					port: config.port,
					fetch(req) {
						const url = new URL(req.url)
						if (req.method === "GET" && url.pathname === "/health") {
							return Runtime.runPromise(runtime)(collectHealth).then(
								(health) =>
									new Response(JSON.stringify(health), {
										status: health.status === "unhealthy" ? 503 : 200,
										headers: { "Content-Type": "application/json" },
									}),
								() =>
									new Response(
										JSON.stringify({ status: "unhealthy", error: "health_check_failed" }),
										{ status: 503, headers: { "Content-Type": "application/json" } },
									),
							)
						}
						return new Response("Not Found", { status: 404 })
					},
				}),
			),
			(server) =>
				Effect.gen(function* () {
					yield* Effect.logDebug("Stopping health server", { port: config.port }).pipe(
						Effect.annotateLogs("service", "BotHealthServer"),
					)
					yield* Effect.sync(() => server.stop(true))
				}),
		)

		yield* Effect.logDebug(`Health server listening`, { port: server.port, path: "/health" }).pipe(
			Effect.annotateLogs("service", "BotHealthServer"),
		)

		return { port: server.port }
	}),
}) {}

/**
 * Create a BotHealthServer layer with the given port
 */
export const BotHealthServerLive = (port: number) =>
	Layer.provide(BotHealthServer.Default, Layer.succeed(BotHealthServerConfigTag, { port }))
