/**
 * CalendarEvent entity model for Calendar slice
 *
 * This is a starter entity to demonstrate the pattern.
 * Rename or replace with your actual domain entities.
 *
 * @module calendar-domain/entities/CalendarEvent
 * @since 0.1.0
 */
import { $CalendarDomainId } from "@beep/identity/packages";
import { CalendarEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CalendarDomainId.create("entities/CalendarEvent");

/**
 * CalendarEvent model for the calendar slice.
 *
 * Replace this with your actual domain entity model.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/calendar-domain";
 *
 * const calendarEvent = Entities.CalendarEvent.Model.make({
 *   id: CalendarEntityIds.CalendarEventId.make("calendar_calendar_event__<uuid>"),
 *   name: "Example",
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`CalendarEventModel`)(
  makeFields(CalendarEntityIds.CalendarEventId, {
    name: S.NonEmptyTrimmedString.annotations({
      title: "Name",
      description: "The name of the calendarEvent entity",
    }),
    description: S.OptionFromNullOr(S.String).annotations({
      title: "Description",
      description: "Optional description of the calendarEvent entity",
    }),
  }),
  $I.annotations("CalendarEventModel", {
    description: "CalendarEvent model for the calendar domain context.",
  })
) {
  static readonly utils = modelKit(Model);
}
