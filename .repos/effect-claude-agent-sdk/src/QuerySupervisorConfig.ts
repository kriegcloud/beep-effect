import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import { layerConfigFromEnv } from "./internal/config.js"

export const PendingQueueStrategy = Schema.Literal("suspend", "dropping", "sliding")

export type PendingQueueStrategy = typeof PendingQueueStrategy.Type

export type QuerySupervisorSettings = {
  readonly concurrencyLimit: number
  readonly pendingQueueCapacity: number
  readonly pendingQueueStrategy: PendingQueueStrategy
  readonly maxPendingTime: Duration.Duration | undefined
  readonly emitEvents: boolean
  readonly eventBufferCapacity: number
  readonly eventBufferStrategy: PendingQueueStrategy
  readonly metricsEnabled: boolean
  readonly tracingEnabled: boolean
}

const defaultSettings: QuerySupervisorSettings = {
  concurrencyLimit: 4,
  pendingQueueCapacity: 64,
  pendingQueueStrategy: "suspend",
  maxPendingTime: Duration.seconds(30),
  emitEvents: false,
  eventBufferCapacity: 256,
  eventBufferStrategy: "sliding",
  metricsEnabled: false,
  tracingEnabled: false
}

export class QuerySupervisorConfig
  extends Context.Tag("@effect/claude-agent-sdk/QuerySupervisorConfig")<
    QuerySupervisorConfig,
    {
      readonly settings: QuerySupervisorSettings
    }
  >()
{
  /**
   * Build QuerySupervisorConfig by reading configuration from environment variables.
   */
  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    QuerySupervisorConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)))

  /**
   * Default configuration layer for QuerySupervisor.
   */
  static readonly layer = Layer.effect(
    QuerySupervisorConfig,
    Effect.gen(function*() {
      const concurrencyLimit = yield* Config.option(Config.integer("CONCURRENCY_LIMIT"))
      const pendingQueueCapacity = yield* Config.option(Config.integer("PENDING_QUEUE_CAPACITY"))
      const pendingQueueStrategy = yield* Config.option(
        Schema.Config("PENDING_QUEUE_STRATEGY", PendingQueueStrategy)
      )
      const maxPendingTime = yield* Config.option(Config.duration("MAX_PENDING_TIME"))
      const emitEvents = yield* Config.option(Config.boolean("EMIT_EVENTS"))
      const eventBufferCapacity = yield* Config.option(Config.integer("EVENT_BUFFER_CAPACITY"))
      const eventBufferStrategy = yield* Config.option(
        Schema.Config("EVENT_BUFFER_STRATEGY", PendingQueueStrategy)
      )
      const metricsEnabled = yield* Config.option(Config.boolean("METRICS_ENABLED"))
      const tracingEnabled = yield* Config.option(Config.boolean("TRACING_ENABLED"))

      const settings: QuerySupervisorSettings = {
        concurrencyLimit: Math.max(
          1,
          Option.getOrElse(concurrencyLimit, () => defaultSettings.concurrencyLimit)
        ),
        pendingQueueCapacity: Math.max(
          0,
          Option.getOrElse(pendingQueueCapacity, () => defaultSettings.pendingQueueCapacity)
        ),
        pendingQueueStrategy: Option.getOrElse(
          pendingQueueStrategy,
          () => defaultSettings.pendingQueueStrategy
        ),
        maxPendingTime: Option.getOrElse(maxPendingTime, () => defaultSettings.maxPendingTime),
        emitEvents: Option.getOrElse(emitEvents, () => defaultSettings.emitEvents),
        eventBufferCapacity: Math.max(
          1,
          Option.getOrElse(eventBufferCapacity, () => defaultSettings.eventBufferCapacity)
        ),
        eventBufferStrategy: Option.getOrElse(
          eventBufferStrategy,
          () => defaultSettings.eventBufferStrategy
        ),
        metricsEnabled: Option.getOrElse(metricsEnabled, () => defaultSettings.metricsEnabled),
        tracingEnabled: Option.getOrElse(tracingEnabled, () => defaultSettings.tracingEnabled)
      }

      return QuerySupervisorConfig.of({ settings })
    })
  )
}
