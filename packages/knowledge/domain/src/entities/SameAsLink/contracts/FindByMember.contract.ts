import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Tool from "@effect/ai/Tool";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";
import * as SameAsLink from "../SameAsLink.model";

const $I = $KnowledgeDomainId.create("entities/SameAsLink/contracts/FindByMember.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    memberId: KnowledgeEntityIds.KnowledgeEntityId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  $I.annotations("Payload", {
    description: "Payload for the FindByMember SameAsLink contract (returns Option via nullable data).",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.optionalWith(SameAsLink.Model.json, { as: "Option" }),
  },
  $I.annotations("Success", {
    description: "Success response for the FindByMember SameAsLink contract. Data is null when no link found.",
  })
) {}

export const Failure = S.Never;
export type Failure = typeof Failure.Type;

export class Contract extends S.TaggedRequest<Contract>($I`Contract`)(
  "FindByMember",
  {
    payload: Payload.fields,
    success: Success,
    failure: Failure,
  },
  $I.annotationsHttp("Contract", {
    description: "Find SameAsLink by member entity ID Request Contract.",
  })
) {
  static readonly Rpc = Rpc.fromTaggedRequest(Contract);
  static readonly Tool = Tool.fromTaggedRequest(Contract);
  static readonly Http = HttpApiEndpoint.get("FindByMember", "/by-member").setPayload(Payload).addSuccess(Success);
}
