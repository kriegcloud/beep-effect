import { $CalendarDomainId } from "@beep/identity/packages";
import { CalendarEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CalendarDomainId.create("entities/CalendarEvent/CalendarEvent.model");

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
