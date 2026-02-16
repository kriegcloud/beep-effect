/**
 * SSE Command Listener Service
 *
 * Connects to the backend's SSE endpoint to receive command events.
 * Commands are published when users execute slash commands in the chat UI.
 *
 * Uses @effect/experimental Sse module for proper SSE parsing.
 */

import { FetchHttpClient, HttpClient, HttpClientRequest } from "@effect/platform"
import { Sse } from "@effect/experimental"
import type { ChannelId, OrganizationId, UserId } from "@hazel/schema"
import {
	Context,
	Effect,
	Layer,
	Metric,
	Option,
	Queue,
	Redacted,
	Ref,
	Schedule,
	Schema,
	Stream,
	type Tracer,
} from "effect"
import { BotAuth } from "../auth.ts"
import { generateCorrelationId } from "../log-context.ts"

// ============ Command Event Schema ============

/**
 * Command event received from the SSE stream
 */
export const CommandEventSchema = Schema.Struct({
	type: Schema.Literal("command"),
	commandName: Schema.String,
	channelId: Schema.String,
	userId: Schema.String,
	orgId: Schema.String,
	arguments: Schema.Record({ key: Schema.String, value: Schema.String }),
	timestamp: Schema.Number,
})

export type CommandEvent = typeof CommandEventSchema.Type

/**
 * Typed command context passed to handlers
 */
export interface CommandContext {
	readonly commandName: string
	readonly channelId: ChannelId
	readonly userId: UserId
	readonly orgId: OrganizationId
	readonly args: Record<string, string>
	readonly timestamp: number
}

/**
 * Wrapper that carries a command event together with its source span
 * for trace propagation across the queue boundary.
 */
export interface CommandQueueItem {
	readonly event: CommandEvent
	readonly sourceSpan?: Tracer.AnySpan | undefined
}

// ============ Queue Config ============

/**
 * Configuration for the command queue
 */
export interface CommandQueueConfig {
	/**
	 * Maximum number of commands to buffer
	 * @default 100
	 */
	readonly capacity: number

	/**
	 * Strategy when queue is full
	 * - "sliding": Use sliding queue (drops oldest automatically) - RECOMMENDED
	 * - "drop-newest": Ignore new command when full
	 * @default "sliding"
	 */
	readonly backpressureStrategy: "sliding" | "drop-newest"
}

/**
 * Default queue configuration
 */
export const defaultCommandQueueConfig: CommandQueueConfig = {
	capacity: 100,
	backpressureStrategy: "sliding",
}

// ============ Metrics ============

const commandQueueDroppedCounter = Metric.counter("bot_command_queue_dropped")
const commandQueueEnqueuedCounter = Metric.counter("bot_command_queue_enqueued")
const commandQueueDequeuedCounter = Metric.counter("bot_command_queue_dequeued")
const commandQueueSizeGauge = Metric.gauge("bot_command_queue_size")
const sseConnectionFailuresCounter = Metric.counter("bot_sse_connection_failures")
const sseRetryExhaustedCounter = Metric.counter("bot_sse_retry_exhausted")

// ============ Config ============

export interface SseCommandListenerConfig {
	readonly backendUrl: string
	readonly botToken: Redacted.Redacted<string>
	/**
	 * Queue configuration for backpressure handling
	 * @default defaultCommandQueueConfig
	 */
	readonly queue?: CommandQueueConfig
}

export const SseCommandListenerConfigTag = Context.GenericTag<SseCommandListenerConfig>(
	"@hazel/bot-sdk/SseCommandListenerConfig",
)

// ============ Error ============

export class SseRequestError extends Schema.TaggedError<SseRequestError>()("SseRequestError", {
	message: Schema.String,
	cause: Schema.Unknown,
}) {}

export class SseResponseError extends Schema.TaggedError<SseResponseError>()("SseResponseError", {
	message: Schema.String,
	status: Schema.optional(Schema.Number),
	cause: Schema.optional(Schema.Unknown),
}) {}

export class SsePayloadParseError extends Schema.TaggedError<SsePayloadParseError>()("SsePayloadParseError", {
	message: Schema.String,
	payload: Schema.String,
	cause: Schema.Unknown,
}) {}

export class SseCommandDecodeError extends Schema.TaggedError<SseCommandDecodeError>()(
	"SseCommandDecodeError",
	{
		message: Schema.String,
		payload: Schema.String,
		cause: Schema.Unknown,
	},
) {}

export class SseReconnectExhaustedError extends Schema.TaggedError<SseReconnectExhaustedError>()(
	"SseReconnectExhaustedError",
	{
		message: Schema.String,
		retryCycle: Schema.Number,
		cause: Schema.Unknown,
	},
) {}

export class SseUnexpectedError extends Schema.TaggedError<SseUnexpectedError>()("SseUnexpectedError", {
	message: Schema.String,
	cause: Schema.Unknown,
}) {}

export const sseReconnectRetrySchedule = Schedule.exponential("1 second", 2).pipe(
	Schedule.jittered,
	Schedule.union(Schedule.spaced("30 seconds")), // Cap at 30s
	Schedule.intersect(Schedule.recurs(10)),
)

// ============ Service ============

/**
 * SSE Command Listener Service
 *
 * Connects to the backend's SSE endpoint and queues incoming command events
 * for processing by the command dispatcher.
 *
 * Auto-starts on construction - no need to call start() manually.
 * Uses @effect/experimental Sse module for proper SSE parsing.
 */
export class SseCommandListener extends Effect.Service<SseCommandListener>()("SseCommandListener", {
	accessors: true,
	scoped: Effect.gen(function* () {
		const auth = yield* BotAuth
		const authContext = yield* auth.getContext.pipe(Effect.orDie)
		const config = yield* SseCommandListenerConfigTag
		const httpClient = yield* HttpClient.HttpClient

		// Extract bot identity for logging
		const botId = authContext.botId
		const botName = authContext.botName

		// Build the SSE URL
		const sseUrl = `${config.backendUrl}/bot-commands/stream`

		// Track running state with Ref (immutable)
		const isRunningRef = yield* Ref.make(false)
		const retryCycleRef = yield* Ref.make(0)

		// Get queue configuration with defaults
		const queueConfig = config.queue ?? defaultCommandQueueConfig

		// Create command queue with proper scoped acquisition and backpressure
		const commandQueue = yield* Effect.acquireRelease(
			queueConfig.backpressureStrategy === "sliding"
				? Queue.sliding<CommandQueueItem>(queueConfig.capacity)
				: Queue.dropping<CommandQueueItem>(queueConfig.capacity),
			(queue) =>
				Effect.gen(function* () {
					yield* Effect.logDebug("Shutting down command queue", {
						capacity: queueConfig.capacity,
						backpressureStrategy: queueConfig.backpressureStrategy,
					}).pipe(Effect.annotateLogs("service", "SseCommandListener"))
					yield* Queue.shutdown(queue)
				}),
		)

		yield* Effect.logDebug("Command queue created", {
			capacity: queueConfig.capacity,
			backpressureStrategy: queueConfig.backpressureStrategy,
		}).pipe(Effect.annotateLogs("service", "SseCommandListener"))

		/**
		 * Connect to SSE stream and process events
		 */
		const connectAndProcess = Effect.gen(function* () {
			yield* Effect.logDebug(`Connecting to SSE stream`, { url: sseUrl, botId, botName }).pipe(
				Effect.annotateLogs("service", "SseCommandListener"),
			)

			// Create HTTP request with bot token authorization
			const request = HttpClientRequest.get(sseUrl).pipe(
				HttpClientRequest.setHeader("Authorization", `Bearer ${Redacted.value(config.botToken)}`),
				HttpClientRequest.setHeader("Accept", "text/event-stream"),
			)

			// Make the request and get the streaming response
			const response = yield* httpClient.execute(request)

			if (response.status !== 200) {
				return yield* Effect.fail(
					new SseResponseError({
						message: `SSE connection failed with status ${response.status}`,
						status: response.status,
					}),
				)
			}

			yield* Ref.set(isRunningRef, true)
			yield* Effect.logDebug(`SSE stream connected`, { url: sseUrl, botId, botName }).pipe(
				Effect.annotateLogs("service", "SseCommandListener"),
			)

			// Process the response stream using Effect-native Sse.makeChannel()
			// This eliminates the need for Effect.runPromise inside callbacks
			yield* response.stream.pipe(
				Stream.decodeText(),
				Stream.pipeThroughChannel(Sse.makeChannel()),
				Stream.tap((event) =>
					Effect.logDebug("Received SSE event", { eventType: event.event, botId }).pipe(
						Effect.annotateLogs("service", "SseCommandListener"),
					),
				),
				// Only process "command" events
				Stream.filter((event) => event.event === "command"),
				Stream.mapEffect((event) => {
					// Generate correlation ID for this command
					const correlationId = generateCorrelationId()

					return Effect.try({
						try: () => JSON.parse(event.data) as unknown,
						catch: (error) =>
							new SsePayloadParseError({
								message: `Failed to parse SSE event data as JSON`,
								payload: event.data,
								cause: error,
							}),
					}).pipe(
						Effect.flatMap((parsed) =>
							Schema.decodeUnknown(CommandEventSchema)(parsed).pipe(
								Effect.mapError(
									(cause) =>
										new SseCommandDecodeError({
											message: "Failed to decode command payload",
											payload: event.data,
											cause,
										}),
								),
							),
						),
						Effect.tap((cmd) =>
							Effect.logInfo("Command received", {
								commandName: cmd.commandName,
								channelId: cmd.channelId,
								correlationId,
							}).pipe(Effect.annotateLogs("service", "SseCommandListener")),
						),
						Effect.tap((cmd) =>
							Effect.logDebug("Command details", {
								commandName: cmd.commandName,
								channelId: cmd.channelId,
								userId: cmd.userId,
								argCount: Object.keys(cmd.arguments).length,
								correlationId,
							}).pipe(Effect.annotateLogs("service", "SseCommandListener")),
						),
						Effect.flatMap((cmd) =>
							Effect.gen(function* () {
								// Capture the current span for trace propagation across the queue
								const sourceSpan = Option.getOrUndefined(
									yield* Effect.currentSpan.pipe(Effect.option),
								)
								const queueItem: CommandQueueItem = { event: cmd, sourceSpan }

								const offered = yield* Queue.offer(commandQueue, queueItem)
								if (!offered) {
									// Command was dropped due to backpressure
									yield* Metric.increment(commandQueueDroppedCounter)
									yield* Effect.logWarning("Command dropped due to queue backpressure", {
										commandName: cmd.commandName,
										channelId: cmd.channelId,
										capacity: queueConfig.capacity,
										correlationId,
									}).pipe(Effect.annotateLogs("service", "SseCommandListener"))
								} else {
									yield* Metric.increment(commandQueueEnqueuedCounter)
								}
								// Update queue size metric
								const size = yield* Queue.size(commandQueue)
								yield* Metric.set(commandQueueSizeGauge, size)
							}),
						),
						Effect.withSpan("bot.command.receive", {
							attributes: { correlationId, botId },
						}),
						Effect.catchAll((parseError) =>
							Effect.logWarning("Failed to parse command event", {
								error: parseError,
								data: event.data,
								correlationId,
							}).pipe(Effect.annotateLogs("service", "SseCommandListener")),
						),
					)
				}),
				Stream.runDrain,
			)
		}).pipe(
			Effect.catchTags({
				RequestError: (e) =>
					Effect.fail(
						new SseRequestError({
							message: `Request error: ${e.message}`,
							cause: e,
						}),
					),
				ResponseError: (e) =>
					Effect.fail(
						new SseResponseError({
							message: `Response error: ${e.reason}`,
							status: undefined,
							cause: e,
						}),
					),
			}),
			Effect.catchAll((e) =>
				Effect.fail(
					new SseUnexpectedError({
						message: `Unexpected SSE connection error: ${String(e)}`,
						cause: e,
					}),
				),
			),
		)

		// Start the connection loop with retry using Effect's built-in retry
		// Uses Effect.forever to keep reconnecting even after permanent failures
		yield* Effect.forever(
			connectAndProcess.pipe(
				Effect.tapError(() =>
					Metric.increment(sseConnectionFailuresCounter).pipe(
						Effect.annotateLogs("service", "SseCommandListener"),
					),
				),
				Effect.retry(sseReconnectRetrySchedule),
				Effect.tapError((error) =>
					Effect.gen(function* () {
						const retryCycle = yield* Ref.updateAndGet(retryCycleRef, (n) => n + 1)
						const exhaustedError = new SseReconnectExhaustedError({
							message: "SSE connection exhausted retries for current cycle",
							retryCycle,
							cause: error,
						})
						yield* Metric.increment(sseRetryExhaustedCounter)
						yield* Effect.logWarning("SSE connection exhausted retries for current cycle", {
							error: exhaustedError,
							botId,
							botName,
							retryCycle,
						}).pipe(Effect.annotateLogs("service", "SseCommandListener"))
					}),
				),
				// After exhausting retries, wait before trying the whole cycle again
				Effect.catchAll(() =>
					Effect.gen(function* () {
						yield* Ref.set(isRunningRef, false)
						yield* Effect.logWarning(
							"SSE connection exhausted retries, waiting before reconnection attempt",
							{ botId, botName },
						).pipe(Effect.annotateLogs("service", "SseCommandListener"))
						// Keep the outer reconnection loop hot without long dark periods.
						yield* Effect.sleep("1 second")
					}),
				),
			),
		).pipe(Effect.forkScoped)

		yield* Effect.logDebug(`Listening for commands via SSE`, { url: sseUrl, botId, botName }).pipe(
			Effect.annotateLogs("service", "SseCommandListener"),
		)

		// Cleanup on scope close
		yield* Effect.addFinalizer(() =>
			Effect.gen(function* () {
				yield* Ref.set(isRunningRef, false)
				yield* Effect.logDebug("SSE listener stopped").pipe(
					Effect.annotateLogs("service", "SseCommandListener"),
				)
			}),
		)

		return {
			/**
			 * Take the next command queue item from the queue (blocks until available)
			 * Returns CommandQueueItem with the event and its source span for trace propagation
			 * Tracks dequeue metrics and updates queue size gauge
			 */
			take: Queue.take(commandQueue).pipe(
				Effect.tap(() => Metric.increment(commandQueueDequeuedCounter)),
				Effect.tap(() =>
					Queue.size(commandQueue).pipe(
						Effect.flatMap((size) => Metric.set(commandQueueSizeGauge, size)),
					),
				),
			),

			/**
			 * Take all available command queue items from the queue (non-blocking)
			 */
			takeAll: Queue.takeAll(commandQueue),

			/**
			 * Check if the listener is currently running
			 */
			isRunning: Ref.get(isRunningRef),

			/**
			 * Get the SSE URL this listener is connected to
			 */
			sseUrl: Effect.succeed(sseUrl),

			/**
			 * Get the current size of the command queue
			 */
			size: Queue.size(commandQueue),
		}
	}),
}) {}

/**
 * Create a SseCommandListener layer with the provided config
 */
export const SseCommandListenerLive = (config: SseCommandListenerConfig) =>
	Layer.provide(
		SseCommandListener.Default,
		Layer.mergeAll(Layer.succeed(SseCommandListenerConfigTag, config), FetchHttpClient.layer),
	)
