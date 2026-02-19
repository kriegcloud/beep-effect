import { $CalendarDomainId } from "@beep/identity/packages";
import { CalendarEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as CalendarEventErrors from "../CalendarEvent.errors";

const $I = $CalendarDomainId.create("entities/CalendarEvent/contracts/Delete.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: CalendarEntityIds.CalendarEventId },
  $I.annotations("Payload", { description: "Payload for the Delete CalendarEvent contract." })
) {}

export class Success extends S.Void.annotations(
  $I.annotations("Success", { description: "Success response for the Delete CalendarEvent contract." })
) {}

export const Failure = S.Union(
  CalendarEventErrors.CalendarEventNotFoundError,
  CalendarEventErrors.CalendarEventPermissionDeniedError
);
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Delete",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Delete CalendarEvent Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.del("Delete", "/:id")
    .setPayload(Payload)
    .addError(CalendarEventErrors.CalendarEventNotFoundError)
    .addError(CalendarEventErrors.CalendarEventPermissionDeniedError)
    .addSuccess(Success, { status: 204 });
}
