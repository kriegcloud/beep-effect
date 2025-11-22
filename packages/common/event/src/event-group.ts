import { $EventGroupId } from "@beep/event/internal";
import type { StringTypes } from "@beep/types";
/**
 * @since 0.1.0
 */
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import { type Pipeable, pipeArguments } from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import type * as S from "effect/Schema";
import type { Event } from "./event.ts";
import * as EventApi from "./event.ts";
/**
 * @since 0.1.0
 * @category type ids
 */
export const TypeId: unique symbol = Symbol.for($EventGroupId`EventGroup`);

/**
 * @since 0.1.0
 * @category type ids
 */
export type TypeId = typeof TypeId;

/**
 * @since 0.1.0
 * @category guards
 */
export const isEventGroup = (u: unknown): u is EventGroup.Any => P.hasProperty(u, TypeId);

/**
 * An `EventGroup` is a collection of `Event`s. You can use an `EventGroup` to
 * represent a portion of your domain.
 *
 * The events can be implemented later using the `EventLogBuilder.group` api.
 *
 * @since 0.1.0
 * @category models
 */
export interface EventGroup<out Events extends Event.Any = never> extends Pipeable {
  new (_: never): {};

  readonly [TypeId]: TypeId;
  readonly events: R.ReadonlyRecord<string, Events>;

  /**
   * Add an `Event` to the `EventGroup`.
   */
  add<
    Tag extends StringTypes.NonEmptyString,
    Payload extends S.Schema.Any = typeof S.Void,
    Success extends S.Schema.Any = typeof S.Void,
    Error extends S.Schema.All = typeof S.Never,
  >(options: {
    readonly tag: Tag;
    readonly primaryKey: (payload: S.Schema.Type<Payload>) => string;
    readonly payload?: Payload;
    readonly success?: Success;
    readonly error?: Error;
  }): EventGroup<Events | Event<Tag, Payload, Success, Error>>;

  /**
   * Add an error schema to all the events in the `EventGroup`.
   */
  addError<Error extends S.Schema.Any>(error: Error): EventGroup<Event.AddError<Events, Error>>;
}

/**
 * @since 0.1.0
 * @category models
 */
export declare namespace EventGroup {
  /**
   * @since 0.1.0
   * @category models
   */
  export interface Any {
    readonly [TypeId]: TypeId;
  }

  /**
   * @since 0.1.0
   * @category models
   */
  export type AnyWithProps = EventGroup<Event.AnyWithProps>;

  /**
   * @since 0.1.0
   * @category models
   */
  export type ToService<A> = A extends EventGroup<infer _Events> ? Event.ToService<_Events> : never;

  /**
   * @since 0.1.0
   * @category models
   */
  export type Events<Group> = Group extends EventGroup<infer _Events> ? _Events : never;

  /**
   * @since 0.1.0
   * @category models
   */
  export type Context<Group> = Event.Context<Events<Group>>;
}

const Proto = {
  [TypeId]: TypeId,
  add(
    this: EventGroup.AnyWithProps,
    options: {
      readonly tag: string;
      readonly primaryKey: (payload: S.Schema.Any) => string;
      readonly payload?: S.Schema.Any;
      readonly success?: S.Schema.Any;
      readonly error?: S.Schema.All;
    }
  ) {
    return makeProto({
      events: {
        ...this.events,
        [options.tag]: EventApi.make(options),
      },
    });
  },
  addError(this: EventGroup.AnyWithProps, error: S.Schema.Any) {
    return makeProto({
      events: R.map(this.events, (event) =>
        EventApi.make({
          ...event,
          error: HttpApiSchema.UnionUnify(event.error, error),
        })
      ),
    });
  },
  pipe() {
    return pipeArguments(this, arguments);
  },
};

const makeProto = <Events extends Event.Any>(options: {
  readonly events: R.ReadonlyRecord<string, Events>;
}): EventGroup<Events> => {
  function EventGroup() {}
  Object.setPrototypeOf(EventGroup, Proto);
  return Object.assign(EventGroup, options) as any;
};

/**
 * An `EventGroup` is a collection of `Event`s. You can use an `EventGroup` to
 * represent a portion of your domain.
 *
 * The events can be implemented later using the `EventLog.group` api.
 *
 * @since 0.1.0
 * @category constructors
 */
export const empty: EventGroup<never> = makeProto({ events: R.empty() });
