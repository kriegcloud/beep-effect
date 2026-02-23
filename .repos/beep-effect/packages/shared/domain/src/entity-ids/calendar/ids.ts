/**
 * Calendar entity IDs
 *
 * Defines branded entity identifiers for the calendar slice.
 *
 * @module calendar/entity-ids/ids
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const make = EntityId.builder("calendar");
const $I = $SharedDomainId.create("entity-ids/calendar/ids");

/**
 * CalendarEvent entity ID.
 *
 * Replace or rename with your actual entity IDs.
 *
 * @since 0.1.0
 * @category ids
 */
export const CalendarEventId = make("calendar_event", {
  brand: "CalendarEventId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("CalendarEventId", {
    description: "A unique identifier for a CalendarEvent entity",
  })
);

export declare namespace CalendarEventId {
  export type Type = S.Schema.Type<typeof CalendarEventId>;
  export type Encoded = S.Schema.Encoded<typeof CalendarEventId>;

  export namespace RowId {
    export type Type = typeof CalendarEventId.privateSchema.Type;
    export type Encoded = typeof CalendarEventId.privateSchema.Encoded;
  }
}

export const Ids = {
  CalendarEventId,
} as const;
