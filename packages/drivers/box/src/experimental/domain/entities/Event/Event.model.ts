/**
 * TODO
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $BoxId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/domain/entities/Event/Event.model");

/**
 *
 * @example
 * ```ts
 * import { Event } from "@beep/box/experimental/domain/entities/Event/Event.model";
 *
 * console.log(Event.make({
 *
 * }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Event extends S.Class<Event>($I`Event`)(
  {},
  $I.annote("Event", {
    description: "TODO",
  })
) {}

/**
 * Companion namespace for {@link Event}
 *
 * @since 0.0.0
 */
export declare namespace Event {
  /**
   * Companion encoded type for {@link Event}.
   *
   * @example
   * ```ts
   * import type { Event } from "@beep/box/experimental/domain/entities/Event/Event.model";
   *
   * const useEncoded = (_value: Event.Encoded) => true;
   * console.log(useEncoded);
   * ```
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = typeof Event.Encoded;
}

/**
 * Companion runtime type for {@link Event}.
 *
 * @example
 * ```ts
 * import type { Event } from "@beep/box/experimental/domain/entities/Event/Event.model";
 *
 * const useValue = (_value: Event) => true;
 * console.log(useValue);
 * ```
 *
 * @category models
 * @since 0.0.0
 */
// export type Event = typeof Event.Type;
