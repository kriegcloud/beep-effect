import type { Effect } from "effect"
import type { EventHandlerError } from "../errors.ts"
import type { EventType } from "./events.ts"

/**
 * Generic event handler that processes validated data of type A
 * @template A - The validated event data type
 * @template E - The error type (defaults to EventHandlerError)
 * @template R - The required context/services
 */
export type EventHandler<A = any, E = EventHandlerError, R = never> = (value: A) => Effect.Effect<void, E, R>

/**
 * Registry of all event handlers
 * Maps event types (e.g., "messages.insert") to sets of handlers
 */
export type EventHandlerRegistry = Map<EventType, Set<EventHandler<any, any, any>>>
