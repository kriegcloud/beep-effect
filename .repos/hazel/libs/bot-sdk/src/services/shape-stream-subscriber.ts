import { isChangeMessage, type ChangeMessage, type Message, ShapeStream } from "@electric-sql/client"
import type { ConfigError } from "effect"
import { Config, Effect, Layer, Metric, Option, Ref, Schedule, Schema, Stream } from "effect"
import { ShapeStreamCreateError, ShapeStreamDecodeError, ShapeStreamSubscribeError } from "../errors.ts"
import { generateEventId } from "../log-context.ts"
import { RetryStrategy } from "../retry.ts"
import { createElectricEvent, type EventOperation } from "../types/events.ts"
import { ElectricEventQueue } from "./electric-event-queue.ts"

/**
 * Configuration for a shape stream subscription
 */
export interface ShapeSubscriptionConfig<A = any, I = any, R = never> {
	/**
	 * Table name to subscribe to
	 */
	readonly table: string

	/**
	 * Schema for runtime validation and type safety
	 */
	readonly schema: Schema.Schema<A, I, R>

	/**
	 * Optional WHERE clause for filtering
	 */
	readonly where?: string

	/**
	 * Optional column selection
	 */
	readonly columns?: readonly string[]

	/**
	 * Start from current position (ignore historical data)
	 * @default true
	 */
	readonly startFromNow?: boolean
}

export interface ShapeStreamSubscriberConfig {
	readonly electricUrl: string

	readonly botToken: string

	readonly subscriptions: readonly ShapeSubscriptionConfig[]
}

/**
 * Create an authenticated fetch client for Electric SQL
 */
const createAuthenticatedFetch = (botToken: string) =>
	Object.assign(
		(input: string | URL | Request, init?: RequestInit) =>
			fetch(input, {
				...init,
				headers: {
					...init?.headers,
					Authorization: `Bearer ${botToken}`,
				},
			}),
		{ preconnect: fetch.preconnect },
	)

/**
 * Metrics for shape stream subscriber
 */
const validationErrorsCounter = Metric.counter("bot_schema_validation_errors")
const eventsReceivedCounter = Metric.counter("bot_shape_stream_events_received")

/**
 * Service that subscribes to Electric SQL shape streams
 */
export class ShapeStreamSubscriber extends Effect.Service<ShapeStreamSubscriber>()("ShapeStreamSubscriber", {
	accessors: true,
	effect: Effect.fn(function* (config: ShapeStreamSubscriberConfig) {
		const queue = yield* ElectricEventQueue
		const connectionStatusRef = yield* Ref.make<Map<string, boolean>>(new Map())

		/**
		 * Create a scoped ShapeStream resource using Effect.acquireRelease
		 */
		const acquireShapeStream = (subscription: ShapeSubscriptionConfig) =>
			Effect.acquireRelease(
				Effect.gen(function* () {
					yield* Effect.logDebug(`Creating shape stream`, {
						table: subscription.table,
						where: subscription.where,
						columns: subscription.columns?.join(", "),
					}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

					const stream = new ShapeStream({
						url: config.electricUrl,
						params: {
							table: subscription.table,
							...(subscription.where && { where: subscription.where }),
							...(subscription.columns && { columns: subscription.columns as string[] }),
						},
						offset: subscription.startFromNow !== false ? "now" : undefined,
						fetchClient: createAuthenticatedFetch(config.botToken),
					})

					return stream
				}).pipe(
					Effect.retry(RetryStrategy.connectionErrors),
					Effect.catchAll((error) =>
						Effect.fail(
							new ShapeStreamCreateError({
								message: `Failed to create shape stream for table: ${subscription.table}`,
								table: subscription.table,
								cause: error,
							}),
						),
					),
				),
				(stream) =>
					Effect.gen(function* () {
						yield* Effect.logDebug(`Releasing shape stream`, {
							table: subscription.table,
						}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))
						yield* Effect.sync(() => stream.unsubscribeAll())
					}),
			)

		/**
		 * Convert a ShapeStream to an Effect Stream
		 * Handles both messages and stream errors via the error callback
		 */
		const shapeStreamToEffectStream = (
			shapeStream: ShapeStream,
			table: string,
		): Stream.Stream<Message, ShapeStreamSubscribeError> =>
			Stream.async<Message, ShapeStreamSubscribeError>((emit) => {
				const unsubscribe = shapeStream.subscribe(
					(messages) => {
						for (const message of messages) {
							emit.single(message)
						}
					},
					(error) => {
						// Handle stream errors by failing the stream
						emit.fail(
							new ShapeStreamSubscribeError({
								message: `Shape stream error for table: ${table}`,
								table,
								cause: error,
							}),
						)
					},
				)
				// Note: cleanup is handled by acquireRelease, not here
				return Effect.sync(() => unsubscribe())
			})

		/**
		 * Validate and transform a message using the subscription schema
		 * Expects a ChangeMessage (filtered upstream)
		 */
		const validateAndTransform = (subscription: ShapeSubscriptionConfig, message: ChangeMessage<any>) =>
			Effect.gen(function* () {
				// Generate event ID for correlation
				const eventId = generateEventId()
				const operation = message.headers.operation as EventOperation

				// Log at DEBUG level with event details
				yield* Effect.logDebug("Shape event received", {
					table: subscription.table,
					operation,
					eventId,
				}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

				// Track received events
				yield* Metric.increment(eventsReceivedCounter).pipe(
					Effect.tagMetrics("table", subscription.table),
				)

				// Validate using schema with typed error handling
				const parseResult = yield* Schema.decodeUnknown(subscription.schema)(message.value).pipe(
					Effect.mapError(
						(error) =>
							new ShapeStreamDecodeError({
								message: error.message,
								table: subscription.table,
								cause: error,
							}),
					),
				)

				// Capture the current span so consumers can use it as parent
				const sourceSpan = Option.getOrUndefined(yield* Effect.currentSpan.pipe(Effect.option))

				// Create immutable event using Data.Class factory
				const event = createElectricEvent({
					operation,
					table: subscription.table,
					value: parseResult,
					sourceSpan,
				})

				yield* queue.offer(event)
			}).pipe(
				Effect.withSpan("bot.shapeStream.event", {
					attributes: {
						table: subscription.table,
						operation: message.headers.operation,
					},
				}),
			)

		/**
		 * Handle validation errors with proper logging and metrics
		 */
		const handleValidationError = Effect.fn("ShapeStreamSubscriber.handleValidationError")(function* (
			error: ShapeStreamDecodeError,
		) {
			yield* Effect.logWarning("Schema validation failed, skipping message", {
				table: error.table,
				error: error.message,
			}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

			yield* Metric.increment(validationErrorsCounter).pipe(Effect.tagMetrics("table", error.table))
		})

		/**
		 * Process a single subscription stream
		 */
		const processSubscription = (subscription: ShapeSubscriptionConfig) =>
			Effect.gen(function* () {
				const shapeStream = yield* acquireShapeStream(subscription)

				yield* Ref.update(connectionStatusRef, (m) => new Map(m).set(subscription.table, true))

				yield* Effect.logDebug(`Shape stream subscription active`, {
					table: subscription.table,
				}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

				yield* shapeStreamToEffectStream(shapeStream, subscription.table).pipe(
					Stream.filter(isChangeMessage),
					Stream.mapEffect((message) =>
						validateAndTransform(subscription, message).pipe(
							// Handle validation errors gracefully - log and continue
							Effect.catchTag("ShapeStreamDecodeError", (error) =>
								handleValidationError(error).pipe(Effect.as(Option.none())),
							),
							Effect.map(Option.some),
						),
					),
					// Filter out None values (validation failures)
					Stream.filterMap((option) => option),
					Stream.runDrain,
				)
			}).pipe(
				Effect.scoped,
				// FetchError from ShapeStream is thrown as an untyped defect that escapes
				// Effect's error channel, crashing the Bun process. Convert defects to
				// typed errors so the retry mechanism can handle them gracefully.
				Effect.catchAllDefect((defect) =>
					Effect.fail(
						new ShapeStreamSubscribeError({
							message: `Shape stream defect for table: ${subscription.table}: ${String(defect)}`,
							table: subscription.table,
							cause: defect instanceof Error ? defect : new Error(String(defect)),
						}),
					),
				),
			)

		return {
			/**
			 * Get the connection status of all active shape stream subscriptions.
			 * Returns a Map of table name -> connected boolean.
			 */
			connectionStatus: Ref.get(connectionStatusRef),

			/**
			 * Start shape stream subscriptions, optionally filtered to only required tables.
			 * If no filter is provided, all configured subscriptions are started.
			 * If an empty set is provided, no streams are opened (useful for command-only bots).
			 */
			start: (requiredTables?: ReadonlySet<string>) =>
				Effect.gen(function* () {
					const activeSubscriptions = requiredTables
						? config.subscriptions.filter((s) => requiredTables.has(s.table))
						: config.subscriptions

					// Log which tables were filtered out
					if (requiredTables) {
						const skippedTables = config.subscriptions
							.filter((s) => !requiredTables.has(s.table))
							.map((s) => s.table)
						if (skippedTables.length > 0) {
							yield* Effect.logDebug(`Skipping shape streams for unused tables`, {
								skippedTables: skippedTables.join(", "),
							}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))
						}
					}

					if (activeSubscriptions.length === 0) {
						yield* Effect.logWarning(
							"No shape stream subscriptions to start (no event handlers registered for any table)",
						).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))
						return
					}

					yield* Effect.logDebug(`Starting shape stream subscriptions`, {
						tablesCount: activeSubscriptions.length,
						tables: activeSubscriptions.map((s) => s.table).join(", "),
					}).pipe(Effect.annotateLogs("service", "ShapeStreamSubscriber"))

					// Start each subscription in a forked fiber with retry on failure
					yield* Effect.forEach(
						activeSubscriptions,
						(subscription) =>
							Effect.forkScoped(
								Effect.forever(
									processSubscription(subscription).pipe(
										Effect.tapError((error) =>
											Effect.gen(function* () {
												yield* Ref.update(connectionStatusRef, (m) =>
													new Map(m).set(subscription.table, false),
												)
												yield* Effect.logWarning(
													`Shape stream subscription ended, reconnecting`,
													{
														table: subscription.table,
														error: String(error),
													},
												).pipe(
													Effect.annotateLogs("service", "ShapeStreamSubscriber"),
												)
											}),
										),
										Effect.retry(
											Schedule.exponential("1 second", 2).pipe(
												Schedule.jittered,
												Schedule.union(Schedule.spaced("30 seconds")), // Cap at 30s
											),
										),
									),
								),
							),
						{ concurrency: "unbounded" },
					)

					yield* Effect.logDebug("All shape stream subscriptions started successfully").pipe(
						Effect.annotateLogs("service", "ShapeStreamSubscriber"),
					)
				}),
		}
	}),
}) {
	/**
	 * Create a layer from Effect Config
	 */
	static readonly layerConfig = (
		config: Config.Config.Wrap<ShapeStreamSubscriberConfig>,
	): Layer.Layer<ShapeStreamSubscriber, ConfigError.ConfigError, ElectricEventQueue> =>
		Layer.unwrapEffect(
			Config.unwrap(config).pipe(Effect.map((cfg) => ShapeStreamSubscriber.Default(cfg))),
		)
}
