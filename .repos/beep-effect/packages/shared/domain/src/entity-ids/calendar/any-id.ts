/**
 * Calendar any entity ID union
 *
 * @module calendar/entity-ids/any-id
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/calendar/any-id");

/**
 * Union of all calendar entity IDs.
 *
 * @since 0.1.0
 * @category ids
 */
export class AnyId extends S.Union(Ids.CalendarEventId).annotations(
  $I.annotations("AnyCalendarId", {
    description: "Any entity id within the calendar domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}
