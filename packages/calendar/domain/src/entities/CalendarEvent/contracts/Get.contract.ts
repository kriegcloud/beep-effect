import { $CalendarDomainId } from "@beep/identity/packages";
import { CalendarEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as CalendarEventErrors from "../CalendarEvent.errors";
import * as CalendarEvent from "../CalendarEvent.model";

const $I = $CalendarDomainId.create("entities/CalendarEvent/contracts/Get.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  { id: CalendarEntityIds.CalendarEventId },
  $I.annotations("Payload", { description: "Payload for the Get CalendarEvent Contract." })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  { data: CalendarEvent.Model.json },
  $I.annotations("Success", { description: "Success response for the Get CalendarEvent Contract." })
) {}

export const Failure = CalendarEventErrors.CalendarEventNotFoundError;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "Get",
  { payload: Payload.fields, success: Success, failure: Failure },
  $I.annotationsHttp("Contract", { description: "Get CalendarEvent Request Contract." })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("Get", "/:id")
    .setPayload(Payload)
    .addError(CalendarEventErrors.CalendarEventNotFoundError)
    .addSuccess(Success);
}
